"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import TripMap from "@/components/TripMap";
import AmapLink, { AmapNavigationIcon } from "@/components/AmapLink";
import { BOOKING_CHECKLIST, DAYS, FIXED_CHECKLIST, SIGHTS, amapMarker, xiaohongshuSearch, type Hotel, type Sight, type Todo, type TripDay } from "@/lib/data";
import { beijingDate, daysUntilTrip, defaultTripDate, TRIP_END, TRIP_START } from "@/lib/date";
import { DEMO_EXPENSES, FAMILY_A, FAMILY_B, PEOPLE, formatMoney, settle, type Expense, type Person } from "@/lib/ledger";
import { checklistStore, expenseStore, isCloudMode } from "@/lib/storage";

type Tab = "today" | "trip" | "map" | "checklist" | "ledger";
const TAB_ITEMS: { id: Tab; label: string; icon: string }[] = [
  { id: "today", label: "今日", icon: "●" },
  { id: "trip", label: "行程", icon: "≡" },
  { id: "map", label: "地图", icon: "⌁" },
  { id: "checklist", label: "清单", icon: "✓" },
  { id: "ledger", label: "记账", icon: "¥" },
];

function SectionTitle({ title, count }: { title: string; count?: string | number }) {
  return <div className="section-title"><h2>{title}</h2>{count !== undefined && <span>{count}</span>}</div>;
}

function DateStrip({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  const selectedRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { selectedRef.current?.scrollIntoView({ inline: "center", block: "nearest" }); }, [selected]);
  return (
    <div className="date-strip scroll-hide">
      {DAYS.map((day) => (
        <button ref={day.id === selected ? selectedRef : undefined} key={day.id} type="button" className={day.id === selected ? "active" : ""} onClick={() => onSelect(day.id)}>
          <small>{day.month}</small><b>{day.dayOfMonth}</b>
        </button>
      ))}
    </div>
  );
}

function NavButton({ href, children, className = "", iconOnly = false, label }: { href: string | null; children: React.ReactNode; className?: string; iconOnly?: boolean; label?: string }) {
  if (!href) return null;
  const accessibleLabel = label ?? (typeof children === "string" ? children : "在高德地图查看地点");
  return (
    <AmapLink
      aria-label={accessibleLabel}
      title={accessibleLabel}
      className={`${className}${iconOnly ? " amap-icon-button" : ""}`.trim()}
      href={href}
    >
      {iconOnly ? <AmapNavigationIcon /> : children}
    </AmapLink>
  );
}

function Hero() {
  const now = beijingDate();
  const before = now < TRIP_START;
  const during = now >= TRIP_START && now <= TRIP_END;
  const count = daysUntilTrip();
  const countdownValue = before ? count : during ? "旅途中" : "已归来";
  const countdownLabel = before ? "天后出发" : during ? "北京时间" : "秋日环线";
  return (
    <header className="hero">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="hero-backdrop" src="/images/sights/shenxian-bay.jpg" alt="阿勒泰喀纳斯神仙湾秋景" loading="eager" />
      <div className="hero-shade" />
      <div className="hero-main">
        <div className="hero-title"><span>NORTHERN XINJIANG</span><h1>北疆秋日环线</h1></div>
        <div className={`countdown ${before ? "" : "countdown-state"}`}><b>{countdownValue}</b><span>{countdownLabel}</span></div>
      </div>
    </header>
  );
}

function RouteCard({ day }: { day: TripDay }) {
  const stops = day.routePoints.length === 2 ? [day.routePoints[0]] : day.routePoints.slice(1, -1);
  return (
    <article className="route-card card">
      <div className="route-meta"><span>DAY {String(day.day).padStart(2, "0")} · {day.date}</span><em>{day.drive}{day.distance ? ` · ${day.distance}` : ""}</em></div>
      <div className="route-heading">
        <h2>{day.title}</h2>
        <NavButton iconOnly href={amapMarker(day.routePoints[day.routePoints.length - 1])}>在高德查看今日终点</NavButton>
      </div>
      <p>{day.route}</p>
      <div className="route-stops"><span>途经</span>{stops.map((point, index) => <NavButton label={`在高德查看${point.name}`} key={`${point.name}-${index}`} href={amapMarker(point)}>{point.name} ↗</NavButton>)}</div>
    </article>
  );
}

function Flights({ day }: { day: TripDay }) {
  if (!day.flights) return null;
  return (
    <section className="content-section">
      <SectionTitle title="航班信息" count={`${day.flights.length} 队`} />
      <div className="flight-grid">{day.flights.map((flight) => (
        <article className="flight-card card" key={flight.no}>
          <span>{flight.team}</span><h3>{flight.no}</h3><p>{flight.depart}</p><i>↓</i><p>{flight.arrive}</p><small>{flight.people}</small>
        </article>
      ))}</div>
    </section>
  );
}

function Timeline({ day }: { day: TripDay }) {
  return (
    <section className="content-section">
      <SectionTitle title="今天怎么走" count={`${day.timeline.length} 个节点`} />
      <div className="timeline card">{day.timeline.map((item, index) => (
        <article key={`${item.time}-${item.title}`}>
          <time>{item.time}</time><i className="timeline-dot" /><div><div className="timeline-heading"><h3>{item.title}</h3>{item.point && <NavButton iconOnly label={`在高德查看${item.point.name}`} href={amapMarker(item.point)}>地点</NavButton>}</div><p>{item.detail}</p></div>
          {index < day.timeline.length - 1 && <span className="timeline-line" />}
        </article>
      ))}</div>
    </section>
  );
}

function SightCard({ sight, index }: { sight: Sight; index: number }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <article className={`sight-card card ${expanded ? "expanded" : ""}`} onClick={() => setExpanded((value) => !value)}>
      <div className="sight-cover">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={sight.image} alt={sight.name} loading="lazy" onError={(event) => { event.currentTarget.style.display = "none"; }} />
        <div className="cover-shade" />
        <button className="expand-button" type="button" aria-label={expanded ? `收起${sight.name}` : `展开${sight.name}`}>{expanded ? "×" : "+"}</button>
        <div className="sight-copy"><b>{String(index + 1).padStart(2, "0")}</b><div><h3>{sight.name}</h3><p>{sight.summary}</p><span>{sight.ticket}</span><span>{sight.duration}</span></div></div>
        <NavButton iconOnly label={`在高德查看${sight.name}`} className="cover-nav" href={amapMarker(sight)}>地点</NavButton>
      </div>
      {expanded && (
        <div className="sight-details" onClick={(event) => event.stopPropagation()}>
          <dl><dt>门票</dt><dd>{sight.ticket}</dd><dt>预约</dt><dd>{sight.reservation}</dd><dt>开放</dt><dd>{sight.opening}</dd><dt>建议停留</dt><dd>{sight.duration}</dd></dl>
          <h4>注意事项</h4><p>{sight.caution} 国庆客流集中，预留停车与排队；天气、道路和开放规则可能临时调整。</p>
          <div className="source-links"><a href={xiaohongshuSearch(sight.search)} target="_blank" rel="noreferrer">图片参考 · 小红书看同地点 ↗</a><a href={sight.policyUrl} target="_blank" rel="noreferrer">来源：新疆发布及景区票价通知 · 核验 2026-07-20 ↗</a></div>
        </div>
      )}
    </article>
  );
}

function HotelCard({ hotel }: { hotel: Hotel }) {
  const facts = [
    ["房型", hotel.room], ["入住", hotel.checkIn], ["退房", hotel.checkOut], ["金额", hotel.amount],
    hotel.order ? ["订单", hotel.order] : null, hotel.contact ? ["联系", hotel.contact] : null, hotel.cancel ? ["取消", hotel.cancel] : null,
  ].filter(Boolean) as string[][];
  return (
    <article className="hotel-card card">
      <div className="hotel-cover">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={hotel.image} alt={hotel.name} loading="lazy" onError={(event) => { event.currentTarget.style.display = "none"; }} />
        <div className="cover-shade" />
        <div className="hotel-badges">{hotel.plan && <span>{hotel.plan}</span>}<span className="booked">已预订</span>{hotel.status.includes("保底") && <span className="pending">保底预订 · 待确认</span>}</div>
        <span className="platform">{hotel.platform}</span>
        <div className="hotel-copy"><h3>{hotel.name}</h3><p>{hotel.address}</p></div>
        <NavButton iconOnly label={`在高德查看${hotel.name}`} className="hotel-place-icon" href={amapMarker(hotel)}>地点</NavButton>
      </div>
      <dl className="hotel-facts">{facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd className={label === "金额" ? "amount" : ""}>{value}</dd></div>)}</dl>
    </article>
  );
}

function TodoCard({ todo, checked, onToggle }: { todo: Todo; checked: boolean; onToggle: () => void }) {
  return (
    <button type="button" className={`todo-card card ${checked ? "checked" : ""}`} onClick={onToggle}>
      <i className="checkbox">{checked ? "✓" : ""}</i><span><b>{todo.title}</b><small>{todo.detail}</small></span>{todo.important && <em>重要</em>}
    </button>
  );
}

function TodayPage({ day, selected, setSelected, checklist, toggleChecklist }: { day: TripDay; selected: string; setSelected: (id: string) => void; checklist: Record<string, boolean>; toggleChecklist: (id: string) => void }) {
  return (
    <main className="today-page page-pad-bottom">
      <Hero />
      <DateStrip selected={selected} onSelect={(id) => { setSelected(id); window.scrollTo({ top: 236, behavior: "smooth" }); }} />
      <div className="today-content">
        <RouteCard day={day} />
        <Flights day={day} />
        <Timeline day={day} />
        <section className="content-section"><SectionTitle title="全部景点" count={`${day.sightIds.length} 个`} />
          {day.sightIds.length ? <div className="sight-list">{day.sightIds.map((id, index) => <SightCard key={id} sight={SIGHTS[id]} index={index} />)}</div> : <div className="empty-card card">今天没有安排景点，重点是交通和休息。</div>}
        </section>
        {day.hotels.length > 0 && <section className="content-section"><SectionTitle title="今晚住宿" count={`${day.hotels.length} 套`} /><div className="hotel-list">{day.hotels.map((hotel) => <HotelCard key={hotel.id} hotel={hotel} />)}</div></section>}
        <section className="content-section"><SectionTitle title="全部待办" count={`${day.todos.length} 项`} /><div className="todo-list">{day.todos.map((todo) => <TodoCard key={todo.id} todo={todo} checked={Boolean(checklist[todo.id])} onToggle={() => toggleChecklist(todo.id)} />)}</div></section>
        <section className="content-section"><SectionTitle title="注意事项" /><div className="notes card">{day.cautions.map((note) => <p key={note}>{note}</p>)}</div></section>
        {day.suggestion && <aside className="suggestion"><span>行程建议</span><p>{day.suggestion}</p></aside>}
      </div>
    </main>
  );
}

function TripPage({ openDay }: { openDay: (id: string) => void }) {
  return (
    <main className="trip-page standalone page-pad-bottom">
      <header className="page-header"><span>11 DAYS · 2026</span><h1>全部行程</h1><p>从两地出发，在乌鲁木齐会合；新疆境内行程完全重合。</p></header>
      <div className="trip-list">{DAYS.map((day) => (
        <button type="button" key={day.id} className="trip-row card" onClick={() => openDay(day.id)}>
          <div><small>{day.week}</small><b>{day.shortDate}</b></div><span><em>DAY {String(day.day).padStart(2, "0")}</em><strong>{day.title}</strong><small>{day.drive}{day.hotels[0] ? ` · ${day.hotels.map((hotel) => hotel.name).join(" / ")}` : ""}</small></span><i>›</i>
        </button>
      ))}</div>
      <aside className="rental-card"><span>RENTAL CAR</span><h2>坦克 300 · 自动挡 2.0T · 5座</h2><p>9月30日 09:00 · 酒店送车上门</p><p>10月9日 14:00 · 乌鲁木齐天山国际机场北航站楼国内出发</p><b>不限里程 · 无禁行区域 · 芝麻免押</b></aside>
    </main>
  );
}

function ChecklistPage({ checklist, toggleChecklist }: { checklist: Record<string, boolean>; toggleChecklist: (id: string) => void }) {
  const all = [...BOOKING_CHECKLIST, ...FIXED_CHECKLIST];
  const completed = all.filter((todo) => checklist[todo.id]).length;
  return (
    <main className="checklist-page standalone page-pad-bottom">
      <header className="page-header"><span>PRE-TRIP CHECK</span><h1>行前清单</h1><p>{completed}/{all.length} 已完成 · {isCloudMode ? "四人看到同一份云端清单" : "当前保存在本机，部署后四人共享"}</p><div className="progress"><i style={{ width: `${all.length ? completed / all.length * 100 : 0}%` }} /></div></header>
      <section><SectionTitle title="预订与预约" count={`${BOOKING_CHECKLIST.length} 项`} /><div className="todo-list">{BOOKING_CHECKLIST.map((todo) => <TodoCard key={todo.id} todo={todo} checked={Boolean(checklist[todo.id])} onToggle={() => toggleChecklist(todo.id)} />)}</div></section>
      <section><SectionTitle title="证件、车辆与装备" count={`${FIXED_CHECKLIST.length} 项`} /><div className="todo-list">{FIXED_CHECKLIST.map((todo) => <TodoCard key={todo.id} todo={todo} checked={Boolean(checklist[todo.id])} onToggle={() => toggleChecklist(todo.id)} />)}</div></section>
      <aside className="last-day-card"><span>临行前 24 小时</span><h2>再核对一次</h2><p>天气、道路封闭、景区开放、预约状态、航班动态与租车联系人。</p></aside>
    </main>
  );
}

function fileToCompressedJpeg(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) { reject(new Error("浏览器无法处理图片")); return; }
      let scale = Math.min(1, 1400 / Math.max(image.width, image.height));
      let data = "";
      for (let resize = 0; resize < 5; resize += 1) {
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        for (let quality = 0.8; quality >= 0.38; quality -= 0.08) {
          data = canvas.toDataURL("image/jpeg", quality);
          if (data.length * 0.75 <= 820 * 1024) { resolve(data); return; }
        }
        scale *= 0.78;
      }
      if (data) resolve(data);
      else reject(new Error("图片压缩失败"));
    };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error("图片读取失败")); };
    image.src = url;
  });
}

function localDateTime() {
  const formatter = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false });
  return formatter.format(new Date()).replace(" ", "T");
}

function ExpenseSheet({ person, expense, onClose, onSave }: { person: Person; expense?: Expense; onClose: () => void; onSave: (expense: Expense) => Promise<void> }) {
  const [title, setTitle] = useState(expense?.title ?? "");
  const [amount, setAmount] = useState(expense ? (expense.amountCents / 100).toFixed(2) : "");
  const [occurredAt, setOccurredAt] = useState(expense?.occurredAt ?? localDateTime());
  const [note, setNote] = useState(expense?.note ?? "");
  const [images, setImages] = useState(expense?.images ?? []);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const files = async (event: ChangeEvent<HTMLInputElement>) => {
    try {
      const selected = Array.from(event.target.files ?? []).slice(0, 3 - images.length);
      const compressed = await Promise.all(selected.map(fileToCompressedJpeg));
      setImages((current) => [...current, ...compressed].slice(0, 3));
    } catch { setError("图片处理失败，请换一张后重试"); }
    event.target.value = "";
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const amountCents = Math.round(Number(amount) * 100);
    if (!title.trim() || !Number.isFinite(amountCents) || amountCents <= 0) { setError("请填写付款内容和有效金额"); return; }
    setSaving(true); setError("");
    try {
      await onSave({ id: expense?.id ?? crypto.randomUUID(), title: title.trim(), amountCents, paidBy: expense?.paidBy ?? person, occurredAt, note: note.trim(), images });
      onClose();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "保存失败，已有数据仍然保留"); }
    finally { setSaving(false); }
  };
  return (
    <div className="sheet-backdrop" onClick={onClose}><form className="expense-sheet" onSubmit={submit} onClick={(event) => event.stopPropagation()}>
      <button className="sheet-close" type="button" onClick={onClose}>×</button><span>NEW EXPENSE</span><h2>{expense ? "修改消费" : "记一笔消费"}</h2>
      <div className="payer"><small>付款人<br />两家固定各承担 50%</small><b>{expense?.paidBy ?? person}</b></div>
      {error && <p className="form-error">{error}</p>}
      <label>付款内容<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="例如：喀纳斯门票" /></label>
      <label>金额<input type="number" inputMode="decimal" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" /></label>
      <label>消费时间<input type="datetime-local" value={occurredAt} onChange={(event) => setOccurredAt(event.target.value)} /></label>
      <label>备注<textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="可选" /></label>
      <label className="upload">＋ 拍摄或从相册选择<input type="file" accept="image/*" multiple onChange={files} disabled={images.length >= 3} /><small>最多 3 张，上传前自动压缩</small></label>
      {images.length > 0 && <div className="image-preview">{images.map((src, index) => <div key={`${src.slice(-24)}-${index}`}><img src={src} alt={`凭证 ${index + 1}`} /><button type="button" onClick={() => setImages(images.filter((_, i) => i !== index))}>×</button></div>)}</div>}
      <button className="primary-button save-expense" disabled={saving}>{saving ? "保存中…" : "保存并更新结算"}</button>
    </form></div>
  );
}

function LedgerPage({ identity, setIdentity, expenses, setExpenses }: { identity: Person | null; setIdentity: (person: Person | null) => void; expenses: Expense[]; setExpenses: (expenses: Expense[]) => void }) {
  const [sheet, setSheet] = useState<Expense | "new" | null>(null);
  const [error, setError] = useState("");
  const result = useMemo(() => settle(expenses), [expenses]);
  const save = async (expense: Expense) => {
    const saved = await expenseStore.save(expense);
    setExpenses(expenses.some((item) => item.id === saved.id) ? expenses.map((item) => item.id === saved.id ? saved : item) : [saved, ...expenses]);
  };
  const remove = async (expense: Expense) => {
    if (!window.confirm(`删除“${expense.title}”？此操作不可撤销。`)) return;
    try { await expenseStore.remove(expense.id); setExpenses(expenses.filter((item) => item.id !== expense.id)); }
    catch { setError("删除失败，已有数据仍然保留"); }
  };
  return (
    <main className="ledger-page page-pad-bottom">
      <header className="ledger-hero"><span>TWO-FAMILY LEDGER</span><button type="button" onClick={() => setIdentity(null)}>{identity ? `${identity}⌄` : "选择身份⌄"}</button><h1>旅行记账</h1><small>团队累计消费</small><strong>{formatMoney(result.total)}</strong><p>{isCloudMode ? "共享账本自动同步，弱网时保留最近数据" : "当前为本机预览数据；部署云端后自动切换为四人共享版本"}</p></header>
      {!identity ? (
        <section className="identity-card card"><span>WHO ARE YOU?</span><h2>选择“我是谁”</h2><p>不注册账号，只在这台手机上记住选择。</p><div>{PEOPLE.map((person) => <button key={person} type="button" onClick={() => setIdentity(person)}><b>{person}</b><small>{person === "闫寒" || person === "刘一帆" ? FAMILY_A : FAMILY_B}</small></button>)}</div></section>
      ) : (
        <div className="ledger-content">
          {error && <p className="form-error">{error}</p>}
          <section className="settlement card"><div className="settlement-title"><h2>家庭结算</h2><span>{isCloudMode ? "云端共享" : "本机数据"}</span></div>
            <div className="family-grid"><article><span>{FAMILY_A}</span><b>已付 {formatMoney(result.paidA)}</b><small>应承担 {formatMoney(result.owedA)}</small></article><article><span>{FAMILY_B}</span><b>已付 {formatMoney(result.paidB)}</b><small>应承担 {formatMoney(result.owedB)}</small></article></div>
            <div className="transfer"><span>最简平账 · 最多一笔</span>{result.transfer ? <><b>{result.transfer.from} → {result.transfer.to}</b><strong>{formatMoney(result.transfer.amountCents)}</strong></> : <b>两家已经结清</b>}</div>
          </section>
          <section className="expenses"><div className="section-title"><h2>消费明细</h2><button type="button" onClick={() => setSheet("new")}>＋ 记一笔</button></div>
            <div className="expense-list">{expenses.map((expense) => <article className="expense-card card" key={expense.id}><div><h3>{expense.title}</h3><strong>{formatMoney(expense.amountCents)}</strong></div><p>{expense.paidBy}支付 · {expense.occurredAt.slice(5).replace("T", " ")}</p>{expense.note && <small>{expense.note}</small>}<div className="expense-foot"><span>两家各一半</span><span>{expense.images.length ? `${expense.images.length} 张图片` : "无图片"}</span><button type="button" onClick={() => setSheet(expense)}>修改</button><button type="button" onClick={() => remove(expense)}>删除</button></div>{expense.images.length > 0 && <div className="receipt-images">{expense.images.map((src, index) => <img key={`${expense.id}-${index}`} src={src} alt={`${expense.title}凭证${index + 1}`} />)}</div>}</article>)}</div>
          </section>
        </div>
      )}
      {identity && sheet && <ExpenseSheet person={identity} expense={sheet === "new" ? undefined : sheet} onClose={() => setSheet(null)} onSave={save} />}
    </main>
  );
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("today");
  const [selected, setSelectedState] = useState(DAYS[0].id);
  const [checklist, setChecklistState] = useState<Record<string, boolean>>({});
  const [identity, setIdentityState] = useState<Person | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>(DEMO_EXPENSES);
  const [hydrated, setHydrated] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  useEffect(() => {
    const savedDate = localStorage.getItem("bj-selected-date");
    setSelectedState(DAYS.some((day) => day.id === savedDate) ? savedDate! : defaultTripDate());
    const savedIdentity = localStorage.getItem("bj-identity") as Person | null;
    if (savedIdentity && PEOPLE.includes(savedIdentity)) setIdentityState(savedIdentity);
    Promise.all([
      checklistStore.load().then((savedChecklist) => { if (savedChecklist) setChecklistState(savedChecklist); }),
      expenseStore.load().then((stored) => {
        if (stored) setExpenses(stored);
        else if (!isCloudMode) localStorage.setItem("bj-expenses-v1", JSON.stringify(DEMO_EXPENSES));
      }),
    ]).catch(() => undefined).finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!isCloudMode || !hydrated) return;
    const refresh = () => {
      if (tab === "ledger") expenseStore.load().then((stored) => stored && setExpenses(stored)).catch(() => undefined);
      if (tab === "today" || tab === "checklist") checklistStore.load().then((stored) => stored && setChecklistState(stored)).catch(() => undefined);
    };
    const refreshVisible = () => { if (document.visibilityState === "visible") refresh(); };
    refresh();
    const timer = window.setInterval(refresh, 15_000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refreshVisible);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refreshVisible);
    };
  }, [hydrated, tab]);

  const setSelected = (id: string) => { setSelectedState(id); if (hydrated) localStorage.setItem("bj-selected-date", id); };
  const toggleChecklist = (id: string) => {
    const checked = !checklist[id];
    setChecklistState({ ...checklist, [id]: checked });
    checklistStore.save(id, checked).then(() => setSyncMessage("")).catch(() => {
      setChecklistState((current) => ({ ...current, [id]: !checked }));
      setSyncMessage("共享清单保存失败，请检查网络后重试");
    });
  };
  const setIdentity = (person: Person | null) => { setIdentityState(person); if (person) localStorage.setItem("bj-identity", person); else localStorage.removeItem("bj-identity"); };
  const day = DAYS.find((item) => item.id === selected) ?? DAYS[0];
  const showDay = (id = selected) => { setSelected(id); setTab("today"); requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" })); };

  return (
    <div className="app-shell">
      {tab === "today" && <TodayPage day={day} selected={selected} setSelected={setSelected} checklist={checklist} toggleChecklist={toggleChecklist} />}
      {tab === "trip" && <TripPage openDay={showDay} />}
      {tab === "map" && <TripMap day={day} onChangeDay={setSelected} onShowDay={() => showDay()} />}
      {tab === "checklist" && <ChecklistPage checklist={checklist} toggleChecklist={toggleChecklist} />}
      {tab === "ledger" && <LedgerPage identity={identity} setIdentity={setIdentity} expenses={expenses} setExpenses={setExpenses} />}
      {syncMessage && <button className="sync-message" type="button" onClick={() => setSyncMessage("")}>{syncMessage} ×</button>}
      <nav className="bottom-nav">{TAB_ITEMS.map((item) => <button key={item.id} type="button" className={tab === item.id ? "active" : ""} onClick={() => { setTab(item.id); window.scrollTo({ top: 0, behavior: "auto" }); }}><i>{item.icon}</i><span>{item.label}</span></button>)}</nav>
    </div>
  );
}
