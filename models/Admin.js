const mongoose = require('mongoose');
const adminSchema = new mongoose.Schema({
  email: String,
  password: String,
  name:String
});

// Create an admin model
const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;


  




