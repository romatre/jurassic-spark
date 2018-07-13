package com.graphanalyser

import lib.{Saver, Session}
import com.RankedGraph.top100PageRank
import com.typesafe.config.{Config, ConfigFactory}
import org.apache.spark.graphx.VertexId
import org.apache.spark.sql.SparkSession


object GraphAnalyser {

  def main(args: Array[String]): Unit = {

    val ethGraph = new ChainGraph()
    val top100 = top100PageRank(ethGraph)

    // see reference.conf for saving strategy
    Saver.save(top100)

    // ethGraph.graph.triplets.take(10).foreach(println)
  }
}
