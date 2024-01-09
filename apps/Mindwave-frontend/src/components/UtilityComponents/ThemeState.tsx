// themeState.js
import { atom } from 'recoil';

export const themeState = atom({
  key: 'themeState', // unique ID (with respect to other atoms/selectors)
  default: 'light', // default value (aka initial value)
});
