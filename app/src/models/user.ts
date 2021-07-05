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

  public static initialize (sequelize: Sequelize): void {

    User.init(
      {
        id: {
          type: DataTypes.INTEGER({ length: (config.types.number.max.toString().length + 1) }).UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        username: {
          type: DataTypes.STRING({ length: 255 }),
          allowNull: false,
        },
        password: {
          type: DataTypes.STRING({ length: 255 }),
          allowNull: false,
        },
        enabled: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
        },
        profile: {
          type: DataTypes.STRING({ length: 255 }),
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

  public static associate (models: Record<string, any>): void {

    User.hasOne(models.Admin, {
      foreignKey: {
        name: 'userId',
        allowNull: false,
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    User.hasOne(models.Garage, {
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
