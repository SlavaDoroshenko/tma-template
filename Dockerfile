FROM node:22-alpine AS builder

WORKDIR /app

# Копируем package.json и lock-файл
COPY package*.json ./

# Устанавливаем pnpm и зависимости
RUN npm install -g pnpm

RUN pnpm install

# Копируем остальные файлы приложения
COPY . .

# Собираем проект
RUN pnpm run build

FROM nginx:alpine

# Копируем собранные файлы в Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
