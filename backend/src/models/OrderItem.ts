import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface OrderItemAttributes {
  id: string;
  orderId: string;
  foodId: string;
  foodName: string;
  price: number;
  quantity: number;
  foodType: 'VEG' | 'NON_VEG';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderItemCreationAttributes extends Optional<OrderItemAttributes, 'id'> {}

export class OrderItem extends Model<OrderItemAttributes, OrderItemCreationAttributes> implements OrderItemAttributes {
  declare public id: string;
  declare public orderId: string;
  declare public foodId: string;
  declare public foodName: string;
  declare public price: number;
  declare public quantity: number;
  declare public foodType: 'VEG' | 'NON_VEG';
  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;
}

OrderItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    foodId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    foodName: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    foodType: {
      type: DataTypes.ENUM('VEG', 'NON_VEG'),
      defaultValue: 'VEG',
    },
  },
  {
    sequelize,
    tableName: 'order_items',
    timestamps: true,
  }
);
