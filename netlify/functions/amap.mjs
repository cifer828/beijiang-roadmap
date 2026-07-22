const json = (value, status = 200) =>
  new Response(JSON.stringify(value), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });

export default async function handler(request) {
  const jscode = process.env.AMAP_SECURITY_JSCODE;
  if (!jscode) {
    return json({ status: "0", info: "AMAP_SECURITY_JSCODE 未配置" }, 503);
  }

  const incoming = new URL(request.url);
  const prefix = "/api/amap/";
  let suffix = incoming.pathname.startsWith(prefix)
    ? incoming.pathname.slice(prefix.length)
    : "";
  if (suffix.startsWith("_AMapService/")) suffix = suffix.slice("_AMapService/".length);

  if (!suffix || !/^[a-zA-Z0-9/_-]+$/.test(suffix)) {
    return json({ status: "0", info: "无效的高德代理路径" }, 400);
  }

  const upstream = suffix.startsWith("v4/map/styles")
    ? "https://webapi.amap.com/"
    : suffix.startsWith("v3/vectormap")
      ? "https://fmap01.amap.com/"
      : "https://restapi.amap.com/";
  const target = new URL(suffix, upstream);
  incoming.searchParams.forEach((value, key) => {
    if (key !== "jscode") target.searchParams.append(key, value);
  });
  target.searchParams.set("jscode", jscode);

  const method = request.method.toUpperCase();
  const response = await fetch(target, {
    method,
    headers: {
      accept: request.headers.get("accept") || "application/json",
      ...(request.headers.get("content-type")
        ? { "content-type": request.headers.get("content-type") }
        : {}),
    },
    body: method === "GET" || method === "HEAD" ? undefined : request.body,
    redirect: "follow",
  });

  return new Response(response.body, {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") || "application/json",
      "cache-control": "no-store",
    },
  });
}

export const config = {
  path: "/api/amap/*",
};
