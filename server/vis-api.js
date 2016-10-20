    const MongoClient = require('mongodb').MongoClient,
            assert = require('assert');

    // Connects to mongo and calls a function after getting the nodes (emojis) 
    const connectMongoGetNodes = (req, res, mongoUrl, callback) => {
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
                        callback({
                            req,
                            res,
                            err,
                            graph,
                            linksCollection,
                            nodesCursor,
                            max
                        });
                    });
                });
            });
        });
    };


    // Adds the vis api to other apis
    module.exports.initiateApi = (app, pub, mongoUrl) => {
        //CORS middleware
        const allowCrossDomain = (req, res, next) => {
            res.header('Access-Control-Allow-Origin', 'http://www.tinyicon.co');
            //res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
            res.header('Access-Control-Allow-Headers', 'Content-Type');
            next();
        };

        app.use(allowCrossDomain);

        console.log('Initializing visualization api ... ');
        app.post('/vis/graph/:links', (req, res) => {
            connectMongoGetNodes(req, res, mongoUrl, (p) => { 
                const options = {
                    'limit': p.max,
                    'sort': {'occurrences': -1}
                }
                p.linksCollection.find({}, options, (err, linksCursor) => {
                    assert.equal(err, null);
                    p.nodesCursor.each((err, node) => {
                        assert.equal(err, null);
                        if (node !== null) {
                            //res.send(JSON.stringify(graph));
                            p.graph.nodes.push(node);
                        } else {
                            linksCursor.each((err, link) => {
                                assert.equal(err, null);
                                if (link !== null) {
                                    p.graph.links.push(link);
                                } else {
                                    // Send the completed graph object in json format
                                    p.graph.links = p.graph.links.reverse();
                                    p.res.send(JSON.stringify(p.graph));
                                }   
                            }); 
                        }   
                    }); 
                }); 
            }); 
        }); 

        app.post('/vis/graph/:links/:maxPer', (req, res) => {
            connectMongoGetNodes(req, res, mongoUrl, (p) => {
                const options = {
                    'sort': {'occurrences': -1}
                };
                p.linksCollection.find({}, options, (err, linksCursor) => {
                    assert.equal(err, null);
                    p.nodesCursor.each((err, node) => {
                        assert.equal(err, null);
                        if (node !== null) {
                            node.branches = 0;
                            p.graph.nodes.push(node);
                        } else {
                            linksCursor.each((err, link) => {
                                assert.equal(err, null);
                                if (link !== null) {
                                    let sourceIdx, targetIdx;
                                    for (let i = 0; i < p.graph.nodes.length; i += 1) {
                                        if (p.graph.nodes[i].code === link.source) {
                                            sourceIdx = i;
                                            break;
                                        } else if (p.graph.nodes[i].code === link.target) {
                                            targetIdx = i;
                                            break;
                                        }
                                    }
                                    for (let j = p.graph.nodes.length -1; 
                                            j >= 0; 
                                            j -= 1) {
                                        if (p.graph.nodes[j].code === link.source) {
                                            sourceIdx = j;
                                            break;
                                        } else if (p.graph.nodes[j].code === link.target) {
                                            targetIdx = j;
                                            break;
                                        }
                                    }
                                    if (p.graph.nodes[sourceIdx].branches < p.req.params.maxPer &&
                                            p.graph.nodes[targetIdx].branches < p.req.params.maxPer &&
                                            p.graph.links.length < p.max) {
                                        p.graph.links.push(link);
                                        p.graph.nodes[sourceIdx].branches += 1;
                                        p.graph.nodes[targetIdx].branches += 1;
                                    }
                                } else {
                                    // Send the completed graph object in json format
                                    p.graph.links = p.graph.links.sort((a, b) => a.occurrences - b.occurrences);
                                    p.res.send(JSON.stringify(p.graph));
                                }
                            });
                        }
                    });
                });
            });
        });
    };
