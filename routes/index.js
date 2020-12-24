var express = require('express');
var router = express.Router();

const { body, validationResult } = require('express-validator');
const User = require('../models/user');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/signup', (req, res, next)  => {
  res.render('signup-form', { title: 'Sign Up', errors: undefined });
});

router.post('/signup', [
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
      new User({
        username: req.body.username,
        password: req.body.password,
        f_name: 'test',
        l_name: 'test',
      }).save((err) => {
        if (err) { return next(err); }
        res.redirect('/');
      })
    }
  }
]);

module.exports = router;
