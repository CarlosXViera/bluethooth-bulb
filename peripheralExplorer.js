var noble = require('noble');

noble.on('stateChange', function (state) {
	if(state === 'poweredOn') {
		noble.startScanning();
		console.log('Scanning....');
		console.log();
	} else {
		noble.stopScanning();
	}
});

noble.on('discover', function (peripheral) {
	if(peripheral.advertisement.localName == 'SBT5007') {
		console.log('Device Name: ' + peripheral.advertisement.localName);
		console.log('-------------------------');
		console.log('PeripheralID: ' + peripheral.id);
		console.log('PeripheralAddress: ' + peripheral.address);
		console.log('Connectable: ' + peripheral.connectable);
		console.log();
	};


});