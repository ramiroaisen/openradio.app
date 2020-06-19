import {collectionGetter, getConnection} from "../db/conn";
import {MongoClient, ObjectId} from "mongodb";
import * as Station from "../db/Station";

export type Mail = {
    from: string
    to: string
    subject: string
    campaignId: string
    lang: string
    isTest: boolean
    body: {
        text: string,
        html: string
    }
    station: {
        _id: ObjectId
        countryCode: string
        slug: string
    }
    info: any
}

export namespace Mail {
    export const getCollection = async () => {
        const client = await MongoClient.connect("mongodb://localhost:27017", {useUnifiedTopology: true, useNewUrlParser: true});
        return client.db("openradio-mailing").collection("mails");
    }
}

export type TemplateOptions = {
    station: Station.Station
    campaignId: string
    lang: string
}

const url = (station: Station.Station, lang: string, campaignId: string) => {
    return `https://openradio.app/${lang}-${station.countryCode}/${station.slug}?src=${campaignId}`
}

const template = ({station, lang, campaignId}: TemplateOptions): {text: string, html: string} => {
const body =
    `\
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
    }
}

import nodemailer from "nodemailer";

const test = async () => {
    const campaignId = "m1-test";
    const lang = "es";

    const transport = nodemailer.createTransport({
        host: "mail.openradio.app",
        port: 465,
        secure: true,
        auth: {
            user: "ramiro@openradio.app",
            pass: "@Orimar123",
        }
    })

    const coll = await Mail.getCollection();

    const stationsCollection = await Station.getCollection();
    const cursor = stationsCollection.find({countryCode: "ar", mail: {$ne: null}});

    const total = await cursor.count();

    const stations = await cursor.toArray();

    let i = 0;
    for(const station of stations) {
        console.log(++i, "/", total, url(station, lang, campaignId), station.mail)
        const body = template({station, lang, campaignId});
        const to = station.mail!;
        if(!station.mail) {
            console.log("Skipping");
            continue;
        }

        const subject = "Estamos listando su radio en nuestro sitio";

        const info = await transport.sendMail({
            from: "Ramiro de openradio.app <ramiro@openradio.app>",
            to: "test@openradio.app",
            html: body.html,
            text: body.text,
            subject,
        })

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
            isTest: true,
            info
        })
    }
}

if(module.parent == null) {
    test();
}

