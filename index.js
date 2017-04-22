var express = require('express');
var app = express();

var fs = require('fs');
var accessToken = '';

fs.readFile('token.access', 'utf8', (err, data) => {
    if (err)
        console.log('could not read access token');

    accessToken = data;
});

// serve files in public/
app.use(express.static('public'));

app.listen(8080, () => {
    console.log('listening on port 8080...');
});
