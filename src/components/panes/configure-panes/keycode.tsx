import React, {FC, useState, useEffect} from 'react';
import styled from 'styled-components';
import styles from '../../menus/keycode-menu.module.css';
import {Button} from '../../inputs/button';
import {KeycodeModal} from '../../inputs/custom-keycode-modal';
import {title, component} from '../../icons/keyboard';
import {
  keycodeInMaster,
  getByteForCode,
  getKeycodes,
  getOtherMenu,
  IKeycode,
  IKeycodeMenu,
} from '../../../utils/key';
import {ErrorMessage} from '../../styled';
import {
  KeycodeType,
  getLightingDefinition,
  isVIADefinitionV3,
  isVIADefinitionV2,
} from 'via-reader';
import {OverflowCell, SubmenuOverflowCell, Row} from '../grid';
import {getNextKey} from '../../positioned-keyboard';
import {useDispatch} from 'react-redux';
import {useAppSelector} from 'src/store/hooks';
import {
  getSelectedDefinition,
  getSelectedKeyDefinitions,
} from 'src/store/definitionsSlice';
import {getSelectedConnectedDevice} from 'src/store/devicesSlice';
import {
  getSelectedKey,
  getSelectedKeymap,
  updateKey as updateKeyAction,
  updateSelectedKey,
} from 'src/store/keymapSlice';
import {
  disableGlobalHotKeys,
  enableGlobalHotKeys,
  getDisableFastRemap,
} from 'src/store/settingsSlice';
const KeycodeList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, 54px);
  grid-auto-rows: 54px;
  justify-content: center;
  grid-gap: 10px;
`;

const MenuContainer = styled.div`
  padding: 15px 20px 20px 10px;
`;

const SubmenuRow = styled(Row)`
  padding-left: 8px;
`;

const Keycode = styled(Button)`
  border-radius: 2px;
  width: 50px;
  height: 50px;
  line-height: 18px;
  font-size: 14px;
  box-shadow: none;
  background: var(--color_dark-grey);
  color: var(--color_light_grey);
  margin: 0;
`;

const CustomKeycode = styled(Button)`
  border-radius: 2px;
  width: 50px;
  height: 50px;
  line-height: 18px;
  font-size: 14px;
  box-shadow: none;
  background: var(--color_accent);
  border-color: var(--color_light-grey);
  color: var(--color_light_grey);
  margin: 0;
`;

const KeycodeContainer = styled.div`
  padding: 12px;
  padding-bottom: 30px;
`;

const KeycodeDesc = styled.div`
  position: fixed;
  bottom: 0;
  background: #d9d9d97a;
  box-sizing: border-box;
  transition: opacity 0.4s ease-out;
  height: 25px;
  width: 100%;
  line-height: 14px;
  padding: 5px;
  font-size: 14px;
  opacity: 1;
  &:empty {
    opacity: 0;
  }
`;

const Link = styled.a`
  font-size: 16x !important;
  color: var(--color_accent);
  text-decoration: underline;
`;

const KeycodeCategories = getKeycodes()
  .concat(getOtherMenu())
  .filter((menu) => !['Other', 'Mod+_'].includes(menu.label));

const maybeFilter = <M extends Function>(maybe: boolean, filter: M) =>
  maybe ? () => true : filter;

export const Pane: FC = () => {
  const dispatch = useDispatch();
  const macros = useAppSelector((state) => state.macros);
  const selectedDefinition = useAppSelector(getSelectedDefinition);
  const selectedDevice = useAppSelector(getSelectedConnectedDevice);
  const matrixKeycodes = useAppSelector(getSelectedKeymap);
  const selectedKey = useAppSelector(getSelectedKey);
  const disableFastRemap = useAppSelector(getDisableFastRemap);
  const selectedKeyDefinitions = useAppSelector(getSelectedKeyDefinitions);

  // TODO: improve typing so we can get rid of this
  if (!selectedDefinition || !selectedDevice || !matrixKeycodes) {
    return null;
  }

  const [selectedCategory, setSelectedCategory] = useState(
    KeycodeCategories[0].label,
  );
  const [mouseOverDesc, setMouseOverDesc] = useState<string | null>(null);
  const [showKeyTextInputModal, setShowKeyTextInputModal] = useState(false);

  useEffect(
    () => () => {
      dispatch(updateSelectedKey(null));
    },
    [],
  ); // componentWillUnmount equiv

  const getEnabledMenus = (): IKeycodeMenu[] => {
    if (isVIADefinitionV3(selectedDefinition)) {
      return [];
    }
    const {lighting, customKeycodes} = selectedDefinition;
    const {keycodes} = getLightingDefinition(lighting);
    return KeycodeCategories.filter(
      maybeFilter(
        keycodes === KeycodeType.QMK,
        ({label}) => label !== 'QMK Lighting',
      ),
    )
      .filter(
        maybeFilter(
          keycodes === KeycodeType.WT,
          ({label}) => label !== 'Lighting',
        ),
      )
      .filter(
        maybeFilter(
          typeof customKeycodes !== 'undefined',
          ({label}) => label !== 'Custom',
        ),
      );
  };

  const renderMacroError = () => {
    return (
      <ErrorMessage>
        It looks like your current firmware doesn't support macros.{' '}
        <Link href="https://beta.docs.qmk.fm/newbs" target="_blank">
          How do I update my firmware?
        </Link>
      </ErrorMessage>
    );
  };

  const renderCategories = () => {
    return (
      <MenuContainer>
        {getEnabledMenus().map(({label}) => (
          <SubmenuRow
            selected={label === selectedCategory}
            onClick={(_) => setSelectedCategory(label)}
            key={label}
          >
            {label}
          </SubmenuRow>
        ))}
      </MenuContainer>
    );
  };

  const renderKeyInputModal = () => {
    dispatch(disableGlobalHotKeys());

    return (
      <KeycodeModal
        defaultValue={selectedKey ? matrixKeycodes[selectedKey] : undefined}
        onExit={() => {
          dispatch(enableGlobalHotKeys());
          setShowKeyTextInputModal(false);
        }}
        onConfirm={(keycode) => {
          dispatch(enableGlobalHotKeys());
          updateKey(keycode);
          setShowKeyTextInputModal(false);
        }}
      />
    );
  };

  const updateKey = (value: number) => {
    if (selectedKey !== null) {
      dispatch(updateKeyAction(selectedKey, value));
      dispatch(
        updateSelectedKey(
          disableFastRemap || !selectedKeyDefinitions
            ? null
            : getNextKey(selectedKey, selectedKeyDefinitions),
        ),
      );
    }
  };

  const handleClick = (code: string, i: number) => {
    if (code == 'text') {
      setShowKeyTextInputModal(true);
    } else {
      return keycodeInMaster(code) && updateKey(getByteForCode(code));
    }
  };

  const renderKeycode = (keycode: IKeycode, index: number) => {
    const {code, title, name} = keycode;
    return (
      <Keycode
        className={[
          !keycodeInMaster(code) && code != 'text' && styles.disabled,
          styles.keycode,
        ].join(' ')}
        key={code}
        onClick={() => handleClick(code, index)}
        onMouseOver={(_) =>
          setMouseOverDesc(title ? `${code}: ${title}` : code)
        }
        onMouseOut={(_) => setMouseOverDesc(null)}
      >
        <div className={styles.innerKeycode}>{name}</div>
      </Keycode>
    );
  };

  const renderCustomKeycode = () => {
    return (
      <CustomKeycode
        onClick={() => selectedKey !== null && handleClick('text', 0)}
        onMouseOver={(_) => setMouseOverDesc('Enter any QMK Keycode')}
        onMouseOut={(_) => setMouseOverDesc(null)}
      >
        Any
      </CustomKeycode>
    );
  };

  const renderSelectedCategory = (
    keycodes: IKeycode[],
    selectedCategory: string,
  ) => {
    const keycodeListItems = keycodes.map((keycode, i) =>
      renderKeycode(keycode, i),
    );
    switch (selectedCategory) {
      case 'Macro': {
        return !macros.isFeatureSupported ? (
          renderMacroError()
        ) : (
          <KeycodeList>{keycodeListItems}</KeycodeList>
        );
      }
      case 'Special': {
        return (
          <KeycodeList>
            {keycodeListItems.concat(renderCustomKeycode())}
          </KeycodeList>
        );
      }
      case 'Custom': {
        if (
          !isVIADefinitionV2(selectedDefinition) ||
          !selectedDefinition.customKeycodes
        ) {
          return null;
        }
        return (
          <KeycodeList>
            {selectedDefinition.customKeycodes.map((keycode, idx) => {
              return renderKeycode(
                {
                  ...keycode,
                  code: `USER${idx.toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false,
                  })}`,
                },
                idx,
              );
            })}
          </KeycodeList>
        );
      }
      default: {
        return <KeycodeList>{keycodeListItems}</KeycodeList>;
      }
    }
  };

  const selectedCategoryKeycodes = KeycodeCategories.find(
    ({label}) => label === selectedCategory,
  )?.keycodes as IKeycode[];

  return (
    <>
      <SubmenuOverflowCell>{renderCategories()}</SubmenuOverflowCell>
      <OverflowCell>
        <KeycodeContainer>
          {renderSelectedCategory(selectedCategoryKeycodes, selectedCategory)}
        </KeycodeContainer>
        <KeycodeDesc>{mouseOverDesc}</KeycodeDesc>
        {showKeyTextInputModal && renderKeyInputModal()}
      </OverflowCell>
    </>
  );
};

export const Icon = component;
export const Title = title;
