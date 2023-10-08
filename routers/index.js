const express = require('express');
const router = express.Router();
const Subscriber = require('../models/Subscriber');
const controller = require('../controllers/home_controller');
const passport = require('passport')


router.get('/',controller.home);
router.get('/user/auth/google',passport.authenticate('google',{scope:['profile', 'email']}));
router.get('/user/auth/google/callback',passport.authenticate('google',{failureRedirect:'/error'}),controller.createSession)
router.get('/dashboard',passport.checkAuthentication,controller.dashboard);
router.get('/add-admin',passport.checkAuthentication, controller.adminForm);
router.get('/delete-subscriber',passport.checkAuthentication,controller.deleteSubscriber);
router.get('/logout',controller.logout);
router.post('/api/create-admin',controller.createAdmin);
router.get('/api',passport.checkAuthentication,controller.api);

router.get('/*', (req,res)=>{
    return res.render('error')
});

module.exports = router;