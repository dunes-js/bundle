export * from "./localResolve.js"
export * from "./includeFile.js"
export * from "./includeString.js"

declare global
{
  /**
   * Read a string and include it*/
  export function includeFile<T>(path: string, useQuotes?: boolean): T;
  /** 
   * Put a string in*/
  export function includeString<T>(content: string, useParse?: boolean): T;
}