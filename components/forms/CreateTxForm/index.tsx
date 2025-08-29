import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useChains } from "@/context/ChainsContext";
import { loadValidators } from "@/context/ChainsContext/helpers";
import { getField, getMsgSchema } from "@/lib/form";
import { getMsgRegistry } from "@/lib/msg";
import { EncodeObject } from "@cosmjs/proto-signing";
import { useRef, useState } from "react";
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

export default function CreateTxForm() {
  const { chain, validatorState, chainsDispatch } = useChains();
  const [msgTypes, setMsgTypes] = useState<readonly MsgType[]>([]);
  const msgGetters = useRef<MsgGetter[]>([]);

  const msgRegistry = getMsgRegistry();
  const categories = [...new Set(Object.values(msgRegistry).map((msg) => msg.category))];

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

  const createTx = () => {
    console.log("Creating transaction with messages:", msgGetters.current.map(g => g.msg));
    // TODO: Implement actual transaction creation
  };

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
            <h3>{category}</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.values(msgRegistry)
                .filter((msg) => msg.category === category)
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

        {/* Render added message forms */}
        {msgTypes.map((msgType, index) => (
          <MsgForm
            key={msgType.key}
            msgType={msgType.url as MsgTypeUrl}
            senderAddress="placeholder-address" // TODO: Get actual sender address
            setMsgGetter={setMsgGetter(index)}
            deleteMsg={() => removeMsg(index)}
          />
        ))}

        {/* Create Transaction button */}
        {msgTypes.length > 0 && (
          <div className="mt-4">
            <Button onClick={createTx} className="w-full">
              Create Transaction
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}