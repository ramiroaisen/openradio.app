"use strict";
exports.__esModule = true;
var url_1 = require("url");
var net_1 = require("net");
var parse_headers = require("parse-headers");
var socketProxy = function (urlstr) {
    try {
        var url_2 = new url_1.URL(urlstr);
        var accept_1 = "audio/*";
        var port = Number(url_2.port) || (url_2.protocol === "https:" ? 443 : 80);
        var socket_1 = net_1["default"].connect(port, url_2.hostname);
        socket_1.on("ready", function () {
            console.log("Connection ready");
            var HEAD = [
                "GET " + (url_2.pathname + url_2.search) + " HTTP/1.0",
                "host: " + url_2.hostname,
                "accept: " + accept_1
            ].join("\r\n") + "\r\n\r\n";
            console.log("Writing head");
            console.log("== HEAD ==");
            console.log(HEAD);
            socket_1.write(HEAD);
            var head_recived = false;
            var head = "";
            var first = true;
            socket_1.on("data", function (chunk) {
                if (first) {
                    first = false;
                    console.log("First-byte received");
                }
                if (!head_recived) {
                    var str = chunk.toString("utf8");
                    var parts = str.split("\r\n\r\n", 2);
                    head += parts[0];
                    if (parts.length !== 1) {
                        head_recived = true;
                        //res.writeHead(200);
                        console.log("== HEAD RECEIVED ==");
                        console.log(head);
                        console.log("===");
                        console.log(parse_headers(head));
                        //socket.pipe(process.stdout);
                    }
                }
                else {
                    //console.log("data: ", chunk.length, "bytes");
                }
            }).on("error", function (error) {
                console.log(error);
            });
        });
    }
    catch (e) {
        console.log(e);
    }
};
if (module.parent == null) {
    socketProxy('http://server8.veemesoft.com.ar:3714/;');
}
