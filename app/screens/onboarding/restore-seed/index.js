import React, { Component } from "react";
import { Box, Flex, Buttons, Type, Input } from "blockstack-ui/dist";
import { Button } from "@components/button/index";
import { Seed } from "@components/seed/index";
import { Page } from "@components/page";
import { OnboardingNavigation } from "@containers/buttons/onboarding-navigation";
import { Hover } from "react-powerplug";
import { ROUTES } from "@common/constants";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import bip39 from 'bip39';
import { 
  selectWalletLoading, 
  selectWalletSeed, 
  selectWalletStacksAddress 
} from "@stores/selectors/wallet";
import { doAddSoftwareWalletAddress, doClearSeed, doRefreshData } from "@stores/actions/wallet";
import { mnemonicToStxAddress, emptySeedArray } from '@utils/utils'

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

export const SeedLengthButton = ({
  label,
  children,
  hoverBg = "blue.dark",
  bg = "#8FA6B8",
  onDark,
  disabled,
  highlighted,
  typeProps,
  ...rest
}) =>
  children || label ? (
    <Hover>
      {({ hovered, bind }) => (
        <Type
          pt={1}
          fontSize={1}
          fontWeight={600}
          cursor={hovered && !disabled ? "pointer" : undefined}
          color={highlighted ? "blue.light" : (hovered && !disabled ? (onDark ? "blue.light" : hoverBg) : bg)}
          style={{
            userSelect: "none"
          }}
          {...bind}
          {...rest}
        >
          {children || label}
        </Type>
      )}
    </Hover>
  ) : null;

const SeedLengthSelector = ({length, handleClick}) => {
  const twelve = length === 12
  return (
    <Flex> 
      <SeedLengthButton 
        disabled={twelve} 
        onDark 
        highlighted={twelve} 
        onClick={!twelve ? handleClick : null}
      >
        12 words
      </SeedLengthButton> 
      <Type color="blue.light" pt={1}>&nbsp;|&nbsp;</Type>
      <SeedLengthButton 
        disabled={!twelve} 
        onDark 
        highlighted={!twelve} 
        onClick={twelve ? handleClick : null}
      >
        24 words
      </SeedLengthButton>
    </Flex>
  )
}

class RestoreSeedScreen extends Component {
  constructor(props) {
    super(props);
  }

  state = {
    seedArray: null,
    seedLength: 24,
    error: null,
    loading: false
  };

  componentWillMount = () => {
    this.resetSeedArray()
  }

  resetSeedArray = () => {
    this.setState({
      seedArray: emptySeedArray(this.state.seedLength)
    })
  }

  validateSeed = () => {
    const seed = this.state.seedArray.join(' ')
    if (bip39.validateMnemonic(seed)) {
      return true
    } else {
      return false
    }
  }

  handleConfirmSuccess = () => {
    if (this.validateSeed()) {
      var seed = this.state.seedArray.join(' ')
      const address = mnemonicToStxAddress(seed)
      this.props.doAddSoftwareWalletAddress(address);
      this.props.doClearSeed();
      this.props.doRefreshData(false);
      this.resetSeedArray();
      this.setState({
        error: null
      });
      seed = ''
      setTimeout(() => {
        this.props.history.push(ROUTES.DASHBOARD);
      }, 10);
    } else {
      this.setState({
        error: "The seed phrase you entered is invalid."
      });
    }
  }

  handleKeyPress = (event, index) => {
    if(event.key === ' ') {
      event.preventDefault()
    }
  }

  handleInputChange = (event, index) => {
    const newSeedArray = this.state.seedArray
    newSeedArray[index] = event.target.value
    this.setState({
      seedArray: newSeedArray
    })
  }

  handleSeedLengthClick = () => {
    this.setState({
      seedLength: this.state.seedLength === 12 ? 24 : 12
    }, this.resetSeedArray)
  }

  render () {
    const { 
      doAddSoftwareWalletAddress, 
      doClearSeed,
      doRefreshData, 
      loading, 
      stxAddress, 
      seed,
      ...rest 
    } = this.props

    return (
      <Page
        alignItems="center"
        justifyContent="center"
        {...rest}
      >
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
            <Title>输入助记</Title>
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
            请按顺序输入24单词助记恢复钱包
          </Type>
          {/* <SeedLengthSelector length={this.state.seedLength} handleClick={this.handleSeedLengthClick} /> */}
          <Seed 
            isInput={true}
            numWords={this.state.seedLength} 
            handleKeyPress={this.handleKeyPress}
            handleChange={this.handleInputChange}
            values={this.state.seedArray}
            small={true}
          />
          { this.state.error && 
            <Type lineHeight={1.5} fontSize={2} pt={1} color="hsl(10, 85%, 50%)">
              {this.state.error}
            </Type>
          }
          <Buttons maxWidth="420px" mx="auto" flexDirection="column" pt={4}>
            <Button outline invert onClick={this.handleConfirmSuccess}>恢复</Button>
            <OnboardingNavigation
                  onDark
                  back={ROUTES.RESTORE_OPTIONS}
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
    stxAddress: selectWalletStacksAddress(state)
  }),
  {
    doAddSoftwareWalletAddress,
    doRefreshData,
    doClearSeed
  }
)(withRouter(RestoreSeedScreen));
