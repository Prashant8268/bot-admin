const {Telegraf} = require('telegraf');
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN2);
const Subscriber = require('./models/Subscriber');
const axios = require('axios');
const schedule = require('node-schedule');
const Api = require('./models/Api');
const userBlock = require('telegraf-userblock');

const { initialize } = require('passport');
const { ConnectionStates } = require('mongoose');
let WEATHER_KEY;
let GET_COORDINATS_KEY;
async function getApiKeys(){
   WEATHER_KEY = await Api.findOne({name:`WEATHER_KEY`});
   GET_COORDINATS_KEY = await Api.findOne({name:`GET_COORDINATS_KEY`});

}
getApiKeys();
bot.use(
  userBlock({
      onUserBlock: (ctx, next, userId) => {
          console.log('This user %s has blocked the bot.', userId);
          return next();
      },
  })
);
bot.launch().then(() => {
console.log('Bot has started.');
});



bot.start((ctx) => {
  try{
    ctx.reply(`
    Hello ${ctx.message.from.first_name}, Welcome! I am a weather bot.
    Follow these commands to interact with me:
    /subscribe{city}  - To get daily weather updates, e.g /subscribe Delhi.
    /unsubscribe - To unsubscribe from my service.
    /todayWeather - To know weather of your city.
    /weather{city} - To know wheater of a city,e.g /weather Delhi.
  `);
  }
  catch (error) {
    if (error.description === 'Forbidden: bot was blocked by the user') {
      console.log('User has blocked the bot.');
    } else {
      console.error('Error occurred:', error);
    }
  }
  });


bot.command('subscribe', async (ctx) => {
  try{
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
  }
  catch(err){
    console.log(err,'errror')
  }

});


bot.command('unsubscribe', async (ctx) => {
  try{
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
  }
  catch(err){
    console.log(err, 'eroor');
  }

});

bot.command('weather', async(ctx) => {
  try{
    const commandArgs = ctx.message.text.split(' '); 
    if (commandArgs.length < 2) {
      ctx.reply('Please provide a city name. Usage: /weather {city}');
    } else {
      const city = commandArgs.slice(1).join(' ');
      const todayTem = await fetchWeather(city);
      if(!todayTem){
        ctx.reply('Report is not present try again later');
        return ;
      }
      ctx.reply(` ${todayTem}`);
    }
  }
  catch(err){
    console.log(err,'error');
  }

  });

  bot.help((ctx) => {
    try{
      ctx.reply('Type /start to interact with me')
    }
    catch(err){
      console.log(err,'error');
    }
  });
  bot.command('hello',(ctx)=>{
    try{
      ctx.reply('I am Fine How are you ')
    }
    catch(err){
      console.log(err, 'error')
    }
  })


bot.command('todayWeather',async(ctx)=>{
    try{
      const existingSubscriber = await Subscriber.findOne({userId:ctx.message.from.id});
      if(!existingSubscriber){
        ctx.reply('You are not subscribed. Please Subscribe or use /weather cityName command');
        return ;
      }
      const todayTem = await fetchWeather(existingSubscriber.city);
      if(!todayTem){
        ctx.reply('Report is not present try again later');
        return ;
      }
      ctx.reply(`${todayTem}`);
    }
    catch(err){
      console.log(err, 'error');
    }
  })

bot.on('text', async (ctx) => {
    try{
      const userMessage = ctx.message.text;
      const userId = ctx.message.from.id;
      const response =  processUserMessage(userMessage, userId);
      ctx.reply(response);
    }
    catch(err){
      console.log(err, 'error');
    }
  });

function processUserMessage(userMessage, userId) {
    if (userMessage.toLowerCase().includes('hello')) {
      return 'Hi there!';
    }
    if (userMessage.toLowerCase().includes('how are you')) {
      return "I'm just a bot, but I'm here to help!";
    }
    return `I did not understand your message. Please try again or use commands.
    Write /start for help` ;
  }

async function fetchWeather(city){
  try{
    const coordinatesResponse = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${city}&key=${GET_COORDINATS_KEY.key}`);
    if(coordinatesResponse.data.results==0){
      return ;
    }
    const coordinates = coordinatesResponse.data.results[0].geometry;
    const weatherResponse = await axios.get(`https://api.tomorrow.io/v4/weather/forecast?location=${coordinates.lat},${coordinates.lng}&apikey=${WEATHER_KEY.key}`);
    if(!weatherResponse){
      return ;
    }
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
  catch(err){
    console.log(err,'error');
  }

} 




// const job = schedule.scheduleJob('30 9 * * *', async () => {
//   try {
//     console.log('Scheduled task executed at 8 AM.');
//     const subscribers = await Subscriber.find();
    
//     for (const subscriber of subscribers) {
//       console.log(`Sending weather report to ${subscriber.name}`);
//       const weatherDetails = await fetchWeather(subscriber.city);
//       const message = weatherDetails
//         ? weatherDetails
//         : 'Report is not available';
      
//       try {
//         await bot.telegram.sendMessage(subscriber.userId, message);
//         console.log('Task executed successfully.');
//       } catch (err) {
//         console.error('Error sending message:', err);
//       }
//     }
//   } catch (err) {
//     console.error('Error in the scheduled task:', err);
//   }
// });


const botEndpoint = 'https://tele-weather-bot.onrender.com/';
async function pingBot() {
  try {
    const response = await axios(botEndpoint);
    if (response.ok) {
      console.log(`Ping successful: ${new Date().toISOString()}`);
    } else {
      console.error(`Ping failed with status code: ${response.status}`);
    }
  } catch (error) {
    console.error(`Error occurred while pinging the bot: ${error.message}`);
  }
}
const pingInterval = 5 * 60 * 1000; 
setInterval(pingBot, pingInterval);
pingBot();


const SUBSCRIBE_TIME = '09:35'; 
async function sendDailyMessage() {
  try {
    const subscribers = await Subscriber.find();
    for (const subscribe of subscribers) {
      const weatherDetails = await fetchWeather(subscribe.city); 
      const message = weatherDetails ? weatherDetails : 'Report is not available';
      await bot.telegram.sendMessage(subscribe.userId, message);
    }
    console.log('Daily messages sent successfully.');
  } catch (err) {
    console.error('Error sending daily messages:', err);
  }
}

function scheduleDailyTask() {
  const now = new Date();
  const targetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), ...SUBSCRIBE_TIME.split(':')); // Parse time
  const timeUntilNextExecution = targetTime - now;

  if (timeUntilNextExecution < 0) {
    targetTime.setDate(targetTime.getDate() + 1);
  }
  const delay = targetTime - now;
  setTimeout(() => {
    sendDailyMessage(); 
    scheduleDailyTask(); 
  }, delay);
}

scheduleDailyTask();



module.exports = {
    bot,
  };