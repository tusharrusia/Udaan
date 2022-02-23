const express = require('express');



const router = express.Router();

router.get('/', (req, res) => {
  res.render('pages/home');
});

router.get('/about', (req, res) => {
  res.render('pages/about');
});

router.get('/donorlogin', (req, res) => {
  res.render('donor/donorlogin');
});

router.get('/donorregister', (req, res) => {
  res.render('donor/donorregister');
});


router.get('/adminlogin', (req, res) => {
  res.render('admin/adminlogin');
});



module.exports = router;