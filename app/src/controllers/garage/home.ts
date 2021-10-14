import { NextFunction, Request, Response, } from 'express';
import _ from 'lodash';

import { JsonResponse, } from '../../base';
import { Garage, User, } from '../../models';

class Home {

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

    let garage: Garage | null = null;

    try {

      garage = await Garage.findOne(
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
        },
      );

    } catch(_) {}

    if (!_.isNull(garage)) {

      output.body = {
        state: 2,
        title: 'Aparcamientos',
        garageAccount: {
          fullName: _.isNil(garage.name) ? '' : garage.name,
          username: _.isNil(garage.User.username) ? '' : garage.User.username,
          picture: `${(_.isNil(garage.User.username) ? '' : garage.User.username).substr(0, 1).toUpperCase()}${(_.isNil(garage.User.username) ? '' : garage.User.username).substr(-1, 1).toUpperCase()}`,
        },
        navMenu: {
          item: {
            updateAccount: {
              title: 'Mi cuenta',
            },
            updatePassword: {
              title: 'Modificar contraseña',
            },
            logout: {
              title: 'Salir',
            },
          },
        },
        form: {
          searchParking: {
            field: {
              term: {
                hint: 'Buscar...',
                value: '',
              },
            },
          },
        },
        list: {
          parking: {
            message: {
              empty: 'No se encontraron aparcamientos',
            },
          },
        },
        page: {
          filterParking: {
            title: 'Filtro',
            actionMenu: {
              item: {
                clearFilter: {
                  title: 'Limpiar',
                }
              },
            },
            form: {
              filterParking: {
                field: {
                  entry: {
                    label: 'Entrada',
                    hint: '',
                    value: ' - ',
                    default: ' - ',
                    pickerHint: 'DD/MM/AAAA',
                  },
                  exit: {
                    label: 'Salida',
                    hint: '',
                    value: ' - ',
                    default: ' - ',
                    pickerHint: 'DD/MM/AAAA',
                  },
                  orderBy: {
                    label: 'Ordenar por',
                    hint: '',
                    item: [
                      {
                        label: 'ID',
                        value: 'id',
                      },
                      {
                        label: 'Matrícula',
                        value: 'plate',
                      },
                      {
                        label: 'Entrada',
                        value: 'entry',
                      },
                      {
                        label: 'Salida',
                        value: 'exit',
                      },
                      {
                        label: 'Importe',
                        value: 'price',
                      },
                    ],
                    value: 'id',
                    default: 'id',
                  },
                  order: {
                    label: 'Orden',
                    hint: '',
                    item: [
                      {
                        label: 'Ascendente',
                        value: 'asc',
                      },
                      {
                        label: 'Descendente',
                        value: 'desc',
                      },
                    ],
                    value: 'desc',
                    default: 'desc',
                  },
                },
                button: {
                  apply: {
                    label: 'Aplicar',
                  },
                },
              },
            },
          },
        },
      };

    } else {

      output.body.error.message = 'Tu usuario no existe';

    }

    res.json(output);

  }

}

export {
  Home,
};
