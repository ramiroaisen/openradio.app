import { Module } from "../Locale";
 
const locale: Module = {
  "continents": {
    "sa": "America de Sud",
    "na": "America de Nord",
    "ca": "America Centrală",
    "eu": "Europa",
    "as": "Asia",
    "af": "Africa",
    "oc": "Oceania"
  },
  "radioCount": "{count} stații",
  "globalIndex": {
    "head": {
      "title": "Openradio.app | Posturi de radio din toată lumea",
      "desc": "Openradio.app | Posturi de radio din toată lumea, ascultați radioul online pe openradio.app"
    }
  },
  "countryIndex": {
    "title": "Radiouri de la {country}",
    "head": {
      "title": "Posturi de radio în direct de la {country} | Openradio.app",
      "desc": "Posturi de radio în direct din {country}, ascultați posturi de radio online de la {country} la Openradio.app"
    }
  },
  "search": {
    "placeholder": {
      "country": "Căutați în {country} ...",
      "global": "Căutați în toată lumea ..."
    },
    "timing": "{total} rezultă în {s} secunde",
    "head": {
      "global": {
        "title": "{q} | Openradio.app",
        "desc": "{q} căutați posturi de radio din lume. Posturi de radio online din lume, la Openradio.app"
      },
      "country": {
        "title": "{q} | Openradio.app",
        "desc": "{q} căutați posturi de radio din {country}. Posturi de radio online de la {country} la Openradio.app"
      }
    }
  },
  "signalList": {
    "global": {
      "title": "Radioane {type.toUpperCase}"
    },
    "country": {
      "title": "{type.toUpperCase} radiouri de la {country}"
    },
    "head": {
      "global": {
        "title": "{type.toUpperCase} posturi de radio din lume",
        "desc": "{type.toUpperCase} posturi de radio din lume. Ascultați {type.toUpperCase} posturi de radio la Openradio.app"
      },
      "country": {
        "title": "{type.toUpperCase} posturi de radio de la {country}",
        "desc": "{type.toUpperCase} posturi de radio de la {country}. Ascultați {type.toUpperCase} posturi de radio la Openradio.app"
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
      "title": "{frec} {type.toUpperCase} radio de la {country}"
    },
    "head": {
      "global": {
        "title": "{type.toUpperCase} {frec} post de radio în direct | Openradio.app",
        "desc": "{type.toUpperCase} {frec} post de radio în direct din lume. Ascultați posturi de radio în direct din Openradio.app"
      },
      "country": {
        "title": "{type.toUpperCase} {frec} post de radio în direct | Openradio.app",
        "desc": "{type.toUpperCase} {frec} post de radio în direct de la {country}. Ascultați posturi de radio în direct de la {country} la Openradio.app"
      }
    }
  },
  "langs": {
    "title": "Limbile",
    "head": {
      "title": "Limbi | Openradio.app",
      "desc": "Posturi de radio în limba dvs. | Openradio.app"
    }
  },
  "station": {
    "head": {
      "title": "{station.name} live | Openradio.app",
      "desc": "{station.name} live, asculta {station.name} live. Posturi de radio din întreaga lume la Openradio.app"
    },
    "labels": {
      "slogan": "Slogan:",
      "signal": "Semnal:",
      "web": "site-ul:",
      "location": "Locație:",
      "mail": "Poștă:",
      "phone": "Telefon:",
      "twitter": "Stare de nervozitate:",
      "facebook": "Facebook:",
      "tags": "Etichete:",
      "programming": "Programare"
    },
    "signals": {
      "title": "frecvenţe",
      "type": {
        "amfm": "{frec} {type.toUpperCase}",
        "web": "Web"
      }
    },
    "tags": {
      "live": "{station.name} în direct",
      "listen": "asculta {station.name}",
      "listenLive": "asculta {station.name} în direct",
      "signal": "{station.signal.frec} {station.signal.type.toUpperCase}",
      "signalLive": "{station.signal.frec} {station.signal.type.toUpperCase} în direct",
      "signalListenLive": "Ascultați {station.signal.frec} {station.signal.type.toUpperCase} în direct"
    }
  },
  "recents": {
    "title": "Recente",
    "head": {
      "title": "Recents | Openradio.app",
      "desc": "Posturile de radio au ascultat recent | Openradio.app"
    }
  },
  "nav": {
    "langs": "Alte limbi",
    "countries": "ţări",
    "recents": "Recente",
    "genres": "genuri",
    "fms": "Frecvențe FM",
    "ams": "Frecvențe AM"
  }
};

export default locale;