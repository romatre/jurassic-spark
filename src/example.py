from _operator import add, itemgetter
from pyspark.sql import SparkSession
import numpy as np

spark = SparkSession \
    .builder \
    .appName("Counter") \
    .config("spark.mongodb.input.uri", "mongodb://127.0.0.1/jurassicspark.aggregated_transactions_to_min_20_tx") \
    .config("spark.mongodb.input.partitioner", "MongoSamplePartitioner") \
    .config("spark.mongodb.input.partitionerOptions.partitionSizeMB", "6000") \
    .config("spark.mongodb.output.uri", "mongodb://127.0.0.1/jurassicspark.standard_deviation_to_min_20_tx") \
    .getOrCreate()

rdd = spark.read.format("com.mongodb.spark.sql.DefaultSource").load().rdd


def delta_blocks(row):
    """
    This function calculate the difference between an array of blocks.
    :param row:
    :return:
    """
    delta_blocks = np.ediff1d(np.sort(row[1]))
    period = np.mean(delta_blocks)
    standard_deviation = np.std(delta_blocks)
    return row[0], row[2], standard_deviation.tolist(), period.tolist(), delta_blocks.size, row[3]

result = rdd\
    .map(lambda row: (row["_id"], row["blocks"], row["count"], row["value"])) \
    .map(delta_blocks) \
    .filter(lambda row: row[2] < 3)

output = spark.createDataFrame(result, ["from", "number_of_transactions", "standard_deviation", "period", "number_of_blocks", "value"])
#output.show()

output.write.format("com.mongodb.spark.sql.DefaultSource").mode("append").save()
