import React from "react";
import { Button, Buttons, Flex, Type } from "blockstack-ui/dist";
import { State } from "react-powerplug";
import { Modal } from "@components/modal";
import { Label } from "@components/field";
import { doResetWallet } from "@stores/actions/wallet";
import { OpenModal } from "@components/modal";
import { TxFeesModal } from "@containers/modals/tx-fees-top-up";
import { connect } from "react-redux";
import {
  selectWalletType,
  selectWalletBitcoinBalance
} from "@stores/selectors/wallet";
import { WALLET_TYPES } from "@stores/reducers/wallet";
import { satoshisToBtc } from "@utils/utils";

const Card = ({ ...rest }) => (
  <Flex
    width={1}
    bg="white"
    borderRadius={6}
    border={1}
    borderColor="blue.mid"
    alignItems="center"
    flexShrink={0}
    {...rest}
  />
);

const Section = ({ ...rest }) => (
  <Flex
    p={4}
    borderBottom={1}
    borderColor="blue.mid"
    bg="blue.light"
    flexShrink={0}
    flexDirection="column"
    {...rest}
  />
);

const TopUpSection = connect(state => ({
  type: selectWalletType(state),
  balance: selectWalletBitcoinBalance(state)
}))(({ type, balance, ...rest }) =>
  type !== WALLET_TYPES.WATCH_ONLY ? (
    <Section>
      <Label pb={4} fontSize={2}>
        转账手续费
      </Label>
      <Card>
        <Flex p={4} borderRight={1} borderColor="blue.mid" flexGrow={1}>
          <Type>
            转账STX需要支付少量的BTC手续费。现有{satoshisToBtc(balance)} BTC可用于支付手续费
          </Type>
        </Flex>
        <Flex justifyContent="center" p={4}>
          <OpenModal component={TxFeesModal}>
            {({ bind }) => (
              <Button height={"auto"} py={2} {...bind}>
                充值BTC
              </Button>
            )}
          </OpenModal>
        </Flex>
      </Card>
    </Section>
  ) : null
);

const DangerZone = connect(
  null,
  { doResetWallet }
)(({ doResetWallet, hide, ...rest }) => (
  <Section>
    <Label pb={4} fontSize={2}>
    重置钱包
    </Label>
    <Card>
      <Flex
        p={4}
        flexDirection="column"
        borderRight={1}
        borderColor="blue.mid"
        flexGrow={1}
      >
        <Type>
          退出当前登录的钱包。不影响钱包余额。如重新登录需要输入助记。
        </Type>
      </Flex>
      <Flex justifyContent="center" alignItems="center" p={4} >
        <State initial={{ clicked: false }}>
          {({ state, setState }) => {
            if (state.clicked) {
              return (
                <Button
                  onClick={() => {
                    hide();
                    setTimeout(() => doResetWallet(), 300);
                  }}
                  height={"auto"}
                  py={2}
                  bg="#EF4813"
                >
                  确定重置钱包
                </Button>
              );
            }
            return (
              <Button
                onClick={() => {
                  setState({ clicked: true });
                }}
                height={"auto"}
                py={2}
                bg="#EF4813"
              >
                重置钱包
              </Button>
            );
          }}
        </State>
      </Flex>
    </Card>
  </Section>
));
const SettingsModal = ({ hide, ...rest }) => {
  return (
    <Modal title="设置" hide={hide} p={0} width="90vw">
      <TopUpSection />
      <DangerZone hide={hide} />
      <Flex flexDirection="column" p={4} flexShrink={0}>
        <Buttons>
          <Button height={"auto"} py={2} onClick={hide}>
            关闭
          </Button>
        </Buttons>
      </Flex>
    </Modal>
  );
};

export { SettingsModal };
