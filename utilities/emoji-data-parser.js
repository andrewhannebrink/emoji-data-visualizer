const fs = require('fs'),
        lineReader = require('readline').createInterface({
            input: require('fs').createReadStream('./emoji-data.txt')
        }),
        graph = {
            nodes: [], // Holds emojis
            links: []  // Holds connections between emojis
        },
        topVersion = 8.0; // Dont use emoji versions newer than this

let done = false; // Keeps track of when the first non-commented line not about emoji characters is reached. When this is true the parser is done reading emoji-data.txt

const connectAllNodes = (dataset) => {
    for (let i = 0; i < dataset.nodes.length - 1; i += 1) {
        for (let j = i + 1; j < dataset.nodes.length; j += 1) {
            dataset.links.push({
                source: i,
                target: j
            }); 
        }   
    }   
}; 

const connectSomeNodes = (graph, n = 2000)  => {
    for (let i = 0; i < n; i += 1) {
        const source = Math.floor(Math.random() * graph.nodes.length),
                target = Math.floor(Math.random() * graph.nodes.length),
                occurrences = Math.floor(Math.random() * 20);
                                
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
        connectSomeNodes(graph, 3000);
        const json = JSON.stringify(graph);
        fs.writeFile('emoji-data.json', json);
        lineReader.close();
        done = true;
        console.log('total nodes: ');
        console.log(graph.nodes.length);
        console.log('total links: ');
        console.log(graph.links.length);
    }
});

