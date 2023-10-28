## Description

Test app for communication with program via Gear Protocol.

## Installation

```bash
$ npm install
```

## Running DB migrations
```bash
$ npx sequelize-cli db:migrate
```

## Setting env
You need to copy .env.example and set up your environment:
- connection to DB
- mnemonic phrase for you connected account
- program ID on idea.gear-tech.io
- application ID on idea.gear-tech.io

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```