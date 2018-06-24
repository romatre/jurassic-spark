#!/usr/bin/env bash
mongoimport \
    --db jurassicspark \
    --collection $1 \
    --file $2 \
    --mode merge \
    --type json \
    --numInsertionWorkers 8
