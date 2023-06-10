import { DataTypes } from 'sequelize';

import { type Order } from '@datalking/pivot-app-shared-lib';

import { addModel } from '../../db';

export const OrderModel = addModel<Order>('order', {
  orderId: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  userId: {
    type: DataTypes.UUID,
  },
  status: {
    type: DataTypes.STRING,
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
  },
});
