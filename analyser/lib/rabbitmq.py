import pika
import socket

class RabbitMQ:

    def __init__(self, uri, queque):
        self.connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))
        self.channel = self.connection.channel()

        self.channel.exchange_declare(exchange=queque, exchange_type='fanout')

        result = self.channel.queue_declare(exclusive=True)
        self.queue_name = result.method.queue

        self.channel.queue_bind(exchange=queque, queue=self.queue_name)

    def consume(self, cb):
        self.channel.basic_consume(cb, queue=self.queue_name, no_ack=True)
        self.channel.start_consuming()

    def listen(self, host, port=10101):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.bind((host, port))
            s.listen(1)
            conn, addr = s.accept()
            dispatcher = conn.sendall
        try:
            self.consume(lambda ch, method, properties, body: dispatcher(bytes(body.decode("utf-8") + '\n', "utf-8")))
        except Exception as e:
            s.close()