const noble = require("@abandonware/noble");
const { CCTS_CONSTANTS } = require("../utils/Constants");

let dev = {};

noble.on("stateChange", async (state) => {
  if (state === "poweredOn") {
    await noble.startScanningAsync([], true);
  }
});

noble.on("discover", (peripheral) => {
  if (
    peripheral.advertisement.serviceUuids[0] &&
    peripheral.advertisement.serviceUuids[0].startsWith(
      CCTS_CONSTANTS.MSB_64_UUID_CCTS
    )
  ) {
    dev[peripheral.advertisement.serviceUuids[0]] = dev[
      peripheral.advertisement.serviceUuids[0]
    ]
      ? {
          ...dev[peripheral.advertisement.serviceUuids[0]],
          txPowerLevel: peripheral.advertisement.txPowerLevel,
          rssi: peripheral.rssi,
          timeLeft: Date.now(),
        }
      : {
          uuid: peripheral.advertisement.serviceUuids[0],
          txPowerLevel: peripheral.advertisement.txPowerLevel,
          rssi: peripheral.rssi,
          timeArrived: Date.now(),
          timeLeft: Date.now(),
        };
    console.clear();
    console.log(dev);
  }
});
