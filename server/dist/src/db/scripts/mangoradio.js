"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mangoradio_json_1 = __importDefault(require("./mangoradio.json"));
const countryCode = "de";
const slug = "mangoradio";
const Station_1 = require("../Station");
const social = mangoradio_json_1.default.station.social;
const links = mangoradio_json_1.default.station.social_link;
const filterQuery = { countryCode, slug };
const updateQuery = {
    $set: {
        slogan: mangoradio_json_1.default.station.slogan,
        desc: mangoradio_json_1.default.station.description,
        web: links.Website,
        twitter: links.Twitter,
        instagram: links.Instagram,
        facebook: links.Facebook,
        youtube: links.YouTube,
        discord: links.Discord,
        twitch: links.Twitch,
        tel: { url: links.Telephone, text: social.Telephone },
        whatsApp: { url: links.WhatsApp, text: social.WhatsApp },
        mail: social.Mail,
    },
    $unset: { address: "" }
};
const main = async () => {
    const coll = await Station_1.getCollection();
    const res = await coll.updateOne(filterQuery, updateQuery);
    console.log(res);
};
main();
//# sourceMappingURL=mangoradio.js.map