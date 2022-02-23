const express = require("express");
const path = require('path');
const mysql = require("mysql");
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

const app = express();

dotenv.config({ path: './.env'});
app.set('views', path.join(__dirname, 'views'));



const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
  });
  
  db.connect( (error) => {
    if(error) {
      console.log(error)
    } else {
      console.log("MYSQL Connected...")
    }
  })


  const publicDirectory = path.join(__dirname, './public');
  
  app.use(express.static(publicDirectory));
  
  // Parse URL-encoded bodies (as sent by HTML forms)
  app.use(express.urlencoded({ extended: false }));
  // Parse JSON bodies (as sent by API clients)
  app.use(express.json());
  app.use(cookieParser());
  
  app.set('view engine', 'ejs');
  
  //Define Routes
app.use('/', require('./routes/pages'));
app.use('/donor', require('./routes/donor'));
app.use('/admin', require('./routes/admin'));
app.use('/payment', require('./routes/payment'));


  app.listen(2000, () => {
    console.log("Server started on Port 2000");
  })