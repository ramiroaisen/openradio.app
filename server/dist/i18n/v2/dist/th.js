"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const locale = {
    "continents": {
        "sa": "อเมริกาใต้",
        "na": "อเมริกาเหนือ",
        "ca": "อเมริกากลาง",
        "eu": "ยุโรป",
        "as": "เอเชีย",
        "af": "แอฟริกา",
        "oc": "โอเชียเนีย"
    },
    "radioCount": "{count} สถานี",
    "globalIndex": {
        "head": {
            "title": "Openradio.app | สถานีวิทยุจากทั่วโลก",
            "desc": "Openradio.app | สถานีวิทยุจากทั่วโลกฟังวิทยุออนไลน์ที่ openradio.app"
        }
    },
    "countryIndex": {
        "title": "วิทยุจาก {country}",
        "head": {
            "title": "สถานีวิทยุถ่ายทอดสดจาก {country} | Openradio.app",
            "desc": "สถานีวิทยุถ่ายทอดสดจาก {country} ฟังสถานีวิทยุออนไลน์จาก {country} ที่ Openradio.app"
        }
    },
    "search": {
        "placeholder": {
            "country": "ค้นหาใน {country} ...",
            "global": "ค้นหาทั่วโลก ..."
        },
        "timing": "{total} ผลลัพธ์ใน {s} วินาที",
        "head": {
            "global": {
                "title": "{q} | Openradio.app",
                "desc": "{q} ค้นหาสถานีวิทยุจากทั่วโลก สถานีวิทยุออนไลน์จากทั่วโลกที่ Openradio.app"
            },
            "country": {
                "title": "{q} | Openradio.app",
                "desc": "{q} ค้นหาสถานีวิทยุจาก {country} สถานีวิทยุออนไลน์จาก {country} ที่ Openradio.app"
            }
        }
    },
    "signalList": {
        "global": {
            "title": "{type.toUpperCase} วิทยุ"
        },
        "country": {
            "title": "{type.toUpperCase} วิทยุจาก {country}"
        },
        "head": {
            "global": {
                "title": "{type.toUpperCase} สถานีวิทยุจากทั่วโลก",
                "desc": "{type.toUpperCase} สถานีวิทยุจากทั่วโลก ฟังสถานีวิทยุ {type.toUpperCase} แห่งที่ Openradio.app"
            },
            "country": {
                "title": "{type.toUpperCase} สถานีวิทยุจาก {country}",
                "desc": "{type.toUpperCase} สถานีวิทยุจาก {country} ฟังสถานีวิทยุ {type.toUpperCase} แห่งที่ Openradio.app"
            }
        }
    },
    "signal": {
        "link": {
            "text": "{frec} {type.toUpperCase}"
        },
        "global": {
            "title": "{frec} {type.toUpperCase} วิทยุ"
        },
        "country": {
            "title": "{frec} {type.toUpperCase} วิทยุจาก {country}"
        },
        "head": {
            "global": {
                "title": "{type.toUpperCase} {frec} สถานีวิทยุถ่ายทอดสด | Openradio.app",
                "desc": "{type.toUpperCase} {frec} สถานีวิทยุถ่ายทอดสดจากทั่วโลก ฟังสถานีวิทยุสดจากทั่วโลกที่ Openradio.app"
            },
            "country": {
                "title": "{type.toUpperCase} {frec} สถานีวิทยุถ่ายทอดสด | Openradio.app",
                "desc": "{type.toUpperCase} {frec} สถานีวิทยุถ่ายทอดสดจาก {country} ฟังสถานีวิทยุสดจาก {country} ที่ Openradio.app"
            }
        }
    },
    "langs": {
        "title": "ภาษา",
        "head": {
            "title": "ภาษา | Openradio.app",
            "desc": "สถานีวิทยุในภาษาของคุณ | Openradio.app"
        }
    },
    "station": {
        "head": {
            "title": "{station.name} สด | Openradio.app",
            "desc": "{station.name} สดฟัง {station.name} สด สถานีวิทยุจากทั่วทุกมุมโลกที่ Openradio.app"
        },
        "labels": {
            "slogan": "คำขวัญ:",
            "signal": "สัญญาณ:",
            "web": "เว็บไซต์:",
            "location": "สถานที่ตั้ง:",
            "mail": "mail:",
            "phone": "โทรศัพท์:",
            "twitter": "twitter:",
            "facebook": "Facebook:",
            "tags": "Tags:",
            "programming": "การเขียนโปรแกรม"
        },
        "signals": {
            "title": "ความถี่",
            "type": {
                "amfm": "{frec} {type.toUpperCase}",
                "web": "เว็บ"
            }
        },
        "tags": {
            "live": "{station.name} สด",
            "listen": "ฟัง {station.name}",
            "listenLive": "ฟังสด {station.name}",
            "signal": "{station.signal.frec} {station.signal.type.toUpperCase}",
            "signalLive": "{station.signal.frec} {station.signal.type.toUpperCase} สด",
            "signalListenLive": "ฟังสด {station.signal.frec} {station.signal.type.toUpperCase}"
        }
    },
    "recents": {
        "title": "ล่าสุด",
        "head": {
            "title": "ล่าสุด | Openradio.app",
            "desc": "สถานีวิทยุฟังเมื่อเร็ว ๆ นี้ Openradio.app"
        }
    },
    "nav": {
        "langs": "ภาษาอื่น ๆ",
        "countries": "ประเทศ",
        "recents": "ล่าสุด",
        "genres": "ประเภท",
        "fms": "FM Frecuencies",
        "ams": "AM Frecuencies"
    }
};
exports.default = locale;
//# sourceMappingURL=th.js.map