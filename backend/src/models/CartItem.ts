import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface CartItemAttributes {
  id: string;
  cartId: string;
  foodId: string;
  quantity: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CartItemCreationAttributes extends Optional<CartItemAttributes, 'id'> {}

export class CartItem extends Model<CartItemAttributes, CartItemCreationAttributes> implements CartItemAttributes {
  declare public id: string;
  declare public cartId: string;
  declare public foodId: string;
  declare public quantity: number;
  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;
}

CartItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    cartId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    foodId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
      },
    },
  },
  {
    sequelize,
    tableName: 'cart_items',
    timestamps: true,
  }
);
