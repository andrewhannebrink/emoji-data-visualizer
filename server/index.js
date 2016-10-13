(() => {

    const express = require('express'),
            app = express(),
            path = require('path'),
            MongoClient = require('mongodb').MongoClient,
            assert = require('assert');

    const pub = path.join(__dirname, '../app'),
            mongoUrl = 'mongodb://localhost:27017/emojis';
    
    app.use(express.static(pub));


    app.get('/m', (req, res) => {
        res.sendFile(path.join(pub, 'index.html'));
    });

    app.post('/api/graph', (req, res) => {
        MongoClient.connect(mongoUrl, (err, db) => {
            if (err) {
                res.send(JSON.stringify({'error': err}));
            }
            const graph = {
                nodes: [],
                links: []
            }
            db.collection('nodes', (err, nodesCollection) => {
                db.collection('links', (err, linksCollection) => {
                    nodesCollection.find({}, (err, nodesCursor) => {
                        linksCollection.find({}, (err, linksCursor) => {
                            assert.equal(err, null);
                            nodesCursor.each((err, node) => {
                                console.log(node);
                                assert.equal(err, null);
                                if (node !== null) {
                                    //res.send(JSON.stringify(graph));
                                    graph.nodes.push(node);
                                } else {
                                    linksCursor.each((err, link) => {
                                        assert.equal(err, null);
                                        if (link !== null) {
                                            graph.links.push(link);
                                        } else {
                                            // Send the completed graph object in json format
                                            res.send(JSON.stringify(graph));
                                        }
                                    });
                                }
                            });
                        });
                    });
                });
            });
        });
    });

    app.listen(8080, () => {
        console.log('Listening on port 8080 ...');
    });

})();