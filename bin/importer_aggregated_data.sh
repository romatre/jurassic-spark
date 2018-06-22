mongoimport \
    --db jurassicspark \
    --collection $1 \
    --file $2 \
    --type csv \
    --fields "address.auto(),count.auto(),value.auto(),gas.auto(),blocks.auto()" \
    --columnsHaveTypes \
    --numInsertionWorkers 8
