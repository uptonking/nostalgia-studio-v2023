// // import './assets/onb-inspector-v3.css';
// import 'antd/dist/antd.css';

// import './index.css';

// import * as React from 'react';
// import { useContext, useEffect, useMemo, useReducer, useState } from 'react';
// import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

// import { WELCOME_NOTE, starterTutorials } from './http/mockData';
// import { NotesAppProvider, appInitialState, combinedReducer } from './store';
// import { NotesAppContext } from './store/context';
// // import {
// //   Button,
// //   Item,
// //   Provider as RSProvider,
// //   View,
// //   darkTheme,
// //   defaultTheme,
// //   lightTheme,
// // } from '@adobe/react-spectrum';
// // import { MDXProvider } from '@mdx-js/react';
// import { FETCH_NOTES_SUCCESS } from './store/note/types';
// import NoteView from './views/NoteView';
// import NotesView from './views/NotesView';

// function AppBase() {
//   // const { isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
//   const { isAuthenticated, isLoading, getAccessTokenSilently } = useMemo(
//     () => ({
//       isAuthenticated: false,
//       isLoading: false,
//       getAccessTokenSilently: () => {},
//     }),
//     [],
//   );
//   // const dispatch = useDispatch();
//   const { dispatch } = useContext(NotesAppContext);

//   useEffect(() => {
//     // (async () => {
//     (() => {
//       // if (isAuthenticated && !isLoading) {
//       //   // const token = await getAccessTokenSilently();
//       //   const token = undefined;
//       //   // dispatch(loadNotes({ token }));
//       // }
//       if (!isLoading) {
//         dispatch({
//           type: FETCH_NOTES_SUCCESS,
//           // payload: [WELCOME_NOTE],
//           payload: starterTutorials,
//         });
//       }
//     })();
//   }, [dispatch, getAccessTokenSilently, isAuthenticated, isLoading]);

//   return (
//     // <RSProvider theme={defaultTheme}>
//     // <RSProvider theme={darkTheme}>
//     // <RSProvider theme={lightTheme}>
//     <Router>
//       <Routes>
//         <Route path='/' element={<NotesView />} />
//         <Route path='/notes/:id' element={<NoteView />} />
//       </Routes>
//     </Router>

//     // </RSProvider>
//   );
// }

// // export function NoteApp2() {
// //   return (
// //     <ReduxProvider store={globalReduxStore}>
// //       <AppBase />
// //     </ReduxProvider>
// //   );
// // }

// export function NoteApp() {
//   const [appState, dispatch] = useReducer(combinedReducer, appInitialState);
//   const ctxVal = useMemo(() => ({ appState, dispatch }), [appState]);

//   // console.log(';;appState, ', appState);

//   return (
//     <NotesAppProvider value={ctxVal}>
//       <AppBase />
//     </NotesAppProvider>
//   );
// }

// export default NoteApp;
