const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { protect } = require('./utils/auth');
const router = require('./router');
const { getToken } = require('./handlers/spotify')

const app = express();
// adding Helmet to enhance API's security
app.use(helmet());
// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());
// enabling CORS for all requests
app.use(cors());
// adding morgan to log HTTP requests
app.use(morgan('combined'));

// Have Node serve the files for our built React app
// https://www.freecodecamp.org/news/how-to-create-a-react-app-with-a-node-backend-the-complete-guide/
app.use(express.static(path.resolve(__dirname, '../public')));

// Authorize all /api except for spotify/ requests. 
// Why? Because we want to cache this, and we can't have auth headers when caching: https://vercel.com/docs/concepts/functions/serverless-functions/edge-caching#:~:text=header.-,Request%20must%20not%20contain%20the,header.,-Request%20must%20not
app.use("/api/spotify/getToken", getToken);
app.use("/api", protect(), router);

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../public', 'index.html'));
});

app.set('port', (process.env.PORT || 8081));

module.exports = app;
