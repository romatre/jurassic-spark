mongoup_full:
	docker-compose -f docker-compose.yml -f docker-compose-full.yml up -d

mongoup_sample:
	docker-compose -f docker-compose.yml -f docker-compose-sample.yml up -d

import:
	./bin/importer.sh $(file)

import_full:
	make import file=full_data.csv

import_sample:
	make import file=sample_data.csv

submit:
	spark-submit --driver-memory 15G --executor-memory 15G --total-executor-cores 7 --packages org.mongodb.spark:mongo-spark-connector_2.11:2.2.2 $(file)
