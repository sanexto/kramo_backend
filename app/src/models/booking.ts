import { DataTypes, Model, Sequelize, } from 'sequelize';

import config from '../config';

class Booking extends Model {

  public id!: number;
  public vehiclePlate!: string;
  public vehicleEntry!: Date;
  public vehicleExit!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public Garage: any;

  public static initialize (sequelize: Sequelize): void {

    Booking.init(
      {
        id: {
          type: DataTypes.INTEGER({ length: (config.types.number.max.toString().length + 1) }).UNSIGNED,
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
      },
      {
        name: {
          singular: 'Booking',
          plural: 'Bookings',
        },
        tableName: 'Bookings',
        sequelize,
      },
    );

  }

  public static associate (models: Record<string, any>): void {

    Booking.belongsTo(models.Garage, {
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
  Booking,
};
