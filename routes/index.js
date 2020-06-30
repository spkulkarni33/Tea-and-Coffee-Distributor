var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
var monk = require('monk');
var User = require('../schema/user');
var Coffee = require('../schema/coffee');
var Tea = require('../schema/tea');
var Response = require('../common/response');
var db = monk('localhost:27017/BrewedAromas');
var bodyParser = require('body-parser');
var ObjectID = require('mongodb').ObjectID;
const bcrypt = require('bcrypt');
/* ------------------------------------- /  ------------------------------------- */
router.get('/', function(req, res, next) {
  res.sendFile(__dirname + '/coffee/index.html');
});

/* ------------------------------------- HOME PAGE ------------------------------------- */
router.get('/home', function(req, res, next){
  var user = {};
  if(req.session.user)
  {
    user["firstname"] = req.session.firstname;
    user["cart_no"] = req.session.cart_no;
    res.render("homepage", {user:user});
  }
  else
  {
    user["cart_no"] = 0;
    res.render("homepage", {user:user});
  }
});

/* ------------------------------------- LOGIN PAGE ------------------------------------- */
router.get('/loginpage', function(req, res, next) {
  res.sendFile(__dirname + '/coffee/login.html');
});

/* ------------------------------------- SIGNUP ------------------------------------------ */
router.post('/signup', function(req, res) {
 bcrypt.hash(req.body.password, 10, (err, hash) => {
    var data = new User(req.body);
    data.password = hash;
    // Now we can store the password hash in db.
    data.save(function(err){
      if(err){
        console.log(err);
          Response.errorResponse(err.message,res);
      }else{
    
        //Response.successResponse('User registered successfully!',res,{});
        res.redirect('/loginpage');
      } 
    });
  });
 
});

/* ------------------------------------- TEA PAGE ----------------------------------------- */
router.get('/tea', function(req, res, next) {
  var collection = db.get('teas');
    collection.find({softdelete: '0'}, function(err, teass){
      if (err) throw err;
      var user = {};
      req.session.teas = teass;
      var p;
        if(!req.query.pagenum)
        {
          p ="1";
        }
        else
        {
            p = req.query.pagenum;
        }
       
        var page = parseInt(p);
        const limit = 8;
        const startIndex = (page-1)*limit;
        const endIndex = page*limit;
        const results = {};
        results.results = teass.slice(startIndex, endIndex);
        var numofpages = Math.ceil(teass.length / limit);
      if(req.session.user)
      {
        user["firstname"] = req.session.firstname;
        user["cart_no"] = req.session.cart_no;
        res.render('tea', {teas:results.results, page_num:p, pages:numofpages ,user:user});
        // res.render('tea', { teas: teas, user: user});
      }
      else
      {
        user["cart_no"] = req.session.cart_no;
        res.render('tea', {teas:results.results, page_num:p, pages:numofpages ,user:user});
        // res.render('tea', { teas: teas, user: user});
      }
      
    });
});

/* ------------------------------------- COFFEE PAGE --------------------------------------- */
router.get('/coffee', function(req, res, next) {
  var collection = db.get('coffees');
    collection.find({softdelete: '0'}, function(err, coffeess){
      if (err) throw err;
      var user = {};
      req.session.coffees = coffeess;
      var p;
        if(!req.query.pagenum)
        {
          p ="1";
        }
        else
        {
            p = req.query.pagenum;
        }
       
        var page = parseInt(p);
        const limit = 8;
        const startIndex = (page-1)*limit;
        const endIndex = page*limit;
        const results = {};
        var numofpages = Math.ceil(coffeess.length / limit);
        results.results = coffeess.slice(startIndex, endIndex);
      if(req.session.user)
      {
        user["firstname"] = req.session.firstname;
        user["cart_no"] = req.session.cart_no;
        res.render('coffee', {coffees:results.results, page_num:p, pages: numofpages, user:user});
      }
      else
      {
        user["cart_no"] = req.session.cart_no;
        res.render('coffee', {coffees:results.results, page_num:p, pages:numofpages, user:user});
      }
      
    });
});
/* ------------------------------------- CONTACT PAGE --------------------------------------- */
router.get('/contact', function(req, res, next) {
  var user = {};
  if(req.session.user)
  {
    user["firstname"] = req.session.firstname;
    user["cart_no"] = req.session.cart_no;
    res.render('contact', {user:user});
  }
  else
  {
    user["cart_no"] = req.session.cart_no;
    res.render('contact', {user:user});
  }
});

/* ------------------------------------- DELETE ITEM --------------------------------------- */
router.get('/delete', function(req, res, next) {
  if(req.session.firstname === 'admin')
  {
    var item_id = req.query.id;
    var collection = db.get(req.query.q);
    collection.update({_id: item_id}, {'$set': {softdelete: '1'}}, function(err, result){
    //collection.delete({_id: item_id}, function(err, result){
      if(err) console.log(err);
      console.log("Item removed from collection "+req.query.q);
      var users = {};
      if(req.query.q === 'teas')
        res.redirect('/tea');
      else
      res.redirect('/coffee');
    });
  }
});
/* ------------------------------------- ORDER PLACED PAGE --------------------------------------- */
router.post('/orderplaced', function(req, res, next) {
  if(req.session.user)
  {
    var insertion = {};
    var shipping = {};
    var billing = {};
    var shipping_a = ["fname","lname","sa1", "sa2", "city", "state", "country", "zipcode", "phone", "email"];
    var billing_a = ["fname2","lname2","sa12", "sa22", "city2", "state2", "country2", "zipcode2", "phone2", "email2"];
    var storedata = req.body;
    Object.keys(storedata).forEach(function(key){
      if(shipping_a.includes(key))
      {
        shipping[key] = storedata[key];
      }
      else if(billing_a.includes(key))
      {
        billing[key] = storedata[key];
      }
    });
    insertion["shipping_address"] = shipping;
    insertion["billing_address"] = billing;
    insertion.userid = req.session.user;
    if(parseFloat(req.session.cart_price)<parseFloat(25))
    {
        insertion.total_price = parseFloat(req.session.cart_price)+parseFloat(5);
    }
    else
    {
        insertion.total_price = req.session.cart_price;
    }
    
    insertion.payment_method = req.body.radiobtn; 
    var collection = db.get('orders');
    collection.insert(insertion, function(err, success){
      if(err) console.log('Error in inserting');
      var new_collection = db.get('cart');
      new_collection.remove({userid: req.session.user}, function(err2, results){
        var data = {};
        data.order_id = success._id;
        data.firstname = req.session.firstname;
        data.cart_no = '0';
        req.session.cart_no = 0;
        res.render('ordplace', {user: data});
      });
    });
  }
  else
  {
    res.redirect('/loginpage');
  }
});
/* ------------------------------------- ADD NEW ITEM FORM ------------------------------------------- */
router.get('/addform', function(req, res, next){
  var dbname={};
  dbname.name = req.query.q;
  res.render('addnew', {db: dbname});
});

/* ------------------------------------- ADD NEW TEA ------------------------------------------- */
router.post('/additem/teas', function(req, res, next){
  if(req.session.firstname === 'admin')
  {
    var data = new Tea(req.body);
    data.save(function(err){
      if(err)
      {
        console.log(err);
          Response.errorResponse(err.message,res);
      }
      else
      {
        var user = {};
        user.firstname = req.session.firstname;
        user.cart_no = req.session.cart_no;
        //res.render('tea', {user: user});
        res.redirect('/tea');
      } 
    });
  }
  
});

/* ------------------------------------- ADD NEW COFFEE ------------------------------------------- */
router.post('/additem/coffees', function(req, res, next){
  if(req.session.firstname === 'admin')
  {
    var data = new Coffee(req.body);
    data.save(function(err){
      if(err)
      {
        console.log(err);
          Response.errorResponse(err.message,res);
      }
      else
      {
        res.redirect('/coffee');
      } 
    });
  }
  
});
/* ------------------------------------- CART PAGE ------------------------------------------- */
router.get('/cart', function(req, res, next) {
  if(req.session.user)
  {
    var collection = db.get('cart');
    collection.findOne({userid: req.session.user}, function(err, cartt){
      if(err) console.log(err);
      var user = {};
      if(cartt)
      {
        console.log('Found the user');
        user["firstname"] = req.session.firstname;
        user["cart_no"] = req.session.cart_no;
        req.session.cart_price = cartt.total_price.toString();
        res.render('cart', { cart_items: cartt, user: user});
      }
      else
      {
        user["firstname"] = req.session.firstname;
        user["cart_no"] = req.session.cart_no;
        req.session.cart_price = '0';
        res.render('cart', { cart_items: cartt, user: user});
      }
    });
  }
  else
    res.redirect('/loginpage');
});
/* ------------------------------------- EDIT CART ------------------------------------------- */
router.post('/editcart', function(req, res, next){
  if(req.session.user)
  {
    var product_id = req.query.id;
    var updated_stock;
    var dbname = ""
    var selected = {};
    var collection = db.get('teas');
    collection.findOne({_id: product_id}, function(err, results){
      if(results)
      {
        dbname = 'teas';
        selected = results;
        if(req.query.q === 'add')
        {
          updated_stock = results.stock - 1;
        }
        else if(req.query.q === 'sub')
        {
          updated_stock = results.stock + 1; 
        }
        collection.update({_id:product_id}, {$set:{stock:updated_stock}}, function(error, updated){
          if(error) console.log(error);
          console.log('Updated stock to ', updated_stock);
        });       
      }

      else
      {
        var new_collection = db.get('coffees');
        new_collection.find({_id: product_id}, function(err, results){
          if(results)
          {
            dbname = 'coffees';
            selected = results;
            if(req.query.q === 'add')
            {
              updated_stock = results.stock - 1;
            }
            else if(req.query.q === 'sub')
            {
              updated_stock = results.stock + 1; 
            }
            new_collection.update({_id:product_id}, {$set:{stock:updated_stock}}, function(error, updated){
              if(error) console.log(error);
              console.log('Updated stock to ', updated_stock);
            });
          }
        });
      } //completed updating stock
    }); 
      var collection = db.get('cart');
      var price;
      collection.findOne({userid: req.session.user}, function(err, result){
        var products = result.product;
        for(var i = 0; i < products.length; i++)
        {
          if(products[i]._id.toString() == product_id)
          {
            console.log('found product ', products[i].bname);
            if(req.query.q === 'add')
            {
              console.log('add');
              products[i].quantity = (parseInt(products[i].quantity) + 1).toString();
              price = parseFloat(result.total_price, 10) + parseFloat(products[i].price, 10);
            }
            else if(req.query.q === 'sub')
            {
              products[i].quantity = parseInt(products[i].quantity) - 1;
              price = parseFloat(result.total_price, 10) - parseFloat(products[i].price, 10);
            }
            break;
          }
        }
        req.session.cart_price = price;
        price = price.toString();
        collection.update({userid: req.session.user}, {'$set': {product: products, total_price: price}}, function(err3, update){
          console.log('Updated the product');
          res.redirect('/cart');
        });

      });
  }
  else
  {
    res.redirect('/loginpage');
  }

});

/* ------------------------------------- ADD TO CART ------------------------------------------- */
router.post('/addtocart', function(req, res, next) {
  var product_id = req.body.product_id;
  var product_stock = parseInt(req.body.stock);
  var user_id = req.session.user;
  var collection_name = req.body.dbname;
  var collection = db.get(collection_name);
  var updated_stock;
  if(req.query.q === 'add')
  {
    updated_stock = product_stock - 1;
  }
  else if(req.query.q === 'sub')
  {
    updated_stock = product_stock + 1; 
  }
  collection.update({_id:product_id}, {$set:{stock:updated_stock}}, function(error, updated){
    if(error) console.log(error);
    console.log('Updated stock to ', updated_stock);
  });
	collection.findOne({_id: product_id}, function(err, b_item){
    if (err) console.log(err);
      var request = {};
      var new_collection = db.get('cart');
      new_collection.findOne({userid: user_id}, function(err1, details){
        if(err1) console.log(err)
        if(details === null)
        {
          console.log('user is not present.');
          request.userid = user_id;
          b_item.quantity = '1';
          request.product = [b_item];
          var price = parseFloat(req.body.product_price);
          req.session.cart_price = price;
          request.total_price = price.toString();
          new_collection.insert(request, function(err2, result){
            if(err2) console.log(err2);
            else
            {
                var user = {};
                user["firstname"] = req.session.firstname;
                req.session.cart_no = request.product.length; 
                user["cart_no"] = req.session.cart_no;
                //res.render('tea', { teas : req.session.teas, user : user });
                if(collection_name === "teas")
                {
                  res.redirect('/tea');
                }
                else if(collection_name === "coffees")
                {
                  res.redirect('/coffee');
                }
                else
                {
                  res.redirect('/cart');
                }
            }            
            });
        }
        else
        {
          console.log("User has a cart present");
          var items = details.product;
          var quantity = 0;
          var detected = false;
          for(var i = 0; i<items.length; i++)
          {
            if(items[i]._id.toString() === product_id)
            {
                if(req.query.q === 'add')
                {
                  quantity = (parseInt(items[i].quantity) + 1).toString();
                  items[i].quantity = quantity;
                  detected = true;
                  break;
                }
                else if(req.query.q === 'sub')
                {
                  quantity = (parseInt(items[i].quantity) - 1).toString();
                  items[i].quantity = quantity;
                  detected = true;
                  break;
                }
            }
          }
          if(!detected)
          {
            b_item.quantity = '1';
            quantity = 1;
            items.push(b_item);
          }
          var price = parseFloat(details.total_price, 10) + parseFloat(b_item.price, 10);
          req.session.cart_price = price;
          price = price.toString();
          new_collection.update({userid: user_id}, {'$set': {product: items, total_price: price}}, function(err3, update){  
            var user = {};
            user["firstname"] = req.session.firstname;
            req.session.cart_no = items.length; 
            user["cart_no"] = req.session.cart_no;  
            if(collection_name === "teas")
            {
              res.redirect('/tea');
            }
            else if(collection_name === "coffees")
            {
                res.redirect('/coffee');
            }
            else
            {
              res.redirect('/cart');
            }
          });          
        }
      });
	});
});
/* ------------------------------------- REMOVE TEA FROM CART ----------------------------------------- */
router.post('/removeitem', function(req, res, next){

  var product_id = req.body.b_id;
  var user_id = req.session.user;
  var collection = db.get('cart');
  var quantity;
  collection.findOne({userid:user_id}, function(err, result){
    if(err) console.log(err);
    var x = 0;
    var price = 0;
    var stock;
    var updated_stock;
    var updatebeverage = {};
    //console.log(result);
    for(let prod of result.product)
    {
      if(prod._id.toString() === product_id)
      {
        stock = parseInt(prod.stock);
        price = parseFloat(prod.price) * parseFloat(prod.quantity, 10);
        quantity = parseFloat(prod.quantity, 10);
        updatebeverage = prod;
        break;
      }
      else
      {
        console.log("Product not found in cart");
      }
    }
    var updatedprice = parseFloat(result.total_price, 10) - price;
    updatedprice = updatedprice.toString();
    updated_stock = stock + quantity;
    req.session.cart_price = updatedprice;
    updatebeverage.stock = updated_stock;
    var new_collection = db.get('teas');
    new_collection.findOne({_id: updatebeverage._id}, function(err, found){
      if(found)
      {
        console.log('Found in teas');
        new_collection.update({_id: updatebeverage._id}, {'$set':{stock: updated_stock}}, function(err3, updateok){
          if(err3) console.log(err3);
        });
      }
      else
      {
        console.log('Found in coffee');
        var coffee_collection = db.get('coffees');
        coffee_collection.update({_id: updatebeverage._id}, {'$set':{stock: updated_stock}}, function(err3, updateok){
          if(err3) console.log(err3);
        });
      }
    });
    collection.update({userid: user_id}, {'$set': {total_price: updatedprice}}, function(err2, success)
    {
      if(err2) console.log(err2);
      console.log("total price updated");
    });
    
  collection.update({ userid: user_id },{ '$pull': { product: { _id: product_id } } }, function(err, result1){
      console.log('removed product');
      collection.findOne({userid: user_id}, function(err1, results){
      var user = {};
      console.log(results);
      user["firstname"] = req.session.firstname;
      req.session.cart_no -= 1; 
      user["cart_no"] = req.session.cart_no;
      res.render('cart', {cart_items: results, user: user});
    });
  });
  });
});

/* ------------------------------------- CHECKOUT ---------------------------------------------- */
router.get('/checkout', function(req, res, next) {
  if(!req.session.user)
  {
    res.redirect('/loginpage');
  }
  else
  {
    console.log(req.session);
    var user = {};
    user.total_price = req.session.cart_price;
    user.firstname = req.session.firstname;
    user.cart_no = req.session.cart_no;
    res.render('checkout', {user: user});
  }
});

/* ------------------------------------- LOGIN ----------------------------------------------- */
router.post('/login', function(req, res) {
 var email = req.body.email;
 //var password = req.body.password;
 var collection = db.get('users');

 collection.findOne({email: email}, function(err,user){
   if(err){
     console.log(err);
   }
   if(!user){
     res.render('not_logged_in');
   }
   else
   {
    bcrypt.compare(req.body.password, user.password, function(err1, hashres) {
      if(err1) console.log(err1);
      // if res == true, password matched
      if(hashres === true)
      {
        console.log('Correct password');
        req.session.user = user._id;
        req.session.firstname = user.firstname;
        var new_collection = db.get('cart');
        new_collection.findOne({userid: req.session.user.toString()}, function(err1, results){
         if(err1) throw err1;
         if(!results)
         {
           console.log('user not present in cart');
           user['cart_no'] = '0';
           req.session.cart_no = 0;
           res.render('logged_in', {user: user});
         }
         else
         {
           user["cart_no"] = results.product.length.toString();
           req.session.cart_no = results.product.length;
           res.render('logged_in', {user: user});
         }     
        });
      }
      // else wrong password
      else
      {
        res.render('not_logged_in');
      }
    });
     
   }   
 });
});

/* ------------------------------------- LOGOUT ---------------------------------------------- */
router.get('/logout', function(req, res) {
  req.session.destroy(function(err){  
        if(err){  
            console.log(err); 
            Response.errorResponse(err.message,res); 
        }  
        else  
        {  
            //Response.successResponse('User logged out successfully!',res,{}); 
            res.redirect('/');
        }  
    });
});

/* ------------------------------------- FILTER TEA ---------------------------------------------- */
router.post('/filtertea', function(req, res){


  var collection = db.get('teas');
  var teaname = req.body.searchteaname.toUpperCase();
  var type = req.body.searchteatype;
  var key = {};
  var searchstring = "";
  if(!type && !teaname)
  {
    res.redirect('/tea');
  }
  if (!type && teaname) 
  {
      key = {bname: {'$regex': teaname, '$options': 'i'}};
      searchstring = "Keyword: "+teaname;
  }
  if (type && !teaname) 
  {
      key = {type: type};
      searchstring = "Type: "+type;
  }
  if (type && teaname) 
  {
      key = {bname: {'$regex': teaname, '$options': 'i'}, type:type};
      searchstring = "type: "+type+" and Keyword: "+teaname;
  }
  console.log(key);
  collection.find(key, function(err, teas){
      if (err) throw err;
      var user = {};
      req.session.teas = teas;
      var p;
        if(!req.query.pagenum)
        {
          p ="1";
        }
        else
        {
            p = req.query.pagenum;
        }
       
        var page = parseInt(p);
        const limit = 8;
        const startIndex = (page-1)*limit;
        const endIndex = page*limit;
        const results = {};
        results.results = teas.slice(startIndex, endIndex);
        var numofpages = Math.ceil(teas.length / limit);
      if(req.session.user)
      {
        user["firstname"] = req.session.firstname;
        user["cart_no"] = req.session.cart_no;
        res.render('tea', {teas:results.results, page_num:p, pages:numofpages ,user:user});
        // res.render('tea', { teas: teas, user: user});
      }
      else
      {
        user["cart_no"] = req.session.cart_no;
        res.render('tea', {teas:results.results, page_num:p, pages:numofpages ,user:user});
        // res.render('tea', { teas: teas, user: user});
      }
  });
});


/* ------------------------------------- FILTER COFFEE ---------------------------------------------- */
router.post('/filtercoffee', function(req, res){
  var collection = db.get('coffees');
  var coffeename = req.body.searchcoffeename.toUpperCase();
  var type = req.body.searchcoffeetype;
  var key = {};
  var searchstring = "";
  if(!type && !coffeename)
  {
    res.redirect('/coffee');
  }
  if (!type && coffeename) 
  {
      key = {bname: {'$regex': coffeename, '$options': 'i'}};
      searchstring = "Keyword: "+coffeename;
  }
  if (type && !coffeename) 
  {
      key = {type: type};
      searchstring = "Type: "+type;
  }
  if (type && coffeename) 
  {
      key = {bname: {'$regex': coffeename, '$options': 'i'}, type:type};
      searchstring = "type: "+type+" and Keyword: "+coffeename;
  }
  console.log(key);
  collection.find(key, function(err, coffees){
      if (err) throw err;
      var user = {};
      req.session.coffees = coffees;
      if(req.session.user)
      {
        user["firstname"] = req.session.firstname;
        user["cart_no"] = req.session.cart_no;
        res.render('coffee', { coffees: coffees, page_num:"1", pages:"1", user: user});
      }
      else
      {
        user["cart_no"] = req.session.cart_no;
        res.render('coffee', { coffees: coffees, page_num:"1", pages:"1", user: user});
      }
  });
});



/* ------------------------------------- ORDERS ---------------------------------------------- */
router.get('/order', function(req, res, next) {
  res.sendFile(__dirname + '/coffee/cart.html');
});

/* ------------------------------------- VALIDATE EMAIL ---------------------------------------------- */
router.post('/checkemail', function(req, res) {
 var email = req.body.email;
 //var password = req.body.password;
 var collection = db.get('users');
 collection.findOne({email: email}, function(err,user){
   if(err){
     console.log(err);
      //Response.errorResponse(err.message,res);
   }
   else if(!user){
     //Response.notFoundResponse('Invalid Email Id or Password!',res);
     //res.render('not_logged_in');
     res.send('Success');
   }
   else
   {
     res.send('Fail');
   }
   
 });
});


module.exports = router;