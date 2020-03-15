"use strict";
/*
import _countries from "./_countries.json";
import _continents from "./_continents.json";

import * as Continent from "../Continent";
import * as Country from "../Country";
import * as State from "../State";
import * as City from "../City";
import { ObjectId } from "mongodb";
import { WithoutId } from "../common";

import fs from "fs";

import bson from "bson";

const continents: Continent.Continent[] = [];
const countries: Country.Country[] = [];
const states: State.State[] = [];
const cities: City.City[] = [];

const main = async () => {
  const db = {
    countinents: await Continent.getCollection(),
    countries: await Country.getCollection(),
    states: await State.getCollection(),
    cities: await City.getCollection(),
  }

  for(const cont of _continents){
    continents.push({
      _id: new ObjectId(),
      ...cont,
      count: 0
    });
  }

  for(const country of _countries){
    countries.push({
      _id: new ObjectId(),
      name: country.name,
      slug: country.slug,
      code: country.code,
      continentCode: country.continent,
      count: 0,
    })

    for(const state of country.data.states){
      
      const stateId = new ObjectId();

      states.push({
        _id: stateId,
        name: state.name,
        slug: state.state_label,
        count: 0,
        countryCode: country.code,
      })

      const _cities = country.data.cities.filter(city => {
        return city.state_label === state.state_label
      })

      const slugs: string[] = [];

      for(const city of _cities){

        if(slugs.includes(city.city_label)){
          console.log("repeated city", city.city_label);
          continue;
        }

        slugs.push(city.city_label);

        cities.push({
          _id: new ObjectId(),
          name: city.name,
          slug: city.city_label,
          countryCode: country.code,
          stateId: stateId,
          id: city.city_id,
          count: 0
        })
      }
    }
  }

  console.log(continents.length, "continents");
  console.log(countries.length, "countries");
  console.log(states.length, "states");
  console.log(cities.length, "cities");

  fs.writeFileSync(__dirname + "/collections/continents.json", JSON.stringify(continents, null, 2));
  fs.writeFileSync(__dirname + "/collections/coutries.json", JSON.stringify(countries, null, 2));
  fs.writeFileSync(__dirname + "/collections/states.json", JSON.stringify(states, null, 2));
  fs.writeFileSync(__dirname + "/collections/cities.json", JSON.stringify(cities, null, 2));
 
  await db.countinents.drop();
  db.countinents.insertMany(continents);
  
  await db.countries.drop();
  db.countries.insertMany(countries);
  
  await db.states.drop();
  db.states.insertMany(states);
  
  await db.cities.drop();
  db.cities.insertMany(cities);
}

main();
*/ 
//# sourceMappingURL=geo.js.map