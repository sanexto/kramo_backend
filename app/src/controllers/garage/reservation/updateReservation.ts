import { NextFunction, Request, Response, } from 'express';
import { body, Meta, param, validationResult, } from 'express-validator';
import { Op, Transaction, } from 'sequelize';
import _ from 'lodash';
import moment from 'moment';

import config from '../../../config';
import { JsonResponse, Validator, } from '../../../base';
import { Garage, Reservation, User, sequelize, } from '../../../models';

class UpdateReservation {

  public static async get(req: Request, res: Response, next: NextFunction): Promise<void> {

    const output: JsonResponse.Output = {
      status: JsonResponse.Status.Ok,
      body: {},
    };

    output.body = {
      state: 1,
      error: {
        message: '',
      },
    };

    await param('reservationId')
    .exists({ checkNull: true })
    .withMessage('El campo "Id de reserva" no existe')
    .bail()
    .isInt({ allow_leading_zeroes: false })
    .withMessage('El campo "Id de reserva" no es un número entero')
    .bail()
    .isInt({ min: config.types.number.min, max: config.types.number.max, allow_leading_zeroes: false })
    .withMessage(`El campo "Id de reserva" no es un número entre ${config.types.number.min} y ${config.types.number.max}`)
    .bail()
    .toInt()
    .run(req);

    const validationError: Record<string, Validator.ValidationError> = validationResult(req).formatWith(Validator.errorFormatter).mapped();

    if (_.isEmpty(validationError)) {

      const reservationId: number = Number(req.params.reservationId);

      let reservation: Reservation | null = null;

      try {

        reservation = await Reservation.findOne(
          {
            include: [
              {
                model: Garage,
                required: true,
                include: [
                  {
                    model: User,
                    required: true,
                    where: {
                      id: {
                        [Op.eq]: req.userId,
                      },
                    },
                  },
                ],
              },
            ],
            where: {
              id: {
                [Op.eq]: reservationId,
              },
            },
          },
        );

      } catch(_) {}

      if (reservation != null) {

        output.body = {
          state: 2,
          title: 'Modificar reserva',
          form: {
            updateReservation: {
              field: {
                vehiclePlate: {
                  label: 'Matrícula del vehículo',
                  hint: '',
                  value: reservation.vehiclePlate ?? '',
                },
                vehicleEntry: {
                  label: 'Entrada del vehículo',
                  hint: 'Ingresar',
                  value: moment(reservation.vehicleEntry).isValid() ? moment(reservation.vehicleEntry).format('YYYY/M/D H:m') : '',
                  pickerHint: 'DD/MM/AAAA HH:MM',
                },
                vehicleExit: {
                  label: 'Salida del vehículo',
                  hint: 'Ingresar',
                  value: moment(reservation.vehicleExit).isValid() ? moment(reservation.vehicleExit).format('YYYY/M/D H:m') : '',
                  pickerHint: 'DD/MM/AAAA HH:MM',
                },
              },
              button: {
                update: {
                  label: 'Modificar',
                },
              },
            },
          },
        };

      } else {

        output.body.error.message = 'La reserva solicitada no existe';

      }

    } else {

      output.body.error.message = validationError[Object.keys(validationError)[0]].message;

    }

    res.json(output);

  }

  public static async put(req: Request, res: Response, next: NextFunction): Promise<void> {

    const output: JsonResponse.Output = {
      status: JsonResponse.Status.Ok,
      body: {},
    };

    output.body = {
      state: 2,
      message: '',
      field: {},
    };

    await param('reservationId')
    .exists({ checkNull: true })
    .withMessage('El campo "Id de reserva" no existe')
    .bail()
    .isInt({ allow_leading_zeroes: false })
    .withMessage('El campo "Id de reserva" no es un número entero')
    .bail()
    .isInt({ min: config.types.number.min, max: config.types.number.max, allow_leading_zeroes: false })
    .withMessage(`El campo "Id de reserva" no es un número entre ${config.types.number.min} y ${config.types.number.max}`)
    .bail()
    .toInt()
    .run(req);

    const validationError: Record<string, Validator.ValidationError> = validationResult(req).formatWith(Validator.errorFormatter).mapped();

    if (_.isEmpty(validationError)) {

      output.body.state = 1;

      const reservationId: number = Number(req.params.reservationId);

      await body('vehiclePlate')
      .exists({ checkNull: true })
      .withMessage('El campo "Matrícula del vehículo" no existe')
      .bail()
      .isString()
      .withMessage('El campo "Matrícula del vehículo" no es una cadena de texto')
      .bail()
      .trim()
      .notEmpty()
      .withMessage('Debes ingresar la matrícula del vehículo')
      .bail()
      .isLength({ max: 255 })
      .withMessage('La matrícula del vehículo debe tener hasta 255 caracteres')
      .bail()
      .run(req);

      await body('vehicleEntry')
      .exists({ checkNull: true })
      .withMessage('El campo "Entrada del vehículo" no existe')
      .bail()
      .isString()
      .withMessage('El campo "Entrada del vehículo" no es una cadena de texto')
      .bail()
      .trim()
      .notEmpty()
      .withMessage('Debes ingresar la fecha y hora de entrada del vehículo')
      .bail()
      .custom((vehicleEntry: string, meta: Meta): any => {

        if (!moment(vehicleEntry, 'YYYY/M/D H:m', true).isBetween(config.types.date.min, config.types.date.max, undefined, '[]')) {

          throw new Error('El campo "Entrada del vehículo" no tiene un valor válido');

        } else {

          return true;

        }

      })
      .bail()
      .run(req);

      await body('vehicleExit')
      .exists({ checkNull: true })
      .withMessage('El campo "Salida del vehículo" no existe')
      .bail()
      .isString()
      .withMessage('El campo "Salida del vehículo" no es una cadena de texto')
      .bail()
      .trim()
      .if(body('vehicleExit').notEmpty())
      .custom((vehicleExit: string, meta: Meta): any => {

        if (!moment(vehicleExit, 'YYYY/M/D H:m', true).isBetween(config.types.date.min, config.types.date.max, undefined, '[]')) {

          throw new Error('El campo "Salida del vehículo" no tiene un valor válido');

        } else {

          return true;

        }

      })
      .bail()
      .run(req);

      const validationError: Record<string, Validator.ValidationError> = validationResult(req).formatWith(Validator.errorFormatter).mapped();

      if (_.isEmpty(validationError)) {

        await body('vehicleExit')
        .if(body('vehicleExit').notEmpty())
        .custom((vehicleExit: string, meta: Meta): any => {

          if (!moment(vehicleExit, 'YYYY/M/D H:m', true).isSameOrAfter(req.body.vehicleEntry, undefined)) {

            throw new Error('La fecha y hora de salida del vehículo debe ser posterior a la fecha y hora de su entrada');

          } else {

            return true;

          }

        })
        .bail()
        .run(req);

        const validationError: Record<string, Validator.ValidationError> = validationResult(req).formatWith(Validator.errorFormatter).mapped();

        if (_.isEmpty(validationError)) {

          const vehiclePlate: string = String(req.body.vehiclePlate);
          const vehicleEntry: Date = new Date(req.body.vehicleEntry);
          const vehicleExit: Date | null = !_.isEmpty(req.body.vehicleExit) ? new Date(req.body.vehicleExit) : null;

          let updatedReservation: boolean = false;
          const transaction: Transaction = await sequelize.transaction();

          try {

            const garage: Garage | null = await Garage.findOne(
              {
                include: [
                  {
                    model: User,
                    required: true,
                    where: {
                      id: {
                        [Op.eq]: req.userId,
                      },
                    },
                  },
                ],
                transaction: transaction,
              },
            );
  
            if (garage != null) {

              await Reservation.update(
                {
                  vehiclePlate,
                  vehicleEntry,
                  vehicleExit,
                },
                {
                  where: {
                    id: reservationId,
                    garageId: garage.id,
                  },
                  transaction: transaction,
                },
              );
    
              await transaction.commit();
              updatedReservation = true;
  
            } else {
  
              await transaction.rollback();
  
            }
  
          } catch (_) {
  
            await transaction.rollback();
  
          }

          if (updatedReservation) {

            output.body.state = 3;
            output.body.message = 'Reserva modificada con éxito';
  
          } else {
  
            output.body.state = 2;
            output.body.message = 'No se pudo modificar la reserva';
  
          }

        } else {

          output.body.field = validationError;

        }

      } else {

        output.body.field = validationError;

      }

    } else {

      output.body.message = validationError[Object.keys(validationError)[0]].message;

    }

    res.json(output);

  }

}

export {
  UpdateReservation,
}
