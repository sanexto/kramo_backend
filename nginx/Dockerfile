ARG NGINX_IMAGE

# ---------- Base ----------
FROM $NGINX_IMAGE AS base

WORKDIR /

COPY ./default.conf.template ./etc/nginx/templates/
