//docker je alat koji mi omogucava da spakujem celu svoju aplikaciju (kod+biblioteke+okruzenje) u jedan kontejner, koji onda mogu
da pokrenem bilo gde, bez razlike da li sam na Windowsu, Linduxu, serveru, cloudu...


# 1. Koristi Node image(mala i brza verzija Node-a)
FROM node:18-alpine

# 2. Radna putanja u kontejneru (kao cd)
WORKDIR /src

# 3. Kopira package fajlove (da instaliramo pakete)
COPY package*.json ./

# 4. Instalira dependencije
RUN npm install

# 5. Kopira ostatak aplikacije
COPY . .

# 6.Bilduje TypeScript kod u JavaScript
RUN npm run build

# 7. Izlaze port(isti kao sto koristi moja aplikacija)
EXPOSE 5000

# 8. Startuje aplikaciju iz build foldera
CMS ["node", "dist/main"]