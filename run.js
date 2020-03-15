const config = require("./server/dist/config");
console.log(`> Running on mode ${config.env}`);
require("./__sapper__/build");