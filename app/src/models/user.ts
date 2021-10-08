import { DataTypes, Model, Sequelize, } from 'sequelize';

import config from '../config';

class User extends Model {

  public id!: number;
  public username!: string;
  public password!: string;
  public enabled!: boolean;
  public profile!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static initialize(sequelize: Sequelize): void {

    User.init(
      {
        id: {
          type: DataTypes.INTEGER({
            length: Math.max(
              Math.abs(config.types.id.min).toString().length,
              Math.abs(config.types.id.max).toString().length,
            ),
            unsigned: !(config.types.id.min < 0 || config.types.id.max < 0),
          }),
          autoIncrement: true,
          primaryKey: true,
        },
        username: {
          type: DataTypes.STRING({
            length: config.username.maxLength,
          }),
          allowNull: false,
        },
        password: {
          type: DataTypes.STRING({
            length: 255,
          }),
          allowNull: false,
        },
        enabled: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
        },
        profile: {
          type: DataTypes.STRING({
            length: 255,
          }),
          allowNull: false,
        },
      },
      {
        indexes: [
          {
            fields: ['username', 'profile'],
            unique: true,
          },
        ],
        name: {
          singular: 'User',
          plural: 'Users',
        },
        tableName: 'Users',
        sequelize,
      },
    );

  }

  public static associate(models: Record<string, any>): void {

    User.hasOne(models.Admin, {
      sourceKey: 'id',
      foreignKey: {
        name: 'userId',
        allowNull: false,
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    User.hasOne(models.Garage, {
      sourceKey: 'id',
      foreignKey: {
        name: 'userId',
        allowNull: false,
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

  }

}

export {
  User,
};
