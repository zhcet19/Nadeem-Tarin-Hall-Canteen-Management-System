var mongoose = require("mongoose");
 var passportLocalMongoose= require("passport-local-mongoose")
var userSchema = new mongoose.Schema({
	
	username:String,
	password:String,
	isPaid:{ type: Boolean, default: false }

	
});
 userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);