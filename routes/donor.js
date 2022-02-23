const express = require('express');
const donor_auth = require('../controllers/donor_auth');

const mysql = require("mysql");

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE
});

const router = express.Router();


router.post('/register', donor_auth.register );

router.post('/login', donor_auth.login );

router.get('/logout', donor_auth.logout );

router.get('/dashboard', donor_auth.isLoggedIn, function(req, res, next) {

    if( req.donor ) {
    var sql='SELECT * FROM martyrs';
    db.query(sql, function (err, data, fields) {
    if (err) throw err;
    res.render('donor/donordashboard', { title: 'Donor Dashboard', martyrData: data});
  });
    } else {
      res.redirect('/donorlogin');
    }
  });

  router.get('/donations', donor_auth.isLoggedIn, function(req, res, next) {

    if( req.donor ) {
     var id = req.donor.id;
    var sql=`SELECT A.orderId,A.amount,A.createdAt,A.status,B.name FROM donationdetails A, martyrs B WHERE A.donorId = ${id} AND B.id=A.martyrId`;
    db.query(sql, function (err, data, fields) {
    
        console.log(data);
        res.render('donor/donordonations', { title: 'Donor Donations', details : data});
  });
    }
  });


module.exports = router;