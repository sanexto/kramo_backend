export default {
  port: Number(process.env.APP_PORT),
  secret: <string> process.env.APP_SECRET,
  db: {
    name: <string> process.env.DB_NAME,
    user: <string> process.env.DB_USER,
    password: <string> process.env.DB_PASSWORD,
    host: <string> process.env.DB_HOST,
    port: <number> Number(process.env.DB_PORT),
    dialect: <'mariadb' | 'mysql' | 'postgres' | 'sqlite' | 'mssql' | undefined> process.env.DB_DIALECT,
  },
  types: {
    id: {
      min: 1,
      max: 999999999,
    },
    decimal: {
      min: -999999999.99,
      max: 999999999.99,
    },
    date: {
      min: '1000-01-01 00:00:00',
      max: '9999-12-31 23:59:59',
    },
  },
  locale: 'es-ES',
};
