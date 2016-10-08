const fs = require('fs'),
        lineReader = require('readline').createInterface({
            input: require('fs').createReadStream('./emoji-data.txt')
        }),
        graph = {
            nodes: [],
            links: []
        };

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

const connectSomeNodes = (graph, n = 200)  => {
    for (let i = 0; i < n; i += 1) {
        const n1 = Math.floor(Math.random() * graph.nodes.length),
                n2 = Math.floor(Math.random() * graph.nodes.length);

        graph.links.push({
            source: n1,
            target: n2
        });
    }
};


let done = false,
        id = 0;
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
            emoji.id = id;
            emoji.version = version;
            code = (parseInt('0x' + code) + 1).toString(16);
            id += 1;
            graph.nodes.push(emoji);
            //console.log(emoji);
        }
    } else if (line.indexOf('Emoji_Presentation') !== -1 &&
            done === false) {
        connectSomeNodes(graph);
        const json = JSON.stringify(graph);
        fs.writeFile('emoji-data.json', json);
        console.log(graph.links.length);
        lineReader.close();
        done = true;
    }
});

