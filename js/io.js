/*utils*/
function throttle (fn, threshhold, scope) {
    threshhold || (threshhold = 250);
    let last,
        deferTimer;
    return function () {
        const context = scope || this;

        const now = +new Date,
            args = arguments;
        if (last && now < last + threshhold) {
            // hold on to it
            clearTimeout(deferTimer);
            deferTimer = setTimeout(function () {
                last = now;
                fn.apply(context, args);
            }, threshhold);
        } else {
            last = now;
            fn.apply(context, args);
        }
    };
}

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
const debounce = (func, wait, immediate) => {
    let timeout;
    return function () {
        const context = this, args = arguments;
        const later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

const round5 = (x) => {
    return Math.round(x / 5) * 5;
};

const resetAllInputs = () => {
    setMotorSpeed(0);
    setMaxMotorSpeed(0);
    setPulse(0);
    setRandomise(false);
    const inputs = document.getElementsByTagName('input');
    for (let input of inputs) {
        input.value = 0;
    }
};

/*storage*/
const settingsStore = {
    activeTab: '',
    motorSpeed: 0,
    maxMotorSpeed: 0,
    pulse: 0,
    pulseDirection: 'up',
    randomWeight: 0,
    randomDir: 1,
    randomise: false,
};
const settings = new Proxy(settingsStore, {
    set: function (target, key, value) {
        // console.log(`${key} set to ${value}`);
        throttledSetOutput(key, value);
        target[key] = value;
        return true;
    }
});
const setOutput = (key, value) => {
    const output = document.getElementById(key + 'Out');
    output && (output.innerHTML = Math.round(value));
};
const throttledSetOutput = throttle(setOutput, 150);

const _touch = ('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);
const eventsStart = _touch ? 'touchstart' : 'mousedown';
const eventsStop = _touch ? 'touchend' : 'mouseup';
const eventsMove = _touch ? 'touchmove' : 'mousemove';
const eventsClick = _touch ? 'touchend' : 'click';
const eventsSlideEnd = ['change', eventsStop];

/* navigation */
const button = document.getElementById('sideMenuToggle');
button.addEventListener(eventsClick, _ => {
    document.getElementById('sidebar').classList.toggle('collapsed');
    document.getElementById('sideMenuToggle').classList.toggle('sidebarExpanded');
});

const smLinks = document.getElementsByClassName('sideBarLinkAnchor');
for (let link of smLinks) {
    link.addEventListener(eventsClick, _ => {
        // _.preventDefault();
        resetAllInputs();
        document.getElementById('sidebar').classList.add('collapsed');
        document.getElementById('sideMenuToggle').classList.remove('sidebarExpanded');
        activatePanel(_.target.dataset['tab']);
    });
}
const activatePanel = (id) => {
    const panels = document.getElementsByClassName('panel');
    if (id === settings.activeTab) {
        return false;
    }
    settings.activeTab = id;
    for (let panel of panels) {
        panel.classList.remove('active');
    }
    document.getElementById(id).classList.add('active');
};

document.addEventListener('DOMContentLoaded', (ev) => {
    let activePanel = 'onoff';
    if (window.location.hash.length) {
        activePanel = window.location.hash.substr(1);
    }
    activatePanel(activePanel);
});

/*input listeners*/
/*onoff*/
const onoffcheck = document.getElementById('onoffcheck');
onoffcheck.addEventListener('change', (event) => {
    let motorSpeed = (event.currentTarget.checked) ? 100 : 0;
    setMotorSpeed(motorSpeed);
});

/*plusminus*/
const plusminus = document.getElementsByClassName('plusminus');
for (let pm of plusminus) {
    pm.addEventListener('contextmenu', e => {
        e.preventDefault();
    });
    pm.addEventListener(eventsStart, (event) => {
        event.currentTarget.classList.add('active');
    });
    pm.addEventListener(eventsStop, (event) => {
        event.currentTarget.classList.remove('active');
    });
}
const plus = document.getElementById('plus');
plus.addEventListener(eventsClick, _ => {
    setMotorSpeed(round5(settings.motorSpeed + 5));
});
const minus = document.getElementById('minus');
minus.addEventListener(eventsClick, _ => {
    setMotorSpeed(round5(settings.motorSpeed - 5));
});

/*slider*/
const inputSlider = document.getElementById('input_slider');
inputSlider.addEventListener('input', (event) => {
    let motorSpeed = (event.currentTarget.value);
    event.currentTarget.style.filter = `saturate(${50 + motorSpeed * 1}%)`;
    motorSpeed < 10 && (motorSpeed = 0);
    throttledSetMotorSpeed(round5(motorSpeed));
});
for (let eventEnd of eventsSlideEnd) {
    inputSlider.addEventListener(eventEnd, (event) => {
        let motorSpeed = (event.currentTarget.value);
        event.currentTarget.style.filter = `saturate(${50 + motorSpeed * 1}%)`;
        setMotorSpeed(round5(motorSpeed));
    });
}

/*dualslider*/
const inputDualsliderPower = document.getElementById('input_dualslider_power');
inputDualsliderPower.addEventListener('input', (event) => {
    let motorSpeed = (event.currentTarget.value);
    event.currentTarget.style.filter = `saturate(${50 + motorSpeed * 1}%)`;
    motorSpeed < 10 && (motorSpeed = 0);
    throttledSetMaxMotorSpeed(round5(motorSpeed));
});
for (let eventEnd of eventsSlideEnd) {
    inputDualsliderPower.addEventListener(eventEnd, (event) => {
        let motorSpeed = (event.currentTarget.value);
        event.currentTarget.style.filter = `saturate(${50 + motorSpeed * 1}%)`;
        setMaxMotorSpeed(round5(motorSpeed));
    });
}
const inputDualsliderPulse = document.getElementById('input_dualslider_pulse');
inputDualsliderPulse.addEventListener('input', (event) => {
    let pulse = (event.currentTarget.value);
    event.currentTarget.style.filter = `saturate(${50 + pulse * 1}%)`;
    pulse < 10 && (pulse = 0);
    throttledSetPulse(round5(pulse));
});
for (let eventEnd of eventsSlideEnd) {
    inputDualsliderPulse.addEventListener(eventEnd, (event) => {
        let pulse = (event.currentTarget.value);
        event.currentTarget.style.filter = `saturate(${50 + pulse * 1}%)`;
        setPulse(round5(pulse));
    });
}

/*simpleTouch*/
const simpleTouchPad = document.getElementById('simpleTouchPad');
simpleTouchPad.addEventListener('contextmenu', e => {
    e.preventDefault();
});
simpleTouchPad.addEventListener(eventsStart, (event) => {
    setMotorSpeed(100);
    event.currentTarget.classList.add('active');
});
simpleTouchPad.addEventListener(eventsStop, (event) => {
    setMotorSpeed(0);
    event.currentTarget.classList.remove('active');
});

/*slideTouch*/

const inputSlideTouch = document.getElementById('input_slide_touch');
inputSlideTouch.addEventListener('input', (event) => {
    let motorSpeed = (event.currentTarget.value);
    event.currentTarget.style.filter = `saturate(${50 + motorSpeed * 1}%)`;
    motorSpeed < 10 && (motorSpeed = 0);
    throttledSetMotorSpeed(round5(motorSpeed));
});
inputSlideTouch.addEventListener('change', (event) => {
    let motorSpeed = (event.currentTarget.value);
    event.currentTarget.style.filter = `saturate(${50 + motorSpeed * 1}%)`;
    setMotorSpeed(round5(motorSpeed));
});
inputSlideTouch.addEventListener(eventsStop, (event) => {
    event.currentTarget.value = 0;
    event.currentTarget.style.filter = `saturate(50%)`;
    setMotorSpeed(0);
});

/*dynamic touch*/
const pulseTouchPad = document.getElementById('pulseTouchPad');
const pulseTouchPadWrapper = document.getElementById('pulseTouchPadWrapper');
pulseTouchPad.addEventListener('contextmenu', e => {
    e.preventDefault();
});
pulseTouchPad.addEventListener(eventsStart, (event) => {
    pulseTouchPadWrapper.classList.add('active');
    pulseTouchPadMove(event);
    // pulseMotor();
    pulseTouchPad.addEventListener(eventsMove, throttledPulseTouchPadMove);
    document.addEventListener(eventsStop, documentPulsePadReset);
});
pulseTouchPad.addEventListener(eventsStop, (event) => {
    setMotorSpeed(0);
    setMaxMotorSpeed(0);
    setPulse(0);
    pulseTouchPadWrapper.classList.remove('active');
    pulseTouchPad.removeEventListener(eventsMove, throttledPulseTouchPadMove);
    document.removeEventListener(eventsStop, documentPulsePadReset);
});
const documentPulsePadReset = (event) => {
    setMaxMotorSpeed(0);
    setPulse(0);
    pulseTouchPadWrapper.classList.remove('active');
    pulseTouchPad.removeEventListener(eventsMove, throttledPulseTouchPadMove);
}

const pulseTouchPadMove = (event) => {
    const touchhighlight = document.getElementById('touchhighlight');
    const data = _touch ? event.touches[0] : event;
    const el = event.currentTarget || event.target;

    const relX = data.pageX - el.offsetLeft;
    let percX = round5((relX / el.offsetWidth) * 100);
    percX = Math.min(Math.max(0, percX), 100);

    const relY = el.offsetHeight - (data.pageY - el.offsetTop);
    let percY = round5((relY / el.offsetHeight) * 100);
    percY = Math.min(Math.max(0, percY), 100);

    touchhighlight.style.top = `${100 - percY}%`;
    touchhighlight.style.left = `${percX}%`;

    let restartPulse = false;
    if (settings.pulse === 100 && percX !== 100
        || settings.pulse === 0 && percX !== 0
        || settings.maxMotorSpeed === 0 && percY !== 0) {
        restartPulse = true;
    }
    if (settings.maxMotorSpeed !== percY) {
        throttledSetMaxMotorSpeed((percY));
        throttledSetMotorSpeed((percY));
    }
    if (settings.pulse !== percY) {
        throttledSetPulse((percX));
    }
    // restartPulse && pulseMotor();
};
const throttledPulseTouchPadMove = throttle(pulseTouchPadMove, 50);

/*pulse graph*/

/* TODO pulse graph */

function reqListener () {
    console.log(this.responseText);
}

/*motor control*/
const setMotorSpeed = (speed) => {
    //clamp speed between 0 and 100;
    speed = Math.round(speed * 100) / 100;
    speed = Math.min(Math.max(0, speed), 100);
    if (settings.motorSpeed !== speed) {
        settings.motorSpeed = speed;
        const oReq = new XMLHttpRequest();
        oReq.addEventListener('load', reqListener);
        const loc = window.location;
        oReq.open('GET', `${loc.protocol}//${loc.hostname}:690?speed=${speed/100}`);
        oReq.send();
    }
};
const throttledSetMotorSpeed = throttle(setMotorSpeed, 50);
const debouncedSetMotorSpeed = debounce(setMotorSpeed, 50);

const setMaxMotorSpeed = (maxspeed) => {
    //clamp speed between 0 and 100;
    maxspeed = Math.min(Math.max(0, maxspeed), 100);
    if (settings.maxMotorSpeed !== maxspeed) {
        settings.maxMotorSpeed = maxspeed;
        settings.motorSpeed = settings.pulse ? maxspeed : 0;
        const oReq = new XMLHttpRequest();
        oReq.addEventListener('load', reqListener);
        const loc = window.location;
        oReq.open('GET', `${loc.protocol}//${loc.hostname}:690?maxspeed=${maxspeed/100}`);
        oReq.send();
    }
};
const throttledSetMaxMotorSpeed = throttle(setMaxMotorSpeed, 50);
const debouncedSetMaxMotorSpeed = debounce(setMaxMotorSpeed, 50);

const setPulse = (pulse) => {
    pulse = Math.min(Math.max(0, pulse), 100);
    if (settings.pulse !== pulse) {
        settings.pulse = pulse;
        settings.motorSpeed = pulse ? settings.maxMotorSpeed : 0;
        const oReq = new XMLHttpRequest();
        oReq.addEventListener('load', reqListener);
        const loc = window.location;
        oReq.open('GET', `${loc.protocol}//${loc.hostname}:690?pulse=${pulse}`);
        oReq.send();
    }
};
const throttledSetPulse = throttle(setPulse, 50);
const debouncedSetPulse = debounce(setPulse, 50);

const togglePulseDirection = () => {
    const dir = settings.pulseDirection;
    settings.pulseDirection = dir === 'up' ? 'down' : 'up';
};

const pulseMotor = () => {
    if (settings.pulse === 0 || settings.maxMotorSpeed === 0) {
        setMotorSpeed(0);
        // console.log('pulse or maxSpeed 0');
    } else if (settings.pulse === 100) {
        setMotorSpeed(settings.maxMotorSpeed);
        // console.log('maxSpeed 100');
    } else {
        if (settings.pulseDirection === 'up') {
            if (settings.motorSpeed < settings.maxMotorSpeed) {
                setMotorSpeed(settings.motorSpeed + (settings.pulse / 50));
            } else {
                togglePulseDirection();
            }
        } else {
            if (settings.motorSpeed > 0) {
                setMotorSpeed(settings.motorSpeed - (settings.pulse / 50));
            } else {
                togglePulseDirection();
            }
        }
        setTimeout(pulseMotor, 500);
    }
};

const setRandomise = (randomise) => {
    settings.randomise = randomise;
    oReq.addEventListener('load', reqListener);
    const loc = window.location;
    oReq.open('GET', `${loc.protocol}//${loc.hostname}:690?randomise=${randomise}`);
    oReq.send();
}

/*reset on startup*/
resetAllInputs();
setMotorSpeed(0);
setMaxMotorSpeed(0);
setPulse(0);
