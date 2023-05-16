import express from 'express';

import { gallery, sendClientConfigSettings, start } from './controller';

export const mainRouter = express.Router();

mainRouter.get(['/gallery', '/gallery/:userId'], gallery);

mainRouter.get('/config', sendClientConfigSettings);

mainRouter.post('/start', start);

export default mainRouter;
