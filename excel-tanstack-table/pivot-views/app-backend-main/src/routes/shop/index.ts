import express from 'express';

import {
  checkout,
  stripeCreatePaymentIntent,
  stripeCreateVerifyIdentitySession,
  stripeWebHook,
  syncProductsHandler,
} from './controller';
import { capturePaymentHandler, createOrderHandler } from './paypal';

export const shopRouter = express.Router();

shopRouter.post('/shop/checkout', checkout);

shopRouter.post('/stripe/payment/intent', stripeCreatePaymentIntent);

shopRouter.post('/stripe/identity/start', stripeCreateVerifyIdentitySession);

shopRouter.post(
  '/stripe/webhook',
  express.raw({ type: 'application/json' }),
  stripeWebHook,
);

shopRouter.post('/paypal/order', createOrderHandler);

shopRouter.post('/api/orders/:orderID/capture', capturePaymentHandler);

shopRouter.get('/products/sync', syncProductsHandler);

export default shopRouter;
