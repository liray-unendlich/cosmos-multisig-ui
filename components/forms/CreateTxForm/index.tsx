import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useChains } from "@/context/ChainsContext";
import { loadValidators } from "@/context/ChainsContext/helpers";
import { getField, getMsgSchema } from "@/lib/form";
import { getMsgRegistry } from "@/lib/msg";
import { createDbTx } from "@/lib/api";
import { exportMsgToJson } from "@/lib/txMsgHelpers";
import { calculateFee } from "@cosmjs/stargate";
import { EncodeObject } from "@cosmjs/proto-signing";
import { assert } from "@cosmjs/utils";
import { useRouter } from "next/router";
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

export default function CreateTxForm({ 
  accountOnChain,
  multisigAddress 
}: {
  accountOnChain: any;
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

  // Generate a valid bech32-compatible placeholder address 
  // using only valid bech32 characters (excludes 'o' and other invalid chars)
  const placeholderAddress = `${chain.addressPrefix}1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a new transaction</CardTitle>
        <CardDescription>You can add several different messages.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Add message buttons */}
        {categories.map((category) => (
          <div key={category}>
            <h3 className="text-lg font-semibold mb-2">{category}</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.values(msgRegistry)
                .filter((msg) => msg.category === category)
                .filter((msg) => !excludedMsgTypes.includes(msg.typeUrl))
                .map((msg) => (
                  <Button
                    key={msg.typeUrl}
                    onClick={() => addMsg(msg.typeUrl)}
                    disabled={
                      msg.fields.map((f: string) => getField(f)).some((v: string) => v === null) ||
                      Object.values(getMsgSchema(msg.fields, { chain }).shape).some(
                        (v) => v === null,
                      )
                    }
                  >
                    Add {msg.name.startsWith("Msg") ? msg.name.slice(3) : msg.name}
                  </Button>
                ))}
            </div>
          </div>
        ))}

        {/* Message forms */}
        {msgTypes.map((msgType, index) => (
          <div key={msgType.key} className="mb-6">
            <MsgForm 
              msgTypeUrl={msgType.url}
              index={index}
              delegatorAddress={placeholderAddress}
              setMsgGetter={setMsgGetter(index)}
              deleteMsg={() => removeMsg(index)}
            />
          </div>
        ))}

        {/* Gas limit and memo section */}
        {msgTypes.length > 0 && (
          <>
            <div className="form-item">
              <Input
                type="number"
                label="Gas Limit"
                name="gasLimit"
                value={gasLimit.toString()}
                onChange={({ target }) => {
                  setGasLimit(Number(target.value));
                  setGasLimitError("");
                }}
                error={gasLimitError}
              />
            </div>
            <div className="form-item">
              <Input
                label="Memo (optional)"
                name="memo"
                value={memo}
                onChange={({ target }) => setMemo(target.value)}
              />
            </div>
            <div className="form-item">
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

        {/* Render added message forms */}
        {msgTypes.map((msgType, index) => (
          <MsgForm
            key={msgType.key}
            msgType={msgType.url as MsgTypeUrl}
            senderAddress={multisigAddress}
            setMsgGetter={setMsgGetter(index)}
            deleteMsg={() => removeMsg(index)}
          />
        ))}

        {/* Gas and Memo settings */}
        {msgTypes.length > 0 && (
          <div className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Gas Limit</label>
                <input
                  type="number"
                  value={gasLimit}
                  onChange={(e) => {
                    setGasLimit(Number(e.target.value));
                    setGasLimitError("");
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
                {gasLimitError && (
                  <p className="text-red-500 text-sm mt-1">{gasLimitError}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Memo (optional)</label>
                <input
                  type="text"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Transaction memo"
                />
              </div>
            </div>
          </div>
        )}

        {/* Create Transaction button */}
        {msgTypes.length > 0 && (
          <div className="mt-6">
            <Button 
              onClick={createTx} 
              className="w-full"
              disabled={processing}
            >
              {processing ? "Creating Transaction..." : "Create Transaction"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}