//For shell scripting
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const Gpio = require("onoff").Gpio;
const logger = require("log4js").getLogger();

const BootstrapService = function () {
    this.initialize = () => {
        configGPRS();
    };
};

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
    //GPRS Power Key
    let gsmPowerPin = new Gpio(4, 'out');
    gsmPowerPin.writeSync(0);
    await sleep(4000);
    gsmPowerPin.writeSync(1);
    gsmPowerPin.unexport();

    return true;
};

/**
 * Function to configure GPRS module and PPP0.
 * 
 */
async function configGPRS() {
    logger.info("Configuring GPRS...");

    let configure = false;
    let toogle = false;
    let count = 0;
    let countToIncreaseTime = 1;

    while (!configure) {
        await checkGPRS().then(async ({ stdout, stderr }) => {
            await exec("route add -net 0.0.0.0 metric 400 ppp0").then(() => {
                logger.info("Static route added with metric 400 via ppp0...");
                logger.info("GPRS is already configured...");
                configure = true;
            }).catch((reason) => {
                if (reason.includes("File exists")) {
                    logger.info("GPRS is already configured...");
                    configure = true;
                }
                logger.error(`Unabled to create static route: route add -net 0.0.0.0 metric 400 ppp0`);
                configure = false;
            });
        }).catch(async () => {
            if (!toogle) {
                logger.info("Powering on GPRS...");
                toogle = await toogleGPRSModule();
                logger.info("GPRS Module is up. Configuring....");

                //Configuring
                let pwd = await exec("pwd").then(({ stdout }) => {
                    return stdout.replace("\n", "");
                }).catch(() => {
                    return "/home/pi/nodes-ccts";
                });

                await exec("apt-get install ppp").then(({ stdout }) => {
                    logger.info("PPP installed for gprs...");
                }).catch(() => {
                    logger.error("PPP can't be installed for gprs: apt-get install ppp");
                });

                await exec(`cp ${pwd}/provider /etc/ppp/peers/ && cp ${pwd}/interfaces /etc/network/ && cp ${pwd}/dhcpcd.conf /etc/`).then(({ stdout }) => {
                    logger.info("Configuration files updated...");
                }).catch(() => {
                    logger.error(`Unabled to updated config files: cp ${pwd}/provider /etc/ppp/peers/ && cp ${pwd}/interfaces /etc/network/ && cp ${pwd}/dhcpcd.conf /etc/`);
                });

                await exec(`service networking restart && sudo systemctl daemon-reload`).then(({ stdout }) => {
                    logger.info("Networking services restarted...");
                }).catch(() => {
                    logger.error(`Unabled to restart networking services: service networking restart && sudo systemctl daemon-reload`);
                });

                await exec("ifdown gprs && ifup gprs").then(({ stdout }) => {
                    logger.info("GPRS interface started...");
                }).catch(() => {
                    logger.error(`Unabled to start gprs interface: ifdown gprs && ifup gprs`);
                });
            }

            if (count > 30) {
                count = 0;
                toogle = false;
                countToIncreaseTime++;
            }
        });

        if (countToIncreaseTime >= 10) {
            break;
        }

        await sleep(10000);
        count++;
    }
}

module.exports = BootstrapService;
