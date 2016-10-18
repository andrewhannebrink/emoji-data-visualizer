(() => {

    const express = require('express'),
            app = express(),
            path = require('path'),
            assert = require('assert'),
            visApi = require('./vis-api.js');

    const pub = path.join(__dirname, '../app'),
            mongoUrl = 'mongodb://localhost:27017/emojis';


    visApi.initiateApi(app, pub, mongoUrl);
    
    app.use('/m/info', express.static(pub));


    app.get('/m/info', (req, res) => {
        res.sendFile(path.join(pub, 'index.html'));
    });

    app.listen(8080, () => {
        console.log('Listening on port 8080 ...');
    });

})();
