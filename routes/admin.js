const router = require('express').Router();
const Category = require('../models/category');

router.get('/admin/category', function(req, res) {
  res.render('admin/add-category', {
    message: req.flash('success')
  });
});

router.post('/admin/category', function(req, res, next) {
  const category = new Category();
  category.name = req.body.name;

  Category.findOne({ name: req.body.name }, function(err, existingCategory) {
    if (err) {
      return next(err);
    } else if (existingCategory) {
      req.flash('errors', 'Already have this category name');
      return res.redirect('/admin/category');
    }

    category.save(function(err) {
      if (err)
        return next(err);

      req.flash('success', 'Successfully added a category!');
      return res.redirect('/admin/category')
    });
  });
});

module.exports = router;
