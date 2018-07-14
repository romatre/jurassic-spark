package com.graphanalyser
import _root_.lib.Session
import com.mongodb.spark.MongoSpark
import com.typesafe.config.{Config, ConfigFactory}
import org.apache.spark.graphx._
import org.apache.spark.rdd.RDD
import org.apache.spark.sql.SparkSession

class ChainGraph() extends Serializable {

  val projectConf: Config = ConfigFactory.load()
  val session: SparkSession = Session.sparkSession

  // [address, hashTx]
  var graph: Graph[String, String] = create()

  def createID(address: Any): VertexId = {
    val addr = address.toString
    java.lang.Long.parseLong(addr.substring(2, 10).concat(addr.substring(17, 24)), 16)
  }


  /* SOURCE: hashTx timestamp blockNumber from to gas gasPrice value */
  def graphFromCsv(): Graph[String, String] = {

    val inputUri: String = projectConf.getString("graph-analyser.inputUriHDFS")
    import session.implicits._

    val transactions = session.read
      .format("csv")
      .option("inferSchema", "true")
      .option("header", value = false)
      .option("treatEmptyValuesAsNulls", "true")
      .load(inputUri)
      .filter(el => !el.isNullAt(3) && !el.isNullAt(4))
      .map(r => ((createID(r.get(3)), r.getString(3)), (createID(r.get(4)), r.getString(4)),
        (r.getString(0), r.get(7).asInstanceOf[Number].doubleValue(), r.get(5).asInstanceOf[Number].intValue())
          .toString()))
      .rdd

    val verts = transactions
      .flatMap(r => List((r._1._1, r._1._2.toString), (r._2._1, r._2._2.toString)))
      .distinct()

    val edges = EdgeRDD.fromEdges(transactions
      .map(e => Edge(e._1._1, e._2._1, e._3)))

    Graph(verts, edges)
  }


  def graphFromMongoDB(): Graph[String, String] = {
    // val session: SparkSession = Session.sparkSession

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


  def create(): Graph[String, String] = {
    projectConf.getString("graph-analyser.readingStrategy") match {
      case "hdfs" => graphFromCsv()
      case "mongodb" => graphFromMongoDB()
    }
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
