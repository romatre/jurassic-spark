# Guida ambiente di sviluppo

1. In primo luogo occorre tirare su il contantainer relativo
a MongoDB. Visto che siamo in un ambiente di sviluppo tireremo
su il container relativo ai dati sample, quindi:

```
make mongoup_sample
```

2. A questo punto il container è up, si consiglia di utilizzare
un client come Robo 3T per verificare che sia possibile collegarsi.
La prima volta che il database verrà tirato su, esso sarà
vuoto. Per importare 10K righe di dati d'esempio utilizzare
il seguente comando:

```
make import_sample
```

3. A questo punto tutto è pronto per partire con lo sviluppo. Nella
cartella src sono presenti i vari job di Spark. L'idea è di usare
come input non l'HDFS, ma direttamente MongoDB, per fare questo
dovremo utilizzare il [connettore Spark di MongoDB](https://docs.mongodb.com/spark-connector/master/python-api/).

Per eseguire un job che faccia uso del connettore di MongoDB Spark:

```
make submit file=src/example.py
```

## Struttura di un job che faccia uso del connettore di MongoDB
Come quando si usa HDFS c'è un una sorgente di input e una path 
di output. Sfruttando il connettore di MongoDB la sorgente di input 
è una collection di MongoDB e il path di output sarà un'altra 
collection di MongoDB.

Questa cosa si definisce all'inizio del file nel seguente modo:

```
from pyspark.sql import SparkSession

spark = SparkSession \
    .builder \
    .appName("Counter") \
    .config("spark.mongodb.input.uri", "mongodb://127.0.0.1/jurassicspark.transactions") \
    .config("spark.mongodb.output.uri", "mongodb://127.0.0.1/jurassicspark.output") \
    .getOrCreate()
```

In particolare:
```
.config("spark.mongodb.input.uri", "mongodb://127.0.0.1/${DB_NAME}.${DB_COLLECTION}") \
.config("spark.mongodb.output.uri", "mongodb://127.0.0.1/${DB_NAME}.${DB_COLLECTION}") \
```

A questo punto ci recuperiamo l'rdd relativo alla collection di input:
```
rdd = spark.read.format("com.mongodb.spark.sql.DefaultSource").load().rdd
```

Eseguiamo tutte le operazioni necessarie sull'rdd come si è sempre fatto
anche su HDFS o filesystem.

Infine si prendono i risultati e si memorizzano in MongoDB.

```
output = spark.createDataFrame([
    ("count", count),
    ("count_alice", count_alice)
], ["analysis", "value"])

output.write.format("com.mongodb.spark.sql.DefaultSource").mode("append").save()
```

```spark.createDataFrame``` ha due parametri, entrambi sono degli array. Il primo
array descrive i documenti che si vuole andare a memorizzare su MongoDB, il
secondo parametro invece descrive il nome delle singole etichette del document.

Ciascun documento deve contenere almeno due campi, non è possibile aggiungere
documenti con un unico campo.


- Hasta la vista!
