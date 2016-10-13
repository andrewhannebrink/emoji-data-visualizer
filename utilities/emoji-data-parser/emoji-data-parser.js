const fs = require('fs'),
        lineReader = require('readline').createInterface({
            input: require('fs').createReadStream('./utilities/emoji-data-parser/emoji-data.txt')
        }),
        graph = {
            nodes: [], // Holds emojis
            links: []  // Holds connections between emojis
        },
        topVersion = 8.0, // Dont use emoji versions newer than this
        totalLinks = 1100,
        badEmojis = [
            'NUMBER SIGN',
            'ASTERISK',
            'DIGIT ZERO..DIGIT NINE'
//            'COPYRIGHT SIGN',
//            'REGISTERED SIGN',
//            'DOUBLE EXCLAMATION MARK',
//            'EXCLAMATION QUESTION MARK',
//            'TRADE MARK SIGN',
//            'INFORMATION SOURCE',
//            'LEFT RIGHT ARROW..SOUTH WEST ARROW',
//            'LEFTWARDS ARROW WITH HOOK..RIGHTWARDS ARROW WITH HOOK'
        ];

let done = false; // Keeps track of when the first non-commented line not about emoji characters is reached. When this is true the parser is done reading emoji-data.txt

// Randomly connect some nodes together with n links, and random occurrences (weights)
const connectSomeNodes = (graph, n = 2000)  => {
    for (let i = 0; i < n; i += 1) {
        const l = graph.nodes.length,
                source = graph.nodes[Math.floor(Math.random() * l)].code,
                target = graph.nodes[Math.floor(Math.random() * l)].code,
                occurrences = Math.floor(Math.random() * 256);
                                
        graph.links.push({
            source,
            target,
            occurrences
        });
    }
};


lineReader.on('line', line => {
    // Not a comment
    if (line[0] !== '#' &&
            line.indexOf('Emoji_Modifier') === -1 && 
            line.indexOf('Emoji_Presentation') === -1) {

        for (let i = 0; i < badEmojis.length; i += 1) {
            if (line.indexOf(badEmojis[i]) > -1) {
                return;
            }
        }

        const codeRange = line.slice(line.indexOf('[') + 1, line.indexOf(']')),
                versStrIdx = line.search(/\d+\.\d+/),
                version = parseFloat(line.slice(versStrIdx, versStrIdx + 6));
        
        // Don't use emojis that are newer than topVersion
        if (version > topVersion) {
            return;
        }

        let code = line.slice(0, line.indexOf(' ')).toLowerCase();

        if (code.indexOf('..')) {
            code = code.split('..')[0];
        }
        for (let i = 0; i < codeRange; i += 1) {
            // ES6 sugar for auto-assignment
            const emoji = {
                code,
                version
            };
            // Increments hexadecimal code string by one
            code = (parseInt('0x' + code) + 1).toString(16); 
            graph.nodes.push(emoji);
        }
    } else if (line.indexOf('Emoji_Presentation') !== -1 &&
            done === false) {
        connectSomeNodes(graph, totalLinks);
        const json = JSON.stringify(graph);
        fs.writeFile('./utilities/emoji-data-parser/emoji-data.json', json);
        lineReader.close();
        done = true;
        console.log('total nodes: ');
        console.log(graph.nodes.length);
        console.log('total links: ');
        console.log(graph.links.length);
    }
});

