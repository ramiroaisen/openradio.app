import { Module } from "../Locale";
 
const locale: Module = {
  "continents": {
    "sa": "Janubiy Amerika",
    "na": "Shimoliy Amerika",
    "ca": "Markaziy Amerika",
    "eu": "Evropa",
    "as": "Osiyo",
    "af": "Afrika",
    "oc": "Okeaniya"
  },
  "radioCount": "{count} bekatlar",
  "globalIndex": {
    "head": {
      "title": "Openradio.app | Dunyo bo'ylab radiostansiyalar",
      "desc": "Openradio.app | Butun dunyoning radio stantsiyalari, radioni openradio.app saytida onlayn tinglang"
    }
  },
  "countryIndex": {
    "title": "{country} radiosi",
    "head": {
      "title": "{country} | jonli radio stantsiyalari Openradio.app",
      "desc": "{country} dan jonli radio stantsiyalari, {country} Openradio.app saytidagi onlayn radio stantsiyalarni tinglang"
    }
  },
  "search": {
    "placeholder": {
      "country": "{country} -dan qidirish ...",
      "global": "Dunyo bo'ylab qidirish ..."
    },
    "timing": "{total} natijalar {s} soniyada",
    "head": {
      "global": {
        "title": "{q} | Openradio.app",
        "desc": "{q} dunyo bo'ylab radiostansiyalarni qidirish. Openradio.app saytidagi dunyoning onlayn radio stantsiyalari"
      },
      "country": {
        "title": "{q} | Openradio.app",
        "desc": "{q} {country} dan radiostansiyalarni qidirish. Openradio.app saytidagi {country} dan onlayn radio stantsiyalari"
      }
    }
  },
  "signalList": {
    "global": {
      "title": "{type.toUpperCase} radiolar"
    },
    "country": {
      "title": "{country} {country} radiolari"
    },
    "head": {
      "global": {
        "title": "{type.toUpperCase} dunyo radiostansiyalari",
        "desc": "{type.toUpperCase} dunyo radiostansiyalari. {type.toUpperCase} radiostantsiyasini Openradio.app-da tinglang"
      },
      "country": {
        "title": "{country} {type.toUpperCase} radiostansiyalari",
        "desc": "{country} {type.toUpperCase} radio stantsiyalari. {type.toUpperCase} radiostansiyasini Openradio.app-da tinglang"
      }
    }
  },
  "signal": {
    "link": {
      "text": "{frec} {type.toUpperCase}"
    },
    "global": {
      "title": "{frec} {type.toUpperCase} radiosi"
    },
    "country": {
      "title": "{frec} {type.toUpperCase} radio {undefined}}"
    },
    "head": {
      "global": {
        "title": "{type.toUpperCase} {frec} jonli radio stantsiyasi | Openradio.app",
        "desc": "{type.toUpperCase} {frec} dunyo radiolari. Openradio.app-da dunyoning jonli radio stantsiyalarini tinglang"
      },
      "country": {
        "title": "{type.toUpperCase} {frec} jonli radio stantsiyasi | Openradio.app",
        "desc": "{country} dan {type.toUpperCase} {frec} jonli radio stantsiyasi. Openradio.app-da {country} dan jonli radio stantsiyalarini tinglang"
      }
    }
  },
  "langs": {
    "title": "Tillar",
    "head": {
      "title": "Tillar | Openradio.app",
      "desc": "Sizning tilingizda radiostansiyalar | Openradio.app"
    }
  },
  "station": {
    "head": {
      "title": "{station.name} jonli | Openradio.app",
      "desc": "{station.name} jonli, {station.name} jonli tinglang. Openradio.app-da dunyoning barcha mamlakatlaridagi radio stantsiyalari"
    },
    "labels": {
      "slogan": "Shior:",
      "signal": "Signal:",
      "web": "Sayt:",
      "location": "Manzil:",
      "mail": "Pochta:",
      "phone": "Telefon:",
      "twitter": "Twitter:",
      "facebook": "Facebook:",
      "tags": "Teglar:",
      "programming": "Dasturlash"
    },
    "signals": {
      "title": "Chastotalar",
      "type": {
        "amfm": "{frec} {type.toUpperCase}",
        "web": "Internet"
      }
    },
    "tags": {
      "live": "{station.name} jonli",
      "listen": "tinglash {station.name}",
      "listenLive": "jonli tinglang {station.name}",
      "signal": "{station.signal.frec} {station.signal.type.toUpperCase}",
      "signalLive": "{station.signal.frec} {station.signal.type.toUpperCase} jonli",
      "signalListenLive": "Jonli tinglang {station.signal.frec} {station.signal.type.toUpperCase}"
    }
  },
  "recents": {
    "title": "So'nggi xabarlar",
    "head": {
      "title": "So‘nggi | Openradio.app",
      "desc": "Yaqinda radio stantsiyalari tingladi | Openradio.app"
    }
  },
  "nav": {
    "langs": "Boshqa tillar",
    "countries": "Mamlakatlar",
    "recents": "So'nggi xabarlar",
    "genres": "Janrlar",
    "fms": "FM chastotalari",
    "ams": "AM mevalari"
  }
};

export default locale;