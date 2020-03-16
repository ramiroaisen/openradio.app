import {expose} from "threads/worker";
import cheerio from "cheerio";
import {promises as fs} from "fs";

export namespace Signal {
  export interface Base {
    regionName: string
    regionHref: string
    type: "am" | "fm" | "web" | "other"
    frec?: number
    str: string
  }

  export interface AM extends Base {
    type: "am"
    frec: number
  }

  export interface FM extends Base {
    type: "fm"
    frec: number
  }

  export interface Web extends Base {
    type: "web"
  }

  export interface Other extends Base {
    type: "other"
    str: string
  }

  export type Signal = AM | FM | Web | Other; 
}

const load = async (filename: string) => {
  const source = await fs.readFile(filename, "utf8");
  return cheerio.load(source);
}

const getWeb = async (filename: string) => {
  const $ = await load(filename);
  const $a = $(".contacts a").eq(0);
  if($a.length == 0)
    return null;
  else
    return $a.attr("href");
}

const getSignals = async (filename: string) => {
  const $ = await load(filename);
  const signals: Signal.Signal[] = [];

  const log: string[] = [];

  $(".frequencies li").each((i, li) => {
    const $li = $(li);
    const regionName = $li.find("a").text().trim();
    const regionHref = $li.find("a").attr("href") || "";
    const str = $li.find(".frequency").text().trim();
    
    if(str == ""){
      signals.push({regionHref, regionName, type: "other", str})
    } else if(/onl?ine|internet|web/i.test(str)){
      signals.push({regionName, regionHref, type: "web", str})
    } else if (/^\d+\.\d+$/.test(str)){
      signals.push({regionName, regionHref, type: "fm", frec: parseFloat(str), str})
    } else {
      let match = str.match(/([\d\.]+).*(am|fm|hd\d?)/i);
      if(match){
        const frec = parseFloat(match[1]);
        let type: Signal.Signal["type"];
        const t = match[2].toLowerCase();
        switch(t){
          case "am":
          case "fm": type = t;
            break;
          // hd as fm
          default: type = "fm";
        }
        signals.push({regionHref, regionName, type, frec, str});
      } else {
        if(match = str.match(/(fm|am).*([\d\.]+)/i)){
          signals.push({
            regionHref,
            regionName,
            type: match[1].toLowerCase() as "am" | "fm",
            frec: parseFloat(match[2]),
            str
          })
        } else {
          signals.push({regionHref, regionName, type: "other", str})
          log.push(str);
        }
      }
    }
  })

  return [signals, log.join("\n")] as [Signal.Signal[], string];
}

const worker = {getWeb, getSignals};
export type WorkerT = typeof worker;
expose(worker)
