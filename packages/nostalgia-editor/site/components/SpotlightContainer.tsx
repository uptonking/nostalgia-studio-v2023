import { message } from 'antd';
import copy from 'copy-to-clipboard';
import React, { useContext } from 'react';
import { useMatch, useNavigate, useParams } from 'react-router-dom';
import showdown from 'showdown';

import { AppState, NotesAppContext } from '../store';
import { toggleInterfaceItem } from '../store/interface/operations';
import { addSelectedNote, resetSelectedNotes } from '../store/note/actions';
import { createNote, deleteNote } from '../store/note/operations';
import SpotlightModal from './SpotlightModal';

// import { useAuth0 } from "@auth0/auth0-react";
// import { useDispatch, useSelector } from 'react-redux';

const converter = new showdown.Converter({ completeHTMLDocument: true });

export default function SpotlightContainer() {
  // const dispatch = useDispatch();
  const navigate = useNavigate();
  const isPathMatched = useMatch('/notes/:id');
  const { id } = useParams();

  // const { notes, activeNote, selectedNotes } = useSelector(
  //   (state: AppState) => state.note,
  // );
  const {
    appState: {
      note: { notes, activeNote, selectedNotes },
    },
    dispatch,
  } = useContext(NotesAppContext);

  // const { getAccessTokenSilently, isAuthenticated, logout, loginWithRedirect } =
  //   {
  //     getAccessTokenSilently: () => {},
  //     isAuthenticated: false,
  //     logout: false,
  //     loginWithRedirect: false,
  //   };
  const isAuthenticated = false;

  const note = notes.find(({ _id }) => _id === activeNote);

  const onSelect = async (event: string) => {
    // const token = isAuthenticated ? await getAccessTokenSilently() : undefined;
    const token = undefined;

    switch (event) {
      case 'New note':
        dispatch(createNote({ token, navigate }));
        break;
      case 'Select':
        dispatch(addSelectedNote(activeNote));
        break;
      case 'Archive (Delete)': {
        // if (match.path === '/notes/:id') {
        if (isPathMatched) {
          dispatch(deleteNote({ token }, id));
          navigate('/');
        } else if (selectedNotes.length) {
          selectedNotes.forEach((note) => {
            dispatch(deleteNote({ token }, note));
          });
          dispatch(resetSelectedNotes());
        } else {
          dispatch(deleteNote({ token }, activeNote));
        }
        break;
      }
      case 'Sign in (Log in)':
        // loginWithRedirect();
        break;
      case 'Sign out (Log out)':
        // logout();
        break;
      case 'Copy as Markdown':
        if (!note) return;

        copy(note.body);
        message.success('Markdown copied to clipboard!');
        break;
      case 'Share note (dark)':
      case 'Share note (light)': {
        if (!note) return;

        const mode = event.split('(')[1].split(')')[0];
        const encodedBody = encodeURIComponent(note.body);
        const encodedTitle = encodeURIComponent(`# ${note.title}`);
        const encodedMarkdown = encodedTitle + '%0A' + encodedBody;
        copy(
          `https://rmmd.link/?markdown=${encodedMarkdown}&darkMode=${
            mode === 'dark'
          }`,
        );
        message.success('Url copied to clipboard!');
        break;
      }
      case 'Copy as HTML':
        if (!note) return;

        copy(converter.makeHtml(note.body));
        message.success('HTML copied to clipboard!');
        break;
      case 'Shortcuts':
        dispatch(toggleInterfaceItem('shortcuts'));
    }

    dispatch(toggleInterfaceItem('spotlight', false));
  };

  const getOptions = () => {
    return isPathMatched
      ? [
          {
            label: 'New note',
            value: 'New note',
          },
          {
            label: 'Archive (Delete)',
            value: 'Archive (Delete)',
          },
          {
            label: 'Share note',
            value: 'Share note',
            options: [
              {
                label: 'Dark mode',
                value: 'Share note (dark)',
              },
              {
                label: 'Light mode',
                value: 'Share note (light)',
              },
            ],
          },
          {
            label: 'Copy note as',
            value: 'copy',
            options: [
              {
                label: 'Markdown',
                value: 'Copy as Markdown',
              },
              {
                label: 'HTML',
                value: 'Copy as HTML',
              },
            ],
          },
          {
            label: 'Shortcuts',
            value: 'Shortcuts',
          },
          isAuthenticated
            ? { label: 'Sign out (Log out)', value: 'Sign out (Log out)' }
            : { label: 'Sign in (Log in)', value: 'Sign in (Log in)' },
        ]
      : [
          {
            label: 'New note',
            value: 'New note',
            command: 'c',
          },
          {
            label: 'Select',
            value: 'Select',
            command: 'x',
          },
          {
            label: 'Archive (Delete)',
            value: 'Archive (Delete)',
            command: 'e',
          },
          {
            label: 'Shortcuts',
            value: 'Shortcuts',
          },
          isAuthenticated
            ? { label: 'Sign out (Log out)', value: 'Sign out (Log out)' }
            : { label: 'Sign in (Log in)', value: 'Sign in (Log in)' },
        ];
  };

  return (
    <SpotlightModal
      onClose={() => dispatch(toggleInterfaceItem('spotlight'))}
      options={getOptions()}
      onSelect={onSelect}
    />
  );
}
