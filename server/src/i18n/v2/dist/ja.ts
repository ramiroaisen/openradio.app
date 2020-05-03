import { Module } from "../Locale";
 
const locale: Module = {
  "continents": {
    "sa": "南アメリカ",
    "na": "北米",
    "ca": "中米",
    "eu": "ヨーロッパ",
    "as": "アジア",
    "af": "アフリカ",
    "oc": "オセアニア"
  },
  "radioCount": "{count}ステーション",
  "globalIndex": {
    "head": {
      "title": "Openradio.app |世界中のラジオ局",
      "desc": "Openradio.app |世界中のラジオ局、openradio.appでオンラインでラジオを聴く"
    }
  },
  "countryIndex": {
    "title": "{country}のラジオ",
    "head": {
      "title": "{country}のライブラジオ局| Openradio.app",
      "desc": "Openradio.appで{country}のラジオ局をライブ、{country}のオンラインラジオ局を聴く"
    }
  },
  "search": {
    "placeholder": {
      "country": "{country}で検索...",
      "global": "世界中を検索..."
    },
    "timing": "{total}は{s}秒になります",
    "head": {
      "global": {
        "title": "{q} | Openradio.app",
        "desc": "{q}世界中のラジオ局を検索します。 Openradio.appの世界のオンラインラジオ局"
      },
      "country": {
        "title": "{q} | Openradio.app",
        "desc": "{q}は{country}からラジオ局を検索します。 Openradio.appの{country}のオンラインラジオ局"
      }
    }
  },
  "signalList": {
    "global": {
      "title": "{type.toUpperCase}ラジオ"
    },
    "country": {
      "title": "{country}の{type.toUpperCase}ラジオ"
    },
    "head": {
      "global": {
        "title": "世界中の{type.toUpperCase}ラジオ局",
        "desc": "世界の{type.toUpperCase}ラジオ局。 Openradio.appで{type.toUpperCase}ラジオ局を聴く"
      },
      "country": {
        "title": "{country}の{type.toUpperCase}ラジオ局",
        "desc": "{country}の{type.toUpperCase}ラジオ局。 Openradio.appで{type.toUpperCase}ラジオ局を聴く"
      }
    }
  },
  "signal": {
    "link": {
      "text": "{frec} {type.toUpperCase}"
    },
    "global": {
      "title": "{frec} {type.toUpperCase}ラジオ"
    },
    "country": {
      "title": "{country}の{frec} {type.toUpperCase}ラジオ"
    },
    "head": {
      "global": {
        "title": "{type.toUpperCase} {frec}ライブラジオ局| Openradio.app",
        "desc": "{type.toUpperCase} {frec}世界のライブラジオ局。 Openradio.appで世界中のラジオ局を聴く"
      },
      "country": {
        "title": "{type.toUpperCase} {frec}ライブラジオ局| Openradio.app",
        "desc": "{type.toUpperCase} {frec} {country}のライブラジオ局。 Openradio.appで{country}のライブラジオ局を聴く"
      }
    }
  },
  "langs": {
    "title": "言語",
    "head": {
      "title": "言語| Openradio.app",
      "desc": "あなたの言語のラジオ局| Openradio.app"
    }
  },
  "station": {
    "head": {
      "title": "{station.name}ライブ| Openradio.app",
      "desc": "{station.name}ライブ、{station.name}ライブを聴く。 Openradio.appで世界中のラジオ局"
    },
    "labels": {
      "slogan": "スローガン：",
      "signal": "信号：",
      "web": "地点：",
      "location": "ロケーション：",
      "mail": "郵便物：",
      "phone": "電話：",
      "twitter": "ツイッター：",
      "facebook": "フェイスブック：",
      "tags": "タグ：",
      "programming": "プログラミング"
    },
    "signals": {
      "title": "頻度",
      "type": {
        "amfm": "{frec} {type.toUpperCase}",
        "web": "ウェブ"
      }
    },
    "tags": {
      "live": "{station.name}ライブ",
      "listen": "{station.name}を聞く",
      "listenLive": "{station.name}ライブを聞く",
      "signal": "{station.signal.frec} {station.signal.type.toUpperCase}",
      "signalLive": "{station.signal.frec} {station.signal.type.toUpperCase}ライブ",
      "signalListenLive": "{station.signal.frec} {station.signal.type.toUpperCase}をライブで聞く"
    }
  },
  "recents": {
    "title": "最近の",
    "head": {
      "title": "最近の| Openradio.app",
      "desc": "最近聞いたラジオ局| Openradio.app"
    }
  },
  "nav": {
    "langs": "他の言語",
    "countries": "国々",
    "recents": "最近の",
    "genres": "ジャンル",
    "fms": "FM周波数",
    "ams": "AM周波数"
  }
};

export default locale;