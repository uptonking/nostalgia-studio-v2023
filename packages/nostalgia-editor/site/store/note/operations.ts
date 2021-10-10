import { message } from 'antd';
import { uniqueId } from 'lodash';

import { AppActions, IRequestContext } from '../../common/types';
import {
  createNote as _createNote,
  deleteNote as _deleteNote,
  getNotes as _getNotes,
  updateNote as _updateNote,
} from '../../http/note';
import {
  addNote,
  addNoteError,
  addNoteSuccess,
  fetchNotes,
  fetchNotesError,
  fetchNotesSuccess,
  removeNote,
  removeNoteError,
  removeNoteSuccess,
  setActiveNote,
  updateNote,
  updateNoteError,
  updateNoteSuccess,
} from './actions';
import { AppState } from '..';

// import { ThunkAction } from 'redux-thunk';

export const loadNotes =
  (
    requestContext: IRequestContext,
    // ): ThunkAction<void, AppState, unknown, AppActions> =>
  ) =>
  async (dispatch) => {
    dispatch(fetchNotes());

    try {
      const notes = await _getNotes(requestContext);
      dispatch(fetchNotesSuccess(notes));
    } catch (err) {
      dispatch(fetchNotesError(err.message));
    }
  };

export const createNote =
  (
    requestContext: IRequestContext,
    // ): ThunkAction<void, AppState, unknown, AppActions> =>
  ) =>
  // async (dispatch) => {
  (dispatch) => {
    // console.log('createNote, ', requestContext);
    dispatch(addNote());

    if (!requestContext.token) {
      const fakeNote = {
        _id: uniqueId(),
        title: 'Untitled',
        createdAt: new Date().toDateString(),
        body: '',
      };

      // console.log(';; createLocalNote', fakeNote);
      dispatch(addNoteSuccess(fakeNote));

      // return requestContext.history?.push(`/notes/${fakeNote._id}`);
      return requestContext.navigate(`/notes/${fakeNote._id}`);
    }

    // try {
    //   const note = await _createNote(requestContext);
    //   dispatch(addNoteSuccess(note));

    //   // requestContext.history?.push(`/notes/${note._id}`);
    //   requestContext.navigate(`/notes/${note._id}`);
    // } catch (err) {
    //   dispatch(addNoteError(err.message));
    // }
  };

export const patchNote =
  (
    requestContext: IRequestContext,
    id: string,
    values: any,
    // ): ThunkAction<void, AppState, unknown, AppActions> =>
  ) =>
  async (dispatch, getState) => {
    const note = getState().note.notes.find((n) => n._id === id);

    const newNote = {
      ...note,
      ...values,
    };

    dispatch(updateNote());
    dispatch(updateNoteSuccess(newNote));

    if (!requestContext.token) return;

    try {
      await _updateNote(requestContext, id, values);
    } catch (err) {
      dispatch(updateNoteError(err.message));
    }
  };

export const deleteNote =
  (
    requestContext: IRequestContext,
    id: string,
    // ): ThunkAction<void, AppState, unknown, AppActions> =>
  ) =>
  async (dispatch) => {
    dispatch(removeNote());
    dispatch(removeNoteSuccess(id));

    if (!requestContext.token) return;

    try {
      await _deleteNote(requestContext, id);
      message.success('Note deleted successfully!');
    } catch (err) {
      dispatch(removeNoteError(err.message));
    }
  };

export const browseNotes =
  (
    requestContext: IRequestContext,
    direction: 'up' | 'down',
    // ): ThunkAction<void, AppState, unknown, AppActions> =>
  ) =>
  async (dispatch, getState) => {
    const { notes, activeNote } = getState().note as any;

    const nextNoteId =
      notes[
        notes.findIndex((n) => n._id === activeNote) +
          (direction === 'up' ? -1 : 1)
      ]?._id || activeNote;

    dispatch(setActiveNote(nextNoteId));

    // if (requestContext.history) {
    //   requestContext.history.push(`/notes/${nextNoteId}`);
    // }
    if (requestContext.navigate) {
      requestContext.navigate(`/notes/${nextNoteId}`);
    }
  };
