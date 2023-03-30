// https://www.twilio.com/blog/working-with-environment-variables-in-node-js-html
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: '../.env' })
}

const app = require('./server');

app.listen(app.get('port'), function() {
  console.log('Express app Spotifeye is running on port', app.get('port'));
});
