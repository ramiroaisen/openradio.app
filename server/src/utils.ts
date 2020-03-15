import { Response } from "express";

export type Without<T, K> = Pick<T, Exclude<keyof T, K>>;

export const tick = () => new Promise(resolve => setImmediate(resolve));

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Redirect with push (nginx)
export const redirect = (res: Response , code: number, url: string) => {
  if(!url.startsWith("http"))
    res.setHeader("Link", `<${url}>;rel=preload;as=document`);
  res.redirect(code, url);
}