const express = require('express');
const router = express.Router();
const passport = require('passport');
require('dotenv').config();


// Login Route
router.get(
    '/google',
    passport.authenticate('google', {
      scope: ['profile', 'email'],
    })
  );


// Google callback route
router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/user/login' }),
    (req, res) => {
      // Successful authentication, redirect to the home page or any other desired route
      res.redirect('/listings');
    }
  );  

module.exports = router;