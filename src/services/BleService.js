const noble = require("@abandonware/noble");

const BleService = function () {
  this.dev = {};

  this.initialize = (cctsUuidPart = "1ad73f5c2d4845e9") => {
    noble.on("stateChange", async (state) => {
      if (state === "poweredOn") {
        await noble.startScanningAsync([], true);
      }
    });

    noble.on("discover", (peripheral) => {
      if (
        peripheral.advertisement.serviceUuids[0] &&
        peripheral.advertisement.serviceUuids[0].startsWith(cctsUuidPart)
      ) {
        this.dev[peripheral.advertisement.serviceUuids[0]] = this.dev[
          peripheral.advertisement.serviceUuids[0]
        ]
          ? {
              ...this.dev[peripheral.advertisement.serviceUuids[0]],
              rssi: peripheral.rssi,
              timeLeft: Date.now(),
            }
          : {
              uuid: peripheral.advertisement.serviceUuids[0],
              rssi: peripheral.rssi,
              timeArrived: Date.now(),
              timeLeft: Date.now(),
            };
        console.clear();
        console.log(this.dev);
      }
    });
  };

  this.deleteDev = (serviceUuids) => {
    delete this.dev[serviceUuids];
  };
};

module.exports = BleService;
