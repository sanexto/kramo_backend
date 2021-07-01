ARG APP_IMAGE

# ---------- Base ----------
FROM $APP_IMAGE AS base

WORKDIR /app

# ---------- Development ----------
FROM base AS development

COPY ./node_modules ./node_modules
COPY ./package.json ./tsconfig.json ./.sequelizerc ./

CMD npm run watch
