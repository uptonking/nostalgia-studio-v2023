import React, { useCallback, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { AppState, NotesAppContext } from '../../store';
import { setIsTyping } from '../../store/note/actions';
import { browseNotes, patchNote } from '../../store/note/operations';
import Note from './Note';

// import { useDispatch, useSelector } from 'react-redux';
// import { useAuth0 } from "@auth0/auth0-react";

/**
 * 主要处理一篇笔记文章编辑时的快捷键
 */
export default function NoteContainer() {
  const { appState: state, dispatch } = useContext(NotesAppContext);
  // const state = useSelector((state: AppState) => state);
  // const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  // const { getAccessTokenSilently, isAuthenticated } = {
  //   getAccessTokenSilently: () => {},
  //   isAuthenticated: true,
  // };
  // const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const note = state.note.notes.find(({ _id }) => _id === id);
  const { spotlight, shortcuts } = state.interface;

  // Add keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (spotlight.isOpen || shortcuts.isOpen) return;

      switch (e.keyCode) {
        case 27: // 'esc'
          return navigate('/');
        case 74: // 'j'
          if (!e.ctrlKey) return;

          e.preventDefault();
          // return dispatch(browseNotes({ history }, 'down'));
          return dispatch(browseNotes({ navigate }, 'down'));
        case 75: // 'k'
          if (!e.ctrlKey) return;

          e.preventDefault();
          // return dispatch(browseNotes({ history }, 'up'));
          return dispatch(browseNotes({ navigate }, 'up'));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.getSelection()?.removeAllRanges();
      dispatch(setIsTyping(false));
    };
  }, [dispatch, navigate, shortcuts.isOpen, spotlight.isOpen]);

  const onChange = async (values: any) => {
    // const token = isAuthenticated ? await getAccessTokenSilently() : undefined;
    const token = undefined;

    if (!note) return;

    dispatch(patchNote({ token }, note._id, values));
  };

  const updateIsTyping = useCallback(
    (value) => dispatch(setIsTyping(value)),
    [dispatch],
  );

  return (
    <Note
      setIsTyping={updateIsTyping}
      onChange={(body) => onChange({ body })}
      onChangeTitle={(title) => onChange({ title })}
      onClickNextNote={() => dispatch(browseNotes({ navigate }, 'down'))}
      onClickPreviousNote={() => dispatch(browseNotes({ navigate }, 'up'))}
      notes={state.note.notes}
      valueTitle={note?.title}
      value={note?.body}
      key={note?._id}
    />
  );
}
