FROM node:18-alpine
WORKDIR /usr/src/app

# copy your package files and install everything else
COPY package*.json ./
RUN npm install --legacy-peer-deps

# axios issue from before 
RUN npm install axios --legacy-peer-deps --save

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host"]
