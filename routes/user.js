const router = require('express').Router();
const User = require('../models/user');
const passport = require('passport');
const passportConf = require('../config/passport');

router.get('/login', function(req, res) {
  if (req.user)
    return res.redirect('/');

  res.render('account/login', {
    message: req.flash('loginMessage')
  });
});

router.post('/login', passport.authenticate('local-login', {
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true
}));

router.get('/profile', function(req, res, next) {
  User.findOne({ _id: req.user._id }, function(err, user) {
    if (err)
      return next(err);

    res.render('account/profile', {
      user
    });
  })
});

router.get('/signup', function(req, res) {
  res.render('account/signup', {
    errors: req.flash('errors')
  });
});

router.post('/signup', function(req, res, next) {
  const user = new User();

  user.profile.name = req.body.name;
  user.email = req.body.email;
  user.password = req.body.password;

  User.findOne({ email: req.body.email }, function(err, existingUser) {
    if (existingUser) {
      req.flash('errors', 'Account with that email address already exists!');
      return res.redirect('/signup')
    }

    user.save(function(err, user) {
      if (err)
        return next(err)
      // req.flash('success', 'Account successfully created!');
      return res.redirect('/');
    });
  });
});

module.exports = router;
