import os
import time
from datetime import timedelta
from psutil._compat import basestring
from functools import update_wrapper
import requests
from flask import Flask, Response, current_app, request, make_response, render_template
import gevent.pywsgi as wsgi
from geventwebsocket.handler import WebSocketHandler
import werkzeug.serving
from gevent import monkey, sleep
import time
from collections import defaultdict
from confluent_kafka import Consumer, Producer, KafkaError
import json
from elasticapm.contrib.flask import ElasticAPM
from elasticapm.handlers.logging import LoggingHandler
import logging
import uuid

# need to patch sockets to make requests async
monkey.patch_all()

CHUNK_SIZE = 1024*1024

app = Flask(__name__)

app.config['ELASTIC_APM'] ={
    'SERVICE_NAME': 'dns_observer',
    'SECRET_TOKEN': 'nothing',
    # 'SERVER_URL': 'http://192.168.2.12:8000'
}

apm = ElasticAPM(app)


session = ""
global session
a = None
global a
qi = -1
global qi

aa = []
global aa
ws = None
global ws
c= None
global c

aa2 = []
global aa2
ws2 = None
global ws2
c2= None
global c2


def redis_channel(host='127.0.0.1', port=6379, db=0, charset='utf-8', decode_responses=True, key='suricata'):
    r = redis.StrictRedis(host=host, port=port, db=db, charset=charset, decode_responses=decode_responses)
    p = r.pubsub()
    p.subscribe(key)

    return p


def redis_publish(host='127.0.0.1', port=6379, db=0, charset='utf-8', decode_responses=True, key='test'):
    i = 0
    r = redis.StrictRedis(host=host, port=port, db=db, charset=charset, decode_responses=decode_responses)
    while True:
        i += 1
        r.publish(channel=key, message='hello : '+str(i))
        sleep(0.5)
        if i > 100:
            break


def kafka_channel(topics):
    global a
    a = uuid.uuid4()
    consumer = Consumer({
        "bootstrap.servers": "192.168.2.12:9092",
        'group.id': str(a),
        'socket.timeout.ms': '1000',
        'session.timeout.ms': 60000,
        'auto.offset.reset': 'latest', # latest
        # 'session.timeout.ms': 5000
    })

    consumer.subscribe(topics)
    return consumer


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/hello')
def hello():
    global qi

    suricata_stack = [
        ("/usr/local/etc/suricata/suricata1.yaml", "/home/var/pcap/eve1.json"),
        ("/usr/local/etc/suricata/suricata2.yaml", "/home/var/pcap/eve2.json"),
        ("/usr/local/etc/suricata/suricata3.yaml", "/home/var/pcap/eve3.json"),
        ("/usr/local/etc/suricata/suricata4.yaml", "/home/var/pcap/eve4.json"),
        ("/usr/local/etc/suricata/suricata5.yaml", "/home/var/pcap/eve5.json")
    ]

    qi = (qi + 1) % len(suricata_stack)
    item = suricata_stack[qi]

    st = time.time()
    msg = None
    json_path = item[1]

    with subprocess.Popen("suricata -c " + item[0] + " -r ./bigFlows.pcap", shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE) as pf:
        x, y = pf.communicate()
        x = x.decode('utf-8').strip()
        y = y.decode('utf-8').strip()
        msg += "\n\n stdout: " + x
        msg += "\n\n stderr: " + y

    msg += "\n" + str(time.time() - st) + " sec taken"
    print(msg)
    return Response(str(msg))


@app.route('/dns')
def dns():

    def dns_gen():

        global aa
        global c

        if request.environ.get('wsgi.websocket'):
            ws_ = request.environ['wsgi.websocket']

            try:
                if c is None:
                    c = kafka_channel(['suricata12mod'])
                    while True:
                        # msg = c.poll()
                        msg = c.consume(num_messages=1000)
                        if msg:
                            for i in msg:
                                flag = 0
                                try:
                                    # print("Value : ", i.value())
                                    MSG = json.loads(i.value().decode('utf-8'))

                                    if len(aa) > 0:

                                        for j, v in enumerate(aa):
                                            if MSG['rrname'] == v['rrname']:
                                                aa[j] = MSG
                                                flag += 1
                                                break

                                        if flag == 0:
                                            aa.append(MSG)

                                    else:
                                        aa.append(MSG)

                                    # print(len(aa))

                                except Exception as e:
                                    # print('error', e)
                                    continue

                            aa = sorted(aa, key=lambda k: k['count(rrname)'], reverse=True)
                            ws_.send(json.dumps(aa[:40]))
                            aa = aa[:1000]
                            sleep(1)
                        else:
                            sleep(1)

                else:
                    _aa = []
                    while True:
                        if _aa == aa:
                            pass
                        else:
                            ws_.send(json.dumps(aa[:40]))
                        sleep(1)

            except Exception as e:
                print('dns : \n\n', e)

    return Response(dns_gen())


@app.route('/dns2')
def dns2():

    def dns_gen2():

        global aa2
        global c2

        if request.environ.get('wsgi.websocket'):
            ws_ = request.environ['wsgi.websocket']

            try:
                if c2 is None:
                    c2 = kafka_channel(['suricata12'])
                    while True:
                        msg = c2.consume(num_messages=2000, timeout=3)
                        if msg:
                            print("Length of msg : ", len(msg))

                            for i in msg:
                                flag = 0
                                try:
                                    MSG = json.loads(i.value().decode('utf-8'))
                                    if len(aa2) > 0:

                                        for j, v in enumerate(aa2):
                                            if MSG['rrname'] == v['rrname']:
                                                flag += 1
                                                aa2[j]['count(rrname)'] = MSG['count(rrname)']
                                                if MSG['count(rrname)'] < v['count(rrname)']:
                                                    print("Smaller than")
                                                else:
                                                    print("Larger than")
                                                break

                                        if flag == 0:
                                            aa2.append(MSG)

                                    else:
                                        aa2.append(MSG)

                                    # print(len(aa))

                                except Exception as e:
                                    continue

                            aa3 = sorted(aa2, key=lambda k: k['count(rrname)'], reverse=True)
                            ws_.send(json.dumps(aa3[:50]))
                            aa2 = aa3[:1000]
                            del aa3
                            sleep(0.1)
                        else:
                            print("No Data!!")
                            sleep(1)

                else:
                    _aa = []
                    while True:
                        if _aa == aa2:
                            pass
                        else:
                            ws_.send(json.dumps(aa2[:200]))
                        sleep(1)

            except Exception as e:
                print('dns2 : \n\n', e)

        else:
            print("What are you doing now?!")

    return Response(dns_gen2())


@app.route('/test')
def seattle(requests_counter=[0]):

    requests_counter[0] += 1
    request_num = requests_counter[0]

    app.logger.debug('started %d', request_num)

    def generator():
        for i in range(0, 1000):
            time.sleep(0.2)
            yield str(i)+'\n'
        app.logger.debug('finished %d', request_num)

    return Response(generator())


def main():
    # print('APM python server...')
    # handler = LoggingHandler(client=apm.client)
    # handler.setLevel(logging.INFO)
    # app.logger.addHandler(handler)

    print('Start python server...')
    app.debug = False
    gevent_server = wsgi.WSGIServer(('0.0.0.0', 8000), app, handler_class=WebSocketHandler)
    gevent_server.serve_forever()


if __name__ == '__main__':
    main()
