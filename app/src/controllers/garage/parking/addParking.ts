import { NextFunction, Request, Response, } from 'express';
import { body, Meta, validationResult, } from 'express-validator';
import { Transaction, } from 'sequelize';
import _ from 'lodash';
import Globalize from 'globalize';
import moment from 'moment';

import config from '../../../config';
import { JsonResponse, Validator, } from '../../../base';
import { Garage, Parking, User, sequelize, } from '../../../models';

class AddParking {

  public static async get(req: Request, res: Response, next: NextFunction): Promise<void> {

    Globalize.load(require('cldr-data').entireSupplemental());
    Globalize.load(require('cldr-data').entireMainFor(config.locale));
    Globalize.locale(config.locale);

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

    Globalize.load(require('cldr-data').entireSupplemental());
    Globalize.load(require('cldr-data').entireMainFor(config.locale));
    Globalize.locale(config.locale);

    const output: JsonResponse.Output = {
      status: JsonResponse.Status.Ok,
      body: {},
    };

    output.body = {
      state: 1,
      message: '',
      field: {},
    };

    let validationError: Record<string, Validator.ValidationError> = {};

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

      if (moment(entryDate, 'YYYY/MM/DD', true).isBetween(config.types.date.min, config.types.date.max, undefined, '[]')) {

        return true;

      } else {

        throw new Error('El campo "Fecha de entrada" no tiene un valor válido');

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

      if (moment(entryTime, 'HH:mm', true).isValid()) {

        return true;

      } else {

        throw new Error('El campo "Hora de entrada" no tiene un valor válido');

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

      if (moment(exitDate, 'YYYY/MM/DD', true).isBetween(config.types.date.min, config.types.date.max, undefined, '[]')) {

        return true;

      } else {

        throw new Error('El campo "Fecha de salida" no tiene un valor válido');

      }

    })
    .bail()
    .run(req);

    validationError = validationResult(req).formatWith(Validator.errorFormatter).mapped();

    if (!_.has(validationError, 'exitDate')) {

      await body('exitDate')
      .if((exitDate: string, meta: Meta): any => 
        (!_.isNil(req.body.exitTime) && (!_.isString(req.body.exitTime) || !_.isEmpty(_.trim(req.body.exitTime)))) || 
        (!_.isNil(req.body.price) && (!_.isString(req.body.price) || !_.isEmpty(_.trim(req.body.price))))
      )
      .notEmpty()
      .withMessage('Debes ingresar la fecha de salida del vehículo')
      .bail()
      .run(req);

    }

    validationError = validationResult(req).formatWith(Validator.errorFormatter).mapped();

    if (!_.has(validationError, 'entryDate') && !_.has(validationError, 'exitDate')) {

      await body('exitDate')
      .if(body('exitDate').notEmpty())
      .custom((exitDate: string, meta: Meta): any => {

        if (moment(exitDate, 'YYYY/MM/DD', true).isSameOrAfter(moment(req.body.entryDate, 'YYYY/MM/DD', true))) {

          return true;

        } else {

          throw new Error('La fecha de salida del vehículo debe ser igual o posterior a la fecha de entrada');

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

      if (moment(exitTime, 'HH:mm', true).isValid()) {

        return true;

      } else {

        throw new Error('El campo "Hora de salida" no tiene un valor válido');

      }

    })
    .bail()
    .run(req);

    validationError = validationResult(req).formatWith(Validator.errorFormatter).mapped();

    if (!_.has(validationError, 'exitTime')) {

      await body('exitTime')
      .if((exitTime: string, meta: Meta): any => 
        (!_.isNil(req.body.exitDate) && (!_.isString(req.body.exitDate) || !_.isEmpty(_.trim(req.body.exitDate)))) || 
        (!_.isNil(req.body.price) && (!_.isString(req.body.price) || !_.isEmpty(_.trim(req.body.price))))
      )
      .notEmpty()
      .withMessage('Debes ingresar la hora de salida del vehículo')
      .bail()
      .run(req);

    }

    validationError = validationResult(req).formatWith(Validator.errorFormatter).mapped();

    if (!_.has(validationError, 'entryDate') && !_.has(validationError, 'entryTime') && !_.has(validationError, 'exitDate') && !_.has(validationError, 'exitTime')) {

      await body('exitTime')
      .if(body('exitDate').notEmpty())
      .if(body('exitTime').notEmpty())
      .custom((exitTime: string, meta: Meta): any => {

        if (!(moment(req.body.exitDate, 'YYYY/MM/DD', true).isSame(moment(req.body.entryDate, 'YYYY/MM/DD', true)) && moment(exitTime, 'HH:mm', true).isBefore(moment(req.body.entryTime, 'HH:mm', true)))) {

          return true;

        } else {

          throw new Error('La hora de salida del vehículo debe ser igual o posterior a la hora de entrada');

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

    validationError = validationResult(req).formatWith(Validator.errorFormatter).mapped();

    if (!_.has(validationError, 'price')) {

      await body('price')
      .if((price: string, meta: Meta): any => 
        (!_.isNil(req.body.exitDate) && (!_.isString(req.body.exitDate) || !_.isEmpty(_.trim(req.body.exitDate)))) || 
        (!_.isNil(req.body.exitTime) && (!_.isString(req.body.exitTime) || !_.isEmpty(_.trim(req.body.exitTime))))
      )
      .notEmpty()
      .withMessage('Debes ingresar el importe de aparcamiento')
      .bail()
      .run(req);

    }

    validationError = validationResult(req).formatWith(Validator.errorFormatter).mapped();

    if (_.isEmpty(validationError)) {

      const plate: string = String(req.body.plate);
      const entry: Date = new Date(`${req.body.entryDate} ${req.body.entryTime}`);
      const exit: Date | null = _.isEmpty(req.body.exitDate) || _.isEmpty(req.body.exitTime) ? null : new Date(`${req.body.exitDate} ${req.body.exitTime}`);
      const price: Number | null = _.isEmpty(req.body.price) ? null : Number(req.body.price);

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

        if (!_.isNull(garage)) {

          await Parking.create(
            {
              plate,
              entry,
              exit,
              price,
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

    res.json(output);

  }

}

export {
  AddParking,
};
