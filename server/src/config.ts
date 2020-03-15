import cmd from "commander";
import process from "process";
import os from "os";
import path from "path";

cmd
	.version('2.0.0', '-v, --version')
	.option('-l --local []', 'Run as local')
	.option('-e --env [env]', 'enviroment: dev, prod, or test', /^(dev|prod|test)$/)
	.option('-p --port []', 'Port number')
	.option('--http []', 'run in http mode')
	.parse(process.argv);

export const http = !!cmd.http;

export const local = (() => {
	if(cmd.local == null){
		return os.hostname() === "fedora";
	} else if(["0", "false"].indexOf(cmd.local) !== -1){
		return false;
	} else {
		return true;
	}
})()

//const env = cmd.env || (isLocal ? 'dev' : 'prod');
export const env = cmd.env != null ? cmd.env : local ? "dev" : "prod";

let _port = cmd.port | 0;
if (!_port) {
	switch (env) {
		case 'dev':
			_port = 7700;
			break;

		case 'test':
			_port = 7701; 
			break;

		case 'prod':
		  _port = 7702;
			break;
	}
}
export const port = _port;

process.env.PORT = String(port);
process.env.NODE_ENV = (env === "dev" ? "development" : "production"); // "test" is production too

export const basedir = path.resolve(__dirname, "../..");

/*
if(env === "dev"){
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}
*/