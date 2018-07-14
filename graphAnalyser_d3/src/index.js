import 'babel-polyfill';

const tadaaan = async () => {
    const verts = await fetch(`http://localhost:3030/top100Vertices?limit=2000`).then(r => r.json());
    const triplets = await fetch(`http://localhost:3030/top100Triplets?limit=2000`).then(r => r.json());

    let address2node = {};

    verts.forEach((v, ind) => {
        address2node[v.address] = ind;
    })


    return {
        vertices: verts.map( v => ({
            id: v.address,
            rank: v.rank
        })),
        edges: triplets.map( t => ({
            source: address2node[t.from],
            to: address2node[t.to],
            value: t.value
        }))
    }

}

tadaaan().then(console.log);