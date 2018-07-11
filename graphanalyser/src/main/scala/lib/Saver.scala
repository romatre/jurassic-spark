package lib

import com.RankedGraph
import com.mongodb.spark.MongoSpark
import com.typesafe.config.{Config, ConfigFactory}
import org.apache.spark.graphx._
import org.apache.spark.sql.SparkSession


object Saver{

  val projectConf: Config = ConfigFactory.load()
  val sparkSes: SparkSession = Session.sparkSession


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
    val writeConf = Session.getWriteConfig("triplets") match {
      case None => throw new IllegalArgumentException("ERROR not 'triplets'")
      case Some(wcf) => wcf
    }
    // triplets
    val rankedTripletsDS = RankedGraph.getTripletsDS(ranked)
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
    val writeConf = Session.getWriteConfig("vertices") match {
      case None => throw new IllegalArgumentException("ERROR not 'vertices'")
      case Some(wcf) => wcf
    }
    val rankedNodesDS = RankedGraph.getVerticesDS(ranked)
    MongoSpark.save(rankedNodesDS, writeConf)

  }


  def saveAll(ranked: Graph[(String, Double), String]): Unit = {
    saveVerticesRanked100(ranked)
    saveTripletsRanked100(ranked)
  }


  def save(ranked: Graph[(String, Double), String]): Unit = {
    val strategy = projectConf.getString("graph-analyser.savingStrategy")

    strategy match {
      case "hdfs" => {
        RankedGraph.getVerticesDS(ranked)
          .coalesce(1)
          .write.format("json")
          .save(projectConf.getString("graph-analyser.HDFSuriVertices"))

        RankedGraph.getTripletsDS(ranked)
          .coalesce(1)
          .write.format("json")
          .save(projectConf.getString("graph-analyser.HDFSuriTriplets"))
      }
      case "mongodb" => saveAll(ranked)
      case _ => println("\n       ERROR WRONG SAVING STRATEGY       \n")
    }
  }

}