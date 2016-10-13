// Bot for collecting data about tweets in which multiple emojis are used
var Bot = require('./bot'),
        config1 = require('./config1'),
        fs = require('fs'),
        MongoClient = require('mongodb').MongoClient,
        assert = require('assert');

var bot = new Bot(config1),
        mongoUrl = 'mongodb://localhost:27017/emojis';

console.log('scraper running ... ');

//get date string for today's date (e.g. '2011-01-01')
function datestring () {
  var d = new Date(Date.now() - 5*60*60*1000);  //est timezone
  return d.getUTCFullYear()   + '-'
     +  (d.getUTCMonth() + 1) + '-'
     +   d.getDate();
}


var jsonInputStr = fs.readFileSync('utilities/emoji-data-parser/emoji-data.json');
var emojiData = JSON.parse(jsonInputStr);
var stream = bot.twit.stream('statuses/sample');

// Returns the next emoji in the tweet with its location or false
const containsEmoji = text => {
    for (let i = 0; i < emojiData.nodes.length; i += 1) {
        let code = emojiData.nodes[i].code,
                emoji = String.fromCodePoint('0x' + code),
                emojiLocation = text.indexOf(emoji);


        if (emojiLocation > -1) {
            //console.log(emoji);
            return {
                code, 
                emojiLocation
            };
        }
    }
    return false;
}; 

const getEmojis = text => {
    const emojiCodes = [];
    let nextEmoji = containsEmoji(text);
    while (nextEmoji) {
        if (emojiCodes.indexOf(nextEmoji.code)) {
            emojiCodes.push(nextEmoji.code);
        }
        text = text.slice(nextEmoji.emojiLocation + 1);
        nextEmoji = containsEmoji(text)
    }
    if (emojiCodes.length > 0) {
        console.log(emojiCodes.map(code => String.fromCodePoint('0x' + code))
                .reduce((a, b) => a + ' ' + b));
    }
    return emojiCodes;
};

// Removes duplicate strings from arrays
const uniq = a => {
    const seen = {};
    return a.filter(item => {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
};

// Creates object used for searching for links in mongo with matching source and target in either order
const queryBySourceOrTarget = (assocs, i, j) => {
    return {
        $or: [
            {
                source: assocs[i],
                target: assocs[j]
            },
            {
                source: assocs[j],
                target: assocs[i]
            }
        ]
    };
}


// Takes array of unique emojis occurring in a tweet, and updates mongo for each association
// TODO: shorten this into smaller funcs, make object generator for $or clauses, write test cases
const updateLinkOccurrences = (assocs, linksCollection) => {
    //if (assocs.length > 1) console.log(assocs.map(c => String.fromCodePoint('0x' + c)));
    for (let i = 0; i < assocs.length - 1; i += 1) {
        for (let j = i + 1; j < assocs.length; j += 1) {
            // Try to find a matching link document in mongo for the association
            linksCollection.findOne(
                    queryBySourceOrTarget(assocs, i, j),
                    (err, link) => {
                        if (link === null) {
                            linksCollection.insert(
                                    {
                                        source: assocs[i],
                                        target: assocs[j],
                                        occurrences: 1
                                    },
                                    (err, result) => {
                                        if (err) {
                                            console.log(err)
                                        }
                                    });

                        } else {
                            linksCollection.update(
                                    queryBySourceOrTarget(assocs, i, j),
                                    {$inc: {occurrences: 1}},
                                    {w: 1}, 
                                    (err, result) => {
                                        if (err) {
                                            console.log(err);
                                        }
                                    });
                        }
                    });
        }
    }
};

// Takes an array of emoji codes and updates mongo for each appearance
const updateEmojiAppearances = (emojis, assocs, nodesCollection) => {
    // TODO
};

// Updates mongo 
const updateMongo = (emojis, nodesCollection, linksCollection, assocOnly = false, countDups = true) => {
    const assocs = uniq(emojis);
    if (countDups === false) {
        emojis = assocs;
    }
    if (assocOnly === true && assocs.length < 2) {
        return;
    }
    updateLinkOccurrences(assocs, linksCollection);
    updateEmojiAppearances(emojis, assocs, nodesCollection);
};


// Use connect method to connect to the server
MongoClient.connect(mongoUrl, (err, db) => {
    assert.equal(null, err);
    console.log("Connected successfully to mongo");

    // Create 'nodes' collection if it doesn't already exist
    db.createCollection('nodes', (err, nodesCollection) => {
        db.createCollection('links', (err, linksCollection) => {
    
            // Make sure all emojis in json have an entry in mongo
            for (let i = 0; i < emojiData.nodes.length; i += 1) {
        
                const entry = nodesCollection.findOne(
                        {code: emojiData.nodes[i].code}, 
                        (err, node) => {
                            if (node === null) {
                                const emojiNode = emojiData.nodes[i];
                                emojiNode.appearances = 0;
                                nodesCollection.insert(emojiNode);
                            }
                        });
            }
        
            stream.on('tweet', function (tweet) {
                const emojis = getEmojis(tweet.text);
                updateMongo(emojis, nodesCollection, linksCollection);
            });
            //db.close();
        });
    });
});


function handleError(err) {
  console.error('response status:', err.statusCode);
  console.error('data:', err.data);
}
