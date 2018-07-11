package com.graphanalyser

import lib.Saver
import com.RankedGraph.top100PageRank

object GraphAnalyser {

  def main(args: Array[String]): Unit = {

    val ethGraph = new ChainGraph()
    val top100 = top100PageRank(ethGraph)

    // see reference.conf for saving strategy
    Saver.save(top100)

  }
}
