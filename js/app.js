const Gpio = require('pigpio').Gpio;
const express = require('express');
const app = express();

let motor = new Gpio(17, {mode: Gpio.OUTPUT});
let storeMotorSpeed = 0;
let motorSpeed = 0;
let maxMotorSpeed = 0;
let pulse = 0;
let pulseDirection = 'up';
let randomWeight = 0;
let randomDir = 1;
let randomise = false;
let debugPulseWidth = 0;

// The HelloWorld
app.get('/', (req, res) => {
    let reqSpeed = req.query.speed || false;
    let reqMaxSpeed = req.query.maxspeed || false;
    let reqPulse = req.query.pulse || false;
    let reqRandomize = req.query.randomise || false;

    if(reqRandomize){
        randomise = reqRandomize;
        if(randomise){
            setmotorRandom();
        }
    }

    if (reqSpeed) {
        storeMotorSpeed = Math.round(reqSpeed * 255);
        setMotorSpeed(storeMotorSpeed);
        if(randomise){
            setmotorRandom();
        }
    } else if (reqMaxSpeed) {
        maxMotorSpeed = Math.round(reqMaxSpeed * 255);
        // console.log(`maxMotorSpeed: ${maxMotorSpeed}`);
    } else if (reqPulse) {
        pulse = reqPulse * 1;
    } else {
        motorSpeed = 0;
        maxMotorSpeed = 0;
        pulse = 0;
    }

    if(reqMaxSpeed || reqPulse){
        pulseMotor();
    }

    res.send(JSON.stringify({
        motorSpeed,
        maxMotorSpeed,
        pulse,
        randomise,
    }));
});

const setMotorSpeed = (speed) => {
    speed = Math.min(Math.max(0, speed), 255);
    motorSpeed = Math.round(speed);
    // motor.pwmWrite(motorSpeed);
    console.log(`motorSpeed: ${motorSpeed}`);
}
const togglePulseDirection = () => {
    const dir = pulseDirection;
    pulseDirection = dir === 'up' ? 'down' : 'up';
    // console.log({debugPulseWidth});
    debugPulseWidth = 0;
};
const pulseMotor = () => {
    if (pulse === 0 || maxMotorSpeed === 0) {
        setMotorSpeed(0);
        // console.log('pulse or maxSpeed 0');
    } else if (pulse >= 95) {
        setMotorSpeed(maxMotorSpeed);
        // console.log(`setSpeed ${maxMotorSpeed}`);
    } else {
        if (pulseDirection === 'up') {
            if (motorSpeed < maxMotorSpeed) {
                setMotorSpeed(motorSpeed + ((maxMotorSpeed * pulse) / 255));
                debugPulseWidth++;
            } else {
                togglePulseDirection();
            }
        } else {
            if (motorSpeed > 0) {
                setMotorSpeed(motorSpeed - ((maxMotorSpeed * pulse) / 255));
                debugPulseWidth++;
            } else {
                togglePulseDirection();
            }
        }
        setTimeout(pulseMotor, 500);
    }
};

const setmotorRandom = () => {
    const rnd = parseInt(Math.random() * 20 + '');
    randomWeight++;
    if (randomWeight > rnd || motorSpeed === 0) {
        randomDir *= -1;
        randomWeight = 0;
        console.log('switch!');
    }
    const randVal = rnd * randomDir;
    setMotorSpeed(motorSpeed + randVal);
    if(randomise){
        setTimeout(setmotorRandom, 250);
    }
};

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`App listening on http://localhost:${port}`);
});
