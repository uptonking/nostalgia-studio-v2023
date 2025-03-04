import { DataTypes } from 'sequelize';

import { type Product } from '@datalking/pivot-app-shared-lib';

import { addModel } from '../../db';

// import { CategoryModel } from './category'

export const ProductDefinition = {
  productId: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    required: true,
  },
  description: {
    type: DataTypes.STRING,
  },
  imageUrl: {
    type: DataTypes.STRING,
  },
  images: {
    // type: DataTypes.ARRAY(DataTypes.STRING),
    type: DataTypes.STRING,
  },
  keywords: {
    type: DataTypes.STRING,
  },
  prices: {
    type: DataTypes.JSONB,
  },
  shippable: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
};

export const ProductModel = addModel<Product>('product', ProductDefinition);

// ProductModel.hasMany(CategoryModel, { foreignKey: 'categoryId' })

// CategoryModel.belongsToMany(ProductModel, { through: 'product_category' })
