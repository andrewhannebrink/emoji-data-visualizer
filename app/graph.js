(function () {
    const graph = { 
        nodes: [], 
        links: []
    };

    const addNodes = (graph) => {
        for (let i = 0; i < 100; i += 1) {
            graph.nodes.push({
                id: i
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

    addNodes(graph);
    connectAllNodes(graph);

    const svg = d3.select('svg'),
            width = +svg.attr('width'),
            height = +svg.attr('height');

    const color = d3.scaleOrdinal(d3.schemeCategory20);

    const simulation = d3.forceSimulation()
            .force('link', d3.forceLink().id(d => d.id))
            .force('charge', d3.forceManyBody()
                    .strength(-500))
            .force('center', d3.forceCenter(width / 2, height / 2));
    
    // Will be json callback from here below later
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

    /*const node = svg.append('g')
            .attr('class', 'nodes')
            .selectAll('circle')
            .data(graph.nodes)
            .enter()
            .append('circle')
            .attr('r', 8)
            .attr('fill', d => color(d.group))
            .call(d3.drag()
                    .on('start', dragstarted)
                    .on('drag', dragged)
                    .on('end', dragended))
    */

    const node = svg.append('g')
            .selectAll('image')
            .data(graph.nodes)
            .enter()
            .append('image')
            .attr('xlink:href', '/test.png')
            .attr('width', 16)
            .attr('height', 16)
            .call(d3.drag()
                    .on('start', dragstarted)
                    .on('drag', dragged)
                    .on('end', dragended));

    const ticked = () => {
        link.attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);
                
        node.attr('x', d => d.x)
            .attr('y', d => d.y);
    };

    node.append('title')
        .text(d => d.id);

    simulation.nodes(graph.nodes)
            .on('tick', ticked);

    simulation.force('link')
            .links(graph.links);

    //


})();
