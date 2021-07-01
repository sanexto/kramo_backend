ARG APP_IMAGE

# ---------- Base ----------
FROM $APP_IMAGE AS base

WORKDIR /app

# ---------- Development ----------
FROM base AS development

CMD npm install && npm run watch
