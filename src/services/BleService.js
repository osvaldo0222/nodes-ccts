const logger = require("log4js").getLogger();
const noble = require("@abandonware/noble");
const { cctsProps } = require("../shared/Props");
const Datastore = require("nedb");
const bleDB = new Datastore({
  filename: "BleDB.db", autoload: true, onload: (err) => {
    if (err) {
      logger.error("Error loading BLE-DB...");
    } else {
      logger.info("Loading databases...");
      bleDB.persistence.compactDatafile();
    }
  }
});

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
        bleDB.find({ uuid: peripheral.advertisement.serviceUuids[0] }, (err, docs) => {
          if (err) {
            logger.error(`Error finding user with uuid: ${peripheral.advertisement.serviceUuids[0]}...`);
          } else {
            if (docs.length === 0) {
              bleDB.insert({
                uuid: peripheral.advertisement.serviceUuids[0],
                rssi: peripheral.rssi,
                timeArrived: Date.now(),
                timeLeft: Date.now(),
              }, (err, newDoc) => {
                if (err) {
                  logger.error(`Error adding user with uuid: ${peripheral.advertisement.serviceUuids[0]}...`);
                }
                logger.info(`User with uuid ${peripheral.advertisement.serviceUuids[0]} in range...`);
              });
            } else {
              bleDB.update({ uuid: peripheral.advertisement.serviceUuids[0] }, {
                $set: {
                  rssi: peripheral.rssi,
                  timeLeft: Date.now()
                }
              }
                , {}, (err, numReplaced) => {
                  if (err) {
                    logger.error(`Error updating user with uuid: ${peripheral.advertisement.serviceUuids[0]}...`);
                  }
                  bleDB.persistence.compactDatafile();
                });
            }
          }
        });
      }
    });
  };
};

function deleteDev(serviceUuid) {
  bleDB.remove({ uuid: serviceUuid }, {}, (err, numRemoved) => {
    if (err) {
      logger.error(`Error removing user with uuid ${serviceUuid}`);
    }

    logger.warn(`User wit uuid ${serviceUuid} out of range...`);
    bleDB.persistence.compactDatafile();
  });
}

function getBleDB() {
  return bleDB;
}

module.exports = BleService;
module.exports.deleteDev = deleteDev;
module.exports.getBleDB = getBleDB;
