const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
const expressValidator = require("express-validator");
const path = require('path');
const dotenv = require("dotenv");
const fs = require('fs');
var models = require('./models');


// Set up the express app
const app = express();
dotenv.config()

//bring in routes
const featureRoutes = require("./routes/feature");
const authRoutes = require("./routes/auth");
app.get(['/','/api'], (req, res)=>{
  fs.readFile('docs/apiDocs.json', (err, data)=>{
    if(err){
      return res.status(400).json({
        error: err
      })
    }
    const docs = JSON.parse(data);
    return res.json(docs);
  })
});


//Middleware
// Log requests to the console
app.use(morgan('dev'));

// Parse incoming requests data
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressValidator());

app.use("/", featureRoutes);
app.use("/", authRoutes);

if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'client/build')));
  // Handle React routing, return all requests to React app
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

const port = process.env.PORT || 8000;
app.listen(port, ()=>{
  console.log(`The Mapalize API is listening on port ${port}`)
});

module.exports = app;
