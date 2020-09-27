/**
 * Script to power on the GPRS module.
 * 
 */
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const Gpio = require("onoff").Gpio;
const logger = require("log4js").getLogger();

/**
 * Delay function
 * @param {*} ms 
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Function to check if GPRS if active.
 */
async function checkGPRS() {
    return await exec("ifconfig ppp0");
};

/**
 * Power key for gprs module.
 * On GPIO 4 (pin 7) as output, write a 0, then hold for 4 seg and write a 1.
 * 
 */
async function toogleGPRSModule() {
    logger.warn("Toogling gprs module...");

    //GPRS Power Key
    let gsmPowerPin = new Gpio(4, 'out');
    gsmPowerPin.writeSync(0);
    await sleep(4000);
    gsmPowerPin.writeSync(1);
    gsmPowerPin.unexport();

    return true;
};

async function run() {
    /* let configure = false;
     let toogle = false;
 
     while (!configure) {
         await checkGPRS().then(({ stdout, stderr }) => {
             console.log("good")
             configure = true;
         }).catch(async () => {
             if (!toogle) {
                 logger.warn("Powering on GPRS...");
                 toogle = await toogleGPRSModule();
                 logger.info("GPRS is up....");
             }
         });
 
         await sleep(10000);
     }*/
    while (true) {
        await checkGPRS().then(async ({ stdout, stderr }) => {
            console.log("then")
        }).catch(async (reason) => {
            console.log("catch")
        });

        await sleep(10000);
    }

}

run();
