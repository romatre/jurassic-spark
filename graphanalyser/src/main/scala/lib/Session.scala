package lib

import com.mongodb.spark.config.WriteConfig
import com.typesafe.config.{Config, ConfigFactory}
import org.apache.spark.SparkContext
import org.apache.spark.sql.SparkSession


object Session {

  val projectConf: Config = ConfigFactory.load()

  val sparkSession: SparkSession = SparkSession.builder()
    .master(projectConf.getString("graph-analyser.master"))
    .appName(projectConf.getString("graph-analyser.appname"))
    .config("spark.mongodb.input.uri", projectConf.getString("graph-analyser.inputUri"))
    .config("spark.mongodb.output.database", projectConf.getString("graph-analyser.db"))
    .getOrCreate()

  val sparkCtx: SparkContext = sparkSession.sparkContext


  /**
    * Returns the proper WriteConfig to pass to MongoSpark.save
    * eg.
    * WriteConfig("Map"("collection" -> "fooCollection", "writeConcern.w" -> "majority"), Some(WriteConfig(sparkCont)))
    *
    * @param elements : "vertices" or "triplets"
    */
  def getWriteConfig(elements: String): Option[WriteConfig] = elements match {

    case "triplets" => Some(WriteConfig(
      Map("spark.mongodb.output.uri" -> projectConf.getString("graph-analyser.outputUriTriplets"),
        "writeConcern.w" -> "majority")))

    case "vertices" => Some(WriteConfig(
      Map("spark.mongodb.output.uri" -> projectConf.getString("graph-analyser.outputUriVertices"),
        "writeConcern.w" -> "majority")))

    case _ =>
      println(elements)
      None
  }
}
