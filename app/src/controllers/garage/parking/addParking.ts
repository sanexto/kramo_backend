import { NextFunction, Request, Response, } from 'express';
import { body, Meta, validationResult, } from 'express-validator';
import { Transaction, } from 'sequelize';
import _ from 'lodash';
import moment from 'moment';

import config from '../../../config';
import { JsonResponse, Validator, } from '../../../base';
import { Garage, Parking, User, sequelize, } from '../../../models';

class AddParking {

  public static async get(req: Request, res: Response, next: NextFunction): Promise<void> {

    const output: JsonResponse.Output = {
      status: JsonResponse.Status.Ok,
      body: {},
    };

    output.body = {
      title: 'Nuevo aparcamiento',
      form: {
        addParking: {
          field: {
            plate: {
              label: 'Matrícula',
              hint: '',
              value: '',
            },
          },
          fieldSet: {
            entry: {
              label: 'Entrada',
              field: {
                date: {
                  label: 'Fecha',
                  hint: 'Seleccionar',
                  value: '',
                  pickerHint: 'DD/MM/AAAA',
                },
                time: {
                  label: 'Hora',
                  hint: 'Seleccionar',
                  value: '',
                  pickerHint: 'HH:MM',
                },
              },
            },
            exit: {
              label: 'Salida',
              field: {
                date: {
                  label: 'Fecha',
                  hint: 'Seleccionar',
                  value: '',
                  pickerHint: 'DD/MM/AAAA',
                },
                time: {
                  label: 'Hora',
                  hint: 'Seleccionar',
                  value: '',
                  pickerHint: 'HH:MM',
                },
              },
            },
          },
          button: {
            add: {
              label: 'Agregar',
            },
          },
        },
      },
    };

    res.json(output);

  }

  public static async post(req: Request, res: Response, next: NextFunction): Promise<void> {

    const output: JsonResponse.Output = {
      status: JsonResponse.Status.Ok,
      body: {},
    };

    output.body = {
      state: 1,
      message: '',
      field: {},
    };

    await body('plate')
    .exists({ checkNull: true })
    .withMessage('El campo "Matrícula" no existe')
    .bail()
    .isString()
    .withMessage('El campo "Matrícula" no es una cadena de texto')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Debes ingresar la matrícula del vehículo')
    .bail()
    .isLength({ max: 255 })
    .withMessage('La matrícula del vehículo debe tener hasta 255 caracteres')
    .bail()
    .run(req);

    await body('entryDate')
    .exists({ checkNull: true })
    .withMessage('El campo "Fecha de entrada" no existe')
    .bail()
    .isString()
    .withMessage('El campo "Fecha de entrada" no es una cadena de texto')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Debes ingresar la fecha de entrada del vehículo')
    .bail()
    .custom((entryDate: string, meta: Meta): any => {

      if (!moment(entryDate, 'YYYY/M/D', true).isBetween(config.types.date.min, config.types.date.max, undefined, '[]')) {

        throw new Error('El campo "Fecha de entrada" no tiene un valor válido');

      } else {

        return true;

      }

    })
    .bail()
    .run(req);

    await body('entryTime')
    .exists({ checkNull: true })
    .withMessage('El campo "Hora de entrada" no existe')
    .bail()
    .isString()
    .withMessage('El campo "Hora de entrada" no es una cadena de texto')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Debes ingresar la hora de entrada del vehículo')
    .bail()
    .custom((entryTime: string, meta: Meta): any => {

      if (!moment(entryTime, 'H:m', true).isValid()) {

        throw new Error('El campo "Hora de entrada" no tiene un valor válido');

      } else {

        return true;

      }

    })
    .bail()
    .run(req);

    await body('exitDate')
    .exists({ checkNull: true })
    .withMessage('El campo "Fecha de salida" no existe')
    .bail()
    .isString()
    .withMessage('El campo "Fecha de salida" no es una cadena de texto')
    .bail()
    .trim()
    .if(body('exitDate').notEmpty())
    .custom((exitDate: string, meta: Meta): any => {

      if (!moment(exitDate, 'YYYY/M/D', true).isBetween(config.types.date.min, config.types.date.max, undefined, '[]')) {

        throw new Error('El campo "Fecha de salida" no tiene un valor válido');

      } else {

        return true;

      }

    })
    .bail()
    .run(req);

    await body('exitTime')
    .exists({ checkNull: true })
    .withMessage('El campo "Hora de salida" no existe')
    .bail()
    .isString()
    .withMessage('El campo "Hora de salida" no es una cadena de texto')
    .bail()
    .trim()
    .if(body('exitTime').notEmpty())
    .custom((exitTime: string, meta: Meta): any => {

      if (!moment(exitTime, 'H:m', true).isValid()) {

        throw new Error('El campo "Hora de salida" no tiene un valor válido');

      } else {

        return true;

      }

    })
    .bail()
    .run(req);

    await body('exitDate')
    .if(body('exitTime').notEmpty())
    .notEmpty()
    .withMessage('Debes ingresar la fecha de salida del vehículo')
    .bail()
    .run(req);

    await body('exitTime')
    .if(body('exitDate').notEmpty())
    .notEmpty()
    .withMessage('Debes ingresar la hora de salida del vehículo')
    .bail()
    .run(req);

    const validationError: Record<string, Validator.ValidationError> = validationResult(req).formatWith(Validator.errorFormatter).mapped();

    if (_.isEmpty(validationError)) {

      let validationError: Record<string, Validator.ValidationError> = {};

      if (!_.isEmpty(req.body.exitDate) && !_.isEmpty(req.body.exitTime)) {

        if (!moment(req.body.exitDate, 'YYYY/M/D', true).isSameOrAfter(moment(req.body.entryDate, 'YYYY/M/D', true))) {

          validationError = {
            exitDate: {
              message: 'La fecha de salida del vehículo debe ser igual o posterior a la fecha de su entrada',
            },
          };

        }

        if (moment(req.body.exitDate, 'YYYY/M/D', true).isSame(moment(req.body.entryDate, 'YYYY/M/D', true)) && !moment(req.body.exitTime, 'H:m', true).isSameOrAfter(moment(req.body.entryTime, 'H:m', true))) {

          validationError = {
            exitTime: {
              message: 'La hora de salida del vehículo debe ser igual o posterior a la hora de su entrada',
            },
          };

        }

      }

      if (_.isEmpty(validationError)) {

        const plate: string = String(req.body.plate);
        const entry: Date = new Date(`${req.body.entryDate} ${req.body.entryTime}`);
        const exit: Date | null = _.isEmpty(req.body.exitDate) && _.isEmpty(req.body.exitTime) ? null : new Date(`${req.body.exitDate} ${req.body.exitTime}`);

        let addedParking: boolean = false;
        const transaction: Transaction = await sequelize.transaction();

        try {

          const garage: Garage | null = await Garage.findOne(
            {
              include: [
                {
                  model: User,
                  required: true,
                  where: {
                    id: req.userId,
                  },
                },
              ],
              transaction: transaction,
            },
          );

          if (garage != null) {

            await Parking.create(
              {
                plate,
                entry,
                exit,
                garageId: garage.id,
              },
              {
                transaction: transaction,
              },
            );

            await transaction.commit();
            addedParking = true;

          } else {

            await transaction.rollback();

          }

        } catch(_) {

          await transaction.rollback();

        }

        if (addedParking) {

          output.body.state = 3;
          output.body.message = 'Aparcamiento agregado con éxito';

        } else {

          output.body.state = 2;
          output.body.message = 'No se pudo agregar el aparcamiento';

        }

      } else {

        output.body.field = validationError;

      }

    } else {

      output.body.field = validationError;

    }

    res.json(output);

  }

}

export {
  AddParking,
};
