package com.graphanalyser

import lib.Saver
import org.apache.spark.graphx.Graph


object GraphAnalyser {

  def main(args: Array[String]): Unit = {
    val ethGraph = new ChainGraph()
    val pRankGraph = ethGraph.pageRankGraph()

    // pick nodes with rank >= threshold100
    val threshold100: Double = pRankGraph.vertices
      .sortBy(_._2, ascending = false)
      .zipWithIndex()
      .filter(v => v._2 == 99)
      .first()._1._2

    val top100: Graph[(String, Double), String] = ethGraph.graph
      .outerJoinVertices(pRankGraph.vertices) {
        case (_, address, rank) if rank.get >= threshold100 => (address, rank.get)
        case (_, address, rank) if rank.get < threshold100 => (address, 0.0)
      }
      .subgraph(vpred = (_, attr) => attr._2 != 0.0).cache()


    // triplets
    Saver.saveTripletsRanked100(top100)
    // vertices
    Saver.saveVerticesRanked100(top100)

  }
}
