var express = require('express');
var router = express.Router();

const { body, validationResult } = require('express-validator');
const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const Message = require('../models/message');
const resources = require('../resources');

/* GET home page. */
router.get('/', function(req, res, next) {
  Message.find().populate('user').exec((err, messages) => {
    if (err) return next(err);
    res.render('index', {
      title: 'Members Only',
      messages: messages
    })
  });
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

router.get('/join-the-club', (req, res, next) => {
  if (!req.user) {
    res.redirect('/');
  }
  res.render('join-the-club', {
    title: 'Join the club'
  });
})

router.post('/join-the-club', (req, res, next) => {
  if (!req.user) {
    res.redirect('/');
  }
  bcrypt.compare(req.body.secretCode, resources.CLUB_PASSWORD_HASH, (err, same) => {
    if (err) return next(err);
    if (same) {
      const update = new User({
        membership_status: true,
        _id: req.user._id,
      });
      User.findByIdAndUpdate(req.user._id, update, (err, user) => {
        if (err) return next(err);
        res.redirect('/')
      })
    } else {
      res.render('join-the-club', {
        title: 'Join the club',
        failed: true
      });
    }
  })
})

router.post('/messages', [
  (req, res, next) => {
    if (!req.user) {
      res.redirect('/');
    }
    next();
  },
  body('title', 'Title cannot be empty.').trim().notEmpty().escape(),
  body('text', 'Text cannot be empty').trim().notEmpty().escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    const message = new Message({
      title: req.body.title,
      text: req.body.text,
      user: req.user._id
    })
    if (!errors.isEmpty()) {
      Message.find().populate('user').exec((err, messages) => {
        if (err) return next(err);
        res.render('index', {
          title: 'Members Only',
          messages: messages,
          message_form_errors: errors.array()
        })
      });
    } else {
      message.save((err, message) => {
        res.redirect('/');
      })
    }
  }
])

router.post('/messages/:id/delete', (req, res, next) => {
  if (req.user && req.user.admin) {
    Message.findByIdAndDelete(req.params.id, (err) => {
      if (err) return next(err);
      res.redirect('/');
    })
  } else {
    const error = new Error('Only admins can delete messages');
    error.status = 403;
    next(error);
  }
})

module.exports = router;
