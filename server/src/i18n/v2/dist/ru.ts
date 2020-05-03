import { Module } from "../Locale";
 
const locale: Module = {
  "continents": {
    "sa": "Южная Америка",
    "na": "Северная Америка",
    "ca": "Центральная Америка",
    "eu": "Европа",
    "as": "Азия",
    "af": "Африка",
    "oc": "Океания"
  },
  "radioCount": "{count} станций",
  "globalIndex": {
    "head": {
      "title": "Openradio.app | Радиостанции со всего мира",
      "desc": "Openradio.app | Радиостанции со всего мира, слушайте радио онлайн на openradio.app"
    }
  },
  "countryIndex": {
    "title": "Радио от {country}",
    "head": {
      "title": "Прямые радиостанции от {country} | Openradio.app",
      "desc": "Прямые радиостанции из {country}, слушайте онлайн радиостанции из {country} на Openradio.app"
    }
  },
  "search": {
    "placeholder": {
      "country": "Искать в {country} ...",
      "global": "Поиск по всему миру ..."
    },
    "timing": "{total} результат за {s} секунды",
    "head": {
      "global": {
        "title": "{q} | Openradio.app",
        "desc": "{q} поиск радиостанций мира. Онлайн радиостанции со всего мира на Openradio.app"
      },
      "country": {
        "title": "{q} | Openradio.app",
        "desc": "{q} поиск радиостанций из {country}. Онлайн радиостанции из {country} на Openradio.app"
      }
    }
  },
  "signalList": {
    "global": {
      "title": "{type.toUpperCase} радио"
    },
    "country": {
      "title": "{type.toUpperCase} радио из {country}"
    },
    "head": {
      "global": {
        "title": "{type.toUpperCase} радиостанции мира",
        "desc": "{type.toUpperCase} радиостанции мира. Слушайте {type.toUpperCase} радиостанций на Openradio.app"
      },
      "country": {
        "title": "{type.toUpperCase} радиостанции из {country}",
        "desc": "{type.toUpperCase} радиостанции из {country}. Слушайте {type.toUpperCase} радиостанций на Openradio.app"
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
      "title": "{frec} {type.toUpperCase} радио от {country}"
    },
    "head": {
      "global": {
        "title": "{type.toUpperCase} {frec} прямая радиостанция | Openradio.app",
        "desc": "{type.toUpperCase} {frec} прямая радиостанция мира. Слушайте прямые радиостанции со всего мира на Openradio.app"
      },
      "country": {
        "title": "{type.toUpperCase} {frec} прямая радиостанция | Openradio.app",
        "desc": "{type.toUpperCase} {frec} прямая радиостанция из {country}. Слушайте прямые радиостанции из {country} на Openradio.app"
      }
    }
  },
  "langs": {
    "title": "Языки",
    "head": {
      "title": "Языки | Openradio.app",
      "desc": "Радиостанции на вашем языке | Openradio.app"
    }
  },
  "station": {
    "head": {
      "title": "{station.name} в прямом эфире | Openradio.app",
      "desc": "{station.name} живи, слушай {station.name} живи. Радиостанции со всего мира на Openradio.app"
    },
    "labels": {
      "slogan": "Лозунг:",
      "signal": "Сигнал:",
      "web": "Сайт:",
      "location": "Расположение:",
      "mail": "Mail:",
      "phone": "Телефон:",
      "twitter": "Twitter:",
      "facebook": "facebook:",
      "tags": "Метки:",
      "programming": "программирование"
    },
    "signals": {
      "title": "частоты",
      "type": {
        "amfm": "{frec} {type.toUpperCase}",
        "web": "Web"
      }
    },
    "tags": {
      "live": "{station.name} в прямом эфире",
      "listen": "слушать {station.name}",
      "listenLive": "слушать {station.name} вживую",
      "signal": "{station.signal.frec} {station.signal.type.toUpperCase}",
      "signalLive": "{station.signal.frec} {station.signal.type.toUpperCase} в прямом эфире",
      "signalListenLive": "Слушайте {station.signal.frec} {station.signal.type.toUpperCase} вживую"
    }
  },
  "recents": {
    "title": "Недавние",
    "head": {
      "title": "Последние | Openradio.app",
      "desc": "Радиостанции слушали недавно | Openradio.app"
    }
  },
  "nav": {
    "langs": "Другие языки",
    "countries": "страны",
    "recents": "Недавние",
    "genres": "Жанры",
    "fms": "FM Frecuencies",
    "ams": "AM Frecuencies"
  }
};

export default locale;