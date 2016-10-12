// Bot for collecting data about tweets in which multiple emojis are used
var Bot = require('./bot')
  , config1 = require('./config1')
  , fs = require('fs');

var bot = new Bot(config1);

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
                .reduce((a, b) => a + b));
    }
    return emojiCodes;
}

stream.on('tweet', function (tweet) {
    var emojis = getEmojis(tweet.text)
});


function handleError(err) {
  console.error('response status:', err.statusCode);
  console.error('data:', err.data);
}


