const express = require('express');
const admin_auth = require('../controllers/admin_auth');

const mysql = require("mysql");

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE
});

const router = express.Router();


router.post('/login', admin_auth.login );

router.get('/logout', admin_auth.logout );

router.get('/dashboard', admin_auth.isLoggedIn, function(req, res, next) {

  if( req.admin ) {
  var sql='SELECT * FROM martyrs';
  db.query(sql, function (err, data, fields) {
  if (err) throw err;
  res.render('admin/admindashboard', { title: 'Admin Dashboard', martyrData: data});
});
  } else {
    res.redirect('/adminlogin');
  }
});

router.get('/add', admin_auth.isLoggedIn, function(req, res, next) {

  if( req.admin ) {
  res.render('admin/add_form');
} else {
  res.redirect('/adminlogin');
}
});

router.post('/insert', admin_auth.isLoggedIn, function(req, res, next) {

  if( req.admin ) {
    const { name, post, force, info, bank } = req.body;

    db.query('INSERT INTO martyrs SET ?', { name:name, post:post, force_name:force, info:info, bank:bank }, (error, results) => {
      if (error) {
        console.log(error);
      } else {
        console.log(results);
        var sql='SELECT * FROM martyrs';
  db.query(sql, function (err, data, fields) {
  if (err) throw err;
  res.render('admin/admindashboard', { title: 'Admin Dashboard',message: 'Martyr Registered', martyrData: data});
          
        });
      }
    })
} else {
  res.redirect('/adminlogin');
}
});


//edit

router.get('/edit/:id',admin_auth.isLoggedIn, function(req, res, next) {
  if( req.admin ) {
  var martyrId= req.params.id;
  var sql=`SELECT * FROM martyrs WHERE id=${martyrId}`;
  db.query(sql, function (err, data) {
    if (err) throw err;
   
    res.render('admin/edit_form', { editData: data[0]});
  });
} else {
  res.redirect('/adminlogin');
}
});

router.post('/edit/:id', function(req, res, next) {
var id= req.params.id;
var updateData=req.body;
var sql = `UPDATE martyrs SET ? WHERE id= ?`;
db.query(sql, [updateData, id], function (err, data) {
if (err) throw err;
console.log(data.affectedRows + " record(s) updated");
});
var sql='SELECT * FROM martyrs';
db.query(sql, function (err, data, fields) {
if (err) throw err;
res.render('admin/admindashboard', { title: 'Admin Dashboard',message: 'Edit Successful', martyrData: data});
        
      });

});

//deletion

router.get('/delete/:id',admin_auth.isLoggedIn, function(req, res, next) {
  if( req.admin ) {
  var id= req.params.id;
    var sql = 'DELETE FROM martyrs WHERE id = ?';
    db.query(sql, [id], function (err, data) {
    if (err) throw err;
    console.log(data.affectedRows + " record(s) updated");
  });
  var sql='SELECT * FROM martyrs';
db.query(sql, function (err, data, fields) {
if (err) throw err;
res.render('admin/admindashboard', { title: 'Admin Dashboard',message: 'Deletion Successful', martyrData: data});
        
      });
} else {
  res.redirect('/adminlogin');
}
});




module.exports = router;