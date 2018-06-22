mongoup_full:
	docker-compose -f docker-compose.yml -f docker-compose-full.yml up -d

mongoup_sample:
	docker-compose -f docker-compose.yml -f docker-compose-sample.yml up -d

import:
	./analyser/bin/importer.sh $(file)

import_full:
	make import file=./analyser/full_data.csv

import_sample:
	make import file=./analyser/sample_data.csv

import_aggregated_data:
	curl -O -L https://www.dropbox.com/s/imolmxsaohzzbum/aggregated_transactions_from_min_20_tx.csv.tar.gz?dl=1
	tar -xzvf aggregated_transactions_from_min_20_tx.csv.tar.gz?dl=1
	rm aggregated_transactions_from_min_20_tx.csv.tar.gz?dl=1
	./analyser/bin/importer_aggregated_data.sh aggregated_transactions_from_min_20_tx aggregated_transactions_from_min_20_tx.csv
	curl -O -L https://www.dropbox.com/s/3qzgl363wxswzii/aggregated_transactions_to_min_20_tx.csv.tar.gz?dl=1
	tar -xzvf aggregated_transactions_to_min_20_tx.csv.tar.gz?dl=1
	rm aggregated_transactions_to_min_20_tx.csv.tar.gz?dl=1
	./analyser/bin/importer_aggregated_data.sh aggregated_transactions_to_min_20_tx aggregated_transactions_to_min_20_tx.csv
	rm aggregated_transactions_from_min_20_tx.csv
	rm aggregated_transactions_to_min_20_tx.csv

submit:
	spark-submit --driver-memory 15G --executor-memory 15G --total-executor-cores 7 --packages org.mongodb.spark:mongo-spark-connector_2.11:2.2.2 $(file)

docker-build-streamer:
	docker build -t jurassicspark/streamer ./streamer
