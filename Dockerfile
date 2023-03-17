FROM nginx AS serve
COPY src /usr/share/nginx/html/src
COPY index.html /usr/share/nginx/html/index.html