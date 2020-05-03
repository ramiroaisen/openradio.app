import { Module } from "../Locale";
 
const locale: Module = {
  "continents": {
    "sa": "Sudamerica",
    "na": "Norteamérica",
    "ca": "Centroamérica",
    "eu": "Europa",
    "as": "Asia",
    "af": "África",
    "oc": "Oceanía"
  },
  "radioCount": "{count} estaciones",
  "globalIndex": {
    "head": {
      "title": "Openradio.app | Estaciones de radio de todo el mundo",
      "desc": "Openradio.app | Estaciones de radio de todo el mundo, escuche la radio en línea en openradio.app"
    }
  },
  "countryIndex": {
    "title": "Radios de {country}",
    "head": {
      "title": "Estaciones de radio en vivo de {country} | Openradio.app",
      "desc": "Estaciones de radio en vivo de {country}, escuche estaciones de radio en línea de {country} en Openradio.app"
    }
  },
  "search": {
    "placeholder": {
      "country": "Buscar en {country} ...",
      "global": "Buscar en todo el mundo ..."
    },
    "timing": "{total} resulta en {s} segundos",
    "head": {
      "global": {
        "title": "{q} | Openradio.app",
        "desc": "{q} busca estaciones de radio del mundo. Emisoras de radio en línea del mundo en Openradio.app"
      },
      "country": {
        "title": "{q} | Openradio.app",
        "desc": "{q} busca estaciones de radio de {country}. Emisoras de radio en línea de {country} en Openradio.app"
      }
    }
  },
  "signalList": {
    "global": {
      "title": "{type.toUpperCase} radios"
    },
    "country": {
      "title": "{type.toUpperCase} radios de {country}"
    },
    "head": {
      "global": {
        "title": "{type.toUpperCase} estaciones de radio del mundo",
        "desc": "{type.toUpperCase} estaciones de radio del mundo. Escuche {type.toUpperCase} estaciones de radio en Openradio.app"
      },
      "country": {
        "title": "{type.toUpperCase} estaciones de radio de {country}",
        "desc": "{type.toUpperCase} estaciones de radio de {country}. Escuche {type.toUpperCase} estaciones de radio en Openradio.app"
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
      "title": "{frec} {type.toUpperCase} radio de {country}"
    },
    "head": {
      "global": {
        "title": "{type.toUpperCase} {frec} estación de radio en vivo | Openradio.app",
        "desc": "{type.toUpperCase} {frec} estación de radio en vivo del mundo. Escuche estaciones de radio en vivo del mundo en Openradio.app"
      },
      "country": {
        "title": "{type.toUpperCase} {frec} estación de radio en vivo | Openradio.app",
        "desc": "{type.toUpperCase} {frec} estación de radio en vivo desde {country}. Escuche estaciones de radio en vivo de {country} en Openradio.app"
      }
    }
  },
  "langs": {
    "title": "Idiomas",
    "head": {
      "title": "Idiomas | Openradio.app",
      "desc": "Estaciones de radio en tu idioma | Openradio.app"
    }
  },
  "station": {
    "head": {
      "title": "{station.name} en vivo | Openradio.app",
      "desc": "{station.name} en vivo, escucha {station.name} en vivo. Estaciones de radio de todo el mundo en Openradio.app"
    },
    "labels": {
      "slogan": "Eslogan:",
      "signal": "Señal:",
      "web": "Sitio:",
      "location": "Ubicación:",
      "mail": "Correo:",
      "phone": "Teléfono:",
      "twitter": "Gorjeo:",
      "facebook": "Facebook:",
      "tags": "Etiquetas:",
      "programming": "Programación"
    },
    "signals": {
      "title": "Frecuencias",
      "type": {
        "amfm": "{frec} {type.toUpperCase}",
        "web": "Web"
      }
    },
    "tags": {
      "live": "{station.name} en vivo",
      "listen": "escucha {station.name}",
      "listenLive": "escuchar {station.name} en vivo",
      "signal": "{station.signal.frec} {station.signal.type.toUpperCase}",
      "signalLive": "{station.signal.frec} {station.signal.type.toUpperCase} en vivo",
      "signalListenLive": "Escucha {station.signal.frec} {station.signal.type.toUpperCase} en vivo"
    }
  },
  "recents": {
    "title": "Recientes",
    "head": {
      "title": "Recientes | Openradio.app",
      "desc": "Estaciones de radio escuchadas recientemente | Openradio.app"
    }
  },
  "nav": {
    "langs": "Otros idiomas",
    "countries": "Países",
    "recents": "Recientes",
    "genres": "Géneros",
    "fms": "Frecuencias FM",
    "ams": "Frecuencias AM"
  }
};

export default locale;