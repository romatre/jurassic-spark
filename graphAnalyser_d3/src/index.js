Promise.all([
    fetch(`http://localhost:3030/top100Vertices?limit=2000`),
    fetch(`http://localhost:3030/top100Triplets?limit=2000`)
])
    .then(results => results.map(r => r.json()))
    .then(([verts, triplets]) => {

        let address2node = {};

        verts.forEach((v, ind) => {
            address2node[v.address] = ind;
        })

        return [ verts, triplets, address2node];
    })
    .then(([ verts, triplets, address2node]) => ({
        vertices: verts.map( v => ({
            id: v.address,
            rank: v.rank
        })),
        edges: triplets.map( t => ({
            source: address2node[t.from],
            to: address2node[t.to],
            value: t.value
        }))
    }));