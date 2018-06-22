mongoimport \
    --db jurassicspark \
    --collection transactions \
    --file $1 \
    --type csv \
    --fields "hashTx.auto(),timestamp.auto(),blockNumber.auto(),from.auto(),to.auto(),gas.auto(),gasPrice.auto(),value.auto()" \
    --columnsHaveTypes \
    --numInsertionWorkers 8
