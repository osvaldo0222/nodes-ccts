//For shell scripting
const { exec } = require('child_process');

const BootstrapService = function () {
    this.initialize = () => {
        const pwd = "/home/pi/nodes-ccts";

        //Where this program is
        exec("pwd", (err, stdout, stderr) => {
            if (err) {
                console.error(err)
            } else {
                pwd = stdout;
            }
        });

        //Check if ppp is installed
        exec("apt-get install ppp", (err, stdout, stderr) => {
            if (err) {
                console.error(err)
            } else {
                //Configuration of ppp gprs
                exec(`cp ${pwd}/provider /etc/ppp/peers/`, (err, stdout, stderr) => {
                    if (err) {
                        console.error(err)
                    }
                });

                //Make gprs automatic up
                exec(`cp ${pwd}/interfaces /etc/network/`, (err, stdout, stderr) => {
                    if (err) {
                        console.error(err)
                    }
                });

                //Make metrics change
                exec(`cp ${pwd}/dhcpcd.conf /etc/`, (err, stdout, stderr) => {
                    if (err) {
                        console.error(err)
                    }
                });

                //Restarting network services
                exec(`service networking restart`, (err, stdout, stderr) => {
                    if (err) {
                        console.error(err)
                    }
                });

                //Adding static route for GPRS
                exec("route add -net 0.0.0.0 metric 500 ppp0", (err, stdout, stderr) => {
                    if (err) {
                        console.error(err)
                    }
                });
            }
        });
    };
};

module.exports = BootstrapService;
