const fs = require("fs");
const fetch = require("node-fetch");
const path = require("path");

const css = fs.readFileSync("./muli.css", "utf8");

const main = async () => {
  const matches = [...css.matchAll(/url\((.+?)\)/g)];
  const total = matches.length;
  console.log(total, "fonts");
  for(let i = 0; i < matches.length; i++){
    const match = matches[i];
    const url = match[1]
    const basename = path.basename(url);
    console.log(i, "/", total, "=>", url);
    const buffer = await fetch(url).then(res => res.buffer())
    fs.writeFileSync(basename, buffer);
  }
}

main();
