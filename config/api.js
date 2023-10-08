const Api = require('../models/Api');
const { initialize } = require('passport');

// Replace 'apiKey' with the actual API key to be hashed


async function initializeApiKeys(){

    const isApiPresent = await Api.find();
    if(isApiPresent.length>0){
        return ;
    }
    const WEATHER_KEY = process.env.WEATHER_KEY;
    const saltRounds =10;
    await Api.create({
        name:`WEATHER_KEY`,
        key:WEATHER_KEY
    });

    const GET_COORDINATS_KEY = process.env.GET_COORDINATS_KEY;
    await Api.create({
        name:`GET_COORDINATS_KEY`,
        key:GET_COORDINATS_KEY
    })
    

}

module.exports={
    initializeApiKeys
}



