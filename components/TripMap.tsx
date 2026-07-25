"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import AmapLink, { AmapNavigationIcon } from "@/components/AmapLink";
import { amapMarker, DAYS, FULL_ROUTE, type Point, type TripDay } from "@/lib/data";

declare global {
  interface Window {
    AMap?: any;
    _AMapSecurityConfig?: { serviceHost: string };
    __BJTripMap?: any;
  }
}

type Props = {
  active: boolean;
  day: TripDay;
  onChangeDay: (id: string) => void;
  onShowDay: () => void;
};

const AMAP_SCRIPT_SELECTOR = "script[data-amap-loader]";
const AMAP_LOAD_TIMEOUT = 15_000;

export default function TripMap({ active, day, onChangeDay, onShowDay }: Props) {
  const apiKey = process.env.NEXT_PUBLIC_AMAP_KEY;
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const routeOverlays = useRef<any[]>([]);
  const [apiState, setApiState] = useState<"loading" | "ready" | "failed">(apiKey ? "loading" : "failed");
  const [retryCount, setRetryCount] = useState(0);
  const [selectedPoint, setSelectedPoint] = useState<Point>(day.routePoints[day.routePoints.length - 1]);
  const [locating, setLocating] = useState(false);
  const [message, setMessage] = useState(apiKey ? "" : "尚未配置高德 Key，已显示可查看地点清单");

  useEffect(() => {
    setSelectedPoint(day.routePoints[day.routePoints.length - 1]);
  }, [day]);

  useEffect(() => {
    if (!apiKey) {
      setApiState("failed");
      setMessage("尚未配置高德 Key，已显示可查看地点清单");
      return;
    }
    if (window.AMap) {
      setApiState("ready");
      setMessage("");
      return;
    }

    setApiState("loading");
    setMessage("正在连接高德地图…");
    const proxyOrigin = (process.env.NEXT_PUBLIC_AMAP_SERVICE_HOST || window.location.origin).replace(/\/$/, "");
    window._AMapSecurityConfig = { serviceHost: `${proxyOrigin}/_AMapService` };

    let script = document.querySelector<HTMLScriptElement>(AMAP_SCRIPT_SELECTOR);
    if (script?.dataset.amapState === "failed" || (script?.dataset.amapState === "ready" && !window.AMap)) {
      script.remove();
      script = null;
    }
    const shouldAppend = !script;
    if (!script) {
      script = document.createElement("script");
      script.dataset.amapLoader = "true";
      script.dataset.amapState = "loading";
      script.src = `https://webapi.amap.com/maps?v=2.0&key=${encodeURIComponent(apiKey)}&plugin=AMap.Geolocation`;
      script.async = true;
    }

    let active = true;
    const failed = () => {
      script!.dataset.amapState = "failed";
      if (!active) return;
      setApiState("failed");
      setMessage("地图连接失败，可重试或使用下方地点清单");
    };
    const ready = () => {
      if (!window.AMap) {
        failed();
        return;
      }
      script!.dataset.amapState = "ready";
      if (!active) return;
      setApiState("ready");
      setMessage("");
    };
    const timeout = window.setTimeout(failed, AMAP_LOAD_TIMEOUT);
    const onLoad = () => {
      window.clearTimeout(timeout);
      ready();
    };
    const onError = () => {
      window.clearTimeout(timeout);
      failed();
    };
    script.addEventListener("load", onLoad, { once: true });
    script.addEventListener("error", onError, { once: true });
    if (shouldAppend) document.head.appendChild(script);
    else if (script.dataset.amapState === "ready") ready();

    return () => {
      active = false;
      window.clearTimeout(timeout);
      script?.removeEventListener("load", onLoad);
      script?.removeEventListener("error", onError);
      if (!window.AMap && script?.dataset.amapState === "loading") {
        script.dataset.amapState = "failed";
        script.remove();
      }
    };
  }, [apiKey, retryCount]);

  const fitRoute = () => {
    const map = mapRef.current;
    if (!map || routeOverlays.current.length === 0) return;
    const cardAvoidance = (cardRef.current?.offsetHeight ?? 190) + 32;
    map.resize();
    // 高德 avoid 的顺序为上、下、左、右；底部必须为信息卡完整预留空间。
    map.setFitView(routeOverlays.current, true, [108, cardAvoidance, 24, 24], 9);
  };

  useEffect(() => {
    if (!active || apiState !== "ready" || !window.AMap || !containerRef.current) return;
    let firstFrame = 0;
    let settleTimer = 0;
    try {
      const AMap = window.AMap;
      const map = mapRef.current ?? new AMap.Map(containerRef.current, {
        viewMode: "2D",
        mapStyle: "amap://styles/whitesmoke",
        zoom: 5,
        showLabel: true,
        resizeEnable: true,
      });
      mapRef.current = map;
      window.__BJTripMap = map;
      map.clearMap();

      const full = new AMap.Polyline({
        path: FULL_ROUTE.map((point) => [point.lng, point.lat]),
        strokeColor: "#315c4a",
        strokeWeight: 5,
        strokeOpacity: 0.72,
        showDir: true,
        lineJoin: "round",
        zIndex: 20,
      });
      const current = new AMap.Polyline({
        path: day.routePoints.map((point) => [point.lng, point.lat]),
        strokeColor: "#d97842",
        strokeWeight: 9,
        strokeOpacity: 1,
        showDir: true,
        lineJoin: "round",
        zIndex: 35,
      });
      map.add([full, current]);

      const todayNames = new Set(day.routePoints.map((point) => point.name));
      const allVisiblePoints = [...FULL_ROUTE, ...day.routePoints];
      const unique = allVisiblePoints.filter((point, index, list) => list.findIndex((item) => item.name === point.name) === index);
      const markers = unique.map((point) => {
        const active = todayNames.has(point.name);
        const marker = new AMap.Marker({
          position: [point.lng, point.lat],
          content: `<span class="amap-route-dot${active ? " is-current" : ""}" aria-label="${point.name}"></span>`,
          offset: new AMap.Pixel(active ? -10 : -7, active ? -10 : -7),
          zIndex: active ? 60 : 40,
        });
        marker.on("click", () => setSelectedPoint(point));
        return marker;
      });
      map.add(markers);
      routeOverlays.current = [full, current, ...markers];
      firstFrame = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(fitRoute);
      });
      settleTimer = window.setTimeout(fitRoute, 260);
    } catch {
      mapRef.current?.destroy?.();
      mapRef.current = null;
      routeOverlays.current = [];
      setApiState("failed");
      setMessage("地图渲染失败，可重试或使用下方地点清单");
    }

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.clearTimeout(settleTimer);
      routeOverlays.current = [];
    };
  }, [active, apiState, day]);

  useEffect(() => () => {
    const map = mapRef.current;
    mapRef.current = null;
    routeOverlays.current = [];
    if (window.__BJTripMap === map) window.__BJTripMap = undefined;
    map?.destroy?.();
  }, []);

  const locate = () => {
    if (!navigator.geolocation || !mapRef.current || !window.AMap) {
      setMessage("当前浏览器无法使用定位，请检查权限后重试");
      return;
    }
    setLocating(true);
    setMessage("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const gps = [position.coords.longitude, position.coords.latitude];
        window.AMap.convertFrom(gps, "gps", (status: string, result: any) => {
          setLocating(false);
          if (status !== "complete" || !result.locations?.[0]) {
            setMessage("坐标转换失败，请稍后重试");
            return;
          }
          const location = result.locations[0];
          const center = [
            typeof location.getLng === "function" ? location.getLng() : location.lng,
            typeof location.getLat === "function" ? location.getLat() : location.lat,
          ];
          const marker = new window.AMap.Marker({
            position: center,
            content: '<span class="amap-location-dot"></span>',
            offset: new window.AMap.Pixel(-10, -10),
            zIndex: 90,
          });
          mapRef.current.add(marker);
          mapRef.current.setZoomAndCenter(13, center, true, 0);
          setMessage(`定位成功，精度约 ${Math.round(position.coords.accuracy)} 米`);
        });
      },
      (error) => {
        setLocating(false);
        setMessage(error.code === 1 ? "定位权限被拒绝，请在浏览器设置中允许后重试" : "定位失败，请检查网络或 GPS 后重试");
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30_000 },
    );
  };

  const counts = useMemo(() => ({ sights: day.sightIds.length, hotels: day.hotels.length, todos: day.todos.length }), [day]);

  return (
    <section className={`map-page${active ? "" : " map-page-hidden"}`}>
      {apiState === "ready" ? <div ref={containerRef} className="amap-canvas" aria-label="北疆全景路线地图" /> : (
        <div className="map-fallback">
          <div className="fallback-copy">
            <span>{apiState === "loading" ? "LOADING MAP" : "OFFLINE ROUTE"}</span>
            <h2>{apiState === "loading" ? "路线地图加载中" : "当天地点清单"}</h2>
            <p>{message}</p>
            {apiKey && apiState === "failed" && <button className="map-retry" type="button" onClick={() => setRetryCount((count) => count + 1)}>重新加载地图</button>}
          </div>
          <div className="fallback-list">
            {day.routePoints.map((point, index) => {
              const href = amapMarker(point);
              const content = <><b>{String(index + 1).padStart(2, "0")}</b><span>{point.name}</span><em>{href ? <AmapNavigationIcon /> : "沿途路段"}</em></>;
              return href ? (
                <AmapLink aria-label={`在高德查看${point.name}`} title={`在高德查看${point.name}`} key={`${point.name}-${index}`} href={href}>{content}</AmapLink>
              ) : (
                <div key={`${point.name}-${index}`}>{content}</div>
              );
            })}
          </div>
        </div>
      )}

      <div className="map-dates">
        {DAYS.map((item) => (
          <button key={item.id} className={item.id === day.id ? "active" : ""} type="button" onClick={() => onChangeDay(item.id)}>{item.shortDate}</button>
        ))}
      </div>
      <aside className="map-toolbar">
        <button className="map-fit glass" type="button" onClick={fitRoute} disabled={apiState !== "ready"}>路线居中</button>
        <span className="map-legend glass"><i />暖橙色为当天路线</span>
        <button className="map-locate glass" type="button" disabled={locating || apiState !== "ready"} onClick={locate}>◎ {locating ? "定位中" : "定位"}</button>
      </aside>
      {message && apiState === "ready" && <div className="map-message">{message}</div>}

      <div ref={cardRef} className="map-info">
        <span>DAY {String(day.day).padStart(2, "0")} · {day.shortDate}</span>
        <h2>{selectedPoint.name}</h2>
        <p>{day.title} · {counts.hotels} 个住宿方案</p>
        <div className="map-stats"><b>景点 {counts.sights}</b><b>待办 {counts.todos}</b><b>{day.drive}</b></div>
        <div className="map-info-actions">
          {amapMarker(selectedPoint) && <AmapLink className="amap-icon-button" aria-label={`在高德查看${selectedPoint.name}`} title={`在高德查看${selectedPoint.name}`} href={amapMarker(selectedPoint)!}><AmapNavigationIcon /></AmapLink>}
          <button type="button" onClick={onShowDay}>查看当天详情</button>
        </div>
      </div>
    </section>
  );
}
