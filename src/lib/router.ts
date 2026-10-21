import { useEffect, useState } from "react";

export interface Route {
  path: string;
  query: URLSearchParams;
}

function parseHash(): Route {
  const hash = window.location.hash.replace(/^#/, "");
  const [path, queryString = ""] = hash.split("?");
  return { path: path || "/", query: new URLSearchParams(queryString) };
}

export function useRouter() {
  const [route, setRoute] = useState<Route>(() => parseHash());

  useEffect(() => {
    const onChange = () => setRoute(parseHash());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return route;
}

export function navigate(to: string): void {
  const target = to.startsWith("#") ? to : `#${to}`;
  if (window.location.hash === target) {
    setRouteImmediate(target);
  } else {
    window.location.hash = target;
  }
}

function setRouteImmediate(target: string): void {
  window.location.hash = target;
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}

export function buildMenuUrl(tableId: string): { url: string; isLocal: boolean } {
  const base = window.location.origin + window.location.pathname;
  const url = `${base}#/menu?table=${encodeURIComponent(tableId)}`;
  const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "0.0.0.0" ||
    window.location.port !== "";
  return { url, isLocal };
}
