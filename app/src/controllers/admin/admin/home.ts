import { NextFunction, Request, Response, } from 'express';

import { JsonResponse, } from '../../../base';

class Home {

  public static async get(req: Request, res: Response, next: NextFunction): Promise<void> {

    const output: JsonResponse.Output = {
      status: JsonResponse.Status.Ok,
      body: {},
    };

    output.body = {
      title: 'Administradores',
      form: {
        searchAdmin: {
          field: {
            term: {
              hint: 'Buscar...',
              value: '',
            },
          },
        },
      },
      list: {
        admin: {
          message: {
            empty: 'No se encontraron administradores',
          },
        },
      },
      page: {
        filterAdmin: {
          title: 'Filtro',
          actionMenu: {
            item: {
              clearFilter: {
                title: 'Limpiar',
              }
            },
          },
          form: {
            filterAdmin: {
              field: {
                orderBy: {
                  label: 'Ordenar por',
                  hint: '',
                  item: [
                    {
                      label: 'Nombre',
                      value: 'name',
                    },
                    {
                      label: 'Apellido',
                      value: 'surname',
                    },
                    {
                      label: 'Correo',
                      value: 'email',
                    },
                    {
                      label: 'Usuario',
                      value: 'username',
                    },
                    {
                      label: 'Fecha',
                      value: 'date',
                    },
                  ],
                  value: 'date',
                  default: 'date',
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

    res.json(output);

  }

}

export {
  Home,
}
