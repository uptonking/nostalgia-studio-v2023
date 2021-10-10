import { INote } from '../../common/types';

// FETCH

export const FETCH_NOTES = 'keyboardnotes/note/FETCH_NOTES';
export const FETCH_NOTES_SUCCESS = 'keyboardnotes/note/FETCH_NOTES_SUCCESS';
export const FETCH_NOTES_ERROR = 'keyboardnotes/note/FETCH_NOTES_ERROR';

export interface IFetchNotesAction {
  type: typeof FETCH_NOTES;
}
export interface IFetchNotesSuccessAction {
  type: typeof FETCH_NOTES_SUCCESS;
  payload: INote[];
}
export interface IFetchNotesErrorAction {
  type: typeof FETCH_NOTES_ERROR;
  payload: string;
}

// ADD

export const ADD_NOTE = 'keyboardnotes/note/ADD_NOTE';
export const ADD_NOTE_SUCCESS = 'keyboardnotes/note/ADD_NOTE_SUCCESS';
export const ADD_NOTE_ERROR = 'keyboardnotes/note/ADD_NOTE_ERROR';

export interface IAddNoteAction {
  type: typeof ADD_NOTE;
}
export interface IAddNoteSuccessAction {
  type: typeof ADD_NOTE_SUCCESS;
  payload: INote;
}
export interface IAddNoteErrorAction {
  type: typeof ADD_NOTE_ERROR;
  payload: string;
}

// UPDATE

export const UPDATE_NOTE = 'keyboardnotes/note/UPDATE_NOTE';
export const UPDATE_NOTE_SUCCESS = 'keyboardnotes/note/UPDATE_NOTE_SUCCESS';
export const UPDATE_NOTE_ERROR = 'keyboardnotes/note/UPDATE_NOTE_ERROR';

export interface IUpdateNoteAction {
  type: typeof UPDATE_NOTE;
}
export interface IUpdateNoteSuccessAction {
  type: typeof UPDATE_NOTE_SUCCESS;
  payload: INote;
}
export interface IUpdateNoteErrorAction {
  type: typeof UPDATE_NOTE_ERROR;
  payload: string;
}

// REMOVE

export const REMOVE_NOTE = 'keyboardnotes/note/REMOVE_NOTE';
export const REMOVE_NOTE_SUCCESS = 'keyboardnotes/note/REMOVE_NOTE_SUCCESS';
export const REMOVE_NOTE_ERROR = 'keyboardnotes/note/REMOVE_NOTE_ERROR';

export interface IRemoveNoteAction {
  type: typeof REMOVE_NOTE;
}
export interface IRemoveNoteSuccessAction {
  type: typeof REMOVE_NOTE_SUCCESS;
  payload: string;
}
export interface IRemoveNoteErrorAction {
  type: typeof REMOVE_NOTE_ERROR;
  payload: string;
}

// SET NOTE

export const SET_ACTIVE_NOTE = 'keyboardnotes/note/SET_ACTIVE_NOTE';

export interface ISetActiveNoteAction {
  type: typeof SET_ACTIVE_NOTE;
  payload: string;
}

// SELECTED NOTES

export const ADD_SELECTED_NOTE = 'keyboardnotes/note/ADD_SELECTED_NOTE';
export const REMOVE_SELECTED_NOTE = 'keyboardnotes/note/REMOVE_SELECTED_NOTE';
export const RESET_SELECTED_NOTES = 'keyboardnotes/note/RESET_SELECTED_NOTES';

export interface IAddSelectedNoteAction {
  type: typeof ADD_SELECTED_NOTE;
  payload: string;
}
export interface IRemoveSelectedNoteAction {
  type: typeof REMOVE_SELECTED_NOTE;
  payload: string;
}
export interface IResetSelectedNotesAction {
  type: typeof RESET_SELECTED_NOTES;
}

// SET IS TYPING

export const SET_IS_TYPING = 'keyboardnotes/note/SET_IS_TYPING';

export interface ISetIsTypingAction {
  type: typeof SET_IS_TYPING;
  payload: boolean;
}

export type NoteActions =
  | IFetchNotesAction
  | IFetchNotesSuccessAction
  | IFetchNotesErrorAction
  | IAddNoteAction
  | IAddNoteSuccessAction
  | IAddNoteErrorAction
  | IUpdateNoteAction
  | IUpdateNoteSuccessAction
  | IUpdateNoteErrorAction
  | IRemoveNoteAction
  | IRemoveNoteSuccessAction
  | IRemoveNoteErrorAction
  | ISetActiveNoteAction
  | IAddSelectedNoteAction
  | IRemoveSelectedNoteAction
  | IResetSelectedNotesAction
  | ISetIsTypingAction;
