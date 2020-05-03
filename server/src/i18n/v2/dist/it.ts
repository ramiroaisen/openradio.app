import { Module } from "../Locale";
 
const locale: Module = {
  "continents": {
    "sa": "Sud America",
    "na": "Nord America",
    "ca": "America Centrale",
    "eu": "Europa",
    "as": "Asia",
    "af": "Africa",
    "oc": "Oceania"
  },
  "radioCount": "{count} stazioni",
  "globalIndex": {
    "head": {
      "title": "Openradio.app | Stazioni radio di tutto il mondo",
      "desc": "Openradio.app | Stazioni radio di tutto il mondo, ascolta la radio online su openradio.app"
    }
  },
  "countryIndex": {
    "title": "Le radio di {country}",
    "head": {
      "title": "Stazioni radio in diretta da {country} | Openradio.app",
      "desc": "Stazioni radio in diretta da {country}, ascolta le stazioni radio online da {country} su Openradio.app"
    }
  },
  "search": {
    "placeholder": {
      "country": "Cerca in {country} ...",
      "global": "Cerca in tutto il mondo ..."
    },
    "timing": "{total} risulta in {s} secondi",
    "head": {
      "global": {
        "title": "{q} | Openradio.app",
        "desc": "{q} cerca stazioni radio dal mondo. Stazioni radio online dal mondo su Openradio.app"
      },
      "country": {
        "title": "{q} | Openradio.app",
        "desc": "{q} cerca le stazioni radio da {country}. Stazioni radio online da {country} su Openradio.app"
      }
    }
  },
  "signalList": {
    "global": {
      "title": "{type.toUpperCase} radio"
    },
    "country": {
      "title": "{type.toUpperCase} radio da {country}"
    },
    "head": {
      "global": {
        "title": "{type.toUpperCase} stazioni radio dal mondo",
        "desc": "{type.toUpperCase} stazioni radio dal mondo. Ascolta le {type.toUpperCase} stazioni radio su Openradio.app"
      },
      "country": {
        "title": "{type.toUpperCase} stazioni radio da {country}",
        "desc": "{type.toUpperCase} stazioni radio da {country}. Ascolta {type.toUpperCase} stazioni radio su Openradio.app"
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
      "title": "{frec} {type.toUpperCase} radio da {country}"
    },
    "head": {
      "global": {
        "title": "{type.toUpperCase} {frec} stazione radio in diretta | Openradio.app",
        "desc": "{type.toUpperCase} {frec} stazione radio in diretta dal mondo. Ascolta le stazioni radio in diretta dal mondo su Openradio.app"
      },
      "country": {
        "title": "{type.toUpperCase} {frec} stazione radio in diretta | Openradio.app",
        "desc": "{type.toUpperCase} {frec} stazione radio in diretta da {country}. Ascolta le stazioni radio in diretta da {country} su Openradio.app"
      }
    }
  },
  "langs": {
    "title": "Le lingue",
    "head": {
      "title": "Lingue | Openradio.app",
      "desc": "Stazioni radio nella tua lingua | Openradio.app"
    }
  },
  "station": {
    "head": {
      "title": "{station.name} live | Openradio.app",
      "desc": "{station.name} live, ascolta {station.name} live. Stazioni radio di tutto il mondo su Openradio.app"
    },
    "labels": {
      "slogan": "Slogan:",
      "signal": "Segnale:",
      "web": "Luogo:",
      "location": "Posizione:",
      "mail": "mail:",
      "phone": "Telefono:",
      "twitter": "Twitter:",
      "facebook": "Facebook:",
      "tags": "tag:",
      "programming": "Programmazione"
    },
    "signals": {
      "title": "frequenze",
      "type": {
        "amfm": "{frec} {type.toUpperCase}",
        "web": "ragnatela"
      }
    },
    "tags": {
      "live": "{station.name} live",
      "listen": "ascolta {station.name}",
      "listenLive": "ascolta {station.name} dal vivo",
      "signal": "{station.signal.frec} {station.signal.type.toUpperCase}",
      "signalLive": "{station.signal.frec} {station.signal.type.toUpperCase} live",
      "signalListenLive": "Ascolta {station.signal.frec} {station.signal.type.toUpperCase} in diretta"
    }
  },
  "recents": {
    "title": "Recenti",
    "head": {
      "title": "Recenti | Openradio.app",
      "desc": "Stazioni radio ascoltate di recente | Openradio.app"
    }
  },
  "nav": {
    "langs": "Altre lingue",
    "countries": "paesi",
    "recents": "Recenti",
    "genres": "generi",
    "fms": "Fruttuosità FM",
    "ams": "Fruttuenze AM"
  }
};

export default locale;