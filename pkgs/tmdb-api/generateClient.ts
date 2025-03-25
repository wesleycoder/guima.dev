import { DOMParser } from "@b-fuze/deno-dom"
import openapiTs, { astToString } from "openapi-typescript"

const oas = await fetch("https://developer.themoviedb.org/openapi")
const html = await oas.text()

const p = new DOMParser()
const doc = p.parseFromString(html, "text/html")

const firstLink = doc.querySelector("a")?.getAttribute("href")

if (!firstLink) {
  const allLinks = Array.from(doc.querySelectorAll("a")).map((l) => `${l.textContent}: ${l.getAttribute("href")}`)
  throw new Error(
    `Latest OpenAPI spec not found. Available links:\n${allLinks.join("\n")}`,
  )
}

const ast = await openapiTs(
  `https://developer.themoviedb.org${firstLink}`,
  // "https://developer.themoviedb.org/openapi/64542913e1f86100738e227f",
)

Deno.writeTextFileSync("./tmdb-api.ts", astToString(ast))
