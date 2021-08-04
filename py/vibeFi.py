from flask import Flask, request
from threading import Thread
from gpiozero import Motor
import json
app = Flask(__name__)

speed_g = 0
M1A = 17
M1B = 18
motor = Motor(M1A, M1B)


def thread():
    while True:
        motor.forward(speed_g)
        time.sleep(1)

@app.route("/")
def index():
    speed = request.args.get("speed")
    if speed is None:
        speed = 0
    speed_g = speed
    return speed

@app.errorhandler(Exception)
def handle_exception(e):
    return e

if __name__ == "__main__":
    test = Thread(target=thread, args=())
    test.start()
    app.run(host='0.0.0.0', threaded=True)
