import { NextFunction, Request, Response, } from 'express';
import { Op, } from 'sequelize';

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
                id: {
                  [Op.eq]: req.userId,
                },
              },
            },
          ],
        },
      );

    } catch(e) {}

    if (garage != null) {

      output.body = {
        state: 2,
        title: 'Reservas',
        garageAccount: {
          fullName: `${garage.name ?? ''}`,
          username: garage.User.username ?? '',
          picture: `${(garage.User.username ?? '').substr(0, 1).toUpperCase()}${(garage.User.username ?? '').substr(-1, 1).toUpperCase()}`,
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
          searchReservation: {
            field: {
              term: {
                hint: 'Buscar...',
                value: '',
              },
            },
          },
        },
        list: {
          reservation: {
            message: {
              empty: 'No se encontraron reservas',
            },
          },
        },
        page: {
          filterReservation: {
            title: 'Filtro',
            actionMenu: {
              item: {
                clearFilter: {
                  title: 'Limpiar',
                }
              },
            },
            form: {
              filterReservation: {
                field: {
                  vehicleEntry: {
                    label: 'Entrada del vehículo',
                    hint: '',
                    value: ' - ',
                    default: ' - ',
                    pickerHint: 'DD/MM/AAAA',
                  },
                  vehicleExit: {
                    label: 'Salida del vehículo',
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
                        label: 'Matrícula del vehículo',
                        value: 'vehiclePlate',
                      },
                      {
                        label: 'Entrada del vehículo',
                        value: 'vehicleEntry',
                      },
                      {
                        label: 'Salida del vehículo',
                        value: 'vehicleExit',
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
}
