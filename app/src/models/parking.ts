import { DataTypes, Model, Sequelize, } from 'sequelize';

import config from '../config';

class Parking extends Model {

  public id!: number;
  public vehiclePlate!: string;
  public vehicleEntry!: Date;
  public vehicleExit!: Date | null;
  public parkingPrice!: number | null;
  public garageId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public Garage!: any;

  public static initialize(sequelize: Sequelize): void {

    Parking.init(
      {
        id: {
          type: DataTypes.INTEGER({ length: (config.types.id.max.toString().length + 1) }).UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        vehiclePlate: {
          type: DataTypes.STRING({ length: 255 }),
          allowNull: false,
        },
        vehicleEntry: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        vehicleExit: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        parkingPrice: {
          type: DataTypes.DECIMAL,
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
