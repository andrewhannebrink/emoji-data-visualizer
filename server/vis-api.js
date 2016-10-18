    const MongoClient = require('mongodb').MongoClient,
            assert = require('assert');

    module.exports.initiateApi = (app, pub, mongoUrl) => {
        //CORS middleware
        const allowCrossDomain = (req, res, next) => {
            res.header('Access-Control-Allow-Origin', 'http://www.tinyicon.co');
            res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
            res.header('Access-Control-Allow-Headers', 'Content-Type');
            next();
        };

        app.use(allowCrossDomain);

        console.log('Initializing visualization api ... ');
        app.post('/vis/graph/:links', (req, res) => {
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
    };
