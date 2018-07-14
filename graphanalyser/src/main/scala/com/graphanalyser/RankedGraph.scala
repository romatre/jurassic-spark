package com.graphanalyser

import lib.Session
import org.apache.spark.graphx.{Graph, VertexId}
import org.apache.spark.sql.{Dataset, SparkSession}


object RankedGraph {

  val sparkSes: SparkSession = Session.sparkSession
  // accessory classes to store data with associated names
  case class RankedTx(fromId:Long, fromAddr:String, fromRank:Double, toId:Long, toAddr:String,
                      toRank:Double, hashTx:String, value:Double, gas:Int)

  case class RankedNode(id:VertexId, address:String, rank:Double)


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

  /**  Triplet decomposed
  *
  *           Id                  Addr                                      rank
  *  ._1    ((20550550273233521,(0x049029DD41661E58f99271A0112DFD34695f7000,86.53756273407782)),
  *  ._2    (974788743809982070,(0xd872532a2AdFA925d7de76d197DD86Fdf8d7601E,14.55124372578739)),
  *          hashTx                                                             value   gas
  *  ._3    (0x601652af21cd2d48202acc601dcf5ff06d50a62c2d8fd6826f897cf7fa16f213,9.4E19,21000))
  *
  *
  **/
  def getTripletsDS(rankedGraph: Graph[(String, Double), String]): Dataset[RankedTx] = {
    import sparkSes.implicits._

    val rankedTripletsDS = rankedGraph.triplets.map { r =>
      val t = r.toTuple
      val (fId: VertexId, (fAddr: String, fRank: Double)) = t._1
      val (tId: VertexId, (tAddr: String, tRank: Double)) = t._2
      val Array(h, v, g) = t._3.substring(1, t._3.length - 1).split(",") // hashTx, value, gas

      RankedTx(fId.asInstanceOf[Long], fAddr, fRank, tId.asInstanceOf[Long], tAddr, tRank, h, v.toDouble, g.toInt)
    }.toDS()

    rankedTripletsDS
  }


  def getVerticesDS(rankedGraph: Graph[(String, Double), String]): Dataset[RankedNode] = {
    import sparkSes.implicits._

    val rankedVerticesDS = rankedGraph.vertices
      .map(v => RankedNode(v._1, v._2._1, v._2._2))
      .toDS()

    rankedVerticesDS
  }

}
