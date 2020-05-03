import { Module } from "../Locale";
 
const locale: Module = {
  "continents": {
    "sa": "Түштүк Америка",
    "na": "Түндүк Америка",
    "ca": "Борбордук Америка",
    "eu": "Европа",
    "as": "Азия",
    "af": "Африка",
    "oc": "Океания"
  },
  "radioCount": "{count} станциялары",
  "globalIndex": {
    "head": {
      "title": "Openradio.app | Бүткүл дүйнөдөгү радиостанциялар",
      "desc": "Openradio.app | Бүткүл дүйнөдөгү радиостанциялар, радиону openradio.app сайтынан онлайн режиминде угуңуз"
    }
  },
  "countryIndex": {
    "title": "{country} радиосу",
    "head": {
      "title": "{country} | түз ободогу радиостанциялар Openradio.app",
      "desc": "{country} түз ободогу радиостанцияларын, Openradio.app дарегиндеги {country} онлайн радио станцияларын угуңуз"
    }
  },
  "search": {
    "placeholder": {
      "country": "{country} ичинен издөө ...",
      "global": "Дүйнө жүзүндө издөө ..."
    },
    "timing": "{total} натыйжасы {s} секунда ичинде болот",
    "head": {
      "global": {
        "title": "{q} | Openradio.app",
        "desc": "{q} дүйнөдөгү радио станцияларды издөө. Openradio.app дарегиндеги дүйнөдөгү онлайн радиостанциялар"
      },
      "country": {
        "title": "{q} | Openradio.app",
        "desc": "{q} радиостанцияларды {country} издөө. Openradio.app дарегиндеги {country} онлайн радиостанциясы"
      }
    }
  },
  "signalList": {
    "global": {
      "title": "{type.toUpperCase} радиолор"
    },
    "country": {
      "title": "{country} {type.toUpperCase} радиосу"
    },
    "head": {
      "global": {
        "title": "{type.toUpperCase} дүйнөдөгү радиостанциялар",
        "desc": "{type.toUpperCase} дүйнөдөгү радиостанциялар. Openradio.app сайтынан {type.toUpperCase} радиостанцияны угуңуз"
      },
      "country": {
        "title": "{country}деги {type.toUpperCase} радиостанциялар",
        "desc": "{country}деги {type.toUpperCase} радиостанциялар. Openradio.app сайтынан {type.toUpperCase} радиостанцияны угуңуз"
      }
    }
  },
  "signal": {
    "link": {
      "text": "{frec} {type.toUpperCase}"
    },
    "global": {
      "title": "{frec} {type.toUpperCase} радио"
    },
    "country": {
      "title": "{frec} {type.toUpperCase} радио {country}"
    },
    "head": {
      "global": {
        "title": "{type.toUpperCase} {frec} жандуу радиостанциясы | Openradio.app",
        "desc": "{type.toUpperCase} {frec} дүйнөдөн түз ободо. Openradio.app сайтынан дүйнөнүн түз ободогу радио станцияларын угуңуз"
      },
      "country": {
        "title": "{type.toUpperCase} {frec} жандуу радиостанциясы | Openradio.app",
        "desc": "{type.toUpperCase} {frec} түз эфирдик радиостанциясы {country}. Openradio.app сайтынан {country} түз ободогу радио станцияларды угуңуз"
      }
    }
  },
  "langs": {
    "title": "Тилдер",
    "head": {
      "title": "Тилдер | Openradio.app",
      "desc": "Сиздин тилиңиздеги радиостанциялар | Openradio.app"
    }
  },
  "station": {
    "head": {
      "title": "{station.name} жандуу | Openradio.app",
      "desc": "{station.name} жандуу, {station.name} жандуу ук. Openradio.app сайтынан дүйнө жүзүндөгү радиостанциялар"
    },
    "labels": {
      "slogan": "Слоган:",
      "signal": "сигнал:",
      "web": "Сайт:",
      "location": "жайгашкан жери:",
      "mail": "Mail:",
      "phone": "Тел:",
      "twitter": "Twitter:",
      "facebook": "Facebook:",
      "tags": "Tags:",
      "programming": "программалоо"
    },
    "signals": {
      "title": "Толкундар",
      "type": {
        "amfm": "{frec} {type.toUpperCase}",
        "web": "желе"
      }
    },
    "tags": {
      "live": "{station.name} жашайт",
      "listen": "угуу {station.name}",
      "listenLive": "жандуу {station.name} угуңуз",
      "signal": "{station.signal.frec} {station.signal.type.toUpperCase}",
      "signalLive": "{station.signal.frec} {station.signal.type.toUpperCase} жашайт",
      "signalListenLive": "Түз эфирди {station.signal.frec} {station.signal.type.toUpperCase} угуңуз"
    }
  },
  "recents": {
    "title": "Акыркылар",
    "head": {
      "title": "Акыркылар | Openradio.app",
      "desc": "Жакында радиостанциялар угушту | Openradio.app"
    }
  },
  "nav": {
    "langs": "Башка тилдер",
    "countries": "Өлкөлөр",
    "recents": "Акыркылар",
    "genres": "жанры",
    "fms": "FM Frecuencies",
    "ams": "AM Frecuencies"
  }
};

export default locale;