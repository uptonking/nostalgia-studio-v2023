import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';

import { NotesAppContext } from '../../store/context';
import { toggleInterfaceItem } from '../../store/interface/operations';
import {
  addSelectedNote,
  removeSelectedNote,
  setActiveNote,
} from '../../store/note/actions';
import {
  browseNotes,
  createNote,
  deleteNote,
} from '../../store/note/operations';
import DeleteNotesModal from './DeleteNotesModal';
import Notes from './Notes';

// import { AppState } from '../../store';
// import { useDispatch, useSelector } from 'react-redux';

/**
 * 主页默认显示的笔记列表，主要处理全局快捷键事件
 */
export default function NotesContainer() {
  // const state = useSelector((state: AppState) => state);
  const { appState: state, dispatch } = useContext(NotesAppContext);
  const [deleteNotesIsOpen, setDeleteNotesIsOpen] = useState<boolean>(false);
  const { getAccessTokenSilently, isAuthenticated, loginWithRedirect } =
    useMemo(
      () => ({
        getAccessTokenSilently: false,
        isAuthenticated: false,
        loginWithRedirect: () => {},
      }),
      [],
    );
  const navigate = useNavigate();
  // const dispatch = useDispatch();

  const { notes, fetchNotesStatus, activeNote, selectedNotes } = state.note;
  const { spotlight } = state.interface;

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (spotlight.isOpen) return;

      // ? await getAccessTokenSilently()
      // const token = isAuthenticated ? undefined : undefined;
      const token = undefined;

      switch (e.keyCode) {
        case 74: // 'j'
        case 40: // 'down'
          dispatch(toggleInterfaceItem('shortcuts', false));
          // return dispatch(browseNotes({}, 'down'));
          return browseNotes({}, 'down')(dispatch, () => state);
        case 75: // 'k'
        case 38: // 'up'
          dispatch(toggleInterfaceItem('shortcuts', false));
          // return dispatch(browseNotes({}, 'up'));
          return browseNotes({}, 'up')(dispatch, () => state);
        case 13: {
          // 'enter'
          e.preventDefault();

          if (deleteNotesIsOpen) {
            if (selectedNotes.length) {
              setDeleteNotesIsOpen(false);
              return selectedNotes.forEach((id) => {
                dispatch(deleteNote({ token }, id));
                dispatch(removeSelectedNote(id));
              });
            }

            setDeleteNotesIsOpen(false);
            return dispatch(deleteNote({ token }, activeNote));
          }
          return navigate(`/notes/${activeNote}`);
        }
        case 67: {
          // 'c'
          e.preventDefault();
          dispatch(toggleInterfaceItem('shortcuts', false));
          console.log(';;key-c');
          // return dispatch(createNote({ token, history }));
          return createNote({ token, navigate })(dispatch);
        }
        case 69: // 'e'
          if (!activeNote) return;

          dispatch(toggleInterfaceItem('shortcuts', false));
          return setDeleteNotesIsOpen(true);
        case 88: // 'x'
          dispatch(toggleInterfaceItem('shortcuts', false));
          return selectedNotes.includes(activeNote)
            ? dispatch(removeSelectedNote(activeNote))
            : dispatch(addSelectedNote(activeNote));
        case 27: // 'esc'
          if (deleteNotesIsOpen) {
            return setDeleteNotesIsOpen(false);
          }

          if (selectedNotes.length) {
            return selectedNotes.forEach((id) => {
              dispatch(removeSelectedNote(id));
            });
          }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    activeNote,
    deleteNotesIsOpen,
    dispatch,
    getAccessTokenSilently,
    navigate,
    isAuthenticated,
    selectedNotes,
    spotlight.isOpen,
    state,
  ]);

  const routingToNoteById = useCallback(
    (id) => navigate(`/notes/${id}`),
    [navigate],
  );

  return (
    <React.Fragment>
      <DeleteNotesModal
        setDeleteNotesIsOpen={setDeleteNotesIsOpen}
        visible={deleteNotesIsOpen}
      />

      <Notes
        notes={notes}
        onNoteClick={routingToNoteById}
        login={loginWithRedirect}
        isAuthenticated={isAuthenticated}
        isLoading={fetchNotesStatus === 'loading'}
        selectedNotes={selectedNotes}
        activeNote={activeNote}
        createNote={async () => {
          // ? await getAccessTokenSilently()
          const token = isAuthenticated ? undefined : undefined;
          dispatch(createNote({ token, navigate }));
        }}
        onMouseEnter={(id) => {
          dispatch(setActiveNote(id));
        }}
      />
    </React.Fragment>
  );
}
