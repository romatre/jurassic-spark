from lib.standard_deviation_streaming import StandardDeviationStreaming

queque = {
    "name": "transactions_from"
}

output = {
    "database": "jurassicspark",
    "collection": "std_from"
}

std = StandardDeviationStreaming(queque=queque, output=output, debug=False)
std.execute()
