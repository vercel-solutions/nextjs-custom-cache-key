import { notFound } from "next/navigation";
import { type NextRequest, NextResponse } from "next/server";
import { match } from "path-to-regexp";

interface CacheKey {
  match: string;
  search?: string[];
  headers?: string[];
  cookies?: string[];
}

type Caching = {
  [page: string]: CacheKey;
};

/**
 * The name of the cache key param as used in the catch-all route.
 */
// const CACHE_KEY = "cacheKey";

/**
 * This allows us to identify the path is a cache key.
 */
export const CACHE_KEY_ID = "k";

export const SECTION_SEPARATOR = ";";
export const PAIR_SEPARATOR = "&";

export const caching: Caching = {
  shop: {
    match: "/shop",
    search: ["a"],
  },
  cart: {
    match: "/cart",
    search: ["a"],
  },
};

const cachingKeys = Object.values(caching).map((cacheKey) => {
  return {
    ...cacheKey,
    match: match(cacheKey.match),
  };
});

export function cacheKey(cacheKey: string): {
  searchParams: { [key: string]: string };
  headers: { [key: string]: string };
  cookies: { [key: string]: string };
} {
  cacheKey = Buffer.from(cacheKey, "base64url").toString("ascii");
  console.log("CACHE KEY", cacheKey);

  const searchParams: { [key: string]: string } = {};
  const headers: { [key: string]: string } = {};
  const cookies: { [key: string]: string } = {};

  const parts = cacheKey.split(SECTION_SEPARATOR);
  const id = parts.shift();

  if (id !== CACHE_KEY_ID) {
    console.log("NOT FOUND");
    notFound();
  }

  for (const part of parts) {
    const [type, value] = part.split(":", 2);

    if (!value) continue;

    const pairs = value.split(PAIR_SEPARATOR);
    for (const pair of pairs) {
      const [k, v] = pair.split("=");

      switch (type) {
        case "s":
          searchParams[k] = v;
          break;
        case "h":
          headers[k] = v;
          break;
        case "c":
          cookies[k] = v;
          break;
      }
    }
  }

  return { searchParams, headers, cookies };
}

export function cacheKeyMiddleware(req: NextRequest): NextResponse {
  const { pathname, searchParams } = req.nextUrl;
  const url = new URL(req.nextUrl);

  // Prevent direct access to the cache key.
  if (pathname.startsWith(`/${CACHE_KEY_ID}${SECTION_SEPARATOR}`)) {
    url.pathname = "/404";
    return NextResponse.rewrite(url);
  }

  // The cache key is not optional.
  url.pathname = `/${CACHE_KEY_ID}${pathname}`;

  for (const cacheKey of cachingKeys) {
    if (!cacheKey.match(pathname)) continue;

    let search = [];
    let headers = [];
    let cookies = [];
    let key = "";

    if (cacheKey.search) {
      for (const searchKey of cacheKey.search) {
        const val = searchParams.get(searchKey);
        if (val) {
          search.push(`${searchKey}=${val}`);
        }
      }
    }
    if (cacheKey.headers) {
      for (const headerKey of cacheKey.headers) {
        const val = req.headers.get(headerKey);
        if (val) {
          headers.push(`${headerKey}=${val}`);
        }
      }
    }
    if (cacheKey.cookies) {
      for (const cookieKey of cacheKey.cookies) {
        const val = req.cookies.get(cookieKey)?.value;
        if (val) {
          cookies.push(`${cookieKey}=${val}`);
        }
      }
    }

    key = [
      CACHE_KEY_ID,
      search.length && `s:${search.join(PAIR_SEPARATOR)}`,
      headers.length && `h:${headers.join(PAIR_SEPARATOR)}`,
      cookies.length && `c:${cookies.join(PAIR_SEPARATOR)}`,
    ]
      .filter(Boolean)
      .join(SECTION_SEPARATOR);

    key = Buffer.from(key).toString("base64url");

    if (key.length) {
      url.pathname = `/${key}${pathname}`;
      break;
    }
  }

  console.log("Rewrite to:", url.pathname);
  const res = NextResponse.rewrite(url);
  // res.headers.set("CDN-Cache-Control", "max-age=10, stale-while-revalidate=60");
  return res;
}
