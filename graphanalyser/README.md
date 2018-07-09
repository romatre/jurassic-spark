Properties in:

    /graphAnalyser/src/main/resources/reference.conf
    
A type-safe configuration library for JVM languages: <https://lightbend.github.io/config/> for reference.conf

# Main
Run main in **com.graphanalyser.GraphAnalyser**

# Graph
The initial data structure comes from blockchain data stored in mogodb, see com.graphanalyser.ChainGraph, it builds the related PageRank graph too

# Graph with top 100 PageRank
The basic idea is to find the 100 most influential nodes in terms of number of transactions, PageRank!\
Plus we would like to find meaningful patterns so we decided to keep **"value"** and **"gas"** from the original blockchain txs
See main for related code.