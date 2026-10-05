import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface FoodAttributes {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  image: string;
  foodType: 'VEG' | 'NON_VEG';
  rating: number;
  isAvailable: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FoodCreationAttributes extends Optional<FoodAttributes, 'id' | 'discountPrice' | 'rating' | 'isAvailable'> {}

export class Food extends Model<FoodAttributes, FoodCreationAttributes> implements FoodAttributes {
  declare public id: string;
  declare public restaurantId: string;
  declare public categoryId: string;
  declare public name: string;
  declare public description: string;
  declare public price: number;
  declare public discountPrice?: number;
  declare public image: string;
  declare public foodType: 'VEG' | 'NON_VEG';
  declare public rating: number;
  declare public isAvailable: boolean;
  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;
}

Food.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    restaurantId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    discountPrice: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    foodType: {
      type: DataTypes.ENUM('VEG', 'NON_VEG'),
      defaultValue: 'VEG',
      allowNull: false,
    },
    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 4.5,
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'foods',
    timestamps: true,
  }
);
