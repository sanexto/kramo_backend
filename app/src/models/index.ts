import { Sequelize, } from 'sequelize';

import config from '../config';

import { Admin, } from './admin';
import { Booking, } from './booking';
import { Garage, } from './garage';
import { User, } from './user';

const sequelize: Sequelize = new Sequelize(config.db.name, config.db.user, config.db.password, {
  host: config.db.host,
  port: config.db.port,
  dialect: config.db.dialect,
  define: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
  },
});

const models: Record<string, any> = {
  Admin,
  Booking,
  Garage,
  User,
};

for (const model of Object.values(models)) { model.initialize(sequelize); }
for (const model of Object.values(models)) { model.associate(models); }

export {
  Admin,
  Booking,
  Garage,
  User,
  sequelize,
};
