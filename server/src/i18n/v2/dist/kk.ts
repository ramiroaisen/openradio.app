import { Module } from "../Locale";
 
const locale: Module = {
  "continents": {
    "sa": "Оңтүстік Америка",
    "na": "Солтүстік Америка",
    "ca": "Орталық Америка",
    "eu": "Еуропа",
    "as": "Азия",
    "af": "Африка",
    "oc": "Мұхит"
  },
  "radioCount": "{count} станциялары",
  "globalIndex": {
    "head": {
      "title": "Openradio.app | Бүкіл әлемдегі радиостанциялар",
      "desc": "Openradio.app | Бүкіл әлемдегі радиостанциялар, радионы openradio.app сайтында онлайн тыңдаңыз"
    }
  },
  "countryIndex": {
    "title": "{country} радиосы",
    "head": {
      "title": "{country} | тікелей эфиріндегі радиостанциялар Openradio.app",
      "desc": "{country} -ден тікелей радиостанциялар, Openradio.app сайтындағы {country} онлайн радиостанцияларын тыңдаңыз"
    }
  },
  "search": {
    "placeholder": {
      "country": "{country} ішінен іздеу ...",
      "global": "Әлем бойынша іздеу ..."
    },
    "timing": "{total} нәтижелері {s} секундта шығады",
    "head": {
      "global": {
        "title": "{q} | Openradio.app",
        "desc": "{q} әлемдегі радиостанцияларды іздеу. Әлемдегі онлайн радиостанциялар: Openradio.app"
      },
      "country": {
        "title": "{q} | Openradio.app",
        "desc": "{q} радиостанцияларды {country} ішінен іздеу. Openradio.app сайтындағы {country} онлайн радиостанциясы"
      }
    }
  },
  "signalList": {
    "global": {
      "title": "{type.toUpperCase} радиолар"
    },
    "country": {
      "title": "{country} {type.toUpperCase} радиосы"
    },
    "head": {
      "global": {
        "title": "{type.toUpperCase} әлемдегі радиостанциялар",
        "desc": "{type.toUpperCase} әлемдегі радиостанциялар. {type.toUpperCase} радиостанцияларын Openradio.app сайтынан тыңдаңыз"
      },
      "country": {
        "title": "{country} {type.toUpperCase} радиостанциясы",
        "desc": "{type.toUpperCase} радиостанциялары. {type.toUpperCase} радиостанцияларын Openradio.app сайтынан тыңдаңыз"
      }
    }
  },
  "signal": {
    "link": {
      "text": "{frec} {type.toUpperCase}"
    },
    "global": {
      "title": "{frec} {type.toUpperCase} радиосы"
    },
    "country": {
      "title": "{frec} {type.toUpperCase} радиосы {country}"
    },
    "head": {
      "global": {
        "title": "{type.toUpperCase} {frec} тікелей радиостанциясы | Openradio.app",
        "desc": "{type.toUpperCase} {frec} әлемдегі тікелей радиостанция. Openradio.app сайтынан әлемдегі тікелей радиостанцияларды тыңдаңыз"
      },
      "country": {
        "title": "{type.toUpperCase} {frec} тікелей радиостанциясы | Openradio.app",
        "desc": "{type.toUpperCase} {frec} тікелей радиостанциясы {country}. Openradio.app сайтындағы {country} -ден тікелей радиостанцияларды тыңдаңыз"
      }
    }
  },
  "langs": {
    "title": "Тілдер",
    "head": {
      "title": "Тілдер | Openradio.app",
      "desc": "Сіздің тіліңіздегі радиостанциялар | Openradio.app"
    }
  },
  "station": {
    "head": {
      "title": "{station.name} тірі | Openradio.app",
      "desc": "{station.name} тірі, {station.name} тікелей эфирді тыңдаңыз. Openradio.app сайтында бүкіл әлемнің радиостанциялары"
    },
    "labels": {
      "slogan": "Ұран:",
      "signal": "Сигнал:",
      "web": "Сайт:",
      "location": "Тұрған орыны:",
      "mail": "Пошта:",
      "phone": "Телефон:",
      "twitter": "Twitter:",
      "facebook": "Facebook:",
      "tags": "Тегтер:",
      "programming": "Бағдарламалау"
    },
    "signals": {
      "title": "Жиіліктер",
      "type": {
        "amfm": "{frec} {type.toUpperCase}",
        "web": "желі"
      }
    },
    "tags": {
      "live": "{station.name} тірі",
      "listen": "тыңдау {station.name}",
      "listenLive": "тікелей эфирді тыңдаңыз",
      "signal": "{station.signal.frec} {station.signal.type.toUpperCase}",
      "signalLive": "{station.signal.frec} {station.signal.type.toUpperCase} тірі",
      "signalListenLive": "Тікелей эфирде {station.signal.frec} {station.signal.type.toUpperCase} тыңдаңыз"
    }
  },
  "recents": {
    "title": "Өткендер",
    "head": {
      "title": "Өткендер | Openradio.app",
      "desc": "Жақында радиостанциялар тыңдады | Openradio.app"
    }
  },
  "nav": {
    "langs": "Басқа тілдер",
    "countries": "Елдер",
    "recents": "Өткендер",
    "genres": "Жанрлар",
    "fms": "FM фрукттары",
    "ams": "AM Жемістер"
  }
};

export default locale;