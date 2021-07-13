from flask import Flask
from flask import request
app = Flask(__name__)

@app.route("/")
def index():
    speed = request.args.get("speed")
    if speed is None:
        speed = 0

    return "{\"speed\": " + str(speed) + "}"


if __name__ == "__main__":
  app.run(host='0.0.0.0',debug=True)
