import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface AddressAttributes {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AddressCreationAttributes extends Optional<AddressAttributes, 'id' | 'isDefault'> {}

export class Address extends Model<AddressAttributes, AddressCreationAttributes> implements AddressAttributes {
  declare public id: string;
  declare public userId: string;
  declare public fullName: string;
  declare public phone: string;
  declare public addressLine: string;
  declare public city: string;
  declare public state: string;
  declare public pincode: string;
  declare public isDefault: boolean;
  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;
}

Address.init(
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
    fullName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    addressLine: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    pincode: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'addresses',
    timestamps: true,
  }
);
