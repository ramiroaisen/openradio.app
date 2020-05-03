import { Module } from "../Locale";

export const locale: Module = {

  continents: {
    sa: "América del Sur",
    na: "América del Norte",
    ca: "América Central",
    eu: "Europa",
    af: "Africa",
    as: "Asia",
    oc: "Oceanía"
  },

  radioCount: "{count} radios",

  globalIndex: {
    head: {
      title: "Openradio.app | Radios de todo el mundo en vivo por internet",
      desc: "Openradio.app | Radios de todo el mundo, Escucha radios en vivo por internet en Openradio.app",
    }
  },

  countryIndex: {
    title: "Radios de {country}",
    head: {
      title: "Radios en vivo de {country} | Openradio.app",
      desc: "Radios en vivo de {country}, Escucha radios online en vivo de {country} en Openradio.app"
    }
  },

  search: {
    placeholder: {
      global: "Buscar en el mundo...",
      country: "Buscar en {country}..."
    },

    timing: "{total} resultados en {s} segundos",

    head: {
      global: {
        title: "{q} | Openradio.app",
        desc: "{q} buscar radios en todo el mundo, Radios online de todo el mundo en Openradio.app",
      },
      country: {
        title: "{q} | Openradio.app",
        desc: "{q} buscar radios en {country}. Radios online de {country} en Openradio.app ",
      }
    }
  },

  langs: {
    title: "Idiomas",
    head: {
      title: "Idiomas | Openradio.app",
      desc: "Radios en tu idioma | Openradio.app"
    }
  },

  station: {
    labels: {
      slogan: "Eslogan:",
      signal: "Señal:",
      web: "Web:",
      location: "Ubicación:",
      mail: "Mail:",
      phone: "Teléfono:",
      twitter: "Twitter:",
      facebook: "Facebook:",
      tags: "Tags:",
      programming: "Programación"
    },

    signals: {
      title: "Frecuencias",
      type: {
        amfm: "{type.toUpperCase} {frec}",
        web: "Web"
      }
    },
    
    tags: {
      live: "{station.name} en vivo",
      listen: "Escuchar {station.name}",
      listenLive: "Escuchar {station.name} en vivo",
      signal: "{station.signal.type.toUpperCase} {station.signal.frec}",
      signalLive: "{station.signal.type.toUpperCase} {station.signal.frec} en vivo",
      signalListenLive: "Escuchar {station.signal.type.toUpperCase} {station.signal.frec} en vivo",
    },

    head: {
      title: "{station.name} en vivo | Openradio.app",
      desc: "{station.name} en vivo por internet, escuchar {station.name} en vivo. Radios del mundo en Openradio.app",
    }
  },

  recents: {
    title: "Recientes",
    head: {
      title: "Recientes | Openradio.app",
      desc: "Radios escuchadas recientemente | Openradio.app"
    }
  },

  signalList: {
    global: {
      title: "Radios {type.toUpperCase}"
    },

    country: {
      title: "Radios {type.toUpperCase} de {country}"
    },

    head: {
      global: {
        title: "Radios {type.toUpperCase} del mundo",
        desc: "Radios {type.toUpperCase} del mundo. Escuchá radio {type.toUpperCase} en Openradio.app",
      },

      country: {
        title: "Radios {type.toUpperCase} de {country}",
        desc: "Radios {type.toUpperCase} de {country}. Escuchá radio {type.toUpperCase} en Openradio.app",
      } 
    }
  },

  signal: {
    link: {
      text: "{type.toUpperCase} {frec}"
    },

    global: {
      title: "Radio {type.toUpperCase} {frec}"
    },

    country: {
      title: "Radio {type.toUpperCase} {frec} de {country}"
    },

    head: {
      global: {
        title: "Radio {type.toUpperCase} {frec} en vivo | Openradio.app",
        desc: "Radio {type.toUpperCase} {frec} en vivo del mundo. Escuchá miles de radios en vivo del mundo en Openradio.app",
      },

      country: {
        title: "Radio {type.toUpperCase} {frec} en vivo | Openradio.app",
        desc: "Radio {type.toUpperCase} {frec} en vivo de {country}. Escuchá miles de radios en vivo de {country} en Openradio.app",
      }
    }
  },

  /*
  genre: {
    title: {
      global: "Radios {genre}",
      country: "Radios {genre} de {country}"
    }
  },
  */

  nav: {
    langs: "Otros Idiomas",
    countries: "Paises",
    recents: "Recientes",
    genres: "Géneros",
    fms: "Frecuencias FM",
    ams: "Frecuencias AM",
  },

  /*
  genreList: {
    title: {
      global: "Géneros",
      country: "Géneros de {country}"
    }
  },
  */

  /*
  genreTitles: {
    short: {
      "60s": "60s",
      "70s": "70s",
      "80s": "80s",
      "90s": "90s",
      "aaa-adult-album-alternative": "Álbum Adulto Alternativo",
      "adult-contemporary": "Adulto Contemporáneo",
      "alternative-rock": "Rock Alternativo",
      "arabic-music": "Música Árabe",
      "blues": "Blues",
      "bollywood": "Bollywood",
      "bossa-nova": "Bossa Nova",
      "brazilian-music": "Música Brasilera",
      "business": "Negocios",
      "caribbean": "Caribeña",
      "catholic": "Católica",
      "childrens-music": "Música para Niñes",
      "chillout": "Relajada",
      "christian": "Cristiana",
      "christian-contemporary": "Cristiana Contemporanea",
      "christmas": "Navideña",
      "classic-country": "Clásicos del Country",
      "classic-hits": "Hits Clásicos",
      "classic-rock": "Rock Clásico",
      "classical": "Música Clásica",
      "college": "Universitarias",
      "comedy": "Comedia",
      "community": "Comunitarias",
      "country": "Country",
      "culture": "Cultura",
      "dance": "Danza",
      "disco": "Disco",
      "easy-listening": "Fácil de Escuchar",
      "eclectic": "Ecléctico",
      "edm-electronic-dance-music": "Música Electrónica para Bailar",
      "educational": "Educacional",
      "electronic": "Electronica",
      "ethnic": "Étnica",
      "euro-hits": "Hits Europeos",
      "folk": "Folk",
      "gospel": "Gospel",
      "hindi": "Hindi",
      "hip-hop": "Hip Hop",
      "hot-ac": "Hot AC",
      "house": "House",
      "indie": "Indie",
      "international": "Internacional",
      "islam": "Islam",
      "j-pop": "J-pop",
      "jazz": "Jazz",
      "k-pop": "K-pop",
      "latino": "Latino",
      "local": "Local",
      "lounge": "Lounge",
      "malayalam": "Malayalam",
      "manele": "Manele",
      "merengue": "Merengue",
      "metal": "Metal",
      "mexican-music": "Música Mexicana",
      "modern-rock": "Rock Moderno",
      "news": "Noticias",
      "news-podcast": "Podcast de Noticias",
      "oldies": "Oldies",
      "pop-music": "Música Pop",
      "public": "Púclico",
      "rb": "R&B",
      "reggae": "Reggae",
      "reggaeton": "Reggaeton",
      "regional": "Regional",
      "religious": "Religiosas",
      "rock": "Rock",
      "romantic": "Romanticas",
      "salsa": "Salsa",
      "scanner": "Scanner",
      "schlager": "Schlager",
      "smooth-jazz": "Jazz Suave",
      "soul": "Soul",
      "soundtracks": "Soundtracks",
      "spirituality": "Espiritualidad",
      "sports": "Deportes",
      "talk": "Habladas",
      "tamil": "Tamil",
      "techno": "Tecno",
      "top-40": "Top 40",
      "traffic": "Traffic",
      "trance": "Trance",
      "variety": "Variadades",
      "world-music": "Musica Mundial"
    },

    long: {
      "60s": "Radios de Música de los 60s",
      "70s": "Radios de Música de los 70s",
      "80s": "Radios de Música de los 80s",
      "90s": "Radios de Música de los 90s",
      "aaa-adult-album-alternative": "Radios de Album Adulto Alternativo",
      "adult-contemporary": "Radios de Adulto Contemporáneo",
      "alternative-rock": "Radios de Rock Alternativo",
      "arabic-music": "Radios de Música Árabe",
      "blues": "Radios de Blues",
      "bollywood": "Radios de Bollywood",
      "bossa-nova": "Radios de Bossa Nova",
      "brazilian-music": "Radios de Música Brasilera",
      "business": "Radios de Negocios",
      "caribbean": "Radios Caribeñas",
      "catholic": "Radios Católicas",
      "childrens-music": "Radios de Música para Niñes",
      "chillout": "Radios de Relajacion",
      "christian": "Radios Cristianas",
      "christian-contemporary": "Radios Cristianas Contemporaneas",
      "christmas": "Radios Navideñas",
      "classic-country": "Radios de Clásicos del Country",
      "classic-hits": "Radios de Hits Clásicos",
      "classic-rock": "Radios de Rock Clásico",
      "classical": "Radios de Música Clásica",
      "college": "Radios Universitarias",
      "comedy": "Radios de Comedia",
      "community": "Radios Comunitarias",
      "country": "Radios de Música Country",
      "culture": "Radios Culturales",
      "dance": "Radios de Danza",
      "disco": "Radios de Disco",
      "easy-listening": "Radios Fáciles de Escuchar",
      "eclectic": "Radias Eclécticas",
      "edm-electronic-dance-music": "Radios Música Electrónica para Bailar",
      "educational": "Radios Educacionales",
      "electronic": "Radios de Electronica",
      "ethnic": "Radios Étnicas",
      "euro-hits": "Radios de Hits Europeos",
      "folk": "Radios de Música Folk",
      "gospel": "Radios de Música Gospel",
      "hindi": "Radios de Hindi",
      "hip-hop": "Radios de Hip Hop",
      "hot-ac": "Radios de Hot AC",
      "house": "Radios de House",
      "indie": "Radios de Indie",
      "international": "Radios Internacionales",
      "islam": "Radios Islamicas",
      "j-pop": "Radios de J-pop",
      "jazz": "Radios de Jazz",
      "k-pop": "Radios de K-pop",
      "latino": "Radios Latinas",
      "local": "Radios Locales",
      "lounge": "Radios de Lounge",
      "malayalam": "Radios de Malayalam",
      "manele": "Radios de Manele",
      "merengue": "Radios de Merengue",
      "metal": "Radios de Metal",
      "mexican-music": "Radios de Música Mexicana",
      "modern-rock": "Radios de Rock Moderno",
      "news": "Radios de Noticias",
      "news-podcast": "Radios de Podcast de Noticias",
      "oldies": "Radios de Oldies",
      "pop-music": "Radios Música Pop",
      "public": "Radios Públicas",
      "rb": "Radios de R&B",
      "reggae": "Radios de Reggae",
      "reggaeton": "Radios de Reggaeton",
      "regional": "Radios Regionales",
      "religious": "Radios Religiosas",
      "rock": "Radios de Rock",
      "romantic": "Radios Romanticas",
      "salsa": "Radios de Salsa",
      "scanner": "Radios de Scanner",
      "schlager": "Radios de Schlager",
      "smooth-jazz": "Radios de Jazz Suave",
      "soul": "Radios de Soul",
      "soundtracks": "Radios de Soundtracks",
      "spirituality": "Radios de Espiritualidad",
      "sports": "Radios Deportivas",
      "talk": "Radios Habladas",
      "tamil": "Radios de Tamil",
      "techno": "Radios de Tecno",
      "top-40": "Radios Top 40",
      "traffic": "Radios de Traffic",
      "trance": "Radios de Trance",
      "variety": "Radios de Variadades",
      "world-music": "Radios de Musica Mundial"
    },

    global: "{title}",
    country: "{title} de {country}"
  }
  */
};