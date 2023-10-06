const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const subscriberSchema = new Schema({
  name: String,
  userId: Number,
  city:String
});
const Subscriber= mongoose.model('Subscriber', subscriberSchema);
module.exports = Subscriber;
