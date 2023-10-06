const express = require('express');
const sassMiddleware = require('node-sass-middleware');
const dotenv = require('dotenv'); 
const session = require('express-session');
const passport = require('passport');
const passportGoogle = require('./config/passport-google-Oauth-strategy');

dotenv.config(); 

const PORT = process.env.PORT || 3000; 

const app = express();
const db = require('./config/mongoose');

// Middleware for session and passport
app.use(session({ 
  name: "teleBot",
  saveUninitialized: false,
  secret: "blahsomething",
  resave: false,
  cookie: {
    maxAge: (1000 * 60 * 100)
  }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(passport.setAuthenticatedUser);

// Middleware for SASS compilation
app.use(
  sassMiddleware({
    src: 'assets/scss',
    dest: 'assets/css',
    debug: true, 
    prefix: '/css',
    err: (err) => {
      console.error(err, ' --> at sass middleware'); 
    },
  })
);

// Static files and other middleware
app.use(express.static('./assets'));

// Express layouts and view engine
app.set('view engine', 'ejs');
app.set('views', './views');
app.set('layout extractStyles', true);
app.set('layout extractScripts', true);

// Routes
app.use('/', require('./routers'));

// Start the server
app.listen(PORT, (err) => {
  if (err) {
    console.error('Error in starting server:', err);
    return;
  }

  console.log(`Server is running on port ${PORT}`);
});
