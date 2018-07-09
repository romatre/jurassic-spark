package com

import org.apache.spark.graphx.Graph

package object graphanalyser {

  // handy downcasting to store graph in hdfs as jsonlines
  val downcast: Graph[_, _] => Graph[Option[Any], Option[Any]] =
    x => x.asInstanceOf[Graph[Option[Any], Option[Any]]]

}
