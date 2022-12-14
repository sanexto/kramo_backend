import { DataTypes, Model, Sequelize, } from 'sequelize';

import config from '../config';

class Garage extends Model {

  public id!: number;
  public name!: string;
  public email!: string;
  public userId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public User!: any;

  public static initialize(sequelize: Sequelize): void {

    Garage.init(
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
        email: {
          type: DataTypes.STRING({
            length: 255,
          }),
          allowNull: false,
        },
      },
      {
        name: {
          singular: 'Garage',
          plural: 'Garages',
        },
        tableName: 'Garages',
        sequelize,
      },
    );

  }

  public static associate(models: Record<string, any>): void {

    Garage.belongsTo(models.User, {
      targetKey: 'id',
      foreignKey: {
        name: 'userId',
        allowNull: false,
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    Garage.hasMany(models.Parking, {
      sourceKey: 'id',
      foreignKey: {
        name: 'garageId',
        allowNull: false,
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

  }

}

export {
  Garage,
};
