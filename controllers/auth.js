const jwt = require('jsonwebtoken');
require('dotenv').config();
const expressJwt = require('express-jwt');
const {User}  = require('../models');
const _ = require('lodash')

exports.signup = async (req, res) => {
  const userExists = await User.findOne({where:{email:req.body.email}});
  console.log(userExists);
  if(userExists) return res.status(403).json({
    error: "Email is taken!"
  });
  const user = await User.build(req.body);
  await user.save();
  res.status(200).json({message:"Signup success. Please login."});
};

exports.signin = (req, res) => {
  console.log(req.body);
  //find the user based on Email
  const{email, password} = req.body;
  User.findOne({where: {email: email}}).then((user, err) => {
    console.log(user, err);
    //if err or no user
    if(err || _.isEmpty(user)){
      return res.status(401).json({
        error: "User with that email does not exist.  Please signin."
      });
    }
    //if user is found, make sure that the email and password match
    // create authentication method in model and use here
    if(!user.authenticate(password)){
      return res.status(401).json({
        error: "Email and password do not match"
      });
    }
    //generate a token with user id and secret
    const token = jwt.sign({id: user.id}, process.env.JWT_SECRET);

    //persist the token as 't' in cookie with expiry date
    res.cookie("t", token, {expire: new Date() + 9999});

    // return response with user and token to frontend client
    const {id, name, email, role} = user;
    return res.json({token, user:{id, email, name, role}});
  });
}
exports.signout = (req, res) => {
  res.clearCookie("t");
  return res.json({message: "Signout success!"})
}

exports.requireSignin = expressJwt({
  //if the toke is valid, express jwt appends the verified users id in an auth key ot the request object
  secret: process.env.JWT_SECRET,
  userProperty: "auth"
})
