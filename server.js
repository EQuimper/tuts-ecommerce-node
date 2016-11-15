const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const engine = require('ejs-mate');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('express-flash');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');

const secret = require('./config/secret');
const mainRoutes = require('./routes/main');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const apiRoutes = require('./api/api');
const Category = require('./models/category');
const cartLength = require('./middlewares/middlewares');

const app = express();

mongoose.Promise = global.Promise;
mongoose.connect(secret.dbUrl, function(err) {
  if (err)
    console.log(err);

  console.log(`Connected to the database`);
});

/*
* APP MIDDLEWARE
*/
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: secret.secretKey,
  store: new MongoStore({ url: secret.dbUrl, autoReconnect: true })
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) { // For get user everywhere
  res.locals.user = req.user;
  next();
});
app.use(cartLength);
app.use(function(req, res, next) { // For get all the categories
  Category.find({}, function(err, categories) {
    if (err)
      return next(err);

    res.locals.categories = categories;
    next();
  });
});

app.engine('ejs', engine);
app.set('view engine', 'ejs');

/*
* APP ROUTES
*/
app.use(userRoutes);
app.use(mainRoutes);
app.use(adminRoutes);
app.use('/api', apiRoutes);

/*
* APP LISTEN
*/
app.listen(secret.port, err => {
  if (err)
    throw err;
  console.log(`Server is Running on port: ${secret.port}`);
});
