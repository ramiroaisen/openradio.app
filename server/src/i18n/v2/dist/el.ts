import { Module } from "../Locale";
 
const locale: Module = {
  "continents": {
    "sa": "νότια Αμερική",
    "na": "Βόρεια Αμερική",
    "ca": "Κεντρική Αμερική",
    "eu": "Ευρώπη",
    "as": "Ασία",
    "af": "Αφρική",
    "oc": "Ωκεανία"
  },
  "radioCount": "{count} σταθμοί",
  "globalIndex": {
    "head": {
      "title": "Openradio.app | Ραδιοφωνικοί σταθμοί από όλο τον κόσμο",
      "desc": "Openradio.app | Ραδιοφωνικοί σταθμοί από όλο τον κόσμο, ακούστε το ραδιόφωνο online στο openradio.app"
    }
  },
  "countryIndex": {
    "title": "Ραδιόφωνα από {country}",
    "head": {
      "title": "Ζωντανά ραδιοφωνικούς σταθμούς από {country} | Openradio.app",
      "desc": "Ζωντανά ραδιοφωνικούς σταθμούς από το {country}, ακούστε διαδικτυακούς ραδιοφωνικούς σταθμούς από το {country} στο Openradio.app"
    }
  },
  "search": {
    "placeholder": {
      "country": "Αναζήτηση σε {country} ...",
      "global": "Αναζήτηση σε όλο τον κόσμο ..."
    },
    "timing": "{total} αποτελέσματα σε {s} δευτερόλεπτα",
    "head": {
      "global": {
        "title": "{q} | Openradio.app",
        "desc": "{q} αναζήτηση ραδιοφωνικών σταθμών από τον κόσμο. Διαδικτυακοί ραδιοφωνικοί σταθμοί από τον κόσμο στο Openradio.app"
      },
      "country": {
        "title": "{q} | Openradio.app",
        "desc": "{q} αναζήτηση ραδιοφωνικών σταθμών από {country}. Ηλεκτρονικοί ραδιοφωνικοί σταθμοί από το {country} στο Openradio.app"
      }
    }
  },
  "signalList": {
    "global": {
      "title": "{type.toUpperCase} ραδιόφωνα"
    },
    "country": {
      "title": "{type.toUpperCase} ραδιόφωνα από {country}"
    },
    "head": {
      "global": {
        "title": "{type.toUpperCase} ραδιοφωνικοί σταθμοί από τον κόσμο",
        "desc": "{type.toUpperCase} ραδιοφωνικοί σταθμοί από τον κόσμο. Ακούστε {type.toUpperCase} ραδιοφωνικούς σταθμούς στο Openradio.app"
      },
      "country": {
        "title": "{type.toUpperCase} ραδιοφωνικούς σταθμούς από {country}",
        "desc": "{type.toUpperCase} ραδιοφωνικούς σταθμούς από {country}. Ακούστε {type.toUpperCase} ραδιοφωνικούς σταθμούς στο Openradio.app"
      }
    }
  },
  "signal": {
    "link": {
      "text": "{frec} {type.toUpperCase}"
    },
    "global": {
      "title": "{frec} {type.toUpperCase} ραδιόφωνο"
    },
    "country": {
      "title": "{frec} {type.toUpperCase} ραδιόφωνο από {country}"
    },
    "head": {
      "global": {
        "title": "{type.toUpperCase} {frec} ζωντανός ραδιοφωνικός σταθμός | Openradio.app",
        "desc": "{type.toUpperCase} {frec} ζωντανός ραδιοφωνικός σταθμός από τον κόσμο. Ακούστε ζωντανά ραδιοφωνικούς σταθμούς από τον κόσμο στο Openradio.app"
      },
      "country": {
        "title": "{type.toUpperCase} {frec} ζωντανός ραδιοφωνικός σταθμός | Openradio.app",
        "desc": "{type.toUpperCase} {frec} ζωντανός ραδιοφωνικός σταθμός από {country}. Ακούστε ζωντανά ραδιοφωνικούς σταθμούς από το {country} στο Openradio.app"
      }
    }
  },
  "langs": {
    "title": "Γλώσσες",
    "head": {
      "title": "Γλώσσες | Openradio.app",
      "desc": "Ραδιοφωνικοί σταθμοί στη γλώσσα σας | Openradio.app"
    }
  },
  "station": {
    "head": {
      "title": "{station.name} ζωντανά | Openradio.app",
      "desc": "{station.name} ζωντανά, ακούστε {station.name} ζωντανά. Ραδιοφωνικοί σταθμοί από όλο τον κόσμο στο Openradio.app"
    },
    "labels": {
      "slogan": "Σύνθημα:",
      "signal": "Σήμα:",
      "web": "Ιστοσελίδα:",
      "location": "Τοποθεσία:",
      "mail": "Ταχυδρομείο:",
      "phone": "Τηλέφωνο:",
      "twitter": "Κελάδημα:",
      "facebook": "Facebook:",
      "tags": "Ετικέτες:",
      "programming": "Προγραμματισμός"
    },
    "signals": {
      "title": "Συχνότητες",
      "type": {
        "amfm": "{frec} {type.toUpperCase}",
        "web": "Ιστός"
      }
    },
    "tags": {
      "live": "{station.name} ζωντανά",
      "listen": "άκουσμα {station.name}",
      "listenLive": "ακούστε {station.name} ζωντανά",
      "signal": "{station.signal.frec} {station.signal.type.toUpperCase}",
      "signalLive": "{station.signal.frec} {station.signal.type.toUpperCase} ζωντανά",
      "signalListenLive": "Ακούστε ζωντανά {station.signal.frec} {station.signal.type.toUpperCase}"
    }
  },
  "recents": {
    "title": "Πρόσφατα",
    "head": {
      "title": "Πρόσφατες | Openradio.app",
      "desc": "Ακούστηκαν πρόσφατα ραδιοφωνικοί σταθμοί | Openradio.app"
    }
  },
  "nav": {
    "langs": "Αλλες γλώσσες",
    "countries": "Χώρες",
    "recents": "Πρόσφατα",
    "genres": "Είδη",
    "fms": "Συχνότητες FM",
    "ams": "AM Συχνότητες"
  }
};

export default locale;