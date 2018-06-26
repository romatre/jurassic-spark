from lib.standard_deviation_streaming import StandardDeviationStreaming

queque = {
    "name": "INBOUND_TRANSACTIONS"
}

output = {
    "database": "jurassicspark",
    "collection": "std_from"
}

std = StandardDeviationStreaming(queque=queque, output=output, debug=True)
std.execute()
