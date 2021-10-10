// import { applyMiddleware, combineReducers, createStore } from 'redux';
// import { composeWithDevTools } from 'redux-devtools-extension';
// import thunk from 'redux-thunk';

import interfaceReducer, {
  initialState as interfaceInitialState,
} from './interface/reducers';
import notesReducer, {
  initialState as noteInitialState,
} from './note/reducers';

export { NotesAppContext, NotesAppProvider } from './context';

export function combiningReducer(state, action) {
  return {
    note: notesReducer(state.note, action),
    interface: interfaceReducer(state.interface, action),
  };
}

export type AppState = ReturnType<typeof combiningReducer>;

export const appInitialState = {
  note: noteInitialState,
  interface: interfaceInitialState,
};

// const rootReducer = combineReducers({
//   note: notesReducer,
//   interface: interfaceReducer,
// });

// const store = createStore(
//   rootReducer,
//   composeWithDevTools(applyMiddleware(thunk)),
// );

// export default store;
