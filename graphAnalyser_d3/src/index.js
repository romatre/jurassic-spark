import 'babel-polyfill';
import * as d3 from "d3";
import * as d3Chromatic from "d3-scale-chromatic";


const getGraph = async () => {
    const verts = await fetch(`http://localhost:3030/top100Vertices?limit=2000`).then(r => r.json());
    const triplets = await fetch(`http://localhost:3030/top100Triplets?limit=2000`).then(r => r.json());

    return {
        vertices: verts.map( v => ({
            id: v.address,
            rank: v.rank
        })),
        edges: triplets.map( t => ({
            source: t.from,
            target: t.to,
            value: t.value
        }))
    }

};

// page rank in [19.6873074396452, 7138.00436242071]

/**
 *
 *
 *  D3 in action!
 *
 * **/


let svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");


// Exponential Scale
const expScale = d3.scalePow()
    .exponent(Math.E)
    .domain([10.0, 7139.0]);

const colorScaleExp = d3.scaleSequential(
    d => d3.interpolateYlOrBr(expScale(d))
);


let simulation = d3.forceSimulation()
    .force("link", d3.forceLink())
    .force("charge", d3.forceManyBody().distanceMax(40).strength(-11))
    .force("center", d3.forceCenter(width / 2, height / 2));


getGraph().then(graph => {

    let nodes = graph.vertices;
    let nodeById = d3.map(nodes, function(d) { return d.id; });
    let links = graph.edges;
    let bilinks = [];


    links.forEach(function(link) {
        let s = link.source = nodeById.get(link.source),
            t = link.target = nodeById.get(link.target),
            i = {}; // intermediate node
        nodes.push(i);
        links.push({source: s, target: i}, {source: i, target: t});
        bilinks.push([s, i, t]);
    });


    let link = svg.selectAll(".link")
        .data(bilinks)
        .enter().append("path")
        .attr("class", "link");

    //{ return color(1.0 - 1.0/d.rank); })
    let node = svg.selectAll(".node")
        .data(nodes.filter(function(d) { return d.id; }))
        .enter().append("circle")
        .attr("class", "node")
        .attr("r", 7)
        .attr("fill", function(d) { return colorScaleExp(d.rank); })
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    node.append("title")
        .text(function(d) { return d.id; });

    simulation
        .nodes(nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(links);

    function ticked() {
        link.attr("d", positionLink);
        node.attr("transform", positionNode);
    }
});



function positionLink(d) {
    return "M" + d[0].x + "," + d[0].y
        + "S" + d[1].x + "," + d[1].y
        + " " + d[2].x + "," + d[2].y;
}

function positionNode(d) {
    return "translate(" + d.x + "," + d.y + ")";
}

function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.8).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}