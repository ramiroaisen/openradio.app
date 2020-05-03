"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const locale = {
    "continents": {
        "sa": "სამხრეთ ამერიკა",
        "na": "ჩრდილოეთ ამერიკა",
        "ca": "Ცენტრალური ამერიკა",
        "eu": "ევროპა",
        "as": "აზია",
        "af": "აფრიკა",
        "oc": "ოკეანეთი"
    },
    "radioCount": "{count} სადგურები",
    "globalIndex": {
        "head": {
            "title": "Openradio.app | რადიოსადგურები მთელი მსოფლიოდან",
            "desc": "Openradio.app | რადიოსადგურები მთელი მსოფლიოდან, მოუსმინეთ რადიოს ინტერნეტით, openradio.app– ზე"
        }
    },
    "countryIndex": {
        "title": "რადიოები {country}დან",
        "head": {
            "title": "პირდაპირი რადიოსადგურები {country}დან | Openradio.app",
            "desc": "ცოცხალი რადიოსადგურები {country}დან, უსმინეთ ონლაინ რადიოსადგურები {country} – დან Openradio.app– ზე"
        }
    },
    "search": {
        "placeholder": {
            "country": "ძებნა {country} ...",
            "global": "ძებნა მსოფლიოში ..."
        },
        "timing": "1} შედეგი {s} წამში",
        "head": {
            "global": {
                "title": "1 | Openradio.app",
                "desc": "{q} მოძებნეთ რადიოსადგურები მსოფლიოში. ონლაინ რადიო სადგურები მსოფლიოში Openradio.app– ზე"
            },
            "country": {
                "title": "1 | Openradio.app",
                "desc": "{q} მოძებნეთ რადიოსადგურები {undefined} -დან Openradio.app– ზე"
            }
        }
    },
    "signalList": {
        "global": {
            "title": "{1 რადიოები"
        },
        "country": {
            "title": "{type.toUpperCase} რადიო from 2 }დან"
        },
        "head": {
            "global": {
                "title": "{type.toUpperCase} რადიოსადგურები მსოფლიოში",
                "desc": "{type.toUpperCase} რადიოსადგურები მსოფლიოში. მოუსმინეთ stations 2} რადიოსადგურებს Openradio.app– ზე"
            },
            "country": {
                "title": "{type.toUpperCase} რადიოსადგურები {country}დან",
                "desc": "{type.toUpperCase} რადიოსადგურები {undefined} რადიოსადგურებს Openradio.app– ზე"
            }
        }
    },
    "signal": {
        "link": {
            "text": "1} {2"
        },
        "global": {
            "title": "{frec} {type.toUpperCase} რადიო"
        },
        "country": {
            "title": "{frec} {type.toUpperCase} რადიო {country}დან"
        },
        "head": {
            "global": {
                "title": "1} {frec} ცოცხალი რადიოსადგური | Openradio.app",
                "desc": "{type.toUpperCase} {frec} ცოცხალი რადიოსადგური მსოფლიოში. მოუსმინეთ პირდაპირ რადიოსადგურებს მსოფლიოში Openradio.app– ზე"
            },
            "country": {
                "title": "1} {frec} ცოცხალი რადიოსადგური | Openradio.app",
                "desc": "{type.toUpperCase} {frec} ცოცხალი რადიოსადგური {country} -დან. მოუსმინეთ პირდაპირ რადიოსადგურებს 4 – დან} rad Openradio.app– ზე"
            }
        }
    },
    "langs": {
        "title": "ენები",
        "head": {
            "title": "ენები | Openradio.app",
            "desc": "რადიოსადგურები თქვენს ენაზე | Openradio.app"
        }
    },
    "station": {
        "head": {
            "title": "1} ცოცხალი | Openradio.app",
            "desc": "{station.name} იცხოვრე, მოუსმინე {station.name} პირდაპირ ეთერში. რადიოსადგურები მთელი მსოფლიოდან Openradio.app– ზე"
        },
        "labels": {
            "slogan": "ლოზუნგი:",
            "signal": "სიგნალი:",
            "web": "საიტი:",
            "location": "ადგილმდებარეობა:",
            "mail": "ფოსტა:",
            "phone": "ტელეფონი:",
            "twitter": "Twitter:",
            "facebook": "Facebook:",
            "tags": "წარწერები:",
            "programming": "პროგრამირება"
        },
        "signals": {
            "title": "სიხშირეები",
            "type": {
                "amfm": "1} {2",
                "web": "ვებ"
            }
        },
        "tags": {
            "live": "{station.name} ცოცხალი",
            "listen": "მოუსმინე {station.name}",
            "listenLive": "მოუსმინეთ {station.name} პირდაპირ ეთერში",
            "signal": "1} {2",
            "signalLive": "{station.signal.frec} {station.signal.type.toUpperCase} ცოცხალი",
            "signalListenLive": "მოუსმინეთ {station.signal.frec} {station.signal.type.toUpperCase} პირდაპირ ეთერში"
        }
    },
    "recents": {
        "title": "უახლესი",
        "head": {
            "title": "უახლესი | Openradio.app",
            "desc": "რადიოსადგურებმა მოუსმინეს ახლახანს | Openradio.app"
        }
    },
    "nav": {
        "langs": "Სხვა ენები",
        "countries": "ქვეყნები",
        "recents": "უახლესი",
        "genres": "ჟანრები",
        "fms": "FM Frecuences",
        "ams": "AM Frecuences"
    }
};
exports.default = locale;
//# sourceMappingURL=ka.js.map