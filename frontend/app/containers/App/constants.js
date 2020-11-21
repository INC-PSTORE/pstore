/*
 * AppConstants
 * Each action has a corresponding type, which the reducer knows and picks up on.
 * To avoid weird typos between the reducer and the actions, we save them as
 * constants here. We prefix them with 'yourproject/YourComponent' so we avoid
 * reducers accidentally picking up actions they shouldn't.
 *
 * Follow this format:
 * export const YOUR_ACTION_CONSTANT = 'yourproject/YourContainer/YOUR_ACTION_CONSTANT';
 */

export const HANDLE_FAILURE_GLOBALLY = 'devbowl/App/HANDLE_FAILURE_GLOBALLY';

export const LOAD_KEY_FROM_STORAGE =
  'devbowl/App/LOAD_KEY_FROM_STORAGE';

export const CREATE_ETH_ACCOUNT =
  'devbowl/App/CREATE_ETH_ACCOUNT';

export const IMPORT_ETH_ACCOUNT =
  'devbowl/App/IMPORT_ETH_ACCOUNT';

export const CREATE_PRIVATE_INC_ACCOUNT =
  'devbowl/App/CREATE_PRIVATE_INC_ACCOUNT';

export const IMPORT_PRIVATE_INC_ACCOUNT =
  'devbowl/App/IMPORT_PRIVATE_INC_ACCOUNT';

export const CREATE_TEMP_INC_ACCOUNT =
  'devbowl/App/CREATE_TEMP_INC_ACCOUNT';

export const IMPORT_TEMP_INC_ACCOUNT =
  'devbowl/App/IMPORT_TEMP_INC_ACCOUNT';

export const UPDATE_ACCOUNT =
  'devbowl/App/UPDATE_ACCOUNT';

export const LOAD_ACCOUNTS =
  'devbowl/App/LOAD_ACCOUNTS';
export const LOAD_ACCOUNTS_SUCCESS =
  'devbowl/App/LOAD_ACCOUNTS_SUCCESS';
export const LOAD_ACCOUNTS_FAILURE =
  'devbowl/App/LOAD_ACCOUNTS_FAILURE';

export const TOGGLE_INFO_DIALOG =
  'devbowl/App/TOGGLE_INFO_DIALOG';
export const TOGGLE_PAPPS_MENU_LIST =
  'devbowl/App/TOGGLE_PAPPS_MENU_LIST';
export const CLOSE_PAPPS_MENU_LIST =
  'devbowl/App/CLOSE_PAPPS_MENU_LIST';

export const COUNT_UP_REQUESTS =
  'devbowl/App/COUNT_UP_REQUESTS';
export const COUNT_DOWN_REQUESTS =
  'devbowl/App/COUNT_DOWN_REQUESTS';

export const ENABLE_META_MASK_ACCOUNTS =
  'devbowl/App/ENABLE_META_MASk_ACCOUNTS';

export const SWITCH_NETWORK =
  'devbowl/App/SWITCH_NETWORK';

export const ENABLE_WALLET_CONNECT_ACCOUNTS =
  'devbowl/App/ENABLE_WALLET_CONNECT_ACCOUNTS';

export const OPEN_WALLET_LIST =
  'devbowl/App/OPEN_WALLET_LIST';