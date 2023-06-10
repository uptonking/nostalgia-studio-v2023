// import * as Joi from '@hapi/joi'
import { type Request } from 'express';
import { type ParamsDictionary } from 'express-serve-static-core';

export interface IRequest<T = {}, P = {}, U extends ParamsDictionary = {}>
  extends Request<U> {
  body: T;
  queryParams: P;
}
