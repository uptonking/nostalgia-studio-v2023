import express from 'express';

import { mainRouter } from './main';
import { profileRouter } from './profile';

// import { shopRouter } from './shop';

export const router = express.Router();
router.use(mainRouter);
router.use(profileRouter);
// router.use(shopRouter);

export default router;
