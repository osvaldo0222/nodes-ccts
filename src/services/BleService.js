const logger = require("log4js").getLogger();
const noble = require("@abandonware/noble");
const { bleProps, cctsProps } = require("../shared/Props");

const BleService = function () {
  this.initialize = () => {
    noble.on("stateChange", async (state) => {
      logger.info(`BLE adapter: ${state}`);
      if (state === "poweredOn") {
        logger.info("Starting BLE scanning...");
        await noble.startScanningAsync([], true);
      } else {
        logger.error(`BLE adapter must be poweredOn for received.: ${state}`);
        logger.error(`BLE adapter actual state: ${state}`);
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
};

function deleteDev(serviceUuid) {
  delete bleProps.DEVICES[serviceUuid];
}

function getDev() {
  return bleProps.DEVICES;
}

module.exports = BleService;
module.exports.deleteDev = deleteDev;
module.exports.getDev = getDev;
