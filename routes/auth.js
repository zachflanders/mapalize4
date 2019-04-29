const express = require("express");
const {signup, signin, signout} = require("../controllers/auth");
const {userById} = require("../controllers/user");
const router = express.Router();
const {userSignupValidator} = require('../validator');



router.post('/api/signup', userSignupValidator, signup);
router.post('/api/signin',  signin);
router.get('/api/signout',  signout);
//any route containing userId, our app will first execute userById()
router.param("userId", userById)


module.exports = router;
