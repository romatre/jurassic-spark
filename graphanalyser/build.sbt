name := "graphAnalyser"

version := "0.1"

scalaVersion := "2.11.8"

val sparkVersion = "2.3.1"
val spark = "org.apache.spark"

libraryDependencies ++= Seq(
  spark %% "spark-core" % sparkVersion,
  spark %% "spark-sql" % sparkVersion,
  spark %% "spark-graphx" % sparkVersion,
  "org.mongodb.spark" %% "mongo-spark-connector" % "2.2.3",
  "com.databricks" %% "spark-csv" % "1.5.0",
  "com.typesafe" % "config" % "1.3.2"
)
