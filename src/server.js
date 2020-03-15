require('source-map-support').install();

import * as sapper from '@sapper/server';

const {start} = require("../../../server/dist/app");

start(sapper);