import React, { useState } from "react";
import styled from "styled-components";

const SwitchWrapper = styled.label`
  position: relative;
  display: inline-block;
  width: 54px;
  height: 28px;
`;

const SwitchInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
`;

const Slider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--bg-300);
  transition: 0.4s;
  border-radius: 34px;

  &:before {
    position: absolute;
    content: "";
    height: 24px;
    width: 24px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }

  ${(props) =>
    props.checked &&
    `
    background-color: var(--primary-100);

    &:before {
      transform: translateX(26px);
    }
  `}
`;

const ToggleSwitch = ({ onChange, checked: controlledChecked }) => {
  const [internalChecked, setInternalChecked] = useState(false);
  const isControlled = controlledChecked !== undefined;
  const isChecked = isControlled ? controlledChecked : internalChecked;

  const handleChange = () => {
    const next = !isChecked;
    if (!isControlled) setInternalChecked(next);
    onChange?.(next);
  };

  return (
    <SwitchWrapper>
      <SwitchInput
        type="checkbox"
        checked={isChecked}
        onChange={handleChange}
      />
      <Slider checked={isChecked} />
    </SwitchWrapper>
  );
};

export default ToggleSwitch;
