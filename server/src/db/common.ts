import { Station } from "./Station"
import { Without } from "../utils"

export type WithoutId<T> = Without<T, "_id">;

export type Paging = {
  start: number,
  page: number,
  pages: number,
  pageSize: number,
  total: number
  nextPage?: number | null
}

export type PaginatedResult<T = Station> = {
  paging: Paging
  items: T[]
}

export type PagingOptions = {
  page: number
  pageSize: number
}

export type SearchQuery = {
  q: string
  countryCode?: string | null
}
