import { DataTypes } from 'sequelize';

import type { Subscription } from '@datalking/pivot-app-shared-lib';

import { addModel } from '../../db';

export const SubscriptionModel = addModel<Subscription>('subscription', {
  subscriptionId: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  userId: {
    type: DataTypes.UUID,
  },
  orderId: {
    type: DataTypes.UUID,
  },
});
