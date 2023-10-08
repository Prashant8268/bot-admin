const {Telegraf} = require('telegraf');
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const Subscriber = require('./models/Subscriber');
const axios = require('axios');
const schedule = require('node-schedule');
const Api = require('./models/Api');
const { initialize } = require('passport');

async function getApiKeys(){

  let WEATHER_KEY = await Api.findOne({name:`WEATHER_KEY`});
  let GET_COORDINATS_KEY = await Api.findOne({name:`GET_COORDINATS_KEY`})

}
getApiKeys();

bot.launch().then(() => {
console.log('Bot has started.');
});

bot.start((ctx) => {
    ctx.reply(`
      Hello ${ctx.message.from.first_name}, Welcome! I am a weather bot.
      Follow these commands to interact with me:
      /subscribe{city}  - To get daily weather updates, e.g /subscribe Delhi.
      /unsubscribe - To unsubscribe from my service.
      /todayWeather - To know weather of your city.
      /weather{city} - To know wheater of a city,e.g /weather Delhi.
    `);
  });


bot.command('subscribe', async (ctx) => {
    let userId = ctx.message.from.id;
    const name = ctx.message.from.first_name;
    const existingSubscriber = await Subscriber.findOne({userId});

    if(existingSubscriber){
        ctx.reply('You are already subscribed');
        return;
    }
    const commandArgs = ctx.message.text.split(' '); 
    let city;
    // Split the command into words
    if (commandArgs.length < 2) {
      ctx.reply('Please provide a city name. Usage: /subscribe {cityName}');
      return ;
    } else {
      city = commandArgs.slice(1).join(' ');
    }
    if (existingSubscriber) {
        ctx.reply('You are already subscribed.');
      } else{
        // Create a new subscriber
        const newSubscriber = await Subscriber.create({
          name,userId,city
        });

      if (newSubscriber) {
        ctx.reply('You have been successfully subscribed to weather updates.');
      } else {
        ctx.reply('Unable to subscribe at the moment. Please try again later.');
      }
    }
});


bot.command('unsubscribe', async (ctx) => {
    let userId = ctx.message.from.id;
    const name = ctx.message.from.first_name;
    const existingSubscriber = await Subscriber.findOne({userId});
    if(existingSubscriber){
        await Subscriber.deleteOne(existingSubscriber);
        ctx.reply(`Hey ${name} you have successfully unsubscribed. 
        You won't receive further updates.
        Thank You`)
    }
    else{
        ctx.reply(`Hey ${name} you are not subscribed`)
    }
});

bot.command('weather', async(ctx) => {
    const commandArgs = ctx.message.text.split(' '); 
    if (commandArgs.length < 2) {
      ctx.reply('Please provide a city name. Usage: /weather {city}');
    } else {
      const city = commandArgs.slice(1).join(' ');
      const todayTem = await fetchWeather(city);
      ctx.reply(` ${todayTem}`);
    }
  });

  bot.help((ctx) => ctx.reply('Type /start to interact with me'));
  bot.command('hello',(ctx)=>{
    ctx.reply('I am Fine How are you ')
  })
  bot.on('text', async (ctx) => {
    const userMessage = ctx.message.text;
    const userId = ctx.message.from.id;
    const response =  processUserMessage(userMessage, userId);
    ctx.reply(response);
  });


  bot.command('todayWeather',async(ctx)=>{
    const existingSubscriber = await Subscriber.findOne({userId:ctx.message.from.id});
    if(!existingSubscriber){
      ctx.reply('You are not subscribed. Please Subscribe or use /weather cityName command');
      return ;
    }
    const todayTem = await this.fetchWeather(existingSubscriber.city);
    ctx.reply(`${todayTem}`);
  })

  function processUserMessage(userMessage, userId) {
    if (userMessage.toLowerCase().includes('hello')) {
      return 'Hi there!';
    }
    if (userMessage.toLowerCase().includes('how are you')) {
      return "I'm just a bot, but I'm here to help!";
    }
    return 'I did not understand your message. Please try again or use commands.';
  }

 async function fetchWeather(city){
    const coordinatesResponse = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${city}&key=${GET_COORDINATS_KEY}`);
    const coordinates = coordinatesResponse.data.results[0].geometry;
    const weatherResponse = await axios.get(`https://api.tomorrow.io/v4/weather/forecast?location=${coordinates.lat},${coordinates.lng}&apikey=${WEATHER_KEY}`);
    const response = weatherResponse.data.timelines.daily[0].values;
    const humidityAvg = response.humidityAvg;
    const temperatureAvg = response.temperatureAvg;
    const temperatureMax = response.temperatureMax;
    const temperatureMin  = response.temperatureMin;
    const windspeedAvg = response.windSpeedAvg;
    let condition;
    if(temperatureAvg>23.4){
      condition = 'Hot';
    } else if(temperatureAvg<23.9 && temperatureAvg>18.3){
      condition= "Mild"
    } else{
      condition= "Cold"
    }
  
    const check = `Your city temp will be ${temperatureAvg}:
    Maximum temperature of Day will be ${temperatureMax},
    Minimum temperature of Day will be ${temperatureMin},
    Humidity will be around ${humidityAvg},
    Average wind speed will be ${windspeedAvg} m/s,
    Overall It will be a ${condition} day. 
    Thank you.`
    return check;
} 




const job = schedule.scheduleJob('0 7 * * *', async () => {
      // This code will be executed at 7 AM every day
      console.log('Scheduled task executed at 7 AM.');
      const subscribers = await Subscriber.find();
      for (const subscriber of subscribers) {
        const weatherDetails = await fetchWeather(subscriber.city);
        if (weatherDetails) {
          bot.telegram.sendMessage(subscriber.userId,weatherDetails)
        }
        else{
          bot.telegram.sendMessage(subscriber.userId,'Report is not available')
        }
      }
});


module.exports = {
    bot,
  };