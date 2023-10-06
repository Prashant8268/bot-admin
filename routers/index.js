const express = require('express');
const router = express.Router();
const Subscriber = require('../models/Subscriber');
const controller = require('../controllers/home_controller');
const passport = require('passport')


router.get('/',controller.home);
router.get('/user/auth/google',passport.authenticate('google',{scope:['profile', 'email']}));
router.get('/user/auth/google/callback',passport.authenticate('google',{failureRedirect:'/'}),(req,res)=>{
    return res.render('dashboard');
})
module.exports = router;