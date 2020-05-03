import { Country } from "../db/Country";
import { Locale } from "../i18n/v2/Locale";

declare global {
  namespace Express {
    interface Request {
      country?: Country | null
      ipCountry?: Country | null
      realIp?: string | null
    }

    interface Response {
      sapperLink?: string
      lang: string
      locale: Locale
    }
  }
}