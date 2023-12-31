import React from 'react';
import styled from 'styled-components';

const AccentButtonElem = styled.button<{disabled?: boolean}>`
  height: 40px;
  padding: 0 15px;
  line-height: 40px;
  min-width: 100px;
  text-align: center;
  outline: none;
  background: none;
  font-size: 20px;
  border-radius: 5px;
  color: var(--color_accent);
  border: 1px solid var(--color_accent);
  display: inline-block;
  box-sizing: border-box;
  cursor: ${(props) => (props.disabled ? 'initial' : 'pointer')};
  color: ${(props) =>
    props.disabled ? 'var(--color_dark-grey)' : 'var(--color_accent)'};
  border-color: ${(props) =>
    props.disabled ? 'var(--color_dark-grey)' : 'var(--color_accent)'};

  &:hover,
  &:focus {
    border: 1px solid var(--color_accent);
    color: ${(props) =>
      props.disabled ? 'var(--color_dark-grey)' : 'var(--color_light-grey)'};
    border-color: ${(props) =>
      props.disabled ? 'var(--color_dark-grey)' : 'var(--color_accent)'};
    background-color: ${(props) =>
      props.disabled ? 'transparent' : 'var(--color_accent)'};
  }
`;
const AccentButtonLargeElem = styled(AccentButtonElem)`
  font-size: 24px;
  line-height: 60px;
  height: 60px;
`;
const noop = () => {};

type AccentButtonProps = {
  disabled?: boolean;
  onClick: (...a: any[]) => void;
};

export const AccentButton: React.FC<AccentButtonProps> = (props) => (
  <AccentButtonElem
    {...props}
    onClick={props.disabled ? noop : props.onClick}
  />
);

export const AccentButtonLarge: React.FC<AccentButtonProps> = (props) => (
  <AccentButtonLargeElem
    {...props}
    onClick={props.disabled ? noop : props.onClick}
  />
);
