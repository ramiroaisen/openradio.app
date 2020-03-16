export type Item = {
  _id: string
  name: string
  slug: string
  countryCode: string | null
  score: number
  origin: "mt" | "rw" | "both"
  mt: { img: { lt: string } } | null
}

export type Paging = {
  page: number
  pages: number
  pageSize: number
  total: number
  nextPage: number | null
}

export type Result = {
  time: number
  paging: Paging
  items: Item[]
}

export type Query = {
  q: string
  page: number
  pageSize: number
  countryCode?: string | null
  ipCountry?: string | null 
}

export const search: (query: Query) => Promise<Result>;
export const start: () => Promise<void>;