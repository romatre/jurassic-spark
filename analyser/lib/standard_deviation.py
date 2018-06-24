from pyspark.sql import SparkSession
import numpy as np


class StandardDeviation:

    def __init__(self, database, read_collection_name, write_collection_name, debug = False):
        self.debug = debug
        self.database = database
        self.read_collection_name = read_collection_name
        self.write_collection_name = write_collection_name
        self.spark = SparkSession \
            .builder \
            .appName("Counter") \
            .config("spark.mongodb.input.partitioner", "MongoSamplePartitioner") \
            .config("spark.mongodb.input.partitionerOptions.partitionSizeMB", "6000") \
            .getOrCreate()

    def execute(self):
        rdd = self.loads_rdd()
        result = rdd.filter(lambda row: len(row["blocks"]) > 2).map(self.delta_blocks)
        self.write(result, self.debug)

    def loads_rdd(self):
        """
        Loads rdd.
        :return:
        """
        return self.spark.read \
            .format("com.mongodb.spark.sql.DefaultSource") \
            .option("uri", "mongodb://127.0.0.1/" + self.database + "." + self.read_collection_name) \
            .load().rdd

    @staticmethod
    def delta_blocks(row):
        """
        This function calculate the difference between an array of blocks.
        p.s.
        tolist is used to convert numpy.float64 in python's float.
        :param row:
        :return:
        """
        blocks = np.sort(row["blocks"])
        delta_blocks = np.ediff1d(blocks)
        period = np.mean(delta_blocks).tolist()
        standard_deviation = np.std(delta_blocks).tolist()
        number_of_blocks = len(row["blocks"])
        return row["_id"], standard_deviation, period, number_of_blocks, row["count"], row["value"], row["gas"]

    def write(self, result, debug = False):
        """
        Write the result in MongoDB.
        :param result:
        :param debug:
        :return:
        """
        output = self.spark \
            .createDataFrame(result,
                             ["address", "standard_deviation", "period", "number_of_blocks", "count", "value", "gas"])
        if debug:
            output.show()
        else:
            output.write \
                .format("com.mongodb.spark.sql.DefaultSource") \
                .option("uri", "mongodb://127.0.0.1/" + self.database + "." + self.write_collection_name) \
                .mode("append").save()

