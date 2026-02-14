import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "@/db/sequelize";

export interface UserCredentialsAttributes {
  id: string;
  email: string;
  username: string;
  password: string;
  //   birthday: Date;
  //   height: number;
  //   weight: number;
  //   intersts: [string];
  createdAt: Date;
  updatedAt: Date;
}

export type UserCredentialsCreationAttributes = Optional<
  UserCredentialsAttributes,
  "id" | "createdAt" | "updatedAt"
>;

export class UserCredentials
  extends Model<UserCredentialsAttributes, UserCredentialsCreationAttributes>
  implements UserCredentialsAttributes
{
  declare id: string;
  declare email: string;
  declare username: string;
  declare password: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

UserCredentials.init(
  {
    id: {
      type: DataTypes.UUID,
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
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "user_credentials",
  },
);
