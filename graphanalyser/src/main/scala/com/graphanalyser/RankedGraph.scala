package com

import com.graphanalyser.ChainGraph
import lib.Session
import org.apache.spark.graphx.Graph
import org.apache.spark.sql.{Dataset, SparkSession}


object RankedGraph {

  val sparkSes: SparkSession = Session.sparkSession
  // accessory classes to store data with associated names
  case class RankedTx(from:String, fromRank:Double, to:String, toRank:Double, hashTx:String, value:Double, gas:Int)
  case class RankedNode(address:String, rank:Double)


  def top100PageRank(chainGraph: ChainGraph): Graph[(String, Double), String] = {
    val ranked =  chainGraph.pageRankGraph()
    val threshold100: Double = ranked.vertices
      .sortBy(_._2, ascending = false)
      .zipWithIndex()
      .filter(v => v._2 == 99)
      .first()._1._2

    val top100Graph = chainGraph.graph
      .outerJoinVertices(ranked.vertices) {
        case (_, address, rank) if rank.get >= threshold100 => (address, rank.get)
        case (_, address, rank) if rank.get < threshold100 => (address, 0.0)
      }
      .subgraph(vpred = (_, attr) => attr._2 != 0.0)
    top100Graph
  }


  def getTripletsDS(rankedGraph: Graph[(String, Double), String]): Dataset[RankedTx] = {
    import sparkSes.implicits._
    val rankedTripletsDS = rankedGraph.triplets.map { r =>
      val t = r.toTuple
      val Array(h, v, g) = t._3.substring(1, t._3.length - 1).split(",") // hashTx, value, gas
      RankedTx(t._1._2._1, t._1._2._2, t._2._2._1, t._2._2._2, h, v.toDouble, g.toInt)
    }.toDS()

    rankedTripletsDS
  }


  def getVerticesDS(rankedGraph: Graph[(String, Double), String]): Dataset[RankedNode] = {
    import sparkSes.implicits._
    val rankedVerticesDS = rankedGraph.vertices
      .map(v => RankedNode(v._2._1, v._2._2))
      .toDS()

    rankedVerticesDS
  }

}
