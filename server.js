const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const engine = require('ejs-mate');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('express-flash');
const secret = require('./config/secret');
const mainRoutes = require('./routes/main');
const userRoutes = require('./routes/user');

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
  secret: secret.secretKey
}));
app.use(flash());

app.engine('ejs', engine);
app.set('view engine', 'ejs');


/*
* APP ROUTES
*/
app.use(mainRoutes);
app.use(userRoutes);


/*
* APP LISTEN
*/

app.listen(secret.port, err => {
  if (err)
    throw err;
  console.log(`Server is Running on port: ${secret.port}`);
});
