"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const Station = __importStar(require("../db/Station"));
const Country = __importStar(require("../db/Country"));
var Mail;
(function (Mail) {
    Mail.getCollection = async () => {
        const client = await mongodb_1.MongoClient.connect("mongodb://localhost:27017", { useUnifiedTopology: true, useNewUrlParser: true });
        return client.db("openradio-mailing").collection("mails");
    };
})(Mail = exports.Mail || (exports.Mail = {}));
const url = (station, lang, campaignId) => {
    return `https://openradio.app/${lang}-${station.countryCode}/radio/${station.slug}?src=${campaignId}`;
};
const template = ({ station, lang, campaignId }) => {
    const body = `\
Buenos días,

Soy Ramiro, de openradio.app.

Somos un portal de radio en vivo para más de 130 países y con cerca de 45.000 radios en todo el mundo.

Me comunico con ustedes para contarles que estamos listando su radio en nuestro sitio.

Pueden verla en <a href="${url(station, lang, campaignId)}">${url(station, lang, campaignId)}</a>

Les queríamos pedir si podrían ser tan amables de listarnos ustedes a nosotros también,
eso nos ayudaría a crecer y difundir nuestro sitio.

Quedo a su disposición para lo que necesiten.

Abrazo de radio!

Ramiro`;
    return {
        text: body,
        html: body.replace(/\n/g, "<br/>")
    };
};
//import nodemailer from "nodemailer";
const node_fetch_1 = __importDefault(require("node-fetch"));
const MailAddress_1 = require("./MailAddress");
const sendMail = async ({ text, html, to, subject }) => {
    const res = await node_fetch_1.default("https://mail.openradio.app:5334/users/5e8d3f3ffb20f34df5561a99/submit", {
        method: "POST",
        headers: {
            "x-access-token": "QE9yaW1hcjEyMw==",
            "content-type": "application/json"
        },
        body: JSON.stringify({
            to: [{ address: to }],
            subject,
            text,
            html,
            bcc: [
                { address: "test@openradio.app" },
            ]
        })
    });
    return res.json();
};
const sleep = (ms) => {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
};
const test = async () => {
    const campaignId = "m1";
    const lang = "es";
    /*
    const transport = nodemailer.createTransport({
        host: "mail.openradio.app",
        port: 465,
        secure: true,
        auth: {
            type: "login",
            user: "ramiro@openradio.app",
            pass: "@Orimar123",
        },
        tls: {
            rejectUnauthorized: false
        }
    })
     */
    const maddcoll = await MailAddress_1.MailAddress.getCollection();
    const coll = await Mail.getCollection();
    const countryCodes = await (await Country.getCollection()).distinct("code", { lang: "es" });
    const stationsCollection = await Station.getCollection();
    const cursor = stationsCollection.find({ countryCode: { $in: countryCodes }, mail: { $ne: null } });
    const total = await cursor.count();
    const stations = await cursor.toArray();
    let i = 0;
    let skipped = 0;
    let sent = 0;
    let mailSkipped = 0;
    for (const station of stations.reverse()) {
        try {
            console.log(mailSkipped, "|", ++i, "/", total, url(station, lang, campaignId), station.mail);
            if (await coll.find({ "station._id": station._id }).count()) {
                skipped++;
                console.log("skipping");
                continue;
            }
            const mailAddress = await maddcoll.findOne({ address: station.mail });
            if (mailAddress.stations.length > 1) {
                mailSkipped++;
                console.log("skipping");
                continue;
            }
            await sleep(5000);
            const body = template({ station, lang, campaignId });
            const to = station.mail;
            if (!station.mail) {
                console.log("Skipping");
                continue;
            }
            const subject = "Estamos listando su radio en nuestro sitio";
            const info = await sendMail({
                to,
                html: body.html,
                text: body.text,
                subject,
            });
            await coll.insertOne({
                from: "ramiro@openradio.app",
                to,
                body,
                subject,
                campaignId,
                lang,
                station: {
                    _id: station._id,
                    countryCode: station.countryCode,
                    slug: station.slug,
                },
                isTest: false,
                info
            });
        }
        catch (e) {
            console.log("[ERROR]:", e.message);
        }
    }
    console.log("Done!");
};
if (module.parent == null) {
    test();
}
//# sourceMappingURL=Mailing.js.map