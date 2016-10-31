const router = require('express').Router();
const User = require('../models/user');

router.get('/signup', function(req, res, next) {
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
