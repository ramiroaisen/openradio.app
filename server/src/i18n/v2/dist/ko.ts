import { Module } from "../Locale";
 
const locale: Module = {
  "continents": {
    "sa": "남아메리카",
    "na": "북아메리카",
    "ca": "중앙 아메리카",
    "eu": "유럽",
    "as": "아시아",
    "af": "아프리카",
    "oc": "오세아니아"
  },
  "radioCount": "{count} 스테이션",
  "globalIndex": {
    "head": {
      "title": "Openradio.app | 전 세계의 라디오 방송국",
      "desc": "Openradio.app | 전 세계의 라디오 방송국, openradio.app에서 온라인으로 라디오 듣기"
    }
  },
  "countryIndex": {
    "title": "{country}의 라디오",
    "head": {
      "title": "{country}의 생방송 라디오 | Openradio.app",
      "desc": "{country}의 라이브 라디오 방송국, Openradio.app에서 {country}의 온라인 라디오 방송국 청취"
    }
  },
  "search": {
    "placeholder": {
      "country": "{country}에서 검색 ...",
      "global": "전세계 검색 ..."
    },
    "timing": "{total} 결과 {s} 초",
    "head": {
      "global": {
        "title": "{q} | Openradio.app",
        "desc": "{q}은 전세계 라디오 방송국을 검색합니다. Openradio.app에서 전 세계의 온라인 라디오 방송국"
      },
      "country": {
        "title": "{q} | Openradio.app",
        "desc": "{q}은 {country}에서 라디오 방송국을 검색합니다. Openradio.app에서 {country}의 온라인 라디오 방송국"
      }
    }
  },
  "signalList": {
    "global": {
      "title": "{type.toUpperCase} 라디오"
    },
    "country": {
      "title": "{country}의 {type.toUpperCase} 라디오"
    },
    "head": {
      "global": {
        "title": "세계의 {type.toUpperCase} 라디오 방송국",
        "desc": "세계의 {type.toUpperCase} 라디오 방송국. Openradio.app에서 {type.toUpperCase} 라디오 방송 청취"
      },
      "country": {
        "title": "{country}의 {type.toUpperCase} 라디오 방송국",
        "desc": "{country}의 {type.toUpperCase} 라디오 방송국. Openradio.app에서 {type.toUpperCase} 라디오 방송 청취"
      }
    }
  },
  "signal": {
    "link": {
      "text": "{frec} {type.toUpperCase}"
    },
    "global": {
      "title": "{frec} {type.toUpperCase} 라디오"
    },
    "country": {
      "title": "{country}의 {frec} {type.toUpperCase} 라디오"
    },
    "head": {
      "global": {
        "title": "{type.toUpperCase} {frec} 라이브 라디오 방송국 | Openradio.app",
        "desc": "{type.toUpperCase} {frec} 전세계 라디오 방송국. Openradio.app에서 전 세계의 생방송 라디오 청취"
      },
      "country": {
        "title": "{type.toUpperCase} {frec} 라이브 라디오 방송국 | Openradio.app",
        "desc": "{country}의 {type.toUpperCase} {frec} 라이브 라디오 방송국. Openradio.app의 {country}에서 생방송 라디오 청취"
      }
    }
  },
  "langs": {
    "title": "언어",
    "head": {
      "title": "언어 | Openradio.app",
      "desc": "귀하의 언어로 된 라디오 방송국 | Openradio.app"
    }
  },
  "station": {
    "head": {
      "title": "{station.name} 라이브 | Openradio.app",
      "desc": "{station.name} 라이브, {station.name} 라이브 듣기. Openradio.app에서 전 세계의 라디오 방송국"
    },
    "labels": {
      "slogan": "슬로건:",
      "signal": "신호:",
      "web": "대지:",
      "location": "위치:",
      "mail": "우편:",
      "phone": "전화:",
      "twitter": "트위터:",
      "facebook": "페이스 북 :",
      "tags": "태그 :",
      "programming": "프로그램 작성"
    },
    "signals": {
      "title": "주파수",
      "type": {
        "amfm": "{frec} {type.toUpperCase}",
        "web": "편물"
      }
    },
    "tags": {
      "live": "{station.name} 라이브",
      "listen": "{station.name} 듣기",
      "listenLive": "{station.name} 라이브 듣기",
      "signal": "{station.signal.frec} {station.signal.type.toUpperCase}",
      "signalLive": "{station.signal.frec} {station.signal.type.toUpperCase} 라이브",
      "signalListenLive": "{station.signal.frec} {station.signal.type.toUpperCase} 라이브 듣기"
    }
  },
  "recents": {
    "title": "최근",
    "head": {
      "title": "최근 | Openradio.app",
      "desc": "라디오 방송국은 최근 들어 | Openradio.app"
    }
  },
  "nav": {
    "langs": "다른 언어",
    "countries": "국가",
    "recents": "최근",
    "genres": "장르",
    "fms": "FM 주파수",
    "ams": "AM Frecuencies"
  }
};

export default locale;