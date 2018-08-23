
### Usage:
#### Note: Sound files must be copied to `sound` folder for music to play. Remove example sounds.
 
1. Pair bluetooth device and select it as sound output.
2. Navigate to the `bluetooth-bulb` folder.
3. Run `yarn start`.
4. Press Pressure Sensor.

### Options:

These options can be tacked on to `yarn start` like so: `yarn start --bulbColor=RED --minimumPressure=200`.

- `--peripheralID=XXXXXXXXXX` changes the default id of bluetooth bulb.
- `--bulbColor=XXXXXXXXX` changes the default color (ON/White).
  - Can be: `ON` (white), `OFF` (no color), `RED`, `GREEN`, `BLUE`, `TEAL`, `PURPLE`, `ORANGE`, or `YELLOW`.
- `--minimumPressure=XXXX` changes minimum pressure needed to turn on bulb. Default: 800. Value from 0 - 1023.





### Known issues:

* Program scans, but does not connect to peripheral.
  - It's possible that `peripheralID` has changed. SOLUTION: type `yarn explore` in the command line to see available bluetooth devices and copy the ID for SBT5007. Then run `yarn start --peripheralID=COPIEDID`.


* Program scans, connects, but then disconnects.
  - This rarely happens, it's due to the bluetooth chip on the the PI.
  SOLUTION: Turn off bluetooth, repair device, select as an audio output and run program again.


* Bulb lights up, but no sound.
  - SOLUTION: Make sure all sounds in the sounds folder have an .mp3 extension.
  - SOLUTION: Make sure bluetooth speaker is connected and is the default sound output.
