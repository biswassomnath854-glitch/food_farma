import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface RestaurantAttributes {
  id: string;
  name: string;
  description: string;
  logo?: string;
  coverImage?: string;
  image?: string;
  address?: string;
  cuisines?: string;
  location?: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  minOrder?: number;
  status: 'OPEN' | 'CLOSED' | 'INACTIVE';
  isOpen?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RestaurantCreationAttributes extends Optional<RestaurantAttributes, 'id' | 'logo' | 'coverImage' | 'image' | 'address' | 'cuisines' | 'location' | 'minOrder' | 'rating' | 'deliveryFee' | 'status' | 'isOpen'> {}

export class Restaurant extends Model<RestaurantAttributes, RestaurantCreationAttributes> implements RestaurantAttributes {
  declare public id: string;
  declare public name: string;
  declare public description: string;
  declare public logo?: string;
  declare public coverImage?: string;
  declare public image?: string;
  declare public address?: string;
  declare public cuisines?: string;
  declare public location?: string;
  declare public rating: number;
  declare public deliveryTime: string;
  declare public deliveryFee: number;
  declare public minOrder?: number;
  declare public status: 'OPEN' | 'CLOSED' | 'INACTIVE';
  declare public isOpen?: boolean;
  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;
}

Restaurant.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    logo: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    coverImage: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    cuisines: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: 'Bengaluru',
    },
    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 4.5,
    },
    deliveryTime: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: '25-35 min',
    },
    deliveryFee: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 40,
    },
    minOrder: {
      type: DataTypes.FLOAT,
      defaultValue: 100,
    },
    status: {
      type: DataTypes.ENUM('OPEN', 'CLOSED', 'INACTIVE'),
      defaultValue: 'OPEN',
      allowNull: false,
    },
    isOpen: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'restaurants',
    timestamps: true,
  }
);
