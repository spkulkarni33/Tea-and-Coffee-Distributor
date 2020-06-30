var express = require('express');
var router = express.Router();
var monk = require('monk');
var User = require('../schema/user');
var Response = require('../common/response');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(__dirname + '/coffee/index.html');
});

router.get('/loginpage', function(req, res, next) {
  res.sendFile(__dirname + '/coffee/login.html');
});

/* SIGNUP USER. */
router.post('/signup', function(req, res) {
 var data = new User(req.body);
 console.log(data);
 data.save(function(err){
  if(err){
    console.log(err);
      Response.errorResponse(err.message,res);
  }else{
    console.log("Added");
    //Response.successResponse('User registered successfully!',res,{});
    res.redirect('localhost:3000/login.html');
  } 
 })
});

var db = monk('localhost:27017/BrewedAromas');
/* LOGIN USER. */
router.post('/login', function(req, res) {
 var email = req.body.email;
 var password = req.body.password;
 var collection = db.get('users');
 collection.findOne({email: email, password: password}, function(err,user){
   if(err){
     console.log(err);
      Response.errorResponse(err.message,res);
   }
   if(!user){
     Response.notFoundResponse('Invalid Email Id or Password!',res);
   }
   else
   {
     //req.session.user = user;
     Response.successResponse('User logged in successfully!',res,user);

   }
   
 })
});

/* GET DASHBOARD */
router.get('/dashboard', function(req, res) {
  if(!req.session.user){
    Response.unauthorizedRequest('You are not logged in',res);
  }else{
    Response.successResponse('Welcome to dashboard!',res,req.session.user);
  }
  
});


/* GET LOGOUT */
router.get('/logout', function(req, res) {
  req.session.destroy(function(err){  
        if(err){  
            console.log(err); 
            Response.errorResponse(err.message,res); 
        }  
        else  
        {  
            Response.successResponse('User logged out successfully!',res,{}); 
        }  
    });
});

module.exports = router;