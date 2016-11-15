const router = require('express').Router();
const Product = require('../models/product');
const Cart = require('../models/cart');

function paginate(req, res, next) {
  const perPage = 9;
  const page = req.params.page;

  Product
    .find()
    .skip(perPage * page)
    .limit(perPage)
    .populate('category')
    .exec(function(err, products) {
      if (err) {
        return next(err);
      }
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

/*
* Get Cart
*/
router.get('/cart', (req, res, next) => {
  Cart
    .findOne({ owner: req.user._id })
    .populate('items.item')
    .exec((err, foundCart) => {
      if (err) return next(err);
      res.render('main/cart', {
        foundCart
      });
    });
});

/*
* Post item in the cart
*/
router.post('/product/:product_id', function(req, res, next) {
  Cart.findOne({ owner: req.user._id }, function(err, cart) {
    if (err) return next(err);
    cart.items.push({
      item: req.body.product_id,
      price: parseFloat(req.body.priceValue),
      quantity: parseInt(req.body.quantity)
    });
    cart.total = (cart.total + parseFloat(req.body.priceValue)).toFixed(2);
    cart.save(function(err) {
      if (err) return next(err);
      return res.redirect('/cart');
    });
  });
});

stream.on('close', function() {
  console.log(`Indexed ${count} documents`);
});

stream.on('error', function(err) {
  console.log(err);
});

router.get('/', (req, res, next) => {
  if (req.user) {
    paginate(req, res, next);
  } else {
    res.render('main/home');
  }
});

router.get('/page/:page', (req, res, next) => {
  paginate(req, res, next);
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
