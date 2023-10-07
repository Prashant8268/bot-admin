const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema({
  name: String,         // User-friendly name for the API key
  key: String,          // Hashed or encrypted API key value
  createdAt: Date,     // Timestamp for key creation
  updatedAt: Date,     // Timestamp for key updates
});

const ApiKey = mongoose.model('ApiKey', apiKeySchema);

module.exports = ApiKey;
