import { config } from "./config.js";

export function assertDefined<T>(value: T | undefined | null, message: string): T {
    
    if (value === null || value === undefined) {
        throw new Error(message);
    }
    
    return value;
}

export function normalizeYearUrl(href: string | undefined) {
  if (!href) href = config.resultsPath + config.year + config.file;

  return href.startsWith("http")
    ? href
    : `${config.baseUrl}${href}`;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function getYearRegex() {
  return new RegExp("^" + escapeRegExp(config.baseUrl) + escapeRegExp(config.resultsPath) + "(\\d{4})" + escapeRegExp(config.file) + "$");
}