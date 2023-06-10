export * from './models/drawing';
export * from './models/user';
export * from './models/setting';
export * from './models/cart';
export * from './models/order';
export * from './models/subscription';

import type express from 'express';
import { type JwtPayload } from 'jsonwebtoken';
import { type EntityConfig } from '../db';

export interface AppAccessToken extends JwtPayload {
  userId: string;
  roles: string[];
}

export type EnrichedRequest = express.Request & {
  auth: AppAccessToken;
  config?: EntityConfig;
};
