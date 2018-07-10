package com.graphanalyser
import _root_.lib.Session
import com.mongodb.spark.MongoSpark
import org.apache.spark.graphx._
import org.apache.spark.rdd.RDD
import org.apache.spark.sql.SparkSession


class ChainGraph() extends Serializable {

  // [address, hashTx]
  var graph: Graph[String, String] = graphFromSparkSession()

  def createID(address: AnyRef): VertexId = {
    val addr = address.toString
    java.lang.Long.parseLong(addr.substring(2, 10).concat(addr.substring(17, 24)), 16)
  }


  def graphFromSparkSession(): Graph[String, String] = {
    val session: SparkSession = Session.sparkSession

    // fromNode, toNode, (hashTx, value, gas)
    val transactions = MongoSpark.load(session.sparkContext)
      .filter(r => !(r.getString("from").equals("") || r.getString("to").equals("")))
      .map(
        r => (
          (createID(r.get("from")):VertexId, r.getString("from")),
          (createID(r.get("to")):VertexId, r.getString("to")),
          (r.getString("hashTx"), r.get("value").asInstanceOf[Number].doubleValue(), r.getInteger("gas").toInt).toString()
        ))

    val verts = transactions
      .flatMap(r => List(r._1, r._2))
      .distinct()

    val edges = transactions
      .map(e => Edge(e._1._1, e._2._1, e._3))

    Graph(verts, edges)
  }


  // 0.001 is less precise yet leads to faster termination, you can use 0.0001 instead
  def pageRankGraph(tolerance:Double = 0.001, resetProb:Double = 0.15): Graph[Double, Double] = {
    graph.pageRank(tolerance, resetProb)
  }

  def triplets(): RDD[EdgeTriplet[String, String]] = {
    graph.triplets
  }

  def vertices(): VertexRDD[String] = {
    graph.vertices
  }

  def edges(): EdgeRDD[String] = {
    graph.edges
  }

}
