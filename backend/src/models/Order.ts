import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
export type PaymentMethod = 'ONLINE' | 'COD';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface OrderAttributes {
  id: string;
  userId: string;
  restaurantId: string;
  addressId?: string;
  deliveryAddress?: string;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  tax: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  deliveryInstructions?: string;
  refundId?: string;
  refundAmount?: number;
  refundReason?: string;
  refundedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderCreationAttributes extends Optional<OrderAttributes, 'id' | 'discount' | 'deliveryFee' | 'tax' | 'status' | 'paymentStatus' | 'refundId' | 'refundAmount' | 'refundReason' | 'refundedAt'> {}

export class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  declare public id: string;
  declare public userId: string;
  declare public restaurantId: string;
  declare public addressId?: string;
  declare public deliveryAddress?: string;
  declare public subtotal: number;
  declare public discount: number;
  declare public deliveryFee: number;
  declare public tax: number;
  declare public totalAmount: number;
  declare public status: OrderStatus;
  declare public paymentMethod: PaymentMethod;
  declare public paymentStatus: PaymentStatus;
  declare public deliveryInstructions?: string;
  declare public refundId?: string;
  declare public refundAmount?: number;
  declare public refundReason?: string;
  declare public refundedAt?: Date;
  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;
}

Order.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    restaurantId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    addressId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    deliveryAddress: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    subtotal: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    discount: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    deliveryFee: {
      type: DataTypes.FLOAT,
      defaultValue: 40,
    },
    tax: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    totalAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'),
      defaultValue: 'PENDING',
    },
    paymentMethod: {
      type: DataTypes.ENUM('ONLINE', 'COD'),
      allowNull: false,
      defaultValue: 'ONLINE',
    },
    paymentStatus: {
      type: DataTypes.ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'),
      defaultValue: 'PENDING',
    },
    deliveryInstructions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    refundId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    refundAmount: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    refundReason: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    refundedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'orders',
    timestamps: true,
  }
);
