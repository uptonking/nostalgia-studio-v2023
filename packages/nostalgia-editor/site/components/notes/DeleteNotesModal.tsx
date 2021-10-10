import { Typography } from 'antd';
import Modal from 'antd/lib/modal/Modal';
import * as React from 'react';
import { useContext } from 'react';

import { AppState, NotesAppContext } from '../../store';
import { removeSelectedNote } from '../../store/note/actions';
import { deleteNote } from '../../store/note/operations';

// import { useAuth0 } from "@auth0/auth0-react";
// import { useSelector, useDispatch } from 'react-redux';

interface IDeleteNotesProps {
  setDeleteNotesIsOpen: (value: boolean) => void;
  visible: boolean;
}

export default function DeleteNotesModal({
  setDeleteNotesIsOpen,
  visible,
}: IDeleteNotesProps) {
  const { appState: state, dispatch } = useContext(NotesAppContext);
  // const state = useSelector((state: AppState) => state);
  // const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  // const { getAccessTokenSilently, isAuthenticated } = {
  //   getAccessTokenSilently: () => {},
  //   isAuthenticated: true,
  // };
  // const dispatch = useDispatch();

  const { activeNote, selectedNotes } = state.note;

  return (
    <Modal
      visible={visible}
      title='Are you sure you want to delete this note?'
      cancelText='Cancel'
      okText='Yes, delete'
      okButtonProps={{ danger: true }}
      onCancel={() => setDeleteNotesIsOpen(false)}
      onOk={async () => {
        // const token = isAuthenticated
        //   ? await getAccessTokenSilently()
        //   : undefined;
        const token = undefined;

        setDeleteNotesIsOpen(false);

        if (selectedNotes.length) {
          return selectedNotes.forEach((id) => {
            dispatch(deleteNote({ token }, id));
            dispatch(removeSelectedNote(id));
          });
        }

        dispatch(deleteNote({ token }, activeNote));
      }}
    >
      <Typography.Text type='secondary'>
        This note will be completely deleted and not recoverable.
      </Typography.Text>
    </Modal>
  );
}
