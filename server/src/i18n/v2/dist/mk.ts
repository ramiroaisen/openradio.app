import { Module } from "../Locale";
 
const locale: Module = {
  "continents": {
    "sa": "Јужна Америка",
    "na": "Северна Америка",
    "ca": "Централна Америка",
    "eu": "Европа",
    "as": "Азија",
    "af": "Африка",
    "oc": "Океанија"
  },
  "radioCount": "{count} станици",
  "globalIndex": {
    "head": {
      "title": "Openradio.app | Радиостаници од целиот свет",
      "desc": "Openradio.app | Радиостаниците од целиот свет, слушајте го радиото преку Интернет на openradio.app"
    }
  },
  "countryIndex": {
    "title": "Радија од {country}",
    "head": {
      "title": "Во живо радио станици од {country} | Openradio.app",
      "desc": "Во живо радио станици од 1 {undefined} на Openradio.app"
    }
  },
  "search": {
    "placeholder": {
      "country": "Пребарај во {country} ...",
      "global": "Пребарувајте низ целиот свет ..."
    },
    "timing": "{total} резултира со {s} секунди",
    "head": {
      "global": {
        "title": "{q} | Openradio.app",
        "desc": "{q} пребарувајте радиостаници од светот. Интернет радио станици од светот на Опендидио.ап"
      },
      "country": {
        "title": "{q} | Openradio.app",
        "desc": "{q} пребарувајте радиостаници од {2. Онлајн радио станици од 3 {на Опендидио.ап"
      }
    }
  },
  "signalList": {
    "global": {
      "title": "} 1} радија"
    },
    "country": {
      "title": "} 1} радија од {country}"
    },
    "head": {
      "global": {
        "title": "{type.toUpperCase} радиостаници од светот",
        "desc": "{type.toUpperCase} радиостаници од светот. Слушајте ги радиостаниците {2 at на Openradio.app"
      },
      "country": {
        "title": "} 1} радиостаници од {2",
        "desc": "} 1} радиостаници од {2. Слушајте ги радиостаниците {3 at на Openradio.app"
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
      "title": "{frec} {type.toUpperCase} радио од {3"
    },
    "head": {
      "global": {
        "title": "{type.toUpperCase} {frec} радио станица во живо | Openradio.app",
        "desc": "{type.toUpperCase} {frec} во живо радио станица од светот. Слушајте ги радио станиците во живо од светот на Openradio.app"
      },
      "country": {
        "title": "{type.toUpperCase} {frec} радио станица во живо | Openradio.app",
        "desc": "{type.toUpperCase} {frec} во живо радио станица од 3 {undefined} на Openradio.app"
      }
    }
  },
  "langs": {
    "title": "Јазици",
    "head": {
      "title": "Јазици | Openradio.app",
      "desc": "Радиостаници на ваш јазик | Openradio.app"
    }
  },
  "station": {
    "head": {
      "title": "{station.name} во живо | Openradio.app",
      "desc": "{station.name} во живо, слушајте {station.name} во живо. Радиостаници од целиот свет на Опендидио.app"
    },
    "labels": {
      "slogan": "Слоган:",
      "signal": "Сигнал:",
      "web": "Мапа на страницата:",
      "location": "Локација:",
      "mail": "Пошта:",
      "phone": "Телефон:",
      "twitter": "Твитер:",
      "facebook": "Фејсбук:",
      "tags": "Тагови:",
      "programming": "Програмирање"
    },
    "signals": {
      "title": "Фреквенции",
      "type": {
        "amfm": "{frec} {type.toUpperCase}",
        "web": "веб"
      }
    },
    "tags": {
      "live": "{station.name} во живо",
      "listen": "слушај {1",
      "listenLive": "слушајте {1 во живо",
      "signal": "{station.signal.frec} {station.signal.type.toUpperCase}",
      "signalLive": "{station.signal.frec} {station.signal.type.toUpperCase} во живо",
      "signalListenLive": "Слушајте {station.signal.frec} {station.signal.type.toUpperCase} во живо"
    }
  },
  "recents": {
    "title": "Неодамнешни",
    "head": {
      "title": "Неодамнешни | Openradio.app",
      "desc": "Радиостаниците слушаа неодамна | Openradio.app"
    }
  },
  "nav": {
    "langs": "Други јазици",
    "countries": "Земји",
    "recents": "Неодамнешни",
    "genres": "Genанрови",
    "fms": "Фреквенција на ФМ",
    "ams": "AM Фреквенции"
  }
};

export default locale;