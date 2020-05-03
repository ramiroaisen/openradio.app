import { Module } from "../Locale";
 
const locale: Module = {
  "continents": {
    "sa": "Cənubi Amerika",
    "na": "Şimali Amerika",
    "ca": "Mərkəzi Amerika",
    "eu": "Avropa",
    "as": "Asiya",
    "af": "Afrika",
    "oc": "Okeaniya"
  },
  "radioCount": "{count} stansiyaları",
  "globalIndex": {
    "head": {
      "title": "Openradio.app | Bütün dünyadakı radio stansiyaları",
      "desc": "Openradio.app | Bütün dünyadakı radio stansiyaları, radiou openradio.app-da onlayn dinlə"
    }
  },
  "countryIndex": {
    "title": "{country} radioları",
    "head": {
      "title": "{country} | -dan canlı radio stansiyaları Openradio.app",
      "desc": "{country} -dən canlı radio stansiyaları, {country} -dən Openradio.app-da onlayn radio stansiyalarını dinləyin"
    }
  },
  "search": {
    "placeholder": {
      "country": "{country} -də axtarın ...",
      "global": "Dünyada axtar ..."
    },
    "timing": "{total} {s} saniyə ərzində nəticə verir",
    "head": {
      "global": {
        "title": "{q} | Openradio.app",
        "desc": "{q} dünyadan radio stansiyaları axtarın. Openradio.app saytında dünyanın onlayn radio stansiyaları"
      },
      "country": {
        "title": "{q} | Openradio.app",
        "desc": "{q} radio stansiyalarını {country} -dən axtarın. Onlayn radio stansiyaları {country} -dən Openradio.app"
      }
    }
  },
  "signalList": {
    "global": {
      "title": "{type.toUpperCase} radiolar"
    },
    "country": {
      "title": "{country} dən {type.toUpperCase} radio"
    },
    "head": {
      "global": {
        "title": "{type.toUpperCase} dünyadan gələn radio stansiyaları",
        "desc": "{type.toUpperCase} dünyadan gələn radio stansiyaları. {type.toUpperCase} radio stansiyalarını Openradio.app saytında dinləyin"
      },
      "country": {
        "title": "{type.toUpperCase} radio stansiyaları {country}",
        "desc": "{type.toUpperCase} radio stansiyaları. {type.toUpperCase} radio stansiyalarını Openradio.app saytında dinləyin"
      }
    }
  },
  "signal": {
    "link": {
      "text": "{frec} {type.toUpperCase}"
    },
    "global": {
      "title": "{frec} {type.toUpperCase} radio"
    },
    "country": {
      "title": "{country} dən {frec} {type.toUpperCase} radio"
    },
    "head": {
      "global": {
        "title": "{type.toUpperCase} {frec} canlı radio stansiyası | Openradio.app",
        "desc": "{type.toUpperCase} {frec} dünyadan canlı radio stansiyası. Openradio.app saytında dünyanın canlı radio stansiyalarına qulaq asın"
      },
      "country": {
        "title": "{type.toUpperCase} {frec} canlı radio stansiyası | Openradio.app",
        "desc": "{country} -dən {type.toUpperCase} {frec} canlı radio stansiyası. Openradio.app saytında {country} -dən canlı radio stansiyalarına qulaq asın"
      }
    }
  },
  "langs": {
    "title": "Dillər",
    "head": {
      "title": "Dillər | Openradio.app",
      "desc": "Dilinizdə radio stansiyaları | Openradio.app"
    }
  },
  "station": {
    "head": {
      "title": "{station.name} canlı | Openradio.app",
      "desc": "{station.name} canlı, {station.name} canlı dinlə. Openradio.app saytında dünyanın hər yerindən gələn radio stansiyaları"
    },
    "labels": {
      "slogan": "Şüar:",
      "signal": "Siqnal:",
      "web": "Sayt:",
      "location": "Məkan:",
      "mail": "Poçt:",
      "phone": "Telefon:",
      "twitter": "Twitter:",
      "facebook": "Facebook:",
      "tags": "Teqlər:",
      "programming": "Proqramlaşdırma"
    },
    "signals": {
      "title": "Tezliklər",
      "type": {
        "amfm": "{frec} {type.toUpperCase}",
        "web": "Veb"
      }
    },
    "tags": {
      "live": "{station.name} yaşayır",
      "listen": "qulaq asın {station.name}",
      "listenLive": "canlı dinlə {station.name}",
      "signal": "{station.signal.frec} {station.signal.type.toUpperCase}",
      "signalLive": "{station.signal.frec} {station.signal.type.toUpperCase} yaşayır",
      "signalListenLive": "Canlı dinlə {station.signal.frec} {station.signal.type.toUpperCase}"
    }
  },
  "recents": {
    "title": "Tecili",
    "head": {
      "title": "Təqvimlər | Openradio.app",
      "desc": "Bu yaxınlarda radio stansiyaları qulaq asdı | Openradio.app"
    }
  },
  "nav": {
    "langs": "Başqa dillər",
    "countries": "Ölkələr",
    "recents": "Tecili",
    "genres": "Janrlar",
    "fms": "FM fraqmentləri",
    "ams": "AM Frecuencies"
  }
};

export default locale;