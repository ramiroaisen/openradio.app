const geo = require("geoip-country");

export type Lookup = {
  range: [number, number]
  country: string
}

export const lookup: (ip: string) => Lookup | null = geo.lookup;

export const preety: (ip: number) => string = geo.preety;

export const geoip = {lookup, preety}

