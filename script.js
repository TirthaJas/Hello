let bluetoothDevice;
let bluetoothCharacteristic;
let connected = false;

// Connect to Bluetooth Device
document.getElementById('connectBtn').addEventListener('click', function() {
  navigator.bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: ['00001101-0000-1000-8000-00805f9b34fb'] // HC-05 SPP UUID
  })
  .then(device => {
    bluetoothDevice = device;
    return device.gatt.connect();
  })
  .then(server => {
    return server.getPrimaryService('00001101-0000-1000-8000-00805f9b34fb');
  })
  .then(service => {
    return service.getCharacteristic('00001101-0000-1000-8000-00805f9b34fb');
  })
  .then(characteristic => {
    bluetoothCharacteristic = characteristic;
    connected = true;
    document.getElementById('status').textContent = "Status: Connected";
  })
  .catch(error => {
    console.error(error);
    document.getElementById('status').textContent = "Status: Connection Failed";
  });
});

// Send command to Bluetooth device
function sendCommand(command) {
  if (connected && bluetoothCharacteristic) {
    let encoder = new TextEncoder();
    bluetoothCharacteristic.writeValue(encoder.encode(command))
    .then(() => {
      console.log(`Sent command: ${command}`);
    })
    .catch(error => {
      console.error(`Failed to send command: ${command}`);
    });
  }
}

// Voice Control Functionality
document.getElementById('voiceBtn').addEventListener('click', function() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.start();

  recognition.onresult = function(event) {
    const voiceCommand = event.results[0][0].transcript.toLowerCase();
    document.getElementById('status').textContent = `Voice Command: ${voiceCommand}`;
    
    if (voiceCommand.includes('forward')) {
      sendCommand('^');
    } else if (voiceCommand.includes('backward')) {
      sendCommand('-');
    } else if (voiceCommand.includes('left')) {
      sendCommand('<');
    } else if (voiceCommand.includes('right')) {
      sendCommand('>');
    } else if (voiceCommand.includes('stop')) {
      sendCommand('*');
    } else {
      console.log('Unknown voice command');
    }
  };
});
