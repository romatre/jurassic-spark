package lib

import com.mongodb.spark.MongoSpark
import org.apache.spark.graphx._
import com.typesafe.config.{Config, ConfigFactory}


object Saver{

  val projectConf: Config = ConfigFactory.load()
  // accessory classes to store data with associated names
  case class RankedTx(from:String, fromRank:Double, to:String, toRank:Double, hashTx:String, value:Double, gas:Int)
  case class RankedNode(address:String, rank:Double)

  val sparkSes = Session.sparkSession


  /**
    *
    * @param ranked : Subgraph of the top 100 nodes by PageRank
    *
    *               ranked.triplets:
    *                   ((fromId, (from, fromRank)), (toId, (to, toRank)), "hashTx, value, gas")]
    *
    *
    *               each triplet is wrapped into a RankedTX object
    */
  def saveTripletsRanked100(ranked: Graph[(String, Double), String]): Unit = {

    val writeConf = Session.getWriteConfig("triplets").get
    // necessary to get DataSets from RDDs
    import sparkSes.implicits._

    // triplets
    val rankedTripletsDS = ranked.triplets.map { r =>
      val t = r.toTuple
      val Array(h, v, g) = t._3.substring(1, t._3.length - 1).split(",") // hashTx, value, gas
      RankedTx(t._1._2._1, t._1._2._2, t._2._2._1, t._2._2._2, h, v.toDouble, g.toInt)
    }.toDS()

    MongoSpark.save(rankedTripletsDS, writeConf)
  }


  /**
    *
    * @param ranked : Subgraph of the top 100 nodes by PageRank
    *
    *               ranked.triplets:
    *                   ((fromId, (from, fromRank)), (toId, (to, toRank)), "hashTx, value, gas")]
    *
    *               each vertex is wrapped into a RankedNode object representing a BlockChain node
    */
  def saveVerticesRanked100(ranked: Graph[(String, Double), String]): Unit = {
    // necessary to get DataSets from RDDs
    val writeConf = Session.getWriteConfig("vertices")  match {
      case None => throw new IllegalArgumentException("ERROR")
      case Some(wcf) => wcf
    }

    println(writeConf.toString)

    import sparkSes.implicits._

    val rankedNodesDS = ranked.vertices
      .map( v => RankedNode(v._2._1, v._2._2))
      .toDS()

    MongoSpark.save(rankedNodesDS, writeConf)

  }
}