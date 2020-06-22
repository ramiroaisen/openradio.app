import {URL} from "url";
import net from "net";
const parse_headers = require("parse-headers");

const socketProxy = (urlstr: string) => {
    try {
        const url = new URL(urlstr);
        const accept = "audio/*";
        const port = Number(url.port) || (url.protocol === "https:" ? 443 : 80);
        const socket = net.connect(port, url.hostname);
        socket.on("ready", () => {

            console.log("Connection ready");

            const HEAD = [
                `GET ${url.pathname + url.search} HTTP/1.0`,
                `host: ${url.host}`,
                `accept: ${accept}`
            ].join("\r\n") + "\r\n\r\n";
            console.log("Writing head");
            console.log("== HEAD ==");
            console.log(HEAD);

            socket.write(HEAD);
            let head_recived = false;
            let head = "";
            let first = true;
            socket.on("data", (chunk) => {
                if(first) {
                    first = false;
                    console.log("First-byte received");
                }
                if(!head_recived) {
                    const str = chunk.toString("utf8");
                    let parts = str.split("\r\n\r\n", 2);
                    head += parts[0];
                    if (parts.length !== 1) {
                        head_recived = true;
                        //res.writeHead(200);
                        console.log("== HEAD RECEIVED ==")
                        console.log(head);
                        console.log("===");
                        console.log(parse_headers(head));
                        //socket.pipe(process.stdout);
                    }
                } else {
                    //console.log("data: ", chunk.length, "bytes");
                }
            }).on("error", error => {
                console.log(error);
            })
        })
    } catch(e) {
        console.log(e);
    }
}

if (module.parent == null) {
    socketProxy('http://server8.veemesoft.com.ar:3714/;');
}