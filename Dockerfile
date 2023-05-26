# Використовуємо node: як базовий образ
FROM node

# Встановлюємо робочу директорію
WORKDIR /app

# Копіюємо весь код з репозиторію до директорії /app
COPY . .

# Встановлюэмо модулі
RUN npm install

# Використовуємо порт 4000
EXPOSE 4000:4000

# Команда для запуску проекту
CMD ["npm", "start"]



# comand for terminal:
# docker build -t backend-kapusta-local .
# docker images
# docker run -d -p 4000:4000 a26223b57f4c //start container running at port 4000 in browser
# docker ps // show all container
# docker stop id // id - container