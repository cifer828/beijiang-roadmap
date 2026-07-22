import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const jscode = process.env.AMAP_SECURITY_JSCODE;
  if (!jscode) {
    return NextResponse.json({ info: "AMAP_SECURITY_JSCODE 未配置", status: "0" }, { status: 503 });
  }
  const { path } = await context.params;
  const suffix = path.join("/");
  const upstream = suffix.startsWith("v4/map/styles")
    ? "https://webapi.amap.com/"
    : suffix.startsWith("v3/vectormap")
      ? "https://fmap01.amap.com/"
      : "https://restapi.amap.com/";
  const target = new URL(suffix, upstream);
  request.nextUrl.searchParams.forEach((value, key) => target.searchParams.set(key, value));
  target.searchParams.set("jscode", jscode);
  const response = await fetch(target, {
    method: request.method,
    headers: {
      Accept: request.headers.get("accept") ?? "application/json",
      ...(request.headers.get("content-type") ? { "content-type": request.headers.get("content-type")! } : {}),
    },
    body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer(),
    cache: "no-store",
  });
  return new NextResponse(response.body, {
    status: response.status,
    headers: { "content-type": response.headers.get("content-type") ?? "application/json" },
  });
}

export const GET = proxy;
export const POST = proxy;
