import { Module } from "../Locale";
 
const locale: Module = {
  "continents": {
    "sa": "Amerika Selatan",
    "na": "Amerika Utara",
    "ca": "Amerika Tengah",
    "eu": "Eropa",
    "as": "Asia",
    "af": "Afrika",
    "oc": "Oceania"
  },
  "radioCount": "{count} stasiun",
  "globalIndex": {
    "head": {
      "title": "Openradio.app | Stasiun radio dari seluruh dunia",
      "desc": "Openradio.app | Stasiun radio dari seluruh dunia, dengarkan radio online di openradio.app"
    }
  },
  "countryIndex": {
    "title": "Radio dari {country}",
    "head": {
      "title": "Stasiun radio langsung dari {country} | Openradio.app",
      "desc": "Stasiun radio langsung dari {country}, dengarkan stasiun radio online dari {country} di Openradio.app"
    }
  },
  "search": {
    "placeholder": {
      "country": "Cari di {country} ...",
      "global": "Cari di seluruh dunia ..."
    },
    "timing": "{total} menghasilkan {s} detik",
    "head": {
      "global": {
        "title": "{q} | Openradio.app",
        "desc": "{q} cari stasiun radio dari dunia. Stasiun radio online dari dunia di Openradio.app"
      },
      "country": {
        "title": "{q} | Openradio.app",
        "desc": "{q} cari stasiun radio dari {country}. Stasiun radio online dari {country} di Openradio.app"
      }
    }
  },
  "signalList": {
    "global": {
      "title": "{type.toUpperCase} radio"
    },
    "country": {
      "title": "{type.toUpperCase} radio dari {country}"
    },
    "head": {
      "global": {
        "title": "{type.toUpperCase} stasiun radio dari dunia",
        "desc": "{type.toUpperCase} stasiun radio dari dunia. Dengarkan {type.toUpperCase} stasiun radio di Openradio.app"
      },
      "country": {
        "title": "{type.toUpperCase} stasiun radio dari {country}",
        "desc": "{type.toUpperCase} stasiun radio dari {country}. Dengarkan {type.toUpperCase} stasiun radio di Openradio.app"
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
      "title": "{frec} {type.toUpperCase} radio dari {country}"
    },
    "head": {
      "global": {
        "title": "{type.toUpperCase} {frec} stasiun radio langsung | Openradio.app",
        "desc": "{type.toUpperCase} {frec} stasiun radio langsung dari dunia. Dengarkan stasiun radio langsung dari dunia di Openradio.app"
      },
      "country": {
        "title": "{type.toUpperCase} {frec} stasiun radio langsung | Openradio.app",
        "desc": "{type.toUpperCase} {frec} stasiun radio langsung dari {country}. Dengarkan stasiun radio langsung dari {country} di Openradio.app"
      }
    }
  },
  "langs": {
    "title": "Bahasa",
    "head": {
      "title": "Bahasa | Openradio.app",
      "desc": "Stasiun radio dalam bahasa Anda | Openradio.app"
    }
  },
  "station": {
    "head": {
      "title": "{station.name} langsung | Openradio.app",
      "desc": "{station.name} live, dengarkan {station.name} live. Stasiun radio dari seluruh dunia di Openradio.app"
    },
    "labels": {
      "slogan": "Slogan:",
      "signal": "Sinyal:",
      "web": "Situs:",
      "location": "Lokasi:",
      "mail": "Surat:",
      "phone": "Telepon:",
      "twitter": "Indonesia:",
      "facebook": "Facebook:",
      "tags": "Tag:",
      "programming": "Pemrograman"
    },
    "signals": {
      "title": "Frekuensi",
      "type": {
        "amfm": "{frec} {type.toUpperCase}",
        "web": "Web"
      }
    },
    "tags": {
      "live": "{station.name} langsung",
      "listen": "dengarkan {station.name}",
      "listenLive": "dengarkan {station.name} secara langsung",
      "signal": "{station.signal.frec} {station.signal.type.toUpperCase}",
      "signalLive": "{station.signal.frec} {station.signal.type.toUpperCase} langsung",
      "signalListenLive": "Dengarkan {station.signal.frec} {station.signal.type.toUpperCase} secara langsung"
    }
  },
  "recents": {
    "title": "Baru-baru ini",
    "head": {
      "title": "Terbaru | Openradio.app",
      "desc": "Stasiun radio baru-baru ini mendengarkan | Openradio.app"
    }
  },
  "nav": {
    "langs": "Bahasa lainnya",
    "countries": "Negara",
    "recents": "Baru-baru ini",
    "genres": "Genre",
    "fms": "Frekuensi FM",
    "ams": "Frekuensi AM"
  }
};

export default locale;