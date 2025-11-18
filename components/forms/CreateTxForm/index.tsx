import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowBigRightDash,
  Banknote,
  Code2,
  Gavel,
  Network,
  ShieldCheck,
  Sparkles,
  Waves,
} from "lucide-react";
import { useChains } from "@/context/ChainsContext";
import { loadValidators } from "@/context/ChainsContext/helpers";
import { getField, getMsgSchema } from "@/lib/form";
import { getMsgRegistry } from "@/lib/msg";
import { createDbTx } from "@/lib/api";
import { exportMsgToJson } from "@/lib/txMsgHelpers";
import { Account, calculateFee } from "@cosmjs/stargate";
import { EncodeObject } from "@cosmjs/proto-signing";
import { assert } from "@cosmjs/utils";
import { useRouter } from "next/router";
import type { ComponentType } from "react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { MsgTypeUrl } from "../../../types/txMsg";
import MsgForm from "./MsgForm";

export interface MsgGetter {
  readonly isMsgValid: () => boolean;
  readonly msg: EncodeObject;
}

type MsgType = Readonly<{
  url: string;
  key: string;
}>;

const categoryMeta: Record<string, { label: string; description: string; icon: ComponentType<{ className?: string }> }> = {
  bank: {
    label: "Bank",
    description: "送金やMultiSendといった基礎的な操作",
    icon: Banknote,
  },
  distribution: {
    label: "Distribution",
    description: "報酬やコミュニティプールに関する操作",
    icon: Waves,
  },
  gov: {
    label: "Governance",
    description: "提案の提出や投票を管理",
    icon: Gavel,
  },
  staking: {
    label: "Staking",
    description: "Delegate/Undelegate の制御",
    icon: ShieldCheck,
  },
  ibc: {
    label: "IBC",
    description: "チェーン間転送を実行",
    icon: Network,
  },
  cosmwasm: {
    label: "CosmWasm",
    description: "スマートコントラクトの操作",
    icon: Code2,
  },
  authz: {
    label: "Authz",
    description: "権限委譲コントロール",
    icon: ShieldCheck,
  },
  feegrant: {
    label: "Feegrant",
    description: "手数料の支払い権限を委譲",
    icon: ArrowBigRightDash,
  },
};

export default function CreateTxForm({
  accountOnChain,
  multisigAddress,
}: {
  accountOnChain: Account;
  multisigAddress: string;
}) {
  const { chain, validatorState, chainsDispatch } = useChains();
  const [msgTypes, setMsgTypes] = useState<readonly MsgType[]>([]);
  const [processing, setProcessing] = useState(false);
  const [gasLimit, setGasLimit] = useState(200000);
  const [gasLimitError, setGasLimitError] = useState("");
  const [memo, setMemo] = useState("");
  const msgGetters = useRef<MsgGetter[]>([]);

  const msgRegistry = getMsgRegistry();
  // Remove vesting category entirely
  const categories = [...new Set(Object.values(msgRegistry)
    .filter((msg) => msg.category !== "vesting")
    .map((msg) => msg.category))];

  // Message types to exclude
  const excludedMsgTypes = [
    "/cosmos.gov.v1beta1.MsgDeposit",
    "/cosmos.vesting.v1beta1.MsgCreateVestingAccount",
  ];

  // Message types that require validator data
  const validatorRequiredMsgTypes = [
    "/cosmos.staking.v1beta1.MsgDelegate",
    "/cosmos.staking.v1beta1.MsgUndelegate", 
    "/cosmos.staking.v1beta1.MsgBeginRedelegate",
    "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
    "/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission",
    "/cosmos.staking.v1beta1.MsgEditValidator",
    "/cosmos.staking.v1beta1.MsgCreateValidator",
  ];

  const addMsg = (typeUrl: string) => {
    // Load validators if this message type requires them
    if (validatorRequiredMsgTypes.includes(typeUrl)) {
      const validatorsLoaded = !!validatorState.validators.bonded.length;
      if (!validatorsLoaded) {
        loadValidators(chainsDispatch);
      }
    }

    setMsgTypes((oldMsgTypes) => {
      const newMsgTypeUrls: readonly MsgType[] = [
        ...oldMsgTypes,
        { url: typeUrl, key: crypto.randomUUID() },
      ];
      return newMsgTypeUrls;
    });
  };

  const removeMsg = (index: number) => {
    setMsgTypes((oldMsgTypes) => {
      const newMsgTypes = [...oldMsgTypes];
      newMsgTypes.splice(index, 1);
      return newMsgTypes;
    });
    msgGetters.current.splice(index, 1);
  };

  const setMsgGetter = (index: number) => (msgGetter: MsgGetter) => {
    msgGetters.current[index] = msgGetter;
  };

  const router = useRouter();
  
  const createTx = async () => {
    
    const loadingToastId = toast.loading("Creating transaction");
    setProcessing(true);
    // If it fails too fast, toast.dismiss does not work
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      assert(typeof accountOnChain.accountNumber === "number", "accountNumber missing");
      assert(msgGetters.current.length, "form filled incorrectly");

      const msgs = msgGetters.current
        .filter(({ isMsgValid }) => isMsgValid())
        .map(({ msg }) => exportMsgToJson(msg));

      if (!msgs.length || msgs.length !== msgTypes.length) {
        toast.error("Please fill all message forms correctly");
        return;
      }

      if (!Number.isSafeInteger(gasLimit) || gasLimit <= 0) {
        setGasLimitError("gas limit must be a positive integer");
        toast.error("Invalid gas limit");
        return;
      }

      const txData = {
        accountNumber: accountOnChain.accountNumber,
        sequence: accountOnChain.sequence,
        chainId: chain.chainId,
        msgs,
        fee: calculateFee(gasLimit, chain.gasPrice),
        memo,
      };

      // Use accountOnChain.address instead of multisigAddress to match OldCreateTxForm
      const txId = await createDbTx(accountOnChain.address, chain.chainId, txData);
      
      toast.success("Transaction created", { 
        description: `Transaction ID: ${txId}`,
        duration: 5000 
      });
      
      // Navigate to the transaction page using multisigAddress for the URL
      router.push(`/${chain.registryName}/${multisigAddress}/transaction/${txId}`);
      
    } catch (error: unknown) {
      console.error("Transaction creation failed:", error);
      toast.error("Transaction creation failed", {
        description: error instanceof Error ? error.message : "Unknown error occurred"
      });
    } finally {
      setProcessing(false);
      toast.dismiss(loadingToastId);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>トランザクションの作成</CardTitle>
        <CardDescription>
          必要なメッセージカテゴリを展開し、追加したいアクションを選択するとフォームが下に現れます。
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Add message buttons */}
        <Accordion type="multiple" className="w-full divide-y rounded-2xl border bg-gradient-to-b from-background via-card to-background shadow-lg">
          {categories.map((category) => (
            <AccordionItem key={category} value={category} className="border-b last:border-b-0">
              <AccordionTrigger className="group flex flex-1 items-center justify-between rounded-xl px-4 py-3 text-left text-base capitalize transition hover:bg-primary/10">
                <span className="flex items-center gap-3">
                  {(() => {
                    const meta = categoryMeta[category.toLowerCase()];
                    const Icon = meta?.icon ?? Sparkles;
                    return <Icon className="h-5 w-5 text-primary" />;
                  })()}
                  <span>
                    <span className="block font-semibold tracking-wide">
                      {categoryMeta[category.toLowerCase()]?.label ?? category}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {categoryMeta[category.toLowerCase()]?.description ?? "メッセージ一覧"}
                    </span>
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-2 sm:grid-cols-2">
                  {Object.values(msgRegistry)
                    .filter((msg) => msg.category === category)
                    .filter((msg) => !excludedMsgTypes.includes(msg.typeUrl))
                    .map((msg) => (
                      <Button
                        key={msg.typeUrl}
                        onClick={() => addMsg(msg.typeUrl)}
                        disabled={
                          msg.fields
                            .map((f: string) => getField(f))
                            .some((v: string) => v === null) ||
                          Object.values(getMsgSchema(msg.fields, { chain }).shape).some(
                            (v) => v === null,
                          )
                        }
                        variant="outline"
                        className="justify-start gap-2 border-border/60 bg-background/60"
                      >
                        <span className="text-sm font-medium">
                          {msg.name.startsWith("Msg") ? msg.name.slice(3) : msg.name}
                        </span>
                        <span className="text-xs uppercase text-muted-foreground">Add</span>
                      </Button>
                    ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Message forms */}
        {msgTypes.map((msgType, index) => (
          <div key={msgType.key} className="mb-6">
            <MsgForm
              msgType={msgType.url as MsgTypeUrl}
              senderAddress={multisigAddress}
              setMsgGetter={setMsgGetter(index)}
              deleteMsg={() => removeMsg(index)}
            />
          </div>
        ))}

        {/* Gas limit and memo section */}
        {msgTypes.length > 0 && (
          <>
            <div className="form-item space-y-2">
              <label htmlFor="gas-limit" className="text-sm font-medium text-foreground">
                Gas Limit
              </label>
              <Input
                id="gas-limit"
                type="number"
                name="gasLimit"
                value={gasLimit.toString()}
                min={1}
                placeholder="例: 200000"
                onChange={({ target }) => {
                  setGasLimit(Number(target.value));
                  setGasLimitError("");
                }}
              />
              {gasLimitError ? (
                <p className="text-xs text-destructive">{gasLimitError}</p>
              ) : null}
            </div>
            <div className="form-item space-y-2">
              <label htmlFor="memo" className="text-sm font-medium text-foreground">
                Memo（任意）
              </label>
              <Input
                id="memo"
                name="memo"
                value={memo}
                placeholder="例: ガバナンス投票メモ"
                onChange={({ target }) => setMemo(target.value)}
              />
            </div>
            <div className="form-item mt-4">
              <Button 
                onClick={createTx} 
                disabled={processing}
                className="w-full"
              >
                {processing ? "Creating Transaction..." : "Create Transaction"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
