mongoup_full:
	docker-compose -f docker-compose.yml -f docker-compose-full.yml up -d

mongoup_sample:
	docker-compose -f docker-compose.yml -f docker-compose-sample.yml up -d

import:
	./analyser/bin/importer.sh $(file)

import_full:
	make import file=./full_data.csv

import_sample:
	curl -O -L https://www.dropbox.com/s/zz6hj6aeo3p9t11/sample_data.csv.tar.gz?dl=1			
	tar -xzvf sample_data.csv.tar.gz?dl=1
	make import file=./sample_data.csv
	rm sample_data.csv.tar.gz?dl=1
	rm sample_data.csv

import_aggregated_sample_data:
	curl -L -o aggregated_transactions_to_10000.json.tar.gz  https://drive.google.com/uc\?id\=1ewbigbOa89r0tgui47sPClcVdbESYzSD\&export\=download
	curl -L -o aggregated_transactions_from_10000.json.tar.gz https://drive.google.com/uc?id\=1i2S0bUjm1BMSVgWCkmDv1HVnCAm1S3vD\&export\=download
	tar -xzvf aggregated_transactions_to_10000.json.tar.gz
	tar -xzvf aggregated_transactions_from_10000.json.tar.gz
	rm aggregated_transactions_to_10000.json.tar.gz
	rm aggregated_transactions_from_10000.json.tar.gz
	./analyser/bin/importer_aggregated_data.sh aggregated_transactions_to_10000 aggregated_transactions_to_10000.json
	./analyser/bin/importer_aggregated_data.sh aggregated_transactions_from_10000 aggregated_transactions_from_10000.json
	rm aggregated_transactions_to_10000.json
	rm aggregated_transactions_from_10000.json

submit:
	spark-submit 	--driver-memory 15G \
					--executor-memory 15G \
					--total-executor-cores 7 \
					--packages org.mongodb.spark:mongo-spark-connector_2.11:2.2.2 \
					$(file)

bulk_from_sample:
	make submit file=./analyser/bulk_std_from_10000.py

bulk_to_sample:
	make submit file=./analyser/bulk_std_to_10000.py

bulk_from:
	make submit file=./analyser/bulk_std_from.py

bulk_to:
	make submit file=./analyser/bulk_std_to.py

docker-build-streamer:
	docker build -t jurassicspark/streamer ./streamer
