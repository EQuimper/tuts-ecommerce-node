const router = require('express').Router();
const Product = require('../models/product');

Product.createMapping(function(err, mapping) {
  if (err) {
    console.log("error creating maping");
    console.log(err);
  }
  console.log("Mapping created");
  console.log(mapping);
});

const stream = Product.synchronize();
let count = 0;

stream.on('data', function() {
  count++;
});

router.post('/search', function(req, res) {
  res.redirect(`/search?q=${req.body.q}`)
});

router.get('/search', function(req, res, next) {
  if (req.query.q) {
    Product.search({
      query_string: { query: req.query.q}
    }, function(err, results) {
      results:
      if (err) return next(err);
      var data = results.hits.hits.map(function(hit) {
        return hit;
      });
      res.render('main/search-result', {
        query: req.query.q,
        data: data
      });
    });
  }
});

stream.on('close', function() {
  console.log(`Indexed ${count} documents`);
});

stream.on('error', function(err) {
  console.log(err);
});

router.get('/', (req, res) => {
  if (req.user) {
    const perPage = 9;
    const page = req.params.page;

    Product
      .find()
      .skip(perPage * page)
      .limit(perPage)
      .exec(function(err, products) {
        if (err)
          return next(err);

          Product.count().exec(function(err, count) {
            if (err)
              return next(err);

            res.render('main/product-main', {
              products,
              pages: count / perPage
            });
          });
      });
  }
  res.render('main/home');
});

router.get('/about', (req, res) => {
  res.render('main/about');
});

router.get('/products/:id', function(req, res, next) {
  Product
    .find({ category: req.params.id })
    .populate('category')
    .exec(function(err, products) {
      if (err)
        return next(err);

      res.render('main/category', {
        products
      });
    });
});

router.get('/product/:id', function(req, res, next) {
  Product.findOne({ _id: req.params.id }, function(err, product) {
    if (err)
      return next(err);

    res.render('main/product', {
      product
    });
  });
});

router.get('/*', function(req, res) {
  res.render('main/page404');
});

module.exports = router;
