//For shell scripting
const { exec } = require('child_process');

const BootstrapService = function () {
    this.initialize = () => {
        exec("route add -net 0.0.0.0 metric 500 ppp0", (err, stdout, stderr) => {
            if (err) {
                console.error(err)
            }
        });
    };
};

module.exports = BootstrapService;
