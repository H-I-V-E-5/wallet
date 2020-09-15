import React from "react";
import { Button, Buttons, Flex, Type } from "blockstack-ui/dist";
import { State } from "react-powerplug";
import { Modal } from "@components/modal";
import { Link } from "react-router-dom";
import { ROUTES } from "@common/constants";
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

const SoftwareWarningModal = ({ hide, proceed, history, ...rest }) => {
  return (
    <Modal title="建议使用硬件钱包" fontSize={4} hide={hide} p={0} width="90vw">
      <Flex 
        flexDirection="column" 
        p={4} 
        flexShrink={0} 
        textAlign="center"
        justifyContent="center"
        alignItems="center">
          <Type      
            pb={2}
            Type
            lineHeight={1.5}
            fontSize={2}
            pt={4}
            maxWidth="600px">
            <p>硬件钱包能更有效的保护您的Stacks币。</p><p>如果不使用，请在继续前仔细阅读有关说明。</p>
          </Type>
          <Buttons maxWidth="420px" mx="auto" flexDirection="column" pt={5} pb={5}>
            <Button onClick={() => proceed(hide)} mb={3} bg="#EF4813">
              继续
            </Button>
            <Button onClick={hide}>
              返回
            </Button>
          </Buttons>
      </Flex>
    </Modal>
  );
};

export { SoftwareWarningModal };
