const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const crypto = require('crypto');
const Admin = require('../models/Admin');
require('dotenv').config();

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL_PROD,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let admin = await Admin.findOne({ email: profile.emails[0].value });
      if (admin) {      
        return done(null, admin);

      }
      else {
        admin = await Admin.create({
          email:profile.emails[0].value,
          password:crypto.randomBytes(20).toString('hex'),
          isAdmin:false,
          name:profile.displayName
        })
        return done(null,admin)
      }
    } catch (err) {
      console.log(err, 'Error in finding admin --> passport');
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const admin = await Admin.findById(id);
    done(null, admin);
  } catch (err) {
    console.log(err, 'Error in finding admin --> passport');
    done(err);
  }
});

passport.checkAuthentication = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/');
};

passport.setAuthenticatedUser = (req, res, next) => {
  if (req.isAuthenticated()) {
    res.locals.admin = req.user; 
  }
  next();
};

module.exports = passport;
