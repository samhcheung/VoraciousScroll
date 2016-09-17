var app = require('./server.js');
var port = process.env.NODE_ENV === 'production' ? 80 : 3000;

app.listen(port, function() {
  console.log('SmartNews server listening on port 3000.');
});