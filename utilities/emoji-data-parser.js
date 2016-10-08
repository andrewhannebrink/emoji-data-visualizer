const fs = require('fs'),
        lineReader = require('readline').createInterface({
            input: require('fs').createReadStream('./emoji-data.txt')
        }),
        emojis = [];


lineReader.on('line', line => {
    // Not a comment
    if (line[0] !== '#' &&
            line.indexOf('Emoji_Modifier') === -1 && 
            line.indexOf('Emoji_Presentation') === -1) {

        const emoji = {},
                codeRange = line.slice(line.indexOf('[') + 1, line.indexOf(']')),
                versStrIdx = line.search(/\d+\.\d+/),
                version = parseFloat(line.slice(versStrIdx, versStrIdx + 6));

        let code = line.slice(0, line.indexOf(' ')).toLowerCase();

        if (code.indexOf('..')) {
            code = code.split('..')[0];
        }
        for (let i = 0; i < codeRange; i += 1) {
            emoji.code = code;
            emoji.version = version;
            code = (parseInt('0x' + code) + 1).toString(16);
            emojis.push(emoji);
            //console.log(emoji);
            //console.log(emojis.length);
        }
    } else if (line.indexOf('Emoji_Presentation') !== -1) {
        const json = JSON.stringify(emojis);
        fs.writeFile('emoji-data.json', json);
        lineReader.close();
    }
});

