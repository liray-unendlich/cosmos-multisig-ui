import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { getKeplrKey } from "@/lib/keplr";
import { toastError } from "@/lib/utils";
import { StargateClient } from "@cosmjs/stargate";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { useChains } from "../../../context/ChainsContext";
import { createMultisigFromCompressedSecp256k1Pubkeys } from "../../../lib/multisigHelpers";
import ConfirmCreateMultisig from "./ConfirmCreateMultisig";
import MemberFormField from "./MemberFormField";
import { getCreateMultisigSchema } from "./formSchema";

export default function CreateMultisigForm() {
  const router = useRouter();
  const { chain } = useChains();

  const createMultisigSchema = getCreateMultisigSchema(chain);

  const createMultisigForm = useForm<z.infer<typeof createMultisigSchema>>({
    resolver: zodResolver(createMultisigSchema),
    defaultValues: { members: [{ member: "" }, { member: "" }], threshold: 2 },
  });

  const {
    fields: membersFields,
    append: membersAppend,
    remove: membersRemove,
    replace: membersReplace,
  } = useFieldArray({ name: "members", control: createMultisigForm.control });

  const [memberCount, setMemberCount] = useState(2);
  const memberFieldCount = membersFields.length;

  const handleMemberCountChange = (value: number) => {
    const nextValue = Number.isNaN(value) ? 2 : Math.round(value);
    setMemberCount(Math.max(2, Math.min(50, nextValue)));
  };

  const handleBulkReplaceMembers = (members: readonly string[]) => {
    handleMemberCountChange(members.length || 2);
  };

  useEffect(() => {
    const desiredCount = Math.max(2, memberCount);
    if (memberFieldCount < desiredCount) {
      for (let i = memberFieldCount; i < desiredCount; i += 1) {
        membersAppend({ member: "" }, { shouldFocus: false });
      }
    } else if (memberFieldCount > desiredCount) {
      for (let i = memberFieldCount; i > desiredCount; i -= 1) {
        membersRemove(i - 1);
      }
    }
  }, [memberCount, memberFieldCount, membersAppend, membersRemove]);

  const submitCreateMultisig = async () => {
    try {
      // Caution: threshold is string instead of number
      const { members, threshold } = createMultisigForm.getValues();

      const pubkeys = await Promise.all(
        members
          .filter(({ member }) => member !== "")
          .map(async ({ member }) => {
            if (!member.startsWith(chain.addressPrefix)) {
              return member;
            }

            const client = await StargateClient.connect(chain.nodeAddress);
            const accountOnChain = await client.getAccount(member);

            if (!accountOnChain || !accountOnChain.pubkey) {
              throw new Error(
                `Member "${member}" is not a pubkey and is not on chain. It needs to send a transaction to appear on chain or you can provide its pubkey`,
              );
            }

            return String(accountOnChain.pubkey.value);
          }),
      );

      const { bech32Address: address } = await getKeplrKey(chain.chainId);

      const multisigAddress = await createMultisigFromCompressedSecp256k1Pubkeys(
        pubkeys,
        Number(threshold),
        chain.addressPrefix,
        chain.chainId,
        { creatorAddress: address },
      );

      router.push(`/${chain.registryName}/${multisigAddress}`);
    } catch (e) {
      console.error("Failed to create multisig:", e);
      toastError({
        description: "Failed to create multisig",
        fullError: e instanceof Error ? e : undefined,
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Create multisig</CardTitle>
          <CardDescription>
            Fill the form to create a new multisig account on {chain.chainDisplayName || "Cosmos Hub"}
            . You can paste several addresses on the first input if they are separated by whitespace
            or commas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...createMultisigForm}>
            <form
              id="create-multisig-form"
              onSubmit={createMultisigForm.handleSubmit(submitCreateMultisig)}
              className="space-y-4"
            >
              {membersFields.map((arrayField, index) => (
                <MemberFormField
                  key={arrayField.id}
                  createMultisigForm={createMultisigForm}
                  index={index}
                  membersReplace={membersReplace}
                  onBulkReplaceMembers={handleBulkReplaceMembers}
                />
              ))}
              <FormField
                control={createMultisigForm.control}
                name="threshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Threshold</FormLabel>
                    <FormDescription>
                      Number of signatures needed to broadcast a transaction
                    </FormDescription>
                    <FormControl className="">
                      <div className="flex flex-wrap items-center gap-3">
                        <Input
                          className="w-20"
                          placeholder="2"
                          type="number"
                          min={1}
                          {...field}
                        />
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                          out of
                          <Input
                            className="w-20"
                            type="number"
                            min={2}
                            value={memberCount}
                            onChange={({ target }) => handleMemberCountChange(Number(target.value))}
                          />
                          members
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <ConfirmCreateMultisig createMultisigForm={createMultisigForm} />
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}
