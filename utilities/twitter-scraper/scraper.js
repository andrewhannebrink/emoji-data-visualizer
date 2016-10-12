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
};


var jsonInputStr = fs.readFileSync('utilities/emoji-data-parser/emoji-data.json');
var emojiData = JSON.parse(jsonInputStr);
var stream = bot.twit.stream('statuses/sample');


stream.on('tweet', function (tweet) {
    var firstEmoji = containsEmoji(tweet);
});


function handleError(err) {
  console.error('response status:', err.statusCode);
  console.error('data:', err.data);
}

const containsEmoji = tweet => {
    for (let i = 0; i < emojiData.nodes.length; i += 1) {
        let code = emojiData.nodes[i].code,
                emoji = String.fromCodePoint('0x' + code);

        if (tweet.text.indexOf(emoji) > -1) {
            console.log(emoji);
            return code;
        }
    }
    return false;
}; 
