name := "graphAnalyser"

version := "0.4"

scalaVersion := "2.11.8"

val sparkVersion = "2.3.1"
val spark = "org.apache.spark"

libraryDependencies ++= Seq(
  spark %% "spark-core" % sparkVersion % "provided",
  spark %% "spark-sql" % sparkVersion % "provided",
  spark %% "spark-graphx" % sparkVersion % "provided",
  "org.mongodb.spark" %% "mongo-spark-connector" % "2.2.3",
  "com.databricks" %% "spark-csv" % "1.5.0",
  "com.typesafe" % "config" % "1.3.2",
  "com.google.cloud" % "google-cloud-storage" % "1.35.0"
)

assemblyMergeStrategy in assembly := {
  case PathList("META-INF", xs @ _*) => MergeStrategy.discard
  case x => MergeStrategy.first
}