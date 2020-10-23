FROM node:12

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

RUN npm run build
EXPOSE 443

ENV NODE_ENV production
ENV API_SERVER https://pstore.app:8080
ENV INCOGNITO_CONTRACT_ADDRESS 0xE0D5e7217c6C4bc475404b26d763fAD3F14D2b86
ENV INCOGNITO_BURN_ADDRESS 12RxahVABnAVCGP3LGwCn8jkQxgw7z1x14wztHzn455TTVpi1wBq9YGwkRMQg3J4e657AbAnCvYCJSdA9czBUNuCKwGSRQt55Xwz8WA
ENV INCOGNITO_FULLNODE https://testnet1.incognito.org/fullnode
ENV ETH_FULLNODE https://kovan.infura.io/v3/34918000975d4374a056ed78fe21c517
ENV ETHER_SCAN_API_HOST https:///api.etherscan.io/api
ENV API_URL https://test-api2.incognito.org
ENV PORT 443

CMD [ "node", "server" ]
