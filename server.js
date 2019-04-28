const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require("dotenv");
const fs = require('fs');
var models = require('./models');

// Set up the express app
const app = express();
dotenv.config()

//bring in routes
const featureRoutes = require("./routes/feature");

//Middleware
// Log requests to the console
app.use(morgan('dev'));

// Parse incoming requests data
app.use(bodyParser.json());

app.use("/", featureRoutes);

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
