from operator import add
from pyspark import SparkContext
from pyspark.streaming import StreamingContext
from lib.rabbitmq import RabbitMQ
from functools import reduce
import json
from pyspark.sql import SparkSession
import numpy as np


class StandardDeviationStreaming:

    def __init__(self, queque, output, debug = False):
        self.debug = debug
        self.database_name = output["database"]
        self.collection_name = output["collection"]
        self.rabbitMq = RabbitMQ("uri", queque["name"])
        self.socket_port = 10101
        self.polling_time = 1
        self.sc = SparkContext(appName="StreamingSTD")
        self.ssc = StreamingContext(self.sc, self.polling_time)
        self.spark = SparkSession.builder \
            .config("spark.mongodb.input.partitioner", "MongoSamplePartitioner") \
            .config("spark.mongodb.input.partitionerOptions.partitionSizeMB", "6000") \
            .getOrCreate()

    def execute(self):
        lines = self.ssc.socketTextStream("localhost", self.socket_port)

        result = lines \
            .map(json.loads) \
            .map(self.calculate_std)

        if self.debug:
            result.pprint()
        else:
            result.foreachRDD(lambda rdd: self.fn_each_rdd(rdd))

        try:
            self.ssc.start()
            self.rabbitMq.listen("localhost", self.socket_port)
        except Exception as e:
            self.ssc.awaitTermination()

    def fn_each_rdd(self, rdd):
        if not (rdd.isEmpty()):
            output = self.spark\
                .createDataFrame(rdd,
                                 ["address", "standard_deviation", "period", "number_of_blocks", "count", "value", "gas"])

            output.write \
                .format("com.mongodb.spark.sql.DefaultSource") \
                .option("uri", "mongodb://127.0.0.1/" + self.database_name + "." + self.collection_name) \
                .mode("overwrite").save()

    @staticmethod
    def calculate_std(row):
        transactions = row["transactions"]
        address = row["address"]
        blocks = list(map(lambda t: t["blockNumber"], transactions))
        blocks = np.sort(blocks)
        blocks = np.unique(blocks)
        delta_blocks = np.ediff1d(blocks)
        gas = reduce(add, map(lambda t: int(t["gas"]), transactions))
        value = reduce(add, map(lambda t: int(t["value"]), transactions))
        period = np.mean(delta_blocks).tolist()
        standard_deviation = np.std(delta_blocks).tolist()
        number_of_blocks = len(blocks)
        count = len(transactions)
        return address, standard_deviation, period, number_of_blocks, count, value, gas