const noble = require('noble');
const async = require('async');
const fs = require('fs');
const player = require('play-sound')(opts = {
	player: 'mpg321'
}); // mpg321 for .mp3 || aplay for .wav.
const PythonShell = require('python-shell');
const sh = require('sh');
const yargs = require('yargs');


/*
  NOTE: Sounds must have .mp3 extension. If wanting to play .wav, must use 'aplay'
*/

let argv = yargs.argv;

let {
	peripheralID,
	minimumPressure
	bulbColor
} = argv;

//check if the arg is specified if not, then use default.clone();

const BULB = {
	'ON': [1, 254, 0, 0, 83, 131, 16, 0, 0, 0, 0, 0, 80, 255, 0, 0, 8, 105, 121, 244],
	'OFF': [1, 254, 0, 0, 83, 131, 16, 0, 0, 0, 0, 0, 80, 0, 0, 0, 197, 234, 49, 244],
	'RED': [1, 254, 0, 0, 83, 131, 16, 0, 0, 0, 255, 0, 80, 0, 0, 0, 201, 110, 223, 244],
	'ORANGE': [1, 254, 0, 0, 83, 131, 16, 0, 165, 0, 255, 0, 80, 0, 0, 0, 146, 143, 64, 244],
	'YELLOW': [1, 254, 0, 0, 83, 131, 16, 0, 255, 0, 255, 0, 80, 0, 0, 0, 39, 86, 120, 244],
	'GREEN': [1, 254, 0, 0, 83, 131, 16, 0, 255, 0, 0, 0, 80, 0, 0, 0, 112, 48, 154, 244],
	'TEAL': [1, 254, 0, 0, 83, 131, 16, 0, 255, 255, 0, 0, 80, 0, 0, 0, 17, 20, 169, 244],
	'BLUE': [1, 254, 0, 0, 83, 131, 16, 0, 0, 255, 0, 0, 80, 0, 0, 0, 99, 199, 184, 244],
	'PURPLE': [1, 254, 0, 0, 83, 131, 16, 0, 0, 255, 255, 0, 80, 0, 0, 0, 69, 232, 5, 244]
};

const pressure = minimumPressure || 800;
const peripheralIdOrAddress = peripheralID || 'ffff7000a241';
const color = BULB[bulbColor.toUpperCase()] || BULB.ON;

console.log('Minimum Pressure = ' + pressure);

const SOUND_DIRECTORY = './sounds';

let sounds = fs.readdirSync(SOUND_DIRECTORY).filter(item => !(/(^|\/)\.[^\/\.]/g).test(item));

let soundStillPlaying = false;

let playRandomSound = (soundArray, cb = () => {}) => {
	if(soundStillPlaying) return;

	let randomSound = soundArray[getRandomInt(soundArray.length)];

	soundStillPlaying = true;

	player.play(`${SOUND_DIRECTORY}/${randomSound}`, (err) => {
		// console.log('Sound complete.');
		soundStillPlaying = false;
		cb();
	});
};

// playRandomSound(sounds);
let options = {
	mode: 'text',
	pythonOptions: ['-u']
};

let pressureSensor = new PythonShell('pressureSensor.py', options);

function changeBulbColors(characteristic, color) {
	let newBuffer = Buffer.from(color);
	characteristic.write(newBuffer);
};

function changeRandomColors(characteristic, colors) {
	if(soundStillPlaying) return;
	let colorKeys = Object.keys(colors);
	colorKeys.splice(colorKeys.indexOf('OFF'), 1);
	let randomColor = colorKeys[getRandomInt(colorKeys.length)];
	changeBulbColors(characteristic, colors[randomColor]);
};

noble.on('stateChange', state => {
	if(state === 'poweredOn') {
		console.log('Scanning');
		noble.startScanning();
	} else {
		noble.stopScanning();
	}
});

noble.on('discover', peripheral => {
	if(peripheral.id === peripheralIdOrAddress || peripheral.address === peripheralIdOrAddress) {
		// connect to the first peripheral that is scanned
		noble.stopScanning();

		const name = peripheral.advertisement.localName;
		console.log(`Connecting to '${name}' ${peripheral.id}`);
		connectAndSetUp(peripheral);
	}
});

function connectAndSetUp(peripheral) {
	peripheral.connect(error => {
		console.log('Connected to', peripheral.id);

		peripheral.discoverServices(['6666', '7777'], (error, [unknownService, lightService]) => {
			unknownService.discoverCharacteristics(['8888'], (error, [unknownCharacteristic]) => {});

			// connect to service that changes light colors!
			lightService.discoverCharacteristics(['8877'], (error, [lightCharacteristic]) => {
				// Turn bulb off on initial discover.
				changeBulbColors(lightCharacteristic, BULB.OFF);
				pressureSensor.on('message', message => {
					// message is the stdout of PressureSensor.py.
					// Prints out the current pressure from pressureSensor.py in place.
					message = padDigits(message, 4);
					process.stdout.write('\033[0G');

					process.stdout.write(`Current Pressure: ${message}`);
					if(message > pressure) {
						// Should turn on and off.
						changeBulbColors(lightCharacteristic, color);
						playRandomSound(sounds, () => {
							changeBulbColors(lightCharacteristic, BULB.OFF);
						});
					}
				})
			});
		});

	});

	peripheral.on('disconnect', () => console.log('disconnected'));
}

// utlils
function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

function padDigits(number, digits) {
	return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
}