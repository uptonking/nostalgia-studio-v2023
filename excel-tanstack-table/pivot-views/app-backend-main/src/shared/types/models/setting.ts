import { DataTypes } from 'sequelize';

import type { Setting } from '@datalking/pivot-app-shared-lib';

import { sendConfig } from '../../../shared/socket';
import { addModel } from '../../db';

export const SettingModel = addModel<Setting>(
  'setting',
  {
    name: {
      primaryKey: true,
      type: DataTypes.STRING,
    },
    data: {
      type: DataTypes.JSONB,
    },
  },
  [],
  ['admin'],
  false,
  false,
  sendConfig,
);

export default SettingModel;
