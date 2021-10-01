import { NextFunction, Request, Response, } from 'express';
import { body, Meta, param, validationResult, } from 'express-validator';
import { Transaction, } from 'sequelize';
import _ from 'lodash';
import Globalize from 'globalize';
import moment from 'moment';

import config from '../../../config';
import { JsonResponse, Validator, } from '../../../base';
import { Garage, Parking, User, sequelize, } from '../../../models';

class UpdateParking {

  public static async get(req: Request, res: Response, next: NextFunction): Promise<void> {

    Globalize.load(require('cldr-data').entireSupplemental());
    Globalize.load(require('cldr-data').entireMainFor(config.locale));
    Globalize.locale(config.locale);

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

    await param('parkingId')
    .exists({ checkNull: true })
    .withMessage('El campo "ID de aparcamiento" no existe')
    .bail()
    .isInt({ allow_leading_zeroes: false })
    .withMessage('El campo "ID de aparcamiento" no es un número entero')
    .bail()
    .isInt({ min: config.types.id.min, max: config.types.id.max, allow_leading_zeroes: false })
    .withMessage(`El campo "ID de aparcamiento" no es un número entre ${config.types.id.min} y ${config.types.id.max}`)
    .bail()
    .run(req);

    const validationError: Record<string, Validator.ValidationError> = validationResult(req).formatWith(Validator.errorFormatter).mapped();

    if (_.isEmpty(validationError)) {

      const parkingId: number = Number(req.params.parkingId);

      let parking: Parking | null = null;

      try {

        parking = await Parking.findOne(
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
                      id: req.userId,
                    },
                  },
                ],
              },
            ],
            where: {
              id: parkingId,
            },
          },
        );

      } catch(_) {}

      if (!_.isNull(parking)) {

        output.body = {
          state: 2,
          title: 'Modificar aparcamiento',
          form: {
            updateParking: {
              field: {
                plate: {
                  label: 'Matrícula',
                  hint: '',
                  value: _.isNull(parking.plate) ? '' : parking.plate,
                },
                price: {
                  label: 'Importe',
                  hint: Globalize.numberFormatter({
                    minimumFractionDigits: Math.max(
                      Math.abs(config.types.decimal.min).toString().split('.')[1].length,
                      Math.abs(config.types.decimal.max).toString().split('.')[1].length,
                    ),
                    maximumFractionDigits: Math.max(
                      Math.abs(config.types.decimal.min).toString().split('.')[1].length,
                      Math.abs(config.types.decimal.max).toString().split('.')[1].length,
                    ),
                    useGrouping: false,
                  })(123.45),
                  value: _.isNull(parking.price) ? '' : `${Globalize.numberFormatter({
                    minimumFractionDigits: Math.max(
                      Math.abs(config.types.decimal.min).toString().split('.')[1].length,
                      Math.abs(config.types.decimal.max).toString().split('.')[1].length,
                    ),
                    maximumFractionDigits: Math.max(
                      Math.abs(config.types.decimal.min).toString().split('.')[1].length,
                      Math.abs(config.types.decimal.max).toString().split('.')[1].length,
                    ),
                    useGrouping: false,
                  })(parking.price)}`,
                },
              },
              fieldSet: {
                entry: {
                  label: 'Entrada',
                  field: {
                    date: {
                      label: 'Fecha',
                      hint: 'Seleccionar',
                      value: _.isNull(parking.entry) ? '' : moment(parking.entry).format('YYYY/MM/DD'),
                      pickerHint: 'DD/MM/AAAA',
                    },
                    time: {
                      label: 'Hora',
                      hint: 'Seleccionar',
                      value: _.isNull(parking.entry) ? '' : moment(parking.entry).format('HH:mm'),
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
                      value: _.isNull(parking.exit) ? '' : moment(parking.exit).format('YYYY/MM/DD'),
                      pickerHint: 'DD/MM/AAAA',
                    },
                    time: {
                      label: 'Hora',
                      hint: 'Seleccionar',
                      value: _.isNull(parking.exit) ? '' : moment(parking.exit).format('HH:mm'),
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

        output.body.error.message = 'El aparcamiento solicitado no existe';

      }

    } else {

      output.body.error.message = validationError[Object.keys(validationError)[0]].message;

    }

    res.json(output);

  }

  public static async put(req: Request, res: Response, next: NextFunction): Promise<void> {

    Globalize.load(require('cldr-data').entireSupplemental());
    Globalize.load(require('cldr-data').entireMainFor(config.locale));
    Globalize.locale(config.locale);

    const output: JsonResponse.Output = {
      status: JsonResponse.Status.Ok,
      body: {},
    };

    output.body = {
      state: 2,
      message: '',
      field: {},
    };

    let validationError: Record<string, Validator.ValidationError> = {};

    await param('parkingId')
    .exists({ checkNull: true })
    .withMessage('El campo "ID de aparcamiento" no existe')
    .bail()
    .isInt({ allow_leading_zeroes: false })
    .withMessage('El campo "ID de aparcamiento" no es un número entero')
    .bail()
    .isInt({ min: config.types.id.min, max: config.types.id.max, allow_leading_zeroes: false })
    .withMessage(`El campo "ID de aparcamiento" no es un número entre ${config.types.id.min} y ${config.types.id.max}`)
    .bail()
    .run(req);

    validationError = validationResult(req).formatWith(Validator.errorFormatter).mapped();

    if (_.isEmpty(validationError)) {

      output.body.state = 1;

      const parkingId: number = Number(req.params.parkingId);

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

        if (!moment(entryDate, 'YYYY/MM/DD', true).isBetween(config.types.date.min, config.types.date.max, undefined, '[]')) {

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

        if (!moment(entryTime, 'HH:mm', true).isValid()) {

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

        if (!moment(exitDate, 'YYYY/MM/DD', true).isBetween(config.types.date.min, config.types.date.max, undefined, '[]')) {

          throw new Error('El campo "Fecha de salida" no tiene un valor válido');

        } else {

          return true;

        }

      })
      .bail()
      .run(req);

      await body('exitDate')
      .if((exitDate: string, meta: Meta): any => 
        (!_.isNil(req.body.exitTime) && (!_.isString(req.body.exitTime) || !_.isEmpty(_.trim(req.body.exitTime)))) || 
        (!_.isNil(req.body.price) && (!_.isString(req.body.price) || !_.isEmpty(_.trim(req.body.price))))
      )
      .notEmpty()
      .withMessage('Debes ingresar la fecha de salida del vehículo')
      .bail()
      .run(req);

      validationError = validationResult(req).formatWith(Validator.errorFormatter).mapped();

      if (!_.has(validationError, 'entryDate') && !_.has(validationError, 'exitDate')) {

        await body('exitDate')
        .if(body('exitDate').notEmpty())
        .custom((exitDate: string, meta: Meta): any => {

          if (!moment(exitDate, 'YYYY/MM/DD', true).isSameOrAfter(moment(req.body.entryDate, 'YYYY/MM/DD', true))) {

            throw new Error('La fecha de salida del vehículo debe ser igual o posterior a la fecha de entrada');

          } else {

            return true;

          }

        })
        .bail()
        .run(req);

      }

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

        if (!moment(exitTime, 'HH:mm', true).isValid()) {

          throw new Error('El campo "Hora de salida" no tiene un valor válido');

        } else {

          return true;

        }

      })
      .bail()
      .run(req);

      await body('exitTime')
      .if((exitTime: string, meta: Meta): any => 
        (!_.isNil(req.body.exitDate) && (!_.isString(req.body.exitDate) || !_.isEmpty(_.trim(req.body.exitDate)))) || 
        (!_.isNil(req.body.price) && (!_.isString(req.body.price) || !_.isEmpty(_.trim(req.body.price))))
      )
      .notEmpty()
      .withMessage('Debes ingresar la hora de salida del vehículo')
      .bail()
      .run(req);

      validationError = validationResult(req).formatWith(Validator.errorFormatter).mapped();

      if (!_.has(validationError, 'entryDate') && !_.has(validationError, 'entryTime') && !_.has(validationError, 'exitDate') && !_.has(validationError, 'exitTime')) {

        await body('exitTime')
        .if(body('exitDate').notEmpty())
        .if(body('exitTime').notEmpty())
        .custom((exitTime: string, meta: Meta): any => {

          if (moment(req.body.exitDate, 'YYYY/MM/DD', true).isSame(moment(req.body.entryDate, 'YYYY/MM/DD', true)) && !moment(exitTime, 'HH:mm', true).isSameOrAfter(moment(req.body.entryTime, 'HH:mm', true))) {

            throw new Error('La hora de salida del vehículo debe ser igual o posterior a la hora de entrada');

          } else {

            return true;

          }

        })
        .bail()
        .run(req);

      }

      await body('price')
      .exists({ checkNull: true })
      .withMessage('El campo "Importe" no existe')
      .bail()
      .isString()
      .withMessage('El campo "Importe" no es una cadena de texto')
      .bail()
      .trim()
      .if(body('price').notEmpty())
      .customSanitizer((price: string, meta: Meta): string => {
    
        return Globalize.numberParser()(price).toString();
        
      })
      .isFloat()
      .withMessage('El importe de aparcamiento debe ser un número')
      .bail()
      .isFloat({ min: 0})
      .withMessage(`El importe de aparcamiento debe ser igual o mayor que ${Globalize.numberFormatter({
        minimumFractionDigits: Math.max(
          Math.abs(config.types.decimal.min).toString().split('.')[1].length,
          Math.abs(config.types.decimal.max).toString().split('.')[1].length,
        ),
        maximumFractionDigits: Math.max(
          Math.abs(config.types.decimal.min).toString().split('.')[1].length,
          Math.abs(config.types.decimal.max).toString().split('.')[1].length,
        ),
      })(0)}`)
      .bail()
      .isFloat({ max: config.types.decimal.max })
      .withMessage(`El importe de aparcamiento debe ser igual o menor que ${Globalize.numberFormatter({
        minimumFractionDigits: Math.max(
          Math.abs(config.types.decimal.min).toString().split('.')[1].length,
          Math.abs(config.types.decimal.max).toString().split('.')[1].length,
        ),
        maximumFractionDigits: Math.max(
          Math.abs(config.types.decimal.min).toString().split('.')[1].length,
          Math.abs(config.types.decimal.max).toString().split('.')[1].length,
        ),
      })(config.types.decimal.max)}`)
      .bail()
      .run(req);

      await body('price')
      .if((price: string, meta: Meta): any => 
        (!_.isNil(req.body.exitDate) && (!_.isString(req.body.exitDate) || !_.isEmpty(_.trim(req.body.exitDate)))) || 
        (!_.isNil(req.body.exitTime) && (!_.isString(req.body.exitTime) || !_.isEmpty(_.trim(req.body.exitTime))))
      )
      .notEmpty()
      .withMessage('Debes ingresar el importe de aparcamiento')
      .bail()
      .run(req);

      validationError = validationResult(req).formatWith(Validator.errorFormatter).mapped();

      if (_.isEmpty(validationError)) {

        const plate: string = String(req.body.plate);
        const entry: Date = new Date(`${req.body.entryDate} ${req.body.entryTime}`);
        const exit: Date | null = _.isEmpty(req.body.exitDate) && _.isEmpty(req.body.exitTime) ? null : new Date(`${req.body.exitDate} ${req.body.exitTime}`);
        const price: Number | null = _.isEmpty(req.body.price) ? null : Number(req.body.price);

        let updatedParking: boolean = false;
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

          if (!_.isNull(garage)) {

            await Parking.update(
              {
                plate,
                entry,
                exit,
                price,
              },
              {
                where: {
                  id: parkingId,
                  garageId: garage.id,
                },
                transaction: transaction,
              },
            );
  
            await transaction.commit();
            updatedParking = true;

          } else {

            await transaction.rollback();

          }

        } catch (_) {

          await transaction.rollback();

        }

        if (updatedParking) {

          output.body.state = 3;
          output.body.message = 'Aparcamiento modificado con éxito';

        } else {

          output.body.state = 2;
          output.body.message = 'No se pudo modificar el aparcamiento';

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
  UpdateParking,
};
