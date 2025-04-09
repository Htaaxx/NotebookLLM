FROM --platform=linux/amd64 node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Add this to generate the `.next` build
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]