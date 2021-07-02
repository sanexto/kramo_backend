import { NextFunction, Request, Response, } from 'express';
import { body, Meta, param, validationResult, } from 'express-validator';
import { Op, Transaction, } from 'sequelize';
import _ from 'lodash';
import moment from 'moment';

import config from '../../../config';
import { JsonResponse, Validator, } from '../../../base';
import { Booking, Garage, User, sequelize, } from '../../../models';

class UpdateBooking {

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

    await param('bookingId')
    .exists({ checkNull: true })
    .withMessage('El campo "ID de reserva" no existe')
    .bail()
    .isInt({ allow_leading_zeroes: false })
    .withMessage('El campo "ID de reserva" no es un número entero')
    .bail()
    .isInt({ min: config.types.number.min, max: config.types.number.max, allow_leading_zeroes: false })
    .withMessage(`El campo "ID de reserva" no es un número entre ${config.types.number.min} y ${config.types.number.max}`)
    .bail()
    .toInt()
    .run(req);

    const validationError: Record<string, Validator.ValidationError> = validationResult(req).formatWith(Validator.errorFormatter).mapped();

    if (_.isEmpty(validationError)) {

      const bookingId: number = Number(req.params.bookingId);

      let booking: Booking | null = null;

      try {

        booking = await Booking.findOne(
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
                [Op.eq]: bookingId,
              },
            },
          },
        );

      } catch(_) {}

      if (booking != null) {

        output.body = {
          state: 2,
          title: 'Modificar reserva',
          form: {
            updateBooking: {
              field: {
                vehiclePlate: {
                  label: 'Matrícula del vehículo',
                  hint: '',
                  value: booking.vehiclePlate ?? '',
                },
              },
              fieldSet: {
                vehicleEntry: {
                  label: 'Entrada del vehículo',
                  field: {
                    date: {
                      label: 'Fecha',
                      hint: 'Seleccionar',
                      value: moment(booking.vehicleEntry, 'YYYY-M-D H:m:s', true).isValid() ? moment(booking.vehicleEntry).format('YYYY/M/D') : '',
                      pickerHint: 'DD/MM/AAAA',
                    },
                    time: {
                      label: 'Hora',
                      hint: 'Seleccionar',
                      value: moment(booking.vehicleEntry, 'YYYY-M-D H:m:s', true).isValid() ? moment(booking.vehicleEntry).format('H:m') : '',
                      pickerHint: 'HH:MM',
                    },
                  },
                },
                vehicleExit: {
                  label: 'Salida del vehículo',
                  field: {
                    date: {
                      label: 'Fecha',
                      hint: 'Seleccionar',
                      value: moment(booking.vehicleExit, 'YYYY-M-D H:m:s', true).isValid() ? moment(booking.vehicleExit).format('YYYY/M/D') : '',
                      pickerHint: 'DD/MM/AAAA',
                    },
                    time: {
                      label: 'Hora',
                      hint: 'Seleccionar',
                      value: moment(booking.vehicleExit, 'YYYY-M-D H:m:s', true).isValid() ? moment(booking.vehicleExit).format('H:m') : '',
                      pickerHint: 'HH:MM',
                    },
                  },
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

    await param('bookingId')
    .exists({ checkNull: true })
    .withMessage('El campo "ID de reserva" no existe')
    .bail()
    .isInt({ allow_leading_zeroes: false })
    .withMessage('El campo "ID de reserva" no es un número entero')
    .bail()
    .isInt({ min: config.types.number.min, max: config.types.number.max, allow_leading_zeroes: false })
    .withMessage(`El campo "ID de reserva" no es un número entre ${config.types.number.min} y ${config.types.number.max}`)
    .bail()
    .toInt()
    .run(req);

    const validationError: Record<string, Validator.ValidationError> = validationResult(req).formatWith(Validator.errorFormatter).mapped();

    if (_.isEmpty(validationError)) {

      output.body.state = 1;

      const bookingId: number = Number(req.params.bookingId);

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

      await body('vehicleEntryDate')
      .exists({ checkNull: true })
      .withMessage('El campo "Fecha de entrada del vehículo" no existe')
      .bail()
      .isString()
      .withMessage('El campo "Fecha de entrada del vehículo" no es una cadena de texto')
      .bail()
      .trim()
      .notEmpty()
      .withMessage('Debes ingresar la fecha de entrada del vehículo')
      .bail()
      .custom((vehicleEntryDate: string, meta: Meta): any => {

        if (!moment(vehicleEntryDate, 'YYYY/M/D', true).isBetween(config.types.date.min, config.types.date.max, undefined, '[]')) {

          throw new Error('El campo "Fecha de entrada del vehículo" no tiene un valor válido');

        } else {

          return true;

        }

      })
      .bail()
      .run(req);

      await body('vehicleEntryTime')
      .exists({ checkNull: true })
      .withMessage('El campo "Hora de entrada del vehículo" no existe')
      .bail()
      .isString()
      .withMessage('El campo "Hora de entrada del vehículo" no es una cadena de texto')
      .bail()
      .trim()
      .notEmpty()
      .withMessage('Debes ingresar la hora de entrada del vehículo')
      .bail()
      .custom((vehicleEntryTime: string, meta: Meta): any => {

        if (!moment(vehicleEntryTime, 'H:m', true).isValid()) {

          throw new Error('El campo "Hora de entrada del vehículo" no tiene un valor válido');

        } else {

          return true;

        }

      })
      .bail()
      .run(req);

      await body('vehicleExitDate')
      .exists({ checkNull: true })
      .withMessage('El campo "Fecha de salida del vehículo" no existe')
      .bail()
      .isString()
      .withMessage('El campo "Fecha de salida del vehículo" no es una cadena de texto')
      .bail()
      .trim()
      .if(body('vehicleExitDate').notEmpty())
      .custom((vehicleExitDate: string, meta: Meta): any => {

        if (!moment(vehicleExitDate, 'YYYY/M/D', true).isBetween(config.types.date.min, config.types.date.max, undefined, '[]')) {

          throw new Error('El campo "Fecha de salida del vehículo" no tiene un valor válido');

        } else {

          return true;

        }

      })
      .bail()
      .run(req);

      await body('vehicleExitTime')
      .exists({ checkNull: true })
      .withMessage('El campo "Hora de salida del vehículo" no existe')
      .bail()
      .isString()
      .withMessage('El campo "Hora de salida del vehículo" no es una cadena de texto')
      .bail()
      .trim()
      .if(body('vehicleExitTime').notEmpty())
      .custom((vehicleExitTime: string, meta: Meta): any => {

        if (!moment(vehicleExitTime, 'H:m', true).isValid()) {

          throw new Error('El campo "Hora de salida del vehículo" no tiene un valor válido');

        } else {

          return true;

        }

      })
      .bail()
      .run(req);

      await body('vehicleExitDate')
      .if(body('vehicleExitTime').notEmpty())
      .notEmpty()
      .withMessage('Debes ingresar la fecha de salida del vehículo')
      .bail()
      .run(req);

      await body('vehicleExitTime')
      .if(body('vehicleExitDate').notEmpty())
      .notEmpty()
      .withMessage('Debes ingresar la hora de salida del vehículo')
      .bail()
      .run(req);

      const validationError: Record<string, Validator.ValidationError> = validationResult(req).formatWith(Validator.errorFormatter).mapped();

      if (_.isEmpty(validationError)) {

        let validationError: Record<string, Validator.ValidationError> = {};

        if (!_.isEmpty(req.body.vehicleExitDate) && !_.isEmpty(req.body.vehicleExitTime)) {

          if (!moment(req.body.vehicleExitDate, 'YYYY/M/D', true).isSameOrAfter(moment(req.body.vehicleEntryDate, 'YYYY/M/D', true))) {

            validationError = {
              vehicleExitDate: {
                message: 'La fecha de salida del vehículo debe ser igual o posterior a la fecha de su entrada',
              },
            };

          }

          if (moment(req.body.vehicleExitDate, 'YYYY/M/D', true).isSame(moment(req.body.vehicleEntryDate, 'YYYY/M/D', true)) && !moment(req.body.vehicleExitTime, 'H:m', true).isSameOrAfter(moment(req.body.vehicleEntryTime, 'H:m', true))) {

            validationError = {
              vehicleExitTime: {
                message: 'La hora de salida del vehículo debe ser igual o posterior a la hora de su entrada',
              },
            };

          }

        }

        if (_.isEmpty(validationError)) {

          const vehiclePlate: string = String(req.body.vehiclePlate);
          const vehicleEntry: Date = new Date(`${req.body.vehicleEntryDate} ${req.body.vehicleEntryTime}`);
          const vehicleExit: Date | null = _.isEmpty(req.body.vehicleExitDate) && _.isEmpty(req.body.vehicleExitTime) ? null : new Date(`${req.body.vehicleExitDate} ${req.body.vehicleExitTime}`);

          let updatedBooking: boolean = false;
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

              await Booking.update(
                {
                  vehiclePlate,
                  vehicleEntry,
                  vehicleExit,
                },
                {
                  where: {
                    id: bookingId,
                    garageId: garage.id,
                  },
                  transaction: transaction,
                },
              );
    
              await transaction.commit();
              updatedBooking = true;
  
            } else {
  
              await transaction.rollback();
  
            }
  
          } catch (_) {
  
            await transaction.rollback();
  
          }

          if (updatedBooking) {

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
  UpdateBooking,
};
