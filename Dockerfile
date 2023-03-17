FROM nginx AS serve
WORKDIR /usr/share/nginx/html
COPY style style
COPY src src
COPY index.html index.html