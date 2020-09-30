import React, { Component } from "react";
import { Box, Flex, Buttons, Type } from "blockstack-ui/dist";
import { Button } from "@components/button/index";
import { Seed } from "@components/seed/index";
import { Page } from "@components/page";
import { OnboardingNavigation } from "@containers/buttons/onboarding-navigation";
import { ROUTES } from "@common/constants";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import {
  selectWalletLoading,
  selectWalletSeed,
  selectWalletStacksAddress
} from "@stores/selectors/wallet";
import {
  doAddSoftwareWalletAddress,
  doClearSeed,
  doRefreshData
} from "@stores/actions/wallet";
import { mnemonicToStxAddress, emptySeedArray } from "@utils/utils";
import { getSeedFromAnyString } from "@common/utils";

const Title = ({ ...rest }) => (
  <Type
    display="block"
    fontSize={7}
    fontWeight="300"
    fontFamily="brand"
    lineHeight={1.3}
    {...rest}
  />
);

class ConfirmSeedScreen extends Component {
  constructor(props) {
    super(props);
  }

  state = {
    seed: null,
    confirmSeedArray: null,
    error: null,
    loading: false
  };

  componentWillMount = () => {
    this.resetConfirmSeedArray();
  };

  resetConfirmSeedArray = () => {
    this.setState({
      confirmSeedArray: emptySeedArray(24)
    });
  };

  validateSeed = () => {
    const confirmSeed = this.state.confirmSeedArray.join(" ");
    if (confirmSeed === this.props.seed) {
      return true;
    } else {
      return false;
    }
  };

  handleConfirmSuccess = () => {
    if (this.validateSeed()) {
      const address = mnemonicToStxAddress(this.props.seed);
      this.props.doAddSoftwareWalletAddress(address);
      this.props.doClearSeed();
      this.props.doRefreshData(false);
      this.resetConfirmSeedArray();
      this.setState({ error: null });
      setTimeout(() => {
        this.props.history.push(ROUTES.DASHBOARD);
      }, 10);
    } else {
      this.setState({
        error: "The seed phrase you entered does not match."
      });
    }
  };

  handleKeyPress = (event, index) => {
    if (event.key === " ") {
      event.preventDefault();
    }
  };

  handleInputChange = (event, index) => {
    const value = event.target.value;
    if (value && value.includes(" ")) return;
    const newConfirmSeedArray = this.state.confirmSeedArray;
    newConfirmSeedArray[index] = value;
    this.setState({
      confirmSeed: newConfirmSeedArray
    });
  };

  handleOnPaste = (event, index) => {
    if (index === 0) {
      const pasted = event.clipboardData.getData("Text");

      const split = getSeedFromAnyString(pasted);

      if (split.length === 24) {
        split.forEach((word, i) => {
          this.handleInputChange(
            {
              target: {
                value: word
              }
            },
            i
          );
        });
      }
    }
  };

  render() {
    const {
      doAddSoftwareWalletAddress,
      doClearSeed,
      doRefreshData,
      loading,
      stxAddress,
      seed,
      ...rest
    } = this.props;

    return (
      <Page alignItems="center" justifyContent="center" {...rest}>
        <Flex
          flexGrow={1}
          flexDirection="column"
          bg="blue.dark"
          color="white"
          justifyContent="center"
          alignItems="center"
          textAlign="center"
          {...rest}
        >
          <Box maxWidth="600px">
            <Title>确认助记</Title>
          </Box>
          <Type
            pt={5}
            pb={2}
            Type
            lineHeight={1.5}
            fontSize={2}
            color="hsl(242, 56%, 75%)"
            maxWidth="600px"
          >
            请按顺序重复之前记下的助记
          </Type>
          <Seed
            seedPhrase={seed}
            handleOnPaste={this.handleOnPaste}
            isInput
            handleKeyPress={this.handleKeyPress}
            handleChange={this.handleInputChange}
            values={this.state.confirmSeedArray}
            small
          />
          {this.state.error && (
            <Type
              lineHeight={1.5}
              fontSize={2}
              pt={1}
              color="hsl(10, 85%, 50%)"
            >
              {this.state.error}
            </Type>
          )}
          <Buttons maxWidth="420px" mx="auto" flexDirection="column" pt={5}>
            <Button outline invert onClick={this.handleConfirmSuccess}>完成</Button>
            <OnboardingNavigation
                  onDark
                  back={ROUTES.NEW_SEED}
                />
          </Buttons>
        </Flex>
      </Page>
    );
  }
}

export default connect(
  state => ({
    loading: selectWalletLoading(state),
    seed: selectWalletSeed(state),
    stxAddress: selectWalletStacksAddress(state)
  }),
  {
    doAddSoftwareWalletAddress,
    doRefreshData,
    doClearSeed
  }
)(withRouter(ConfirmSeedScreen));
