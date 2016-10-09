(() => {

    d3.json("/emoji-data.json", graph => {
        const graph2 = {
            nodes: [],
            links: []
        };
        const addNodes = (graph, n = 1000) => {
            for (let i = 0; i < n; i += 1) {
                graph.nodes.push({
                    id: i,
                    code: '0023',
                    version: 1.1
                });
            }
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
        const connectSomeNodes = (graph, n = 5000)  => {
            for (let i = 0; i < n; i += 1) {
                const n1 = Math.floor(Math.random() * graph.nodes.length),
                        n2 = Math.floor(Math.random() * graph.nodes.length);
        
                graph.links.push({
                    source: n1, 
                    target: n2
                }); 
            }   
        };

        addNodes(graph2, 1500);
        connectSomeNodes(graph2, 2000);
        //graph = graph2;


        const dragstarted = d => {
            if (!d3.event.active) {
                simulation.alphaTarget(0.3).restart();
            }
            d.fx = d.x;
            d.fy = d.y;
        };
    
        const dragged = d => {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        };
    
        const dragended = d => {
            if (!d3.event.active) {
                simulation.alphaTarget(0);
            }
            d.fx = null;
            d.fy = null;
        }
    
        const svg = d3.select('svg'),
                width = +svg.attr('width'),
                height = +svg.attr('height');
    
        const color = d3.scaleOrdinal(d3.schemeCategory20);
    
        const simulation = d3.forceSimulation()
                .force('link', d3.forceLink().id(d => d.id))
                .force('charge', d3.forceManyBody()
                        .strength(-5))
                .force('center', d3.forceCenter(width / 2, height / 2));
        
        const link = svg.append('g')
                .attr('class', 'links')
                .selectAll('line')
                .data(graph.links)
                .enter().append('line')
                .attr('stroke-width', 0.5)
                .attr('stroke', d => {
                    return d3.rgb(Math.floor(Math.random()*256),
                            Math.floor(Math.random()*256),
                            Math.floor(Math.random()*256));
                });
    
        const node = svg.append('g')
                .selectAll('text')
                .data(graph.nodes)
                .enter()
                .append('text')
                .text(d => String.fromCodePoint('0x' + d.code))
                .attr('cursor', 'move')
                .call(d3.drag()
                        .on('start', dragstarted)
                        .on('drag', dragged)
                        .on('end', dragended));
    
        const ticked = () => {
            link.attr('x1', d => d.source.x)
                    .attr('y1', d => d.source.y)
                    .attr('x2', d => d.target.x)
                    .attr('y2', d => d.target.y);
                    
            node.attr('x', d => {
                    return d.x;
                })
                .attr('y', d => d.y);
        };
    
        node.append('title')
                .text(d => d.id);
    
        simulation.nodes(graph.nodes)
                .on('tick', ticked);
    
//        console.log('graph:');
//        console.dir(graph);
//        console.log(graph.nodes[0]);
//        console.log(graph.links[0]);
//        console.log('graph2:');
//        console.dir(graph2);
//        console.log(graph2.nodes[0]);
//        console.log(graph2.links[0]);

        test = graph; // take out

        simulation.force('link')
              .links(graph.links);
    });

})();
