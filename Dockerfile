FROM node:18.16.0-alpine AS production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json", "./"]
RUN npm install
COPY . .
EXPOSE 4000
CMD [ "npm", "run", "start" ]
