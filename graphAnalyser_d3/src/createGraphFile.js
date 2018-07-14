Promise.all([
    fetch(`http://localhost:3030/top100Vertices`),
    fetch(`http://localhost:3030/top100Triplets`)
])
    .then( result =>{
        return result.map(r => r.json());
    })
    .then(([verts, triplets]) => {

        let address2node = {};

        Array.prototype.forEach.call(verts, (v, ind) => {
            address2node[v.address] = ind;
            console.log(address2node[v.address])
        });

        let graph = {
            vertices: verts.then(el => el.map( v => ({
                id: v.address,
                rank: v.rank
            }))),
            edges: triplets.then(el => el.map( t => ({
                source: address2node[t.from],
                to: address2node[t.to],
                value: t.value
            })))
        };

        console.log(graph);
    });