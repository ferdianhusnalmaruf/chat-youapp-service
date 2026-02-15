import type { User } from '@/types/user';
import { DataTypes, type Optional, Model } from 'sequelize';
import { sequelize } from '@/db/sequelize';

export type UserCreationAttributes = Optional<User, 'id' | 'createdAt' | 'updatedAt'>;

export class UserModel extends Model<User, UserCreationAttributes> implements User {
  declare id: string;
  declare email: string;
  declare username: string;
  declare birthday?: Date;
  declare height?: number;
  declare weight?: number;
  declare interests: string[];
  declare createdAt: Date;
  declare updatedAt: Date;
}

UserModel.init(
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    birthday: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    height: {
      type: DataTypes.FLOAT, // NOT DataTypes.NUMBER
      allowNull: true,
    },
    weight: {
      type: DataTypes.FLOAT, // NOT DataTypes.NUMBER
      allowNull: true,
    },
    interests: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'users',
  },
);
