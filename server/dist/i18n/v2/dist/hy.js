"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const locale = {
    "continents": {
        "sa": "Հարավային Ամերիկա",
        "na": "Հյուսիսային Ամերիկա",
        "ca": "Կենտրոնական Ամերիկա",
        "eu": "Եվրոպա",
        "as": "Ասիա",
        "af": "Աֆրիկա",
        "oc": "Օվկիանիա"
    },
    "radioCount": "{count} կայաններ",
    "globalIndex": {
        "head": {
            "title": "Openradio.app | Ռադիոկայաններ ամբողջ աշխարհից",
            "desc": "Openradio.app | Ռադիոկայաններն ամբողջ աշխարհից, առցանց լսեք ռադիոյին ՝ openradio.app- ում"
        }
    },
    "countryIndex": {
        "title": "Adiառագայթներ {country}-ից",
        "head": {
            "title": "Ուղիղ ռադիոկայաններ from 1}-ից Openradio.app",
            "desc": "Կենդանի ռադիոկայաններ {country}-ից, առցանց ռադիոկայաններ լսեք {country}-ից ՝ Openradio.app- ում"
        }
    },
    "search": {
        "placeholder": {
            "country": "Որոնել {country} ...",
            "global": "Որոնել ամբողջ աշխարհում ..."
        },
        "timing": "1} -ը հանգեցնում է {s} վայրկյանում",
        "head": {
            "global": {
                "title": "1} | Openradio.app",
                "desc": "{q} որոնել ռադիոկայաններ աշխարհից: Առցանց ռադիոկայաններ աշխարհից ՝ Openradio.app- ում"
            },
            "country": {
                "title": "1} | Openradio.app",
                "desc": "{q} որոնել radio 2 stations ռադիոկայաններ: Առցանց ռադիոկայանները 3-ից {} -ից ՝ Openradio.app- ում"
            }
        }
    },
    "signalList": {
        "global": {
            "title": "{type.toUpperCase} ռադիո"
        },
        "country": {
            "title": "{type.toUpperCase} ռադիոկայան {2-ից"
        },
        "head": {
            "global": {
                "title": "{type.toUpperCase} ռադիոկայաններ աշխարհից",
                "desc": "{type.toUpperCase} ռադիոկայաններ աշխարհից: Լսեք rad 2} ռադիոկայաններին Openradio.app- ում"
            },
            "country": {
                "title": "{type.toUpperCase} ռադիոկայաններ {2-ից",
                "desc": "{type.toUpperCase} ռադիոկայաններ {country}-ից: Լսեք rad 3} ռադիոկայաններին Openradio.app- ում"
            }
        }
    },
    "signal": {
        "link": {
            "text": "1} {type.toUpperCase}"
        },
        "global": {
            "title": "{frec} {type.toUpperCase} ռադիո"
        },
        "country": {
            "title": "{frec} {type.toUpperCase} ռադիո {country}-ից"
        },
        "head": {
            "global": {
                "title": "1} {frec} կենդանի ռադիոկայան | Openradio.app",
                "desc": "{type.toUpperCase} {frec} կենդանի ռադիոկայան աշխարհից: Լսեք աշխարհի կենդանի ռադիոկայաններից ՝ Openradio.app- ում"
            },
            "country": {
                "title": "1} {frec} կենդանի ռադիոկայան | Openradio.app",
                "desc": "{type.toUpperCase} {frec} կենդանի ռադիոկայան {country}-ից: Լսեք կենդանի ռադիոկայաններ from 4-ից} Openradio.app- ում"
            }
        }
    },
    "langs": {
        "title": "Լեզուներ",
        "head": {
            "title": "Լեզուներ Openradio.app",
            "desc": "Ռադիոկայաններ ձեր լեզվով | Openradio.app"
        }
    },
    "station": {
        "head": {
            "title": "1} կենդանի | Openradio.app",
            "desc": "{station.name} ապրեք, լսեք {station.name} ուղիղ եթերը: Ռադիոկայաններն ամբողջ աշխարհից ՝ Openradio.app- ում"
        },
        "labels": {
            "slogan": "Կարգախոս.",
            "signal": "Ազդանշան",
            "web": "Կայքը ՝",
            "location": "Գտնվելու վայրը:",
            "mail": "Փոստ:",
            "phone": "Հեռախոս `",
            "twitter": "Twitter:",
            "facebook": "Facebook:",
            "tags": "Tags:",
            "programming": "Ծրագրավորում"
        },
        "signals": {
            "title": "Հաճախականություններ",
            "type": {
                "amfm": "1} {type.toUpperCase}",
                "web": "Վեբ"
            }
        },
        "tags": {
            "live": "{station.name} ապրել",
            "listen": "լսել {1",
            "listenLive": "լսեք {station.name} կենդանի մասին",
            "signal": "1} {station.signal.type.toUpperCase}",
            "signalLive": "{station.signal.frec} {station.signal.type.toUpperCase} կենդանի",
            "signalListenLive": "Լսեք {station.signal.frec} {station.signal.type.toUpperCase} ուղիղ եթերին"
        }
    },
    "recents": {
        "title": "Վերջերս",
        "head": {
            "title": "Վերջին | Openradio.app",
            "desc": "Վերջերս ունկնդրված ռադիոկայաններ | Openradio.app"
        }
    },
    "nav": {
        "langs": "Այլ լեզուներ",
        "countries": "Երկրներ",
        "recents": "Վերջերս",
        "genres": "Ժանրեր",
        "fms": "FM ճգնաժամերը",
        "ams": "AM ճգնաժամեր"
    }
};
exports.default = locale;
//# sourceMappingURL=hy.js.map