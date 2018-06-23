from _operator import add, itemgetter
from pyspark import SparkContext
from pyspark.streaming import StreamingContext
from lib.rabbitmq import RabbitMQ
import json
rabbitMq = RabbitMQ("uri", "transaction")
socket_port = 10101
polling_time = 1

sc = SparkContext(appName="PythonSqlNetworkWordCount")
ssc = StreamingContext(sc, polling_time)

lines = ssc.socketTextStream("localhost", socket_port)

result = lines.map(json.loads).map(lambda x: int(x["value"])).reduce(add)

# ogni secondo stampa la somma dei value fetchati
result.pprint()

try:
    ssc.start()
    rabbitMq.listen("localhost", socket_port)
except Exception as e:
    ssc.awaitTermination()
