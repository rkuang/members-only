var express = require('express');
var router = express.Router();

const { body, validationResult } = require('express-validator');
const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('../models/user');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/signup', (req, res, next)  => {
  res.render('signup-form', { title: 'Sign Up', errors: undefined });
});

router.post('/signup', [
  body('firstName', 'First Name cannt be empty.').trim().notEmpty().escape(),
  body('lastName', 'Last Name cannt be empty.').trim().notEmpty().escape(),
  body('username').trim().notEmpty().withMessage('Username cannot be empty.')
    .isEmail().withMessage('Username must be in an email format.').escape(),
  body('password').notEmpty().withMessage('Password cannot be empty.')
    .not().matches('/\s/').withMessage('Password cannot contain spaces.')
    .custom((value, { req }) => {
      if (value !== req.body.confirmPassword) {
        throw new Error("Passwords do not match.");
      } else {
        return true;
      }
    }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('signup-form', {
        title: 'Sign Up',
        username: req.body.username,
        errors: errors.array()
      })
    } else {
      bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) return next(err);
        new User({
          username: req.body.username,
          password: hash,
          f_name: req.body.firstName,
          l_name: req.body.lastName,
        }).save((err) => {
          if (err) { return next(err); }
          res.redirect('/');
        });
      });
    }
  }
]);

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/',
}));

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;
