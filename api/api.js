const router = require('express').Router();
const async = require('async');
const faker = require('faker');
const Category = require('../models/category');
const Product = require('../models/product');

router.get('/:name', function(req, res, next) {
  async.waterfall([
    function(cb) {
      Category.findOne({ name: req.params.name }, function(err, category) {
        if (err)
          return next(err);

        cb(null, category)
      });
    },
    function(category, cb) {
      for (let i = 0; i < 30; i++) {
        const product = new Product();
        product.category = category._id;
        product.name = faker.commerce.productName();
        product.price = faker.commerce.price();
        product.image = faker.image.image();

        product.save();
      }
    }
  ]);
  res.json({ message: 'Success' });
});

module.exports = router;
