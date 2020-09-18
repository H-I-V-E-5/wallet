import React from "react";
import { Button, Type, Flex, Card } from "blockstack-ui";
import { HardwareSteps } from "@containers/hardware-steps";
import { ledgerSteps } from "@screens/onboarding/hardware-wallet/ledger";
import { trezorSteps } from "@screens/onboarding/hardware-wallet/trezor";
import { WALLET_TYPES } from "@stores/reducers/wallet";
import { decodeRawTx } from "@utils/stacks";
import { ERRORS } from "@common/lib/transactions";

const HardwareView = ({
  wrapper: Wrapper,
  nextView,
  prevView,
  children,
  type,
  hide,
  doSignTransaction,
  state,
  sender,
  setState,
  ...rest
}) => {
  const handleSubmit = async () => {
    setState({
      processing: true
    });
    try {
      const tx = await doSignTransaction(
        sender,
        state.values.recipient,
        state.values.amount,
        type,
        "",
        state.values.memo || ""
      );

      if (tx && tx.error) {
        console.log("error");
        console.log(tx);
        if (
          tx.error.message &&
          tx.error.message.includes("Not enough UTXOs to fund. Left to fund: ")
        ) {
          const difference = Number(
            tx.error.message.replace(
              "Not enough UTXOs to fund. Left to fund: ",
              ""
            )
          );
          setState({
            errors: {
              ...ERRORS.INSUFFICIENT_BTC_BALANCE,
              difference
            }
          });
        }
        return;
      }
      const decoded = await decodeRawTx(tx.rawTx);

      setState(
        {
          tx: {
            ...tx,
            decoded
          }
        },
        () => nextView()
      );
    } catch (e) {
      console.log("caught error, processing done");
      console.log(e);
      setState({
        processing: false
      });
    }
  };
  return children ? (
    <Wrapper hide={hide}>
      <Flex flexDirection="column" alignItems="center" pt={4}>
        <Type pb={6} fontSize={4}>
          请连接{type === WALLET_TYPES.TREZOR ? "Trezor" : "Ledger"}硬件钱包
        </Type>
        <HardwareSteps
          steps={type === WALLET_TYPES.TREZOR ? trezorSteps : ledgerSteps}
        >
          {({ step, next, hasNext, lastView, prev }) => (
            <Flex pt={4}>
              {children({
                next: {
                  label: state.processing
                    ? "加载中…"
                    : hasNext
                    ? "下一步"
                    : "继续",
                  action: () => (hasNext ? next() : handleSubmit()),
                  props: {
                    style: {
                      pointerEvents: state.processing ? "none" : "unset"
                    }
                  }
                },
                secondary: [
                  {
                    label: "返回",
                    action: prevView
                  }
                ].concat(
                  hasNext
                    ? [
                        {
                          label: "跳过",
                          action: lastView
                        }
                      ]
                    : []
                )
              })}
            </Flex>
          )}
        </HardwareSteps>
      </Flex>
    </Wrapper>
  ) : null;
};
export { HardwareView };
