 require('dotenv').config

var express= require("express")
var mongoose= require("mongoose")
var passport= require("passport")
var bodyParser= require("body-parser")
var User= require("./models/user")
var food =require("./models/food"); 
var bill =require("./models/billing"); 
var Comment =require("./models/comment");
var flash= require("connect-flash");
var seedDB = require("./seeds");


var methodOverride = require("method-override");
var LocalStrategy= require("passport-local")
var passportLocalMongoose= require("passport-local-mongoose")
var app= express();
app.use(express.json());
app.use(flash());
app.use(bodyParser.urlencoded({extended:true}));
mongoose.connect('mongodb://localhost:27017/hostel_canteen', {useNewUrlParser: true, useUnifiedTopology: true});
app.set("view engine","ejs");
//seedDB();
app.use(require("express-session")(
	{
		secret:"i am not a lier",
		resave:false,
		saveUninitialized:false
	}
		
));
app.use(methodOverride("_method"));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function(req, res, next){
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});



//Setting Stripe Api

// Set your secret key. Remember to switch to your live secret key in production!
// See your keys here: https://dashboard.stripe.com/account/apikeys
//const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Stripe = require('stripe');
const stripe = Stripe('sk_test_51H31kJAjdqoO2kJMJqjqxPP45dznjuomBYhvNpHF8e8LTnNYaz843sCCqdeyN9g9WVfEGZSKOgHswe1mKtl3i7LF00EJXTykIv');
app.get("/", function(req, res){
   res.render("landing")
});

app.get("/food",function(req,res){
	 if (req.query.paid) res.locals.success = 'Registration Payment succeeded, welcome Again!';
	food.find({},function(err,allFoods){
		if(err)
			{
				console.log(err);
				
			}
		else
			{
				res.render("foods/index",{food:allFoods,currentUser:req.user});
			}
	});
});
	app.post("/food",function(req,res){
	var name=req.body.name;
	var price=req.body.price;
	var image=req.body.image;
	var desc=req.body.description;	
	var author={
		id: req.user._id,
		username: req.user.username
	};
	var newFood={name:name,price:price,image:image,description:desc ,author:author};
food.create(newFood,function(err,newlyCreated)
					 {
		if(err)
			{
				console.log(err);
			}
		else
			{
				res.redirect("/food");
			}
	});
	});
app.get("/food/new",isLoggedIn,function(req,res){
	res.render("foods/new");
});
app.get("/food/billing",isLoggedIn,isPaid,function(req,res){
	
			
				res.render("billing");
			
});
app.post("/food/billing",isLoggedIn,isPaid,function(req,res){
	
			
	var name=req.body.name;
	var roomno=req.body.roomno;
	var Amount=req.body.Amount;
    var COD=req.body.COD;
	var IT=req.body.IT;
	var phone=req.body.phone;	
	var newOrder={name:name,roomno:roomno,Amount:Amount,IT:IT,COD:COD,phone:phone};
bill.create(newOrder,function(err,newlyCreated)
					 {
		if(err)
			{
				console.log(err);
			}
		else
			{
			    console.log(newOrder);
				res.render("final");
			}
	});
	});
			


app.get("/food/:id",function(req,res){
	food.findById(req.params.id).populate("comments").exec(function(err,foundfood){
		if(err)
			{
				console.log(err);
				
			}
		else
			{
				res.render("foods/show",{food:foundfood});
			}

	})
	
});


app.get("/food/:id/edit",CheckOwnership,function(req,res){

   food.findById(req.params.id, function(err, foundfood){
       if(err){
           res.redirect("/food");
       } else {
           res.render("foods/edit", {food: foundfood});
       }
    });
	
});

app.put("/food/:id",CheckOwnership, function(req, res){
   food.findByIdAndUpdate(req.params.id, req.body.food, function(err, updatedfood){
      if(err){
          res.redirect("/food");
      }  else {
          res.redirect("/food/" +req.params.id);
      }
   });
});

app.delete("/food/:id",CheckOwnership,function(req, res){
  
   food.findByIdAndRemove(req.params.id, function(err){
       if(err){
           res.redirect("/food");
       } else {
           res.redirect("/food");
       }
   })
 
});

app.get("/food/:id/comments/new",isLoggedIn,function(req,res){
	food.findById(req.params.id,function(err,food)
						{
		if(err)
			{
				console.log(err);
			}
		else
	{  
		res.render("comments/new",{food:food});
	}	
});
});
app.post("/food/:id/comments",isLoggedIn,function(req,res){
	food.findById(req.params.id,function(err,food)
			{
		if(err)
			{
				console.log(err);
				res.redirect("/food");
			}
		else
			{
				Comment.create(req.body.comment,function(err,comment)
							   {
					if(err)	
						{  
							console.log(err);
						}
					else{
						comment.author.id= req.user._id;
						comment.author.username = req.user.username;
						
						comment.save();
						
						food.comments.push(comment);
						food.save();
			
						res.redirect("/food/" + food._id);
					}
							   
							   
			});
	}			
						
						
						
});
});
app.get("/register",function(req,res){
	res.render("register");
});

app.post("/register",function(req,res){
    req.body.username
	req.body.password
	User.register(new User({username: req.body.username}),req.body.password,function(err,user){
	if(err)
	{
				req.flash("error",err.message)
				return res.redirect("register");
		}
	passport.authenticate("local")(req,res,function(){
		 req.flash("success" , "welcome to Nadeem Tarin Hall Canteen " + user.username);
			res.redirect("/");
		});
	});
});
app.get("/login",function(req,res){
	res.render("login");
})
app.post("/login",passport.authenticate("local",{
		successRedirect:"/food",
		failureRedirect:"/login"
}),function(req,res){});
app.get("/logout",function(req,res)
	   {
	req.logout();
	req.flash("success","You logged out successfully")
	res.redirect("/");
});
function isLoggedIn(req,res,next){
	if(req.isAuthenticated())
		{
			return next();
		}
	
		if(req['headers']['content-type'] === 'application/json') {
        return res.send({ error: 'Login required' });}
		
		req.flash("error","please login first")
		res.redirect("/login");
	
}
function CheckOwnership(req,res,next){
if(req.isAuthenticated())
	{ food.findById(req.params.id, function(err, foundfood){
       if(err){
		   req.flash("error" , "Food not found");
           res.redirect("back");
	   }else{
		      if(foundfood.author.id.equals(req.user._id))
				  {
					  next();
				  }
		   else{
			   req.flash("error" , "Permission Denied");
			   res.redirect("back");
		   }
	   }
	});}
	 else{
		 res.redirect("back");
	 }}

function CheckCommentOwner(req,res,next){
if(req.isAuthenticated())
	{ Comment.findById(req.params.comment_id, function(err, foundComment){
       if(err){
           res.redirect("back");
	   }else{
		      if(foundComment.author.id.equals(req.user._id))
				  {
					  next();
				  }
		   else{
			   req.flash("error" , "You don't have permission to do that");
			   res.redirect("back");
		   }
	   }
	});}
	 else{
		 req.flash("error" , "You need to be logged in first to do that");
		 res.redirect("back");
	 }}



function isPaid(req, res, next){
    if (req.user.isPaid) return next();
    req.flash("error", "Please pay one time registration fee before continuing");
    res.redirect("/checkout");
}

app.get('/checkout', isLoggedIn, (req, res) => {
    if (req.user.isPaid) {
        req.flash('success', 'Your account is already paid You may now place order');
        return res.redirect('food/billing');
    }
    res.render('checkout', { amount: 20 });
});

// POST pay
app.post('/pay', isLoggedIn, async (req, res) => {
    const { paymentMethodId, items, currency } = req.body;

    const amount = 2000;
  
    try {
      // Create new PaymentIntent with a PaymentMethod ID from the client.
      const intent = await stripe.paymentIntents.create({
        amount,
        currency,
        payment_method: paymentMethodId,
        error_on_requires_action: true,
        confirm: true
      });
  
      console.log("💰 Payment received!");

      req.user.isPaid = true;
      await req.user.save();
      // The payment is complete and the money has been moved
      // You can add any post-payment code here (e.g. shipping, fulfillment, etc)
  
      // Send the client secret to the client to use in the demo
      res.send({ clientSecret: intent.client_secret });
    } catch (e) {
      // Handle "hard declines" e.g. insufficient funds, expired card, card authentication etc
      // See https://stripe.com/docs/declines/codes for more
      if (e.code === "authentication_required") {
        res.send({
          error:
            "This card requires authentication in order to proceeded. Please use a different card."
        });
      } else {
        res.send({ error: e.message });
      }
    }
});

app.listen( 3000, function(){
  console.log("welcome to Nadeem tarin hall canteen");
});