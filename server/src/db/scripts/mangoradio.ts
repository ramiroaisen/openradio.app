import json from "./mangoradio.json";

const countryCode = "de";
const slug = "mangoradio";

import {getCollection, Station} from "../Station";
import {UpdateQuery} from "mongodb";

const social = json.station.social;
const links = json.station.social_link;

const filterQuery = {countryCode, slug};

const updateQuery: UpdateQuery<Station> = {
    $set: {
        slogan: json.station.slogan,
        desc: json.station.description,
        web: links.Website,
        twitter: links.Twitter,
        instagram: links.Instagram,
        facebook: links.Facebook,
        youtube: links.YouTube,
        discord: links.Discord,
        twitch: links.Twitch,
        tel: {url: links.Telephone, text: social.Telephone },
        whatsApp: {url: links.WhatsApp, text: social.WhatsApp},
        mail: social.Mail,
    },

    $unset: { address: "" }
}


const main = async () => {
    const coll = await getCollection();
    const res = await coll.updateOne(filterQuery, updateQuery);
    console.log(res);
}


main()