import { Module } from "../Locale";
 
const locale: Module = {
  "continents": {
    "sa": "Južna Amerika",
    "na": "Severna Amerika",
    "ca": "Srednja Amerika",
    "eu": "Evropa",
    "as": "Azija",
    "af": "Afrika",
    "oc": "Oceanija"
  },
  "radioCount": "{count} postaje",
  "globalIndex": {
    "head": {
      "title": "Openradio.app | Radijske postaje z vsega sveta",
      "desc": "Openradio.app | Radijske postaje z vsega sveta, poslušajte radio na spletu na openradio.app"
    }
  },
  "countryIndex": {
    "title": "Radijski sprejemniki od {country}",
    "head": {
      "title": "Žive radijske postaje od {country} | Openradio.app",
      "desc": "Radijske postaje v živo od {country}, poslušajte spletne radijske postaje od {country} na Openradio.app"
    }
  },
  "search": {
    "placeholder": {
      "country": "Išči {country} ...",
      "global": "Išči po vsem svetu ..."
    },
    "timing": "{total} rezultate v 2 sekundah",
    "head": {
      "global": {
        "title": "{q} | Openradio.app",
        "desc": "{q} poiščite radijske postaje po vsem svetu. Spletne radijske postaje iz sveta na Openradio.app"
      },
      "country": {
        "title": "{q} | Openradio.app",
        "desc": "{q} poiščite radijske postaje od {country}. Spletne radijske postaje od {country} na Openradio.app"
      }
    }
  },
  "signalList": {
    "global": {
      "title": "{type.toUpperCase} radijski sprejemniki"
    },
    "country": {
      "title": "{type.toUpperCase} radijski sprejemniki od {country}"
    },
    "head": {
      "global": {
        "title": "{type.toUpperCase} svetovne radijske postaje",
        "desc": "{type.toUpperCase} svetovne radijske postaje. Poslušajte {type.toUpperCase} radijske postaje na spletni strani Openradio.app"
      },
      "country": {
        "title": "{type.toUpperCase} radijske postaje od {country}",
        "desc": "{type.toUpperCase} radijske postaje od {country}. Poslušajte {type.toUpperCase} radijske postaje na spletni strani Openradio.app"
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
      "title": "{frec} {type.toUpperCase} radio od {country}"
    },
    "head": {
      "global": {
        "title": "{type.toUpperCase} {frec} radijska postaja v živo | Openradio.app",
        "desc": "{type.toUpperCase} {frec} živa radijska postaja iz sveta. Poslušajte v živo radijske postaje iz sveta na Openradio.app"
      },
      "country": {
        "title": "{type.toUpperCase} {frec} radijska postaja v živo | Openradio.app",
        "desc": "{type.toUpperCase} {frec} radijska postaja v živo od {country}. Poslušajte radijske postaje v živo od {country} na Openradio.app"
      }
    }
  },
  "langs": {
    "title": "Jeziki",
    "head": {
      "title": "Jeziki | Openradio.app",
      "desc": "Radijske postaje v vašem jeziku | Openradio.app"
    }
  },
  "station": {
    "head": {
      "title": "{station.name} v živo Openradio.app",
      "desc": "{station.name} v živo, poslušaj {station.name} v živo. Radijske postaje z vsega sveta na Openradio.app"
    },
    "labels": {
      "slogan": "Slogan:",
      "signal": "Signal:",
      "web": "Spletna stran:",
      "location": "Kraj:",
      "mail": "Pošta:",
      "phone": "Telefon:",
      "twitter": "Twitter:",
      "facebook": "Facebook:",
      "tags": "Oznake:",
      "programming": "Programiranje"
    },
    "signals": {
      "title": "Frekvence",
      "type": {
        "amfm": "{frec} {type.toUpperCase}",
        "web": "Splet"
      }
    },
    "tags": {
      "live": "{station.name} v živo",
      "listen": "poslušaj {station.name}",
      "listenLive": "poslušajte {station.name} v živo",
      "signal": "{station.signal.frec} {station.signal.type.toUpperCase}",
      "signalLive": "{station.signal.frec} {station.signal.type.toUpperCase} v živo",
      "signalListenLive": "Poslušajte {station.signal.frec} {station.signal.type.toUpperCase} v živo"
    }
  },
  "recents": {
    "title": "Prejemki",
    "head": {
      "title": "Prejemniki | Openradio.app",
      "desc": "Pred kratkim so poslušali radijske postaje | Openradio.app"
    }
  },
  "nav": {
    "langs": "Drugi jeziki",
    "countries": "Države",
    "recents": "Prejemki",
    "genres": "Žanri",
    "fms": "Frekvence FM",
    "ams": "AM Frekvenca"
  }
};

export default locale;