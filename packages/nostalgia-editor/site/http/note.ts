import Axios from 'axios';

import { IRequestContext } from '../common/types';

export const request = (requestContext: IRequestContext) =>
  Axios.create({
    baseURL: 'https://backend-keyboardnotes.herokuapp.com',
    headers: {
      Authorization: `bearer ${requestContext.token}`,
    },
  });

export const getNotes = async (requestContext: IRequestContext) => {
  const response = await request(requestContext).get(`/notes`);

  return response.data.notes;
};

export const createNote = async (requestContext: IRequestContext) => {
  const response = await request(requestContext).post(`/notes`);

  return response.data.note;
};

export const updateNote = async (
  requestContext: IRequestContext,
  id: string,
  values: any,
) => {
  const response = await request(requestContext).patch(`/notes/${id}`, values);

  return response.data.note;
};

export const deleteNote = async (
  requestContext: IRequestContext,
  id: string,
) => {
  const response = await request(requestContext).delete(`/notes/${id}`);

  return response.status === 200;
};
