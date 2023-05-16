import express from 'express';

import { tokenCheckWare } from '../../shared/auth';
import { listHandler } from '../../shared/model-api/routes';
import { UserActiveModel } from '../../shared/types';
import {
  edit,
  forgot,
  login,
  register,
  social,
  socialCheck,
} from './controller';

export const profileRouter = express.Router();

/**
 * @swagger
 * /profile/login:
 *   post:
 *     tags:
 *       - profile
 *     summary: Login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 */
profileRouter.post('/profile/login', login);

/**
 * @swagger
 * /profile/register:
 *   post:
 *     tags:
 *       - profile
 *     summary: Register
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 */
profileRouter.post('/profile/register', register);

profileRouter.post('/profile/edit', tokenCheckWare, edit);

profileRouter.post('/profile/logoff', (_req, res) => {
  res.json({ success: true });
});

profileRouter.post('/profile/forgot', forgot);

/**
 * @swagger
 * /profile/social:
 *  post:
 *    tags:
 *      - profile
 */
profileRouter.post('/profile/social', social);

/**
 * @swagger
 * /profile/social/check:
 *  post:
 *    tags:
 *      - profile
 */
profileRouter.post('/profile/social/check', socialCheck);

profileRouter.get('/active', async (req, res) => {
  const handler = listHandler.bind(UserActiveModel);
  const items = await handler(req, res);
  res.json(items);
});

export default profileRouter;
