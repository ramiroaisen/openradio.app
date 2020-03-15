import {ObjectId} from "bson";

// TYPES

export type Paging = {
  start: number,
  page: number,
  pages: number,
  pageSize: number,
  total: number
  nextPage?: number | null
}

export type PaginatedResult<T> = {
  paging: Paging
  items: T[]
}

export type PagingOptions = {
  page: number
  pageSize: number
}

export type Region = {
  _id: ObjectId
  name: string
  slug: string
}

// START SEARCH
export type SearchQuery = {
  q: string
  countryCode?: string
}

export type SearchMessage = {
  query: SearchQuery
  paging: PagingOptions
  cbid: number
}
// END TYPES


// PROJECTS
export const stationsListProject = {
  _id: 1,
  name: 1,
  slug: 1,
  countryCode: 1,
  streams: 1
}

export const countryProject = {
  _id: 0,
  name: 1,
  code: 1,
  contCode: 1,
  lang: 1,
  count: 1,
  amCount: 1,
  fmCount: 1,  
}

export const stationProject = {
  _id: 1,
  name: 1,
  slug: 1,
  slogan: 1,
  signal: 1,
  countryCode: 1,
  streams: 1,
  desc: 1,
  address: 1,
  web: 1,
  mail: 1,
  tel: 1,
  twitter: 1,
  facebook: 1,
  votes: 1,
}
// END PROJECTS
