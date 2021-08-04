from gpiozero import LED, Button, Buzzer
import pigpio
from time import sleep

pi = pigpio.pi()

# sw1 = Button(21)
# sw2 = Button(16)
# sw3 = Button(20)
# buzzer = Buzzer(26)

M1A = 17
M1B = 18

pi.set_mode(M1A, pigpio.OUTPUT)
pi.set_mode(M1B, pigpio.OUTPUT)

def motorSpeed(speedRight):
    if speedRight > 0:
        pi.set_PWM_dutycycle(M1A, speedRight)
        pi.set_PWM_dutycycle(M1B, 0)
    else:
        pi.set_PWM_dutycycle(M1A, 0)
        pi.set_PWM_dutycycle(M1B, abs(speedRight))


motorSpeed(0)

try:
    while True:
        motorSpeed(200)
        sleep(1)
        motorSpeed(-100)
        sleep(1)
        motorSpeed(0)
        sleep(1)

except KeyboardInterrupt:
    pi.set_PWM_dutycycle(M1A, 0)
    pi.set_PWM_dutycycle(M1B, 0)