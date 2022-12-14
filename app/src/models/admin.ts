import { DataTypes, Model, Sequelize, } from 'sequelize';

import config from '../config';

class Admin extends Model {

  public id!: number;
  public name!: string;
  public surname!: string;
  public email!: string;
  public userId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public User!: any;

  public static initialize(sequelize: Sequelize): void {

    Admin.init(
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
        name: {
          type: DataTypes.STRING({
            length: 255,
          }),
          allowNull: false,
        },
        surname: {
          type: DataTypes.STRING({
            length: 255,
          }),
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING({
            length: 255,
          }),
          allowNull: false,
        },
      },
      {
        name: {
          singular: 'Admin',
          plural: 'Admins',
        },
        tableName: 'Admins',
        sequelize,
      },
    );

  }

  public static associate(models: Record<string, any>): void {

    Admin.belongsTo(models.User, {
      targetKey: 'id',
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
  Admin,
};
