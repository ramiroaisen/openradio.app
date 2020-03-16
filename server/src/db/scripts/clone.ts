import { connect } from "mongodb";
import { Station } from "../Station";
import { Country } from "../Country";
import { Continent } from "../Continent";

async function main(){
  const client = await connect("mongodb://localhost:27017");
  const src = client.db("openradio");
  const dest = client.db("openradio-2");

  const cloneStations = async () => {
    console.log("cloning stations");
    const srcStations = src.collection<Station>("stations");
    const destStations = dest.collection<Station>("stations");
    
    await destStations.drop();
    
    const cursor = await srcStations.find({});
    
    while(true){
      const station = await cursor.next();
      if(station == null)
        break;
      
      station.order = (station as any).popularity;
      delete (station as any).popularity;

      await destStations.insertOne(station);
    }
  }

  const cloneCountries = async () => { 
    console.log("cloning countries")
    const srcCountries = src.collection("countries");
    const destCountries = dest.collection<Country>("countries");

    await destCountries.drop();

    const cursor = await srcCountries.find({});
    while(true){
      const item = await cursor.next();
      if(item == null)
        break;
      
      const country: Country = {
        _id: item._id,
        name: item.name,
        code: item.code,
        continentCode: item.contCode,
        lang: item.lang,
        count: item.count,
        amCount: item.amCount,
        fmCount: item.fmCount
      }

      await destCountries.insertOne(country);
    }
  }

  const cloneContinents = async () => { 
    console.log("cloning countries")
    const srcC = src.collection("continents");
    const destC = dest.collection<Continent>("continents");

    await destC.drop();

    const cursor = await srcC.find({});
    while(true){
      const item = await cursor.next();
      if(item == null)
        break;
      
      const c: Continent = {
        _id: item._id,
        code: item.code,
        name: item.name,
      }

      await destC.insertOne(c);
    }
  }

  await cloneStations();
  await cloneCountries();
  await cloneContinents();
  console.log("Done!");
}

main();