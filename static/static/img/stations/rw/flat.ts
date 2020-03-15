import fs from "fs";

const src = `${__dirname}/stations`;
const dest = `${__dirname}/png`;

let count = 0;

try{ fs.mkdirSync(dest) } catch(e){}

const countryCodes = fs.readdirSync(src);
for(let countryCode of countryCodes){
  const files = fs.readdirSync(`${src}/${countryCode}`);
  for(const file of files){
    const from = `${src}/${countryCode}/${file}`;
    const to = `${dest}/${countryCode}.${file}`;
    console.log(`${++count} | ${from} => ${to}`);
    fs.renameSync(from, to);
  }
}
