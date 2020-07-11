var mongoose = require("mongoose");
 
var BillingSchema = new mongoose.Schema({
   name: String,
   roomno: Number,	
   Amount: Number,
	COD:Number,
	IT:Number,
   phone: Number,
   
});
 
module.exports = mongoose.model("bill", BillingSchema);
