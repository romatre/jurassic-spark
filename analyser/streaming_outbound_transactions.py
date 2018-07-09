from lib.standard_deviation_streaming import StandardDeviationStreaming

queque = {
    "name": "OUTBOUND_TRANSACTIONS"
}

output = {
    "database": "jurassicspark",
    "collection": "std_to"
}

std = StandardDeviationStreaming(queque=queque, output=output, debug=False)
std.execute()
