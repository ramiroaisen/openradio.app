import { Module } from "../Locale";
 
const locale: Module = {
  "continents": {
    "sa": "Pietų Amerika",
    "na": "Šiaurės Amerika",
    "ca": "Centrinė Amerika",
    "eu": "Europa",
    "as": "Azija",
    "af": "Afrika",
    "oc": "Okeanija"
  },
  "radioCount": "{count} stotys",
  "globalIndex": {
    "head": {
      "title": "„Openradio.app“ Radijo stotys iš viso pasaulio",
      "desc": "„Openradio.app“ Viso pasaulio radijo stotys klausykite radijo internete, naudodamiesi „openradio.app“"
    }
  },
  "countryIndex": {
    "title": "Radijo imtuvai iš {country}",
    "head": {
      "title": "Tiesioginės radijo stotys iš {country} | „Openradio.app“",
      "desc": "Tiesioginės radijo stotys iš {country}, klausykite internetinių radijo stočių iš {country} per Openradio.app"
    }
  },
  "search": {
    "placeholder": {
      "country": "Ieškokite {country} ...",
      "global": "Paieška visame pasaulyje ..."
    },
    "timing": "Rezultatas {total} gaunamas per {s} sekundes",
    "head": {
      "global": {
        "title": "{q} | „Openradio.app“",
        "desc": "{q} ieško radijo stočių iš viso pasaulio. Internetinės radijo stotys iš viso pasaulio yra „Openradio.app“"
      },
      "country": {
        "title": "{q} | „Openradio.app“",
        "desc": "{q} ieškokite radijo stočių iš {country}. Internetinės radijo stotys nuo {country}, esančios Openradio.app"
      }
    }
  },
  "signalList": {
    "global": {
      "title": "{type.toUpperCase} radijo imtuvų"
    },
    "country": {
      "title": "{type.toUpperCase} radijas iš {country}"
    },
    "head": {
      "global": {
        "title": "{type.toUpperCase} radijo stotys iš viso pasaulio",
        "desc": "{type.toUpperCase} radijo stotys iš viso pasaulio. Klausykite {type.toUpperCase} radijo stočių „Openradio.app“"
      },
      "country": {
        "title": "{type.toUpperCase} radijo stotys iš {country}",
        "desc": "{type.toUpperCase} radijo stotys iš {country}. Klausykite {type.toUpperCase} radijo stočių „Openradio.app“"
      }
    }
  },
  "signal": {
    "link": {
      "text": "{frec} {type.toUpperCase}"
    },
    "global": {
      "title": "{frec} {type.toUpperCase} radijas"
    },
    "country": {
      "title": "{frec} {type.toUpperCase} radijas iš {country}"
    },
    "head": {
      "global": {
        "title": "{type.toUpperCase} {frec} tiesioginė radijo stotis | „Openradio.app“",
        "desc": "{type.toUpperCase} {frec} tiesioginė radijo stotis iš viso pasaulio. Klausykite tiesioginių radijo stočių iš viso pasaulio, naudodamiesi „Openradio.app“"
      },
      "country": {
        "title": "{type.toUpperCase} {frec} tiesioginė radijo stotis | „Openradio.app“",
        "desc": "{type.toUpperCase} {frec} tiesioginė radijo stotis iš {country}. Klausykite tiesioginių radijo stočių nuo {country} per „Openradio.app“"
      }
    }
  },
  "langs": {
    "title": "Kalbos",
    "head": {
      "title": "Kalbos | „Openradio.app“",
      "desc": "Radijo stotys jūsų kalba | „Openradio.app“"
    }
  },
  "station": {
    "head": {
      "title": "{station.name} gyvena | „Openradio.app“",
      "desc": "{station.name} gyvai, klausykitės {station.name} gyvai. Radijo stotys iš viso pasaulio per „Openradio.app“"
    },
    "labels": {
      "slogan": "Šūkis:",
      "signal": "Signalas:",
      "web": "Svetainė:",
      "location": "Vieta:",
      "mail": "Paštas:",
      "phone": "Telefonas:",
      "twitter": "„Twitter“:",
      "facebook": "Facebook:",
      "tags": "Žymos:",
      "programming": "Programavimas"
    },
    "signals": {
      "title": "Dažniai",
      "type": {
        "amfm": "{frec} {type.toUpperCase}",
        "web": "Žiniatinklis"
      }
    },
    "tags": {
      "live": "{station.name} gyvena",
      "listen": "klausyk {station.name}",
      "listenLive": "klausyk {station.name} gyvai",
      "signal": "{station.signal.frec} {station.signal.type.toUpperCase}",
      "signalLive": "{station.signal.frec} {station.signal.type.toUpperCase} gyvena",
      "signalListenLive": "Klausykite {station.signal.frec} {station.signal.type.toUpperCase} tiesiogiai"
    }
  },
  "recents": {
    "title": "Pastarieji",
    "head": {
      "title": "Pastarieji | „Openradio.app“",
      "desc": "Radijo stotys klausėsi neseniai „Openradio.app“"
    }
  },
  "nav": {
    "langs": "Kitos kalbos",
    "countries": "Šalys",
    "recents": "Pastarieji",
    "genres": "Žanrai",
    "fms": "FM dažnis",
    "ams": "AM dažnis"
  }
};

export default locale;