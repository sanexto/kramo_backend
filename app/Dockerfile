ARG APP_IMAGE

# ---------- Base ----------
FROM $APP_IMAGE AS base

WORKDIR /app

# ---------- Development ----------
FROM base AS development

COPY ./package.json ./package-lock.json ./tsconfig.json ./.sequelizerc ./
COPY ./node_modules ./node_modules

CMD npm run watch
