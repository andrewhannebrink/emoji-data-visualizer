(() => {

    $.post( 'http://tinyicon.co/vis/graph/1200/8', res => {
    //$.post( 'http://localhost:8080/vis/graph/2500/10', res => {
        
        const graph = JSON.parse(res);
        test = graph;

        // Unit scale for edges
        const occurrencesToUnit = d3.scaleLog()
                .domain([
                        d3.min(graph.links, d => d.occurrences), 
                        d3.max(graph.links, d => d.occurrences)])
                .range([0, 1]);
                
        // Unit scale for nodes (emojis) 
        const appearancesToUnit = d3.scaleSqrt()
                .domain([
                        d3.min(graph.nodes, d => d.appearances), 
                        d3.max(graph.nodes, d => d.appearances)])
                .range([0, 1]);

        // Opacity scale for edges
        const occurrencesToOpacity = d3.scaleLog()
                .domain([1, d3.max(graph.links, d => d.occurrences)])
                .range([0.5, 1]);

        // 0-256 scale for edges
        const occurrencesToColor = d3.scaleLog()
                .domain([1, d3.max(graph.links, d => {
                    return d.occurrences;
                })])
                .range([0, 256]);

        // Function for calculating color gradients for edges
        const occurrencesToRgb = d => {
            const totalRgbSteps = Math.floor(
                            (256 * 4) * occurrencesToUnit(d.occurrences)),
                    third = totalRgbSteps / 256;
            let r = 255,            
                    g = 255,
                    b = 255;

            if (third < 1) {
                // turquoise -> green
                r = 0;
                b -= (totalRgbSteps % 256);
            } else if (third < 2) {
                // green -> yellow
                r = (totalRgbSteps % 256);
                b = 0;
            } else {
                // yellow -> red
                g -= (totalRgbSteps % 256);
                b = 0;
            }
            return d3.rgb(r, g, b);
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
    
        const svg = d3.select('svg'),
                width = +svg.attr('width'),
                height = +svg.attr('height');
    
        const color = d3.scaleOrdinal(d3.schemeCategory20);
    
        const simulation = d3.forceSimulation()
                .force('link', d3.forceLink().id(d => d.code))
                .force('charge', d3.forceManyBody().strength(-30))
                .force('center', d3.forceCenter(width / 2 - 350, height / 2));
        
        const link = svg.append('g')
                .attr('class', 'links')
                .selectAll('line')
                .data(graph.links)
                .enter().append('line')
                .attr('stroke-width', d => 7 * occurrencesToUnit(d.occurrences) + 0.5)
                .attr('stroke-opacity', d => occurrencesToOpacity(d.occurrences))
                .attr('stroke', d => occurrencesToRgb(d));

        const getNodeRadius = emoji => {
            const r  = (appearancesToUnit(parseInt(emoji.appearances))) * 42 + 6;
            return r;
        };
    
        const node = svg.append('g')
                .selectAll('text')
                .data(graph.nodes)
                .enter()
                .append('text')
                .text(d => String.fromCodePoint('0x' + d.code))
                .attr('cursor', 'move')
                .attr('font-size', d => (2 * getNodeRadius(d)).toString() + 'px')
                .attr('dx', d => (-1 * getNodeRadius(d)).toString())
                .attr('dy', d => getNodeRadius(d).toString())
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
    
        simulation.force('link')
                .links(graph.links)
                //.strength(d => 1(0.05 * occurrencesToUnit(d.occurrences) + 0.3));
    });

})();
