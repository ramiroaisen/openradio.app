import { Module } from "../Locale";

export const locale = {

  continents: {
    sa: "South America",
    na: "North America",
    ca: "Central America",
    eu: "Europe",
    as: "Asia",
    af: "Africa",
    oc: "Oceania"
  },

  radioCount: "{count} stations",

  globalIndex: {
    head: {
      title: "Openradio.app | Radio stations from all the world",
      desc: "Openradio.app | Radio stations from all the world, listen to the radio online at openradio.app",
    }
  },

  countryIndex: {
    title: "Radios from {country}",
    head: {
      title: "Live radio stations from {country} | Openradio.app",
      desc: "Live radio stations from {country}, listen online radio stations from {country} at Openradio.app"
    }
  },

  search: {
    placeholder: {
      country: "Search in {country}...",
      global: "Search worldwide..."
    },

    timing: "{total} results in {s} seconds",

    head: {
      global: {
        title: "{q} | Openradio.app",
        desc: "{q} search radio stations from the world. Online radio stations from the world at Openradio.app",
      },
  
      country: {
        title: "{q} | Openradio.app",
        desc: "{q} search radio stations from {country}. Online radio stations from {country} at Openradio.app ",
      }
    }
  },

  signalList: {
    global: {
      title: "{type.toUpperCase} radios"
    },

    country: {
      title: "{type.toUpperCase} radios from {country}"
    },

    head: {
      global: {
        title: "{type.toUpperCase} radio stations from the world",
        desc: "{type.toUpperCase} radio stations from the world. Listen to {type.toUpperCase} radio stations at Openradio.app"
      },
  
      country: {
        title: "{type.toUpperCase} radio stations from {country}",
        desc: "{type.toUpperCase} radio stations from {country}. Listen to {type.toUpperCase} radio stations at Openradio.app", 
      }
    }
  },
  
  signal: {
    link: {
      text: "{frec} {type.toUpperCase}"
    },

    global: {
      title: "{frec} {type.toUpperCase} radio"
    },

    country: {
      title: "{frec} {type.toUpperCase} radio from {country}"
    },

    head: {
      global: {
        title: "{type.toUpperCase} {frec} live radio station | Openradio.app",
        desc: "{type.toUpperCase} {frec} live radio station from the world. Listen to live radio stations from the world at Openradio.app",
      },
  
      country: {
        title: "{type.toUpperCase} {frec} live radio station | Openradio.app",
        desc: "{type.toUpperCase} {frec} live radio station from {country}. Listen to live radio stations from {country} at Openradio.app"
      }
    }
  },

  /*
  genre: {
    title: {
      global: "{genre} radios",
      country: "{genre} radios from {country}"
    }
  },
  */

  langs: {
    title: "Languages",
    head: {
      title: "Languages | Openradio.app",
      desc: "Radio stations in your language | Openradio.app"
    }
  },

  station: {
    head: {
      title: "{station.name} live | Openradio.app",
      desc: "{station.name} live, listen to {station.name} live. Radio stations from all over the world at Openradio.app",
    },

    labels: {
      slogan: "Slogan: ",
      signal: "Signal: ",
      web: "Site: ",
      location: "Location: ",
      mail: "Mail: ",
      phone: "Phone: ",
      twitter: "Twitter: ",
      facebook: "Facebook: ",
      tags: "Tags: ",
      programming: "Programming"
    },

    signals: {
      title: "Frequencies",
      type: {
        amfm: "{frec} {type.toUpperCase}",
        web: "Web"
      }
    },

    tags: {
      live: "{station.name} live",
      listen: "listen to {station.name}",
      listenLive: "listen to {station.name} live",
      signal: "{station.signal.frec} {station.signal.type.toUpperCase}",
      signalLive: "{station.signal.frec} {station.signal.type.toUpperCase} live",
      signalListenLive: "Listen to {station.signal.frec} {station.signal.type.toUpperCase} live",
    }

  },

  recents: {
    title: "Recents",
    head: {
      title: "Recents | Openradio.app",
      desc: "Radio stations listened recently | Openradio.app"
    }
  },

  nav: {
    langs: "Other Languages",
    countries: "Countries",
    recents: "Recents",
    genres: "Genres",
    fms: "FM Frecuencies",
    ams: "AM Frecuencies",
  },

  /*
  genreList: {
    title: {
      global: "Genres",
      country: "Genres from {country}"
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
      "aaa-adult-album-alternative": "AAA - Adult Album Alternative",
      "adult-contemporary": "Adult Contemporary",
      "alternative-rock": "Alternative Rock",
      "arabic-music": "Arabic Music",
      "blues": "Blues",
      "bollywood": "Bollywood",
      "bossa-nova": "Bossa Nova",
      "brazilian-music": "Brazilian Music",
      "business": "Business",
      "caribbean": "Caribbean",
      "catholic": "Catholic",
      "childrens-music": "Children’s Music",
      "chillout": "Chillout",
      "christian": "Christian",
      "christian-contemporary": "Christian Contemporary",
      "christmas": "Christmas",
      "classic-country": "Classic Country",
      "classic-hits": "Classic Hits",
      "classic-rock": "Classic Rock",
      "classical": "Classical",
      "college": "College",
      "comedy": "Comedy",
      "community": "Community",
      "country": "Country",
      "culture": "Culture",
      "dance": "Dance",
      "disco": "Disco",
      "easy-listening": "Easy Listening",
      "eclectic": "Eclectic",
      "edm-electronic-dance-music": "EDM - Electronic Dance Music",
      "educational": "Educational",
      "electronic": "Electronic",
      "ethnic": "Ethnic",
      "euro-hits": "Euro Hits",
      "folk": "Folk",
      "gospel": "Gospel",
      "hindi": "Hindi",
      "hip-hop": "Hip Hop",
      "hot-ac": "Hot AC",
      "house": "House",
      "indie": "Indie",
      "international": "International",
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
      "mexican-music": "Mexican Music",
      "modern-rock": "Modern Rock",
      "news": "News",
      "news-podcast": "News Podcast",
      "oldies": "Oldies",
      "pop-music": "Pop Music",
      "public": "Public",
      "rb": "R&B",
      "reggae": "Reggae",
      "reggaeton": "Reggaeton",
      "regional": "Regional",
      "religious": "Religious",
      "rock": "Rock",
      "romantic": "Romantic",
      "salsa": "Salsa",
      "scanner": "Scanner",
      "schlager": "Schlager",
      "smooth-jazz": "Smooth Jazz",
      "soul": "Soul",
      "soundtracks": "Soundtracks",
      "spirituality": "Spirituality",
      "sports": "Sports",
      "talk": "Talk",
      "tamil": "Tamil",
      "techno": "Techno",
      "top-40": "Top 40",
      "traffic": "Traffic",
      "trance": "Trance",
      "variety": "Variety",
      "world-music": "World Music"
    },

    long: {
      "60s": "60s radios",
      "70s": "70s radios",
      "80s": "80s radios",
      "90s": "90s radios",
      "aaa-adult-album-alternative": "AAA - Adult Album Alternative radios",
      "adult-contemporary": "Adult Contemporary radios",
      "alternative-rock": "Alternative Rock radios",
      "arabic-music": "Arabic Music radios",
      "blues": "Blues radios",
      "bollywood": "Bollywood radios",
      "bossa-nova": "Bossa Nova radios",
      "brazilian-music": "Brazilian Music radios",
      "business": "Business radios",
      "caribbean": "Caribbean radios",
      "catholic": "Catholic radios",
      "childrens-music": "Children’s Music radios",
      "chillout": "Chillout radios",
      "christian": "Christian radios",
      "christian-contemporary": "Christian Contemporary radios",
      "christmas": "Christmas radios",
      "classic-country": "Classic Country radios",
      "classic-hits": "Classic Hits radios",
      "classic-rock": "Classic Rock radios",
      "classical": "Classical radios",
      "college": "College radios",
      "comedy": "Comedy radios",
      "community": "Community radios",
      "country": "Country radios",
      "culture": "Culture radios",
      "dance": "Dance radios",
      "disco": "Disco radios",
      "easy-listening": "Easy Listening radios",
      "eclectic": "Eclectic radios",
      "edm-electronic-dance-music": "EDM - Electronic Dance Music radios",
      "educational": "Educational radios",
      "electronic": "Electronic radios",
      "ethnic": "Ethnic radios",
      "euro-hits": "Euro Hits radios",
      "folk": "Folk radios",
      "gospel": "Gospel radios",
      "hindi": "Hindi radios",
      "hip-hop": "Hip Hop radios",
      "hot-ac": "Hot AC radios",
      "house": "House radios",
      "indie": "Indie radios",
      "international": "International radios",
      "islam": "Islam radios",
      "j-pop": "J-pop radios",
      "jazz": "Jazz radios",
      "k-pop": "K-pop radios",
      "latino": "Latino radios",
      "local": "Local radios",
      "lounge": "Lounge radios",
      "malayalam": "Malayalam radios",
      "manele": "Manele radios",
      "merengue": "Merengue radios",
      "metal": "Metal radios",
      "mexican-music": "Mexican Music radios",
      "modern-rock": "Modern Rock radios",
      "news": "News radios",
      "news-podcast": "News Podcast radios",
      "oldies": "Oldies radios",
      "pop-music": "Pop Music radios",
      "public": "Public radios",
      "rb": "R&B radios",
      "reggae": "Reggae radios",
      "reggaeton": "Reggaeton radios",
      "regional": "Regional radios",
      "religious": "Religious radios",
      "rock": "Rock radios",
      "romantic": "Romantic radios",
      "salsa": "Salsa radios",
      "scanner": "Scanner radios",
      "schlager": "Schlager radios",
      "smooth-jazz": "Smooth Jazz radios",
      "soul": "Soul radios",
      "soundtracks": "Soundtracks radios",
      "spirituality": "Spirituality radios",
      "sports": "Sports radios",
      "talk": "Talk radios",
      "tamil": "Tamil radios",
      "techno": "Techno radios",
      "top-40": "Top 40 radios",
      "traffic": "Traffic radios",
      "trance": "Trance radios",
      "variety": "Variety radios",
      "world-music": "World Music radios"
    },

    country: "{title} from {country}",
    global: "{title}"
  }
  */
};