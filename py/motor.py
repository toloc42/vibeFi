from gpiozero import Motor
import time

M1A = 17
M1B = 18
motor = Motor(M1A, M1B)
motorSpeed = 0
speed = "50"

while True:
    try:
#         speed = "100"
#         if speed is None:
#             speed = 0
#         speed = float(speed)/100

        motor.forward(0.5)
#         motorSpeed = motor.value
#         print(motorSpeed)
        time.sleep(10)

    except KeyboardInterrupt:
        motor.stop()
        break