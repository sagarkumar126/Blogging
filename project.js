require('dotenv').config();
const session = require('express-session');
const express = require('express');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override') 


const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo');


const connectDB = require('./server/config/db');
const {isActiveRoute} = require('./server/helpers/routehelpers');

const app = express();
const Port = process.env.PORT || 5000;


connectDB(); 

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));


app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI
  })
}));



app.use(express.static('public'));

app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');
app.locals.isActiveRoute=isActiveRoute;

app.use((req, res, next) => {
  res.locals.user = req.cookies.token ? true : false;
  next();
});



app.set('layout extractLocals', true); // ✅ THIS LINE FIXES YOUR ISSUE

app.use('/', require('./server/routes/main'));
app.use('/', require('./server/routes/admin'));

app.listen(Port, () => {
  console.log(`App is listening on port ${Port}`);
});
