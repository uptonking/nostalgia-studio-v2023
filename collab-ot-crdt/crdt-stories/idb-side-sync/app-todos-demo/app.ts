import {
  initDefaultTodoTypes,
  loadAndApplyProfileSettings,
  render,
  setupSync,
} from './main';

// Delay the sync setup a bit to avoid taking resources away from getting the app to a usable state.
// setTimeout(setupSync, 1000);

loadAndApplyProfileSettings();

initDefaultTodoTypes();

render();
