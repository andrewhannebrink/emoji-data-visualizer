(() => {

    const express = require('express'),
            app = express(),
            path = require('path');

    app.use(express.static(path.join(__dirname, '../app')));

    app.get('/m', (req, res) => {
        console.log('hi');
        res.sendFile(path.join(__dirname, '../app/index.html'));
    });

    app.listen(8080, () => {
        console.log('Listening on port 8080 ...');
    });

})();
