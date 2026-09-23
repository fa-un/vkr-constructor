#!/bin/sh
# Собирает index.html для GitHub Pages из vkr_constructor.html (исходник артефакта claude.ai,
# который публикуется без обёртки <html>/<head>/<body>).
set -e
cd "$(dirname "$0")"
{
  printf '<!doctype html>\n<html lang="ru">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
  sed -n '/^<title>/p' vkr_constructor.html
  printf '</head>\n<body>\n'
  sed '/^<title>/d' vkr_constructor.html
  printf '</body>\n</html>\n'
} > index.html
echo "index.html: $(wc -c < index.html) bytes"
