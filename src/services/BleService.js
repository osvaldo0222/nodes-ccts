const noble = require("@abandonware/noble");
const { bleProps, cctsProps } = require("../shared/Props");

const BleService = function () {
  this.initialize = () => {
    noble.on("stateChange", async (state) => {
      if (state === "poweredOn") {
        console.log("[...] Starting BLE scanning");
        await noble.startScanningAsync([], true);
      }
    });

    noble.on("discover", (peripheral) => {
      if (
        peripheral.advertisement.serviceUuids[0] &&
        peripheral.advertisement.serviceUuids[0].startsWith(
          cctsProps.MSB_64_UUID_CCTS
        )
      ) {
        bleProps.DEVICES[peripheral.advertisement.serviceUuids[0]] = bleProps
          .DEVICES[peripheral.advertisement.serviceUuids[0]]
          ? {
              ...bleProps.DEVICES[peripheral.advertisement.serviceUuids[0]],
              rssi: peripheral.rssi,
              timeLeft: Date.now(),
            }
          : {
              uuid: peripheral.advertisement.serviceUuids[0],
              rssi: peripheral.rssi,
              timeArrived: Date.now(),
              timeLeft: Date.now(),
            };
      }
    });
  };

  this.deleteDev = (serviceUuids) => {
    delete bleProps.DEVICES[serviceUuids];
  };

  this.getDev = () => {
    return bleProps.DEVICES;
  };
};

module.exports = BleService;
