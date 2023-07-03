import React from 'react';
import {anyKeycodeToString} from '../../../utils/advanced-keys';
import {AccentButton} from '../accent-button';
import {KeycodeModal} from '../custom-keycode-modal';
import type {PelpiInput} from './input';

export const PelpiKeycodeInput: React.VFC<PelpiInput<{}>> = (props) => {
  const [showModal, setShowModal] = React.useState(false);

  return (
    <>
      <AccentButton onClick={() => setShowModal(true)}>
        {anyKeycodeToString(props.value)}
      </AccentButton>
      {showModal && (
        <KeycodeModal
          defaultValue={props.value}
          onChange={props.setValue}
          onConfirm={(keycode) => {
            props.setValue(keycode);
            setShowModal(false);
          }}
          onExit={() => setShowModal(false)}
        />
      )}
    </>
  );
};
