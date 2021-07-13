from gpiozero import LED, Button, Buzzer
import pigpio
from time import sleep

pi = pigpio.pi()

sw1 = Button(21)
sw2 = Button(16)
sw3 = Button(20)
buzzer = Buzzer(26)

M1A = 17
M1B = 18
M2A = 27
M2B = 22

pi.set_mode(M1A, pigpio.OUTPUT)
pi.set_mode(M1B, pigpio.OUTPUT)
pi.set_mode(M2A, pigpio.OUTPUT)
pi.set_mode(M2B, pigpio.OUTPUT)

def motorSpeed(speedLeft, speedRight):
    if speedLeft > 0:
        pi.set_PWM_dutycycle(M2A, speedLeft)
        pi.set_PWM_dutycycle(M2B, 0)
    else:
        pi.set_PWM_dutycycle(M2A, 0)
        pi.set_PWM_dutycycle(M2B, abs(speedLeft))

    if speedRight > 0:
        pi.set_PWM_dutycycle(M1A, speedRight)
        pi.set_PWM_dutycycle(M1B, 0)
    else:
        pi.set_PWM_dutycycle(M1A, 0)
        pi.set_PWM_dutycycle(M1B, abs(speedRight))

def sw1Pressed():
    motorSpeed(200, 200)

def sw2Pressed():
    motorSpeed(-100, -100)

def sw3Pressed():
    motorSpeed(0, 0)

sw1.when_pressed = sw1Pressed
sw2.when_pressed = sw2Pressed
sw3.when_pressed = sw3Pressed

motorSpeed(0, 0)
buzzer.beep(0.1, 0.1, 1)

try:
    while True:
        sleep(1)

except KeyboardInterrupt:
    pi.set_PWM_dutycycle(M1A, 0)
    pi.set_PWM_dutycycle(M1B, 0)
    pi.set_PWM_dutycycle(M2A, 0)
    pi.set_PWM_dutycycle(M2B, 0)