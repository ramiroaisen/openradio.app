import { Module } from "../Locale";
 
const locale: Module = {
  "continents": {
    "sa": "Sør Amerika",
    "na": "Nord Amerika",
    "ca": "Sentral-Amerika",
    "eu": "Europa",
    "as": "Asia",
    "af": "Afrika",
    "oc": "Oceania"
  },
  "radioCount": "{count} stasjoner",
  "globalIndex": {
    "head": {
      "title": "Openradio.app | Radiostasjoner fra hele verden",
      "desc": "Openradio.app | Radiostasjoner fra hele verden, hør på radio på nettet på openradio.app"
    }
  },
  "countryIndex": {
    "title": "Radioer fra {country}",
    "head": {
      "title": "Live radiostasjoner fra {country} | Openradio.app",
      "desc": "Live radiostasjoner fra {country}, lytt radiostasjoner på nettet fra {country} på Openradio.app"
    }
  },
  "search": {
    "placeholder": {
      "country": "Søk på {country} ...",
      "global": "Søk over hele verden ..."
    },
    "timing": "{total} resulterer i {s} sekunder",
    "head": {
      "global": {
        "title": "{q} | Openradio.app",
        "desc": "{q} søk radiostasjoner fra hele verden. Online radiostasjoner fra hele verden på Openradio.app"
      },
      "country": {
        "title": "{q} | Openradio.app",
        "desc": "{q} søk radiostasjoner fra {country}. Online radiostasjoner fra {country} på Openradio.app"
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
        "title": "{type.toUpperCase} radiostasjoner fra hele verden",
        "desc": "{type.toUpperCase} radiostasjoner fra hele verden. Lytt til {type.toUpperCase} radiostasjoner på Openradio.app"
      },
      "country": {
        "title": "{type.toUpperCase} radiostasjoner fra {country}",
        "desc": "{type.toUpperCase} radiostasjoner fra {country}. Lytt til {type.toUpperCase} radiostasjoner på Openradio.app"
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
        "title": "{type.toUpperCase} {frec} direktesendt radiostasjon | Openradio.app",
        "desc": "{type.toUpperCase} {frec} live radiostasjon fra hele verden. Lytt til live radiostasjoner fra hele verden på Openradio.app"
      },
      "country": {
        "title": "{type.toUpperCase} {frec} direktesendt radiostasjon | Openradio.app",
        "desc": "{type.toUpperCase} {frec} direktesendt radiostasjon fra {country}. Hør live radiostasjoner fra {country} på Openradio.app"
      }
    }
  },
  "langs": {
    "title": "språk",
    "head": {
      "title": "Språk | Openradio.app",
      "desc": "Radiostasjoner på ditt språk | Openradio.app"
    }
  },
  "station": {
    "head": {
      "title": "{station.name} live | Openradio.app",
      "desc": "{station.name} live, lytt til {station.name} live. Radiostasjoner fra hele verden på Openradio.app"
    },
    "labels": {
      "slogan": "slagord:",
      "signal": "Signal:",
      "web": "Nettstedet:",
      "location": "Plassering:",
      "mail": "Post:",
      "phone": "telefon:",
      "twitter": "twitter:",
      "facebook": "Facebook:",
      "tags": "Tags:",
      "programming": "programmering"
    },
    "signals": {
      "title": "frekvenser",
      "type": {
        "amfm": "{frec} {type.toUpperCase}",
        "web": "web"
      }
    },
    "tags": {
      "live": "{station.name} live",
      "listen": "hør på {station.name}",
      "listenLive": "hør på {station.name} live",
      "signal": "{station.signal.frec} {station.signal.type.toUpperCase}",
      "signalLive": "{station.signal.frec} {station.signal.type.toUpperCase} live",
      "signalListenLive": "Lytt til {station.signal.frec} {station.signal.type.toUpperCase} live"
    }
  },
  "recents": {
    "title": "Sist brukte",
    "head": {
      "title": "Nyheter | Openradio.app",
      "desc": "Radiostasjoner hørte nylig | Openradio.app"
    }
  },
  "nav": {
    "langs": "Andre språk",
    "countries": "land",
    "recents": "Sist brukte",
    "genres": "sjangere",
    "fms": "FM Frecuencies",
    "ams": "AM Frecuencies"
  }
};

export default locale;