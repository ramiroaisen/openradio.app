import { Module } from "../Locale";
 
const locale: Module = {
  "continents": {
    "sa": "Јужна Америка",
    "na": "Северна Америка",
    "ca": "Централна Америка",
    "eu": "Европа",
    "as": "Азија",
    "af": "Африка",
    "oc": "Оцеаниа"
  },
  "radioCount": "{count} станице",
  "globalIndex": {
    "head": {
      "title": "Опенрадио.апп | Радио станице из целог света",
      "desc": "Опенрадио.апп | Радио станице из свих крајева света, слушајте радио онлине на опенрадио.апп"
    }
  },
  "countryIndex": {
    "title": "Радио од {country}",
    "head": {
      "title": "Ливе радио станице од {country} | Опенрадио.апп",
      "desc": "Радио станице уживо од {country}, слушајте мрежне радио станице од {country} на Опенрадио.апп"
    }
  },
  "search": {
    "placeholder": {
      "country": "Претражите {country} ...",
      "global": "Претражите широм света ..."
    },
    "timing": "{total} резултира за {s} секунди",
    "head": {
      "global": {
        "title": "{q} | Опенрадио.апп",
        "desc": "{q} претражујте светске радио станице. Онлине светске радио станице на Опенрадио.апп"
      },
      "country": {
        "title": "{q} | Опенрадио.апп",
        "desc": "{q} тражите радио станице од {country}. Онлине радио станице од {country} на Опенрадио.апп"
      }
    }
  },
  "signalList": {
    "global": {
      "title": "{type.toUpperCase} радио"
    },
    "country": {
      "title": "{type.toUpperCase} радио станице од {country}"
    },
    "head": {
      "global": {
        "title": "{type.toUpperCase} светске радио станице",
        "desc": "{type.toUpperCase} светске радио станице. Слушајте {type.toUpperCase} радио станице на Опенрадио.апп"
      },
      "country": {
        "title": "{type.toUpperCase} радио станице од {country}",
        "desc": "{type.toUpperCase} радио станице од {country}. Слушајте {type.toUpperCase} радио станице на Опенрадио.апп"
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
      "title": "{frec} {type.toUpperCase} радио од {country}"
    },
    "head": {
      "global": {
        "title": "{type.toUpperCase} {frec} радио станица уживо Опенрадио.апп",
        "desc": "{type.toUpperCase} {frec} жива радио станица из света. Слушајте радио станице уживо из света на Опенрадио.апп"
      },
      "country": {
        "title": "{type.toUpperCase} {frec} радио станица уживо Опенрадио.апп",
        "desc": "{type.toUpperCase} {frec} ливе радио од {country}. Слушајте радио станице уживо од {country} на Опенрадио.апп"
      }
    }
  },
  "langs": {
    "title": "Језици",
    "head": {
      "title": "Језици | Опенрадио.апп",
      "desc": "Радио станице на вашем језику | Опенрадио.апп"
    }
  },
  "station": {
    "head": {
      "title": "{station.name} уживо | Опенрадио.апп",
      "desc": "{station.name} уживо, слушај {station.name} уживо. Радио станице из целог света на Опенрадио.апп"
    },
    "labels": {
      "slogan": "Слоган:",
      "signal": "Сигнал:",
      "web": "Сите:",
      "location": "Локација:",
      "mail": "Пошта:",
      "phone": "Телефон:",
      "twitter": "Твиттер:",
      "facebook": "Фејсбук:",
      "tags": "Ознаке:",
      "programming": "Програмирање"
    },
    "signals": {
      "title": "Фреквенције",
      "type": {
        "amfm": "{frec} {type.toUpperCase}",
        "web": "Веб"
      }
    },
    "tags": {
      "live": "{station.name} уживо",
      "listen": "слушај {station.name}",
      "listenLive": "слушајте уживо {station.name}",
      "signal": "{station.signal.frec} {station.signal.type.toUpperCase}",
      "signalLive": "{station.signal.frec} {station.signal.type.toUpperCase} уживо",
      "signalListenLive": "Слушајте уживо {station.signal.frec} {station.signal.type.toUpperCase}"
    }
  },
  "recents": {
    "title": "Рецентс",
    "head": {
      "title": "Рецентс | Опенрадио.апп",
      "desc": "Недавно су преслушаване радио станице | Опенрадио.апп"
    }
  },
  "nav": {
    "langs": "Остали језици",
    "countries": "Земље",
    "recents": "Рецентс",
    "genres": "Жанрови",
    "fms": "ФМ Фреквенције",
    "ams": "АМ Фрецуенци"
  }
};

export default locale;