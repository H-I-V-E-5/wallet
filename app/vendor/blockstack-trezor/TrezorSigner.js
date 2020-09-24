import btc from "bitcoinjs-lib";
import { config as bskConfig } from "blockstack";
import { pathToPathArray } from "./utils";
import TrezorConnect from "../trezor/index";

export class TrezorSigner {
  constructor(hdpath, address) {
    this.address = address;
    this.hdpath = hdpath;
  }

  static createSigner(hdpath) {
    return TrezorSigner.getAddressFrom(hdpath).then(
      address => new TrezorSigner(hdpath, address)
    );
  }

  static translateInput(input) {
    const scriptSig =
      input.script.length > 0 ? input.script.toString("hex") : null;
    return {
      prev_index: input.index,
      prev_hash: Buffer.from(input.hash)
        .reverse()
        .toString("hex"),
      sequence: input.sequence,
      script_sig: scriptSig
    };
  }

  static getPublicKeys(paths): Promise<[string]> {
    const pubkeys = [];
    let curPromise = Promise.resolve();
    paths.forEach(path => {
      curPromise = curPromise.then(prev => {
        if (prev) {
          pubkeys.push(prev);
        }
        return new Promise((resolve, reject) => {
          TrezorConnect.getXPubKey(path, function(result) {
            if (result.success) {
              setTimeout(() => {
                resolve(result.xpubkey);
              }, 200);
            } else {
              reject(result);
            }
          });
        }).then(xpub => btc.bip32.fromBase58(xpub).publicKey.toString("hex"));
      });
    });

    return curPromise.then(pubk => {
      pubkeys.push(pubk);
      return pubkeys;
    });
  }

  static getAddressFrom(hdpath) {
    return TrezorSigner.getPublicKeys([hdpath]).then(pks => {
      const address = btc.payments.p2pkh({ pubkey: Buffer.from(pks[0], "hex") })
        .address;
      return bskConfig.network.coerceAddress(address);
    });
  }

  getAddress() {
    return Promise.resolve(this.address);
  }

  prepareInputs(inputs, myIndex) {
    return inputs.map((input, inputIndex) => {
      const translated = TrezorSigner.translateInput(input);
      if (inputIndex === myIndex) {
        translated["address_n"] = pathToPathArray(this.hdpath);
      } else {
        translated["address_n"] = pathToPathArray(this.hdpath);
      }
      return translated;
    });
  }

  prepareOutputs(outputs) {
    return outputs.map(output => {
      if (btc.script.toASM(output.script).startsWith("OP_RETURN")) {
        const nullData = btc.script.decompile(output.script)[1];
        return {
          op_return_data: nullData.toString("hex"),
          amount: "0",
          script_type: "PAYTOOPRETURN"
        };
      } else {
        const address = bskConfig.network.coerceAddress(
          btc.address.fromOutputScript(output.script)
        );
        return {
          address,
          amount: `${output.value}`,
          script_type: "PAYTOADDRESS"
        };
      }
    });
  }

  signTransaction(txB, signInputIndex) {
    return this.signTransactionSkeleton(txB.__tx, signInputIndex).then(resp => {
      const signedTxHex = resp.tx;
      const signedTx = btc.Transaction.fromHex(signedTxHex);
      const signedTxB = btc.TransactionBuilder.fromTransaction(signedTx);
      if(signInputIndex < 0) {
        for (let i = 0; i < txB.__tx.ins.length; i++) {
          txB.__inputs[i] = signedTxB.__inputs[i];
        }
      } else {
        txB.__inputs[signInputIndex] = signedTxB.__inputs[signInputIndex];
      }
    });
  }

  prepareTransactionInfo(tx, signInputIndex, extra) {
    return Promise.resolve().then(() => {
      // prepare inputs / outputs for trezor format
      var inputs, outputs;
      if (signInputIndex < 0) {
        for (let i = 0; i < tx.ins.length; i++) {
          inputs = this.prepareInputs(tx.ins, i, extra);
          outputs = this.prepareOutputs(tx.outs);
        }
      } else {
        inputs = this.prepareInputs(tx.ins, signInputIndex, extra);
        outputs = this.prepareOutputs(tx.outs);
      }

      return { inputs, outputs };
    });
  }

  signTransactionSkeleton(tx, signInputIndex, extra) {
    return this.prepareTransactionInfo(tx, signInputIndex, extra).then(
      txInfo => {
        return this.promisifySignTx(
          txInfo.inputs,
          txInfo.outputs
        );
      }
    );
  }

  promisifySignTx(inputs, outputs) {
    return new Promise((resolve, reject) => {
      console.log('trezor signer signing TX')
      TrezorConnect.signTx(inputs, outputs, resp => {
        if (!resp.success) {
          if (resp && resp.error) {
            reject(resp.error);
            // throw new Error(`Failed to sign Trezor transaction: ${resp.payload.error}`)
          } else {
            reject("");
            // throw new Error('Failed to sign Trezor transaction.')
          }
        } else {
          setTimeout(() => {
            resolve({ tx: resp.serialized_tx, signatures: resp.signatures });
          }, 200);
        }
      });
    });
  }

  signerVersion() {
    return 1;
  }
}
