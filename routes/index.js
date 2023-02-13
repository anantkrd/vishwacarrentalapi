var express = require('express');
var router = express.Router();
/* GET home page. */
router.get('/', async function (req, res, next) {
  console.log("Testing");
  
  res.redirect('https://vishwacarrental.com');
  //res.render('index', { title: 'Express' });
});


module.exports = router;
