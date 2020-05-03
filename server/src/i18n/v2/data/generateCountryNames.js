const fs = require("fs");
const path = require("path");

const countryNames = {};
const files = fs.readdirSync(path.resolve(__dirname, "./countryNames"));

files.forEach(filename => {
	
	if(!filename.endsWith(".json"))
		return;
		
	const lang = filename.replace(".json", "");
	
	const map = require("./countryNames/" + filename);
	
	countryNames[lang] = map;
})

fs.writeFileSync(__dirname + "/countryNames.json", JSON.stringify(countryNames, null, 2));
