FROM node

RUN apt-get update && apt-get install -y vim 
WORKDIR /home/node
RUN yarn -y init
RUN yarn add bootstrap jquery popper.js
RUN yarn add --dev parcel
