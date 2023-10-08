const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema({
  name: String,         
  key: String,             
});

const ApiKey = mongoose.model('ApiKey', apiKeySchema);


module.exports = ApiKey;
