# bot-admin
A telegram bot for daily weather updates. telegram username - @hospalsBot

## Installation

To install this project, follow these steps:

1. Clone the repository.
2. Run `npm install` to install dependencies.

## Usage
1. Create your bot token by following below steps:
a) Search for @BotFather.
b) Create new bot using /newbot command.
   
2. Create .env file and define below variables
PORT,
CLIENT_ID ,
CLIENT_SECRET ,
CALLBACK_URL,
MONGO_URL,
ADMIN_EMAIL,
ADMIN_PASSWORD,
TELEGRAM_BOT_TOKEN,


3.Setting APIs in .env 
```bash
WEATHER_KEY www.tomorrow.io
```
```bash
GET_COORDINATS_KEY  https://opencagedata.com
```

3.Run project :
```bash
npm start 

