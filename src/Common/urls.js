export const canonical = url => `https://openradio.app${url}`; 

export const indexUrl = ({lang}) => `/${lang}`;

export const countryUrl = ({lang, countryCode}) => `/${lang}-${countryCode}`;

export const searchActionUrl = ({lang, countryCode}) => {
  return (
    countryCode ? 
      countryUrl({lang, countryCode}) :
      indexUrl({lang})
    ) + "/search";
}

export const searchUrl = ({lang, countryCode, q}) => searchActionUrl({lang, countryCode}) + "?q=" + encodeURIComponent(q);

export const stationUrl = ({lang, station}) => countryUrl({lang, countryCode: station.countryCode}) + "/radio/" + station.slug;

export const stationImgUrl = (size, station) => station.origin != "mt" ? [
  `/static/img/stations/rw/webp/${size}/${station.countryCode}.${station.slug}.png.webp`,
  `/static/img/stations/rw/png/${size}/${station.countryCode}.${station.slug}.png`
] : [
  `/static/img/stations/mt/webp/${size}/${station.mt.img.lt}.webp`,
  `/static/img/stations/mt/jpg/${size}/${station.mt.img.lt}.jpg`,
];

export const langsUrl = ({lang}) => indexUrl({lang}) + "/languages";

export const recentsUrl = ({lang}) => indexUrl({lang}) + "/recents";

export const genreListUrl = ({lang, countryCode}) => 
  (countryCode ? 
    countryUrl({lang, countryCode}) :
    indexUrl({lang})
  ) + "/genres";


export const genreUrl = ({lang, countryCode, genre}) => genreListUrl({lang, countryCode}) + "/" + genre;

export const signalListUrl = ({lang, countryCode, type}) => {
  return (countryCode ? countryUrl({lang, countryCode}) : indexUrl({lang}))
         + "/radio-" + type;
}

export const signalUrl = ({lang, countryCode, type, frec}) => {
  return signalListUrl({lang, countryCode, type}) + "/" + frec;
}