import { ZH_COUNTRIES } from "./config.js";

export function getRouteInfo(request) {
  const url = new URL(request.url);
  const ip = request.headers.get("CF-Connecting-IP") || "Unknown";
  const country = request.cf?.country || "Unknown";
  const region = request.cf?.region || request.cf?.regionCode || "";
  const city = request.cf?.city || "";
  const pathParts = url.pathname.split("/").filter(Boolean);
  const firstSegment = pathParts[0]?.toLowerCase();
  let pathname = url.pathname;
  let locale;

  if (firstSegment === "zh-cn") {
    locale = "zh";
    pathname = "/" + pathParts.slice(1).join("/");
  } else if (firstSegment === "en") {
    locale = "en";
    pathname = "/" + pathParts.slice(1).join("/");
  }

  if (!pathname || pathname === "//") {
    pathname = "/";
  }

  if (!locale) {
    const lang = (url.searchParams.get("lang") || "").toLowerCase();
    if (lang === "zh" || lang === "zh-cn") {
      locale = "zh";
    } else if (lang === "en") {
      locale = "en";
    } else {
      locale = ZH_COUNTRIES.includes(country) ? "zh" : "en";
    }
  }

  return {
    pathname,
    locale,
    ipInfo: {
      ip,
      country,
      region,
      city,
      locale
    }
  };
}

export function buildLinks(locale, pathname) {
  const prefix = locale === "zh" ? "/zh-cn" : "/en";
  const currentPath = pathname === "/" ? "" : pathname;

  return {
    login: `${prefix}/login`,
    signUp: `${prefix}/sign-up`,
    dashboard: `${prefix}/dashboard`,
    zhCurrent: `/zh-cn${currentPath}`,
    enCurrent: `/en${currentPath}`
  };
}

export function html(content, status = 200) {
  return new Response(content, {
    status,
    headers: {
      "content-type": "text/html;charset=UTF-8",
    },
  });
}

export function localizedRedirect(request, locale, pathname) {
  const url = new URL(request.url);
  const prefix = locale === "zh" ? "/zh-cn" : "/en";
  url.pathname = `${prefix}${pathname}`;
  return Response.redirect(url.toString(), 302);
}

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json;charset=UTF-8",
      "cache-control": "no-store"
    }
  });
}

