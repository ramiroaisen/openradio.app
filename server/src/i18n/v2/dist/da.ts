import { Module } from "../Locale";
 
const locale: Module = {
  "continents": {
    "sa": "Sydamerika",
    "na": "Nordamerika",
    "ca": "Mellemamerika",
    "eu": "Europa",
    "as": "Asien",
    "af": "Afrika",
    "oc": "Oceanien"
  },
  "radioCount": "{count} stationer",
  "globalIndex": {
    "head": {
      "title": "Openradio.app | Radiostationer fra hele verden",
      "desc": "Openradio.app | Radiostationer fra hele verden, lyt til radioen online på openradio.app"
    }
  },
  "countryIndex": {
    "title": "Radioer fra {country}",
    "head": {
      "title": "Live radiostationer fra {country} | Openradio.app",
      "desc": "Live radiostationer fra {country}, lyt online radiostationer fra {country} på Openradio.app"
    }
  },
  "search": {
    "placeholder": {
      "country": "Søg i {country} ...",
      "global": "Søg i hele verden ..."
    },
    "timing": "{total} resulterer i {s} sekunder",
    "head": {
      "global": {
        "title": "{q} | Openradio.app",
        "desc": "{q} søg radiostationer fra verden. Online radiostationer fra verden på Openradio.app"
      },
      "country": {
        "title": "{q} | Openradio.app",
        "desc": "{q} søg radiostationer fra {country}. Online radiostationer fra {country} på Openradio.app"
      }
    }
  },
  "signalList": {
    "global": {
      "title": "{type.toUpperCase} radioer"
    },
    "country": {
      "title": "{type.toUpperCase} radioer fra {country}"
    },
    "head": {
      "global": {
        "title": "{type.toUpperCase} radiostationer fra verden",
        "desc": "{type.toUpperCase} radiostationer fra verden. Lyt til {type.toUpperCase} radiostationer på Openradio.app"
      },
      "country": {
        "title": "{type.toUpperCase} radiostationer fra {country}",
        "desc": "{type.toUpperCase} radiostationer fra {country}. Lyt til {type.toUpperCase} radiostationer på Openradio.app"
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
      "title": "{frec} {type.toUpperCase} radio fra {country}"
    },
    "head": {
      "global": {
        "title": "{type.toUpperCase} {frec} live radiostation | Openradio.app",
        "desc": "{type.toUpperCase} {frec} live radiostation fra verden. Lyt til live radiostationer fra verden på Openradio.app"
      },
      "country": {
        "title": "{type.toUpperCase} {frec} live radiostation | Openradio.app",
        "desc": "{type.toUpperCase} {frec} live radiostation fra {country}. Lyt til live radiostationer fra {country} på Openradio.app"
      }
    }
  },
  "langs": {
    "title": "Sprog",
    "head": {
      "title": "Sprog | Openradio.app",
      "desc": "Radiostationer på dit sprog | Openradio.app"
    }
  },
  "station": {
    "head": {
      "title": "{station.name} live | Openradio.app",
      "desc": "{station.name} live, lyt til {station.name} live. Radiostationer fra hele verden på Openradio.app"
    },
    "labels": {
      "slogan": "slogan:",
      "signal": "Signal:",
      "web": "site:",
      "location": "Beliggenhed:",
      "mail": "Post:",
      "phone": "Telefon:",
      "twitter": "twitter:",
      "facebook": "Facebook:",
      "tags": "Tags:",
      "programming": "Programmering"
    },
    "signals": {
      "title": "frekvenser",
      "type": {
        "amfm": "{frec} {type.toUpperCase}",
        "web": "Web"
      }
    },
    "tags": {
      "live": "{station.name} live",
      "listen": "lyt til {station.name}",
      "listenLive": "lyt til {station.name} live",
      "signal": "{station.signal.frec} {station.signal.type.toUpperCase}",
      "signalLive": "{station.signal.frec} {station.signal.type.toUpperCase} live",
      "signalListenLive": "Lyt til {station.signal.frec} {station.signal.type.toUpperCase} live"
    }
  },
  "recents": {
    "title": "recents",
    "head": {
      "title": "Nyheder | Openradio.app",
      "desc": "Radiostationer hørte for nylig | Openradio.app"
    }
  },
  "nav": {
    "langs": "Andre sprog",
    "countries": "Lande",
    "recents": "recents",
    "genres": "Genrer",
    "fms": "FM Frecuencies",
    "ams": "AM Frecuencies"
  }
};

export default locale;