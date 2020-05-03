import { Module } from "../Locale";
 
const locale: Module = {
  "continents": {
    "sa": "Dienvidamerika",
    "na": "Ziemeļamerika",
    "ca": "Centrālamerika",
    "eu": "Eiropa",
    "as": "Āzija",
    "af": "Āfrika",
    "oc": "Okeānija"
  },
  "radioCount": "{count} stacijas",
  "globalIndex": {
    "head": {
      "title": "Openradio.app | Radiostacijas no visas pasaules",
      "desc": "Openradio.app | Radio stacijas no visas pasaules, klausieties radio tiešsaistē vietnē openradio.app"
    }
  },
  "countryIndex": {
    "title": "Radioaparāti no {country}",
    "head": {
      "title": "Tiešraides radio stacijas no {country} | Openradio.app",
      "desc": "Tiešraides radiostacijas no {country}, klausieties tiešsaistes radiostacijas no {country} vietnē Openradio.app"
    }
  },
  "search": {
    "placeholder": {
      "country": "Meklēt {country} ...",
      "global": "Meklēt visā pasaulē ..."
    },
    "timing": "Rezultāts {total} tiek iegūts {s} sekundēs",
    "head": {
      "global": {
        "title": "{q} | Openradio.app",
        "desc": "{q} meklē radiostacijas no visas pasaules. Tiešsaistes radiostacijas no visas pasaules vietnē Openradio.app"
      },
      "country": {
        "title": "{q} | Openradio.app",
        "desc": "{q} meklējiet radiostacijas no {country}. Tiešsaistes radiostacijas no {country} vietnē Openradio.app"
      }
    }
  },
  "signalList": {
    "global": {
      "title": "{type.toUpperCase} radioaparāti"
    },
    "country": {
      "title": "{type.toUpperCase} radioaparāti no {country}"
    },
    "head": {
      "global": {
        "title": "{type.toUpperCase} radiostacijas no visas pasaules",
        "desc": "{type.toUpperCase} radiostacijas no visas pasaules. Klausieties {type.toUpperCase} radiostacijas vietnē Openradio.app"
      },
      "country": {
        "title": "{type.toUpperCase} radiostacijas no {country}",
        "desc": "{type.toUpperCase} radiostacijas no {country}. Klausieties {type.toUpperCase} radiostacijas vietnē Openradio.app"
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
      "title": "{frec} {type.toUpperCase} radio no {country}"
    },
    "head": {
      "global": {
        "title": "{type.toUpperCase} {frec} tiešraides stacija | Openradio.app",
        "desc": "{type.toUpperCase} {frec} tiešraidē no visas pasaules. Klausieties tiešraidē radiostacijas no visas pasaules vietnē Openradio.app"
      },
      "country": {
        "title": "{type.toUpperCase} {frec} tiešraides stacija | Openradio.app",
        "desc": "{type.toUpperCase} {frec} tiešraides stacija no {country}. Klausieties tiešsaistes radio stacijas no {country} vietnē Openradio.app"
      }
    }
  },
  "langs": {
    "title": "Valodas",
    "head": {
      "title": "Valodas | Openradio.app",
      "desc": "Radiostacijas jūsu valodā | Openradio.app"
    }
  },
  "station": {
    "head": {
      "title": "{station.name} dzīvo | Openradio.app",
      "desc": "{station.name} dzīvojiet, klausieties {station.name} tiešraidē. Radio stacijas no visas pasaules vietnē Openradio.app"
    },
    "labels": {
      "slogan": "Sauklis:",
      "signal": "Signāls:",
      "web": "Vietne:",
      "location": "Atrašanās vieta:",
      "mail": "Pasts:",
      "phone": "Tālrunis:",
      "twitter": "Twitter:",
      "facebook": "Facebook:",
      "tags": "Tags:",
      "programming": "Programmēšana"
    },
    "signals": {
      "title": "Frekvences",
      "type": {
        "amfm": "{frec} {type.toUpperCase}",
        "web": "Web"
      }
    },
    "tags": {
      "live": "{station.name} dzīvo",
      "listen": "klausies {station.name}",
      "listenLive": "klausieties {station.name} tiešraidē",
      "signal": "{station.signal.frec} {station.signal.type.toUpperCase}",
      "signalLive": "{station.signal.frec} {station.signal.type.toUpperCase} dzīvo",
      "signalListenLive": "Klausieties {station.signal.frec} {station.signal.type.toUpperCase} tiešraidē"
    }
  },
  "recents": {
    "title": "Pēdējie",
    "head": {
      "title": "Pēdējie Openradio.app",
      "desc": "Radiostacijas klausījās nesen Openradio.app"
    }
  },
  "nav": {
    "langs": "Citas valodas",
    "countries": "Valstis",
    "recents": "Pēdējie",
    "genres": "Žanri",
    "fms": "FM frekvences",
    "ams": "AM frekvences"
  }
};

export default locale;