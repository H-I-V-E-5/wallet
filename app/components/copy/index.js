import React from "react";
import { Flex, Tooltip } from "blockstack-ui/dist";
import CopyIcon from "mdi-react/ContentCopyIcon";
import { Hover, State } from "react-powerplug";
import { CopyToClipboard } from "react-copy-to-clipboard";

const Copy = ({ value = "", ...rest }) => (
  <State initial={{ copied: false }}>
    {({ state: { copied }, setState }) => {
      const handleCopy = () => {
        setState(state => ({ copied: !state.copied }));
      };
      const resetState = () => {
        setState(() => ({ copied: false }));
      };

      return (
        <Hover>
          {({ hovered, bind }) => (
            <Flex
              color="hsl(205, 30%, 70%)"
              alignItems="center"
              justifyContent="center"
              opacity={hovered ? 1 : 0.5}
              cursor="pointer"
              {...bind}
              onMouseLeave={() => {
                bind.onMouseLeave();
                if (copied) {
                  resetState();
                }
              }}
              {...rest}
            >
              <Tooltip text={copied ? "已复制！" : "复制"}>
                <CopyToClipboard text={value} onCopy={handleCopy}>
                  <Flex py={2} px={3}>
                    <CopyIcon size={18} />
                  </Flex>
                </CopyToClipboard>
              </Tooltip>
            </Flex>
          )}
        </Hover>
      );
    }}
  </State>
);

export { Copy };
