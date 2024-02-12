const server = require("./server");
const config = require("./config");

/*server.post('/ping', (req, res) => {
    res.send('Pong!');
});*/

server.listen(config.port, () => {
    console.log(`The server is up and running on port ${config.port} in ${config.envName} mode`);
});