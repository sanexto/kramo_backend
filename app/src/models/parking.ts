import { DataTypes, Model, Sequelize, } from 'sequelize';

import config from '../config';

class Parking extends Model {

  public id!: number;
  public plate!: string;
  public entry!: Date;
  public exit!: Date | null;
  public price!: number | null;
  public garageId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public Garage!: any;

  public static initialize(sequelize: Sequelize): void {

    Parking.init(
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
        plate: {
          type: DataTypes.STRING({
            length: 255,
          }),
          allowNull: false,
        },
        entry: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        exit: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        price: {
          type: DataTypes.DECIMAL({
            precision: Math.max(
              Math.abs(config.types.decimal.min).toString().split('.')[0].length,
              Math.abs(config.types.decimal.max).toString().split('.')[0].length,
            ) + Math.max(
              Math.abs(config.types.decimal.min).toString().split('.')[1].length,
              Math.abs(config.types.decimal.max).toString().split('.')[1].length,
            ),
            scale: Math.max(
              Math.abs(config.types.decimal.min).toString().split('.')[1].length,
              Math.abs(config.types.decimal.max).toString().split('.')[1].length,
            ),
            unsigned: !(config.types.decimal.min < 0 || config.types.decimal.max < 0),
          }),
          allowNull: true,
        },
      },
      {
        name: {
          singular: 'Parking',
          plural: 'Parkings',
        },
        tableName: 'Parkings',
        sequelize,
      },
    );

  }

  public static associate(models: Record<string, any>): void {

    Parking.belongsTo(models.Garage, {
      targetKey: 'id',
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
  Parking,
};
