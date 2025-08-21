import { StargateClient } from "@/lib/packages/stargate";
import { NextRouter, withRouter } from "next/router";
import { useState } from "react";
import { useChains } from "../../context/ChainsContext";
import { exampleAddress, examplePubkey } from "../../lib/displayHelpers";
import { createMultisigFromCompressedSecp256k1Pubkeys } from "../../lib/multisigHelpers";
import Button from "../inputs/Button";
import Input from "../inputs/Input";
import ThresholdInput from "../inputs/ThresholdInput";
import StackableContainer from "../layout/StackableContainer";

const emptyPubKeyGroup = () => {
  return { address: "", compressedPubkey: "", keyError: "", isPubkey: false };
};

interface Props {
  router: NextRouter;
}

const MultiSigForm = (props: Props) => {
  const { chain } = useChains();
  const [pubkeys, setPubkeys] = useState([emptyPubKeyGroup(), emptyPubKeyGroup()]);
  const [threshold, setThreshold] = useState(2);
  const [processing, setProcessing] = useState(false);

  const handleChangeThreshold = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newThreshold = parseInt(e.target.value, 10);
    if (newThreshold > pubkeys.length || newThreshold <= 0) {
      newThreshold = threshold;
    }
    setThreshold(newThreshold);
  };

  const handleKeyGroupChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const tempPubkeys = [...pubkeys];
    if (e.target.name === "compressedPubkey") {
      tempPubkeys[index].compressedPubkey = e.target.value;
    } else if (e.target.name === "address") {
      tempPubkeys[index].address = e.target.value;
    }
    setPubkeys(tempPubkeys);
  };

  const handleAddKey = () => {
    const tempPubkeys = [...pubkeys];
    setPubkeys(tempPubkeys.concat(emptyPubKeyGroup()));
  };

  const handleRemove = (index: number) => {
    const tempPubkeys = [...pubkeys];
    const oldLength = tempPubkeys.length;
    tempPubkeys.splice(index, 1);
    const newThreshold = threshold > tempPubkeys.length ? tempPubkeys.length : oldLength;
    setPubkeys(tempPubkeys);
    setThreshold(newThreshold);
  };

  const getPubkeyFromNode = async (address: string) => {
    // Check if nodeAddress is available
    if (!chain.nodeAddress) {
      throw new Error("RPC endpoint not available");
    }
    
    // Force HTTPS-only connection to prevent WebSocket security errors
    const client = await StargateClient.connect({ url: chain.nodeAddress, headers: {} });
    const accountOnChain = await client.getAccount(address);
    // console.log("getPubkeyFromNode", JSON.stringify({ accountOnChain }, null, 2));

    // Return the pubkey only if it exists and is not null
    if (accountOnChain?.pubkey) {
      // Extract the actual public key value from the pubkey object
      if (typeof accountOnChain.pubkey === 'object' && accountOnChain.pubkey.value) {
        return accountOnChain.pubkey.value;
      }
      // If it's already a string, return as is
      if (typeof accountOnChain.pubkey === 'string') {
        return accountOnChain.pubkey;
      }
      throw new Error("Invalid public key format returned from chain");
    }
    // If the account exists but has no pubkey, provide helpful guidance
    if (accountOnChain) {
      throw new Error("This address has never sent a transaction, so its public key is not available on-chain. Please use the 'Use Public Key' option and enter the compressed public key directly.");
    }
    throw new Error("Address not found on chain. Please verify the address or use 'Use Public Key' option.");
  };;;

  const handleKeyBlur = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const tempPubkeys = [...pubkeys];
      let pubkey;
      const inputValue = e.target.value;
      
      // use pubkey
      // console.log(tempPubkeys[index]);
      if (tempPubkeys[index].isPubkey) {
        pubkey = inputValue;
        if (pubkey.length !== 44) {
          throw new Error("Invalid Secp256k1 pubkey");
        }
      } else {
        // use address to fetch pubkey
        if (inputValue.length > 0) {
          pubkey = await getPubkeyFromNode(inputValue);
          if (!pubkey) {
            throw new Error("Could not retrieve public key from address");
          }
        } else {
          // Clear the pubkey if address is empty
          pubkey = "";
        }
      }

      // Only set the pubkey if it's valid
      if (pubkey) {
        tempPubkeys[index].compressedPubkey = pubkey;
        tempPubkeys[index].keyError = "";
      } else if (inputValue && inputValue.length > 0) {
        throw new Error("Invalid or empty public key");
      }
      setPubkeys(tempPubkeys);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log(error);
      const tempPubkeys = [...pubkeys];
      tempPubkeys[index].keyError = error.message;
      setPubkeys(tempPubkeys);
    }
  };

  const handleCreate = async () => {
    setProcessing(true);
    
    // Filter out empty pubkeys and validate
    const compressedPubkeys = pubkeys
      .map((item) => item.compressedPubkey)
      .filter((pubkey) => pubkey && pubkey.length > 0);
    
    // Check if we have enough valid pubkeys
    if (compressedPubkeys.length < 2) {
      alert("At least 2 valid public keys are required to create a multisig");
      setProcessing(false);
      return;
    }
    
    // Check if threshold is valid
    if (threshold > compressedPubkeys.length) {
      alert(`Threshold (${threshold}) cannot be greater than number of valid keys (${compressedPubkeys.length})`);
      setProcessing(false);
      return;
    }
    
    let multisigAddress;
    try {
      multisigAddress = await createMultisigFromCompressedSecp256k1Pubkeys(
        compressedPubkeys,
        threshold,
        chain.addressPrefix,
        chain.chainId,
      );
      props.router.push(`/${chain.registryName}/${multisigAddress}`);
    } catch (error) {
      console.log("Failed to create multisig: ", error);
      alert(`Failed to create multisig: ${error.message || error}`);
    } finally {
      setProcessing(false);
    }
  };

  const togglePubkey = (index: number) => {
    const tempPubkeys = [...pubkeys];
    tempPubkeys[index].isPubkey = !tempPubkeys[index].isPubkey;
    setPubkeys(tempPubkeys);
  };

  return (
    <>
      <StackableContainer>
        <StackableContainer lessPadding>
          <p>Add the addresses that will make up this multisig.</p>
        </StackableContainer>
        {pubkeys.map((pubkeyGroup, index) => {
          return (
            <StackableContainer lessPadding lessMargin key={index}>
              <div className="key-row">
                {pubkeys.length > 2 && (
                  <button
                    className="remove"
                    onClick={() => {
                      handleRemove(index);
                    }}
                  >
                    ✕
                  </button>
                )}
                <div className="key-inputs">
                  <Input
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      handleKeyGroupChange(index, e);
                    }}
                    value={
                      pubkeyGroup.isPubkey ? pubkeyGroup.compressedPubkey : pubkeyGroup.address
                    }
                    label={pubkeyGroup.isPubkey ? "Public Key (Secp256k1)" : "Address"}
                    name={pubkeyGroup.isPubkey ? "compressedPubkey" : "address"}
                    width="100%"
                    placeholder={`E.g. ${
                      pubkeyGroup.isPubkey
                        ? examplePubkey(index)
                        : exampleAddress(index, chain.addressPrefix)
                    }`}
                    error={pubkeyGroup.keyError}
                    onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
                      handleKeyBlur(index, e);
                    }}
                  />
                  <button className="toggle-type" onClick={() => togglePubkey(index)}>
                    Use {pubkeyGroup.isPubkey ? "Address" : "Public Key"}
                  </button>
                </div>
              </div>
            </StackableContainer>
          );
        })}

        <Button label="Add another address" onClick={() => handleAddKey()} />
      </StackableContainer>
      <StackableContainer>
        <StackableContainer lessPadding>
          <ThresholdInput
            onChange={handleChangeThreshold}
            value={threshold}
            total={pubkeys.length}
          />
        </StackableContainer>

        <StackableContainer lessPadding lessMargin>
          <p>
            This means that each transaction this multisig makes will require {threshold} of the
            members to sign it for it to be accepted by the validators.
          </p>
        </StackableContainer>
      </StackableContainer>
      <Button primary onClick={handleCreate} label="Create Multisig" loading={processing} />
      <style jsx>{`
        .key-inputs {
          display: flex;
          flex-direction: column;
          align-items: end;
          justify-content: space-between;
          max-width: 350px;
        }
        .error {
          color: coral;
          font-size: 0.8em;
          text-align: left;
          margin: 0.5em 0;
        }
        .key-row {
          position: relative;
        }
        button.remove {
          background: rgba(255, 255, 255, 0.2);
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: none;
          color: white;
          position: absolute;
          right: -23px;
          top: -22px;
        }
        p {
          margin-top: 1em;
        }
        p:first-child {
          margin-top: 0;
        }
        .toggle-type {
          margin-top: 10px;
          font-size: 12px;
          font-style: italic;
          border: none;
          background: none;
          color: white;
          text-decoration: underline;
        }
      `}</style>
    </>
  );
};

export default withRouter(MultiSigForm);
