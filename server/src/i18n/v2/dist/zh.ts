import { Module } from "../Locale";
 
const locale: Module = {
  "continents": {
    "sa": "南美洲",
    "na": "北美",
    "ca": "中美洲",
    "eu": "欧洲",
    "as": "亚洲",
    "af": "非洲",
    "oc": "大洋洲"
  },
  "radioCount": "{count}个电台",
  "globalIndex": {
    "head": {
      "title": "Openradio.app |来自世界各地的广播电台",
      "desc": "Openradio.app |来自世界各地的广播电台，在openradio.app上在线收听广播"
    }
  },
  "countryIndex": {
    "title": "{country}的广播",
    "head": {
      "title": "来自{country}的直播电台| Openradio.app",
      "desc": "来自{country}的实时广播电台，来自Openradio.app的{country}的在线广播电台"
    }
  },
  "search": {
    "placeholder": {
      "country": "在{country}中搜索...",
      "global": "搜寻全球..."
    },
    "timing": "{total}秒后{s}秒",
    "head": {
      "global": {
        "title": "{q} | Openradio.app",
        "desc": "{q}搜索世界各地的广播电台。来自Openradio.app的全球在线广播电台"
      },
      "country": {
        "title": "{q} | Openradio.app",
        "desc": "{q}从{country}搜索广播电台。来自Openradio.app的{country}的在线广播电台"
      }
    }
  },
  "signalList": {
    "global": {
      "title": "{type.toUpperCase}台收音机"
    },
    "country": {
      "title": "{type.toUpperCase}的{type.toUpperCase}电台"
    },
    "head": {
      "global": {
        "title": "{type.toUpperCase}来自世界各地的广播电台",
        "desc": "{type.toUpperCase}个来自世界各地的广播电台。在Openradio.app收听{type.toUpperCase}个广播电台"
      },
      "country": {
        "title": "来自{country}的{type.toUpperCase}个广播电台",
        "desc": "来自{country}的{type.toUpperCase}个广播电台。在Openradio.app收听{type.toUpperCase}个广播电台"
      }
    }
  },
  "signal": {
    "link": {
      "text": "{frec} {type.toUpperCase}"
    },
    "global": {
      "title": "{frec} {type.toUpperCase}广播"
    },
    "country": {
      "title": "{country}的{frec} {type.toUpperCase}广播"
    },
    "head": {
      "global": {
        "title": "{type.toUpperCase} {frec}直播电台| Openradio.app",
        "desc": "{type.toUpperCase} {frec}来自世界各地的直播电台。在Openradio.app收听世界各地的直播电台"
      },
      "country": {
        "title": "{type.toUpperCase} {frec}直播电台| Openradio.app",
        "desc": "{type.toUpperCase}的{type.toUpperCase} {frec}直播电台。在Openradio.app收听来自{country}的直播电台"
      }
    }
  },
  "langs": {
    "title": "语言能力",
    "head": {
      "title": "语言| Openradio.app",
      "desc": "您所用语言的广播电台| Openradio.app"
    }
  },
  "station": {
    "head": {
      "title": "{station.name}个直播| Openradio.app",
      "desc": "{station.name}直播，听{station.name}直播。来自Openradio.app的来自世界各地的广播电台"
    },
    "labels": {
      "slogan": "口号：",
      "signal": "信号：",
      "web": "现场：",
      "location": "位置：",
      "mail": "邮件：",
      "phone": "电话：",
      "twitter": "推特：",
      "facebook": "脸书：",
      "tags": "标签：",
      "programming": "程式设计"
    },
    "signals": {
      "title": "频率",
      "type": {
        "amfm": "{frec} {type.toUpperCase}",
        "web": "网页"
      }
    },
    "tags": {
      "live": "{station.name}个直播",
      "listen": "听{station.name}",
      "listenLive": "现场收听{station.name}",
      "signal": "{station.signal.frec} {station.signal.type.toUpperCase}",
      "signalLive": "{station.signal.frec} {station.signal.type.toUpperCase}直播",
      "signalListenLive": "现场收听{station.signal.frec} {station.signal.type.toUpperCase}"
    }
  },
  "recents": {
    "title": "最近的",
    "head": {
      "title": "最新消息| Openradio.app",
      "desc": "电台最近听过| Openradio.app"
    }
  },
  "nav": {
    "langs": "其他语言",
    "countries": "国别",
    "recents": "最近的",
    "genres": "体裁",
    "fms": "调频频率",
    "ams": "AM汇率"
  }
};

export default locale;