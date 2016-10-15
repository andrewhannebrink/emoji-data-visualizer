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

    app.post('/api/graph/:links', (req, res) => {
        MongoClient.connect(mongoUrl, (err, db) => {
            if (err) {
                res.send(JSON.stringify({'error': err}));
            }
            const graph = {
                nodes: [],
                links: []
            };
            const max = parseInt(req.params.links);

            db.collection('nodes', (err, nodesCollection) => {
                db.collection('links', (err, linksCollection) => {
                    nodesCollection.find({}, (err, nodesCursor) => {
                        linksCollection.find({}, (err, linksCursor) => {
                            assert.equal(err, null);
                            nodesCursor.each((err, node) => {
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
                                            graph.links = graph.links.sort((a, b) => {
                                                return a.occurrences > b.occurrences;
                                            });
                                            graph.links = graph.links.slice(
                                                    graph.links.length - max, 
                                                    graph.links.length);
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
