import React from "react";
import { Type, Buttons, Flex } from "blockstack-ui/dist";
import { Button } from "@components/button/index";
import { Link } from "react-router-dom";
import { Hover } from "react-powerplug";

const PrimaryButton = ({ label, ...props }) => (
  <Button {...props}>{label}</Button>
);

export const TextLink = ({
  label,
  children,
  hoverBg = "blue.dark",
  bg = "#8FA6B8",
  onDark,
  typeProps,
  ...rest
}) =>
  children || label ? (
    <Hover>
      {({ hovered, bind }) => (
        <Type
          pt={3}
          fontSize={1}
          fontWeight={600}
          cursor={hovered ? "pointer" : undefined}
          color={hovered ? (onDark ? "blue.light" : hoverBg) : bg}
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

const BackButton = ({ to, onClick, onDark, ...props }) =>
  to ? (
    <Link to={to}>
      <TextLink onDark={onDark}>返回</TextLink>
    </Link>
  ) : (
    <Flex onClick={onClick}>
      <TextLink onDark={onDark}>返回</TextLink>
    </Flex>
  );

const ButtonCombo = ({ primary, secondary, ...rest }) => (
  <Buttons
    justifyContent="center"
    alignItems="center"
    flexDirection="column"
    {...rest}
  >
    {primary ? (
      primary.component ? (
        primary.component
      ) : (
        <PrimaryButton {...primary} />
      )
    ) : null}
    {secondary ? <TextLink {...secondary} /> : null}
  </Buttons>
);

const OnboardingNavigation = ({
  back,
  next,
  nextLabel = "继续",
  onDark
}) => {
  return back || next ? (
    <Buttons
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      pt={6}
    >
      {next ? (
        typeof next === "object" ? (
          <PrimaryButton
            invert
            label={next.label}
            onClick={next.action}
            {...next.props}
          />
        ) : typeof next === "function" ? (
          <PrimaryButton invert label={nextLabel} onClick={next} />
        ) : (
          <PrimaryButton invert label={nextLabel} to={next} />
        )
      ) : null}
      {back ? (
        typeof back === "function" ? (
          <BackButton onDark={onDark} onClick={back} />
        ) : (
          <BackButton onDark={onDark} to={back} />
        )
      ) : null}
    </Buttons>
  ) : null;
};

export { OnboardingNavigation, ButtonCombo };
