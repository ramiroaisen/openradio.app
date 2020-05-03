import { Module } from "../Locale";
 
const locale: Module = {
  "continents": {
    "sa": "América do Sul",
    "na": "América do Norte",
    "ca": "América Central",
    "eu": "Europa",
    "as": "Ásia",
    "af": "África",
    "oc": "Oceânia"
  },
  "radioCount": "{count} estações",
  "globalIndex": {
    "head": {
      "title": "Openradio.app | Estações de rádio de todo o mundo",
      "desc": "Openradio.app | Estações de rádio de todo o mundo, ouça a rádio online em openradio.app"
    }
  },
  "countryIndex": {
    "title": "Rádios de {country}",
    "head": {
      "title": "Estações de rádio ao vivo de {country} | Openradio.app",
      "desc": "Estações de rádio ao vivo de {country}, ouça estações de rádio online de {country} no Openradio.app"
    }
  },
  "search": {
    "placeholder": {
      "country": "Pesquisar em {country} ...",
      "global": "Pesquisar em todo o mundo ..."
    },
    "timing": "{total} resulta em {s} segundos",
    "head": {
      "global": {
        "title": "{q} | Openradio.app",
        "desc": "{q} pesquise estações de rádio do mundo. Estações de rádio online do mundo em Openradio.app"
      },
      "country": {
        "title": "{q} | Openradio.app",
        "desc": "{q} pesquise estações de rádio em {country}. Estações de rádio online de {country} no Openradio.app"
      }
    }
  },
  "signalList": {
    "global": {
      "title": "{type.toUpperCase} rádios"
    },
    "country": {
      "title": "{type.toUpperCase} rádios de {country}"
    },
    "head": {
      "global": {
        "title": "{type.toUpperCase} estações de rádio do mundo",
        "desc": "{type.toUpperCase} estações de rádio do mundo. Ouça {type.toUpperCase} estações de rádio em Openradio.app"
      },
      "country": {
        "title": "{type.toUpperCase} estações de rádio de {country}",
        "desc": "{type.toUpperCase} estações de rádio de {country}. Ouça {type.toUpperCase} estações de rádio em Openradio.app"
      }
    }
  },
  "signal": {
    "link": {
      "text": "{frec} {type.toUpperCase}"
    },
    "global": {
      "title": "Rádio {frec} {type.toUpperCase}"
    },
    "country": {
      "title": "{frec} {type.toUpperCase} rádio de {country}"
    },
    "head": {
      "global": {
        "title": "{type.toUpperCase} {frec} estação de rádio ao vivo | Openradio.app",
        "desc": "{type.toUpperCase} {frec} estação de rádio ao vivo do mundo. Ouça estações de rádio ao vivo do mundo em Openradio.app"
      },
      "country": {
        "title": "{type.toUpperCase} {frec} estação de rádio ao vivo | Openradio.app",
        "desc": "{type.toUpperCase} {frec} estação de rádio ao vivo de {country}. Ouça estações de rádio ao vivo de {country} no Openradio.app"
      }
    }
  },
  "langs": {
    "title": "línguas",
    "head": {
      "title": "Línguas Openradio.app",
      "desc": "Estações de rádio no seu idioma | Openradio.app"
    }
  },
  "station": {
    "head": {
      "title": "{station.name} ao vivo | Openradio.app",
      "desc": "{station.name} ao vivo, ouça {station.name} ao vivo. Estações de rádio de todo o mundo em Openradio.app"
    },
    "labels": {
      "slogan": "Slogan:",
      "signal": "Sinal:",
      "web": "Local:",
      "location": "Localização:",
      "mail": "Enviar:",
      "phone": "Telefone:",
      "twitter": "Twitter:",
      "facebook": "Facebook:",
      "tags": "Tag:",
      "programming": "Programação"
    },
    "signals": {
      "title": "Frequências",
      "type": {
        "amfm": "{frec} {type.toUpperCase}",
        "web": "Rede"
      }
    },
    "tags": {
      "live": "{station.name} ao vivo",
      "listen": "ouça {station.name}",
      "listenLive": "ouça {station.name} ao vivo",
      "signal": "{station.signal.frec} {station.signal.type.toUpperCase}",
      "signalLive": "{station.signal.frec} {station.signal.type.toUpperCase} ao vivo",
      "signalListenLive": "Ouça {station.signal.frec} {station.signal.type.toUpperCase} ao vivo"
    }
  },
  "recents": {
    "title": "Recentes",
    "head": {
      "title": "Recentes Openradio.app",
      "desc": "Estações de rádio ouviram recentemente | Openradio.app"
    }
  },
  "nav": {
    "langs": "Outras línguas",
    "countries": "Países",
    "recents": "Recentes",
    "genres": "Géneros",
    "fms": "Frequências de FM",
    "ams": "Frequências AM"
  }
};

export default locale;