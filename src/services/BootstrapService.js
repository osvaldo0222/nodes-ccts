//For shell scripting
const { exec } = require('child_process');
const logger = require("log4js").getLogger();

const BootstrapService = function () {
    this.initialize = () => {
        let pwd = "/home/pi/nodes-ccts";

        logger.info(`Boostraping services...`);

        //Where this program is
        exec("pwd", (err, stdout, stderr) => {
            if (err) {
                logger.error(`Error trying to get the path of nodes ccts: pwd command`);
            } else {
                pwd = stdout.replace("\n", "");
                logger.info(`Nodes CCTS program path: ${pwd}`);

                //Check if ppp is installed
                exec("apt-get install ppp", (err, stdout, stderr) => {
                    if (err) {
                        logger.error(`Error trying to install ppp of gprs: apt-get install ppp command`);
                    } else {
                        logger.info(`PPP for gprs installed...`);

                        //Configuration files
                        exec(`cp ${pwd}/provider /etc/ppp/peers/ && cp ${pwd}/interfaces /etc/network/ && cp ${pwd}/dhcpcd.conf /etc/`, (err, stdout, stderr) => {
                            if (err) {
                                logger.error(`Error copying files to destinations with command: cp ${pwd}/provider /etc/ppp/peers/ && cp ${pwd}/interfaces /etc/network/ && cp ${pwd}/dhcpcd.conf /etc/`);
                            } else {
                                logger.info(`Configuration file updated...`);

                                //Restarting network services
                                exec(`service networking restart && sudo systemctl daemon-reload`, (err, stdout, stderr) => {
                                    if (err) {
                                        logger.error(`Error restarting networking services with command: service networking restart && sudo systemctl daemon-reload`);
                                    } else {
                                        logger.info(`Network service restarting...`);

                                        //Power off gprs
                                        exec(`ifdown gprs`, (err, stdout, stderr) => {
                                            if (err) {
                                                logger.error(`GPRS already down or wasn't configured, command: ifdown gprs`);
                                            } else {
                                                logger.info(`GPRS stopped...`);

                                                //Power on gprs
                                                exec(`ifup gprs`, (err, stdout, stderr) => {
                                                    if (err) {
                                                        logger.error(`GPRS already up or wasn't configured, command: ifup gprs`);
                                                    } else {
                                                        logger.info(`GPRS started on ppp0...`);

                                                        setTimeout(() => {
                                                            //Adding static route for GPRS
                                                            exec("route add -net 0.0.0.0 metric 500 ppp0", (err, stdout, stderr) => {
                                                                if (err) {
                                                                    logger.error(`Error adding static route for gprs, command: route add -net 0.0.0.0 metric 500 ppp0`);
                                                                } else {
                                                                    logger.info(`Static route 0.0.0.0 via ppp0 with metric 500 added...`);
                                                                }
                                                            });
                                                        }, 5000);
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });

                            }
                        });
                    }
                });
            }
        });
    };
};

module.exports = BootstrapService;
