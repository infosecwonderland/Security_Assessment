FROM node:latest

#Create a application directory
WORKDIR /usr/src/app

#Install all the application dependencies
COPY package*.json ./

#nodejs install
RUN npm install

COPY . .

CMD 
#EXPOSE 443
RUN apt-get update && apt-get install -y wget

ENV DOCKERIZE_VERSION v0.6.1
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz

ENTRYPOINT dockerize -wait tcp://mysqldb:3306 -timeout 60m
CMD npm run
