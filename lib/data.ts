export type NavigationTarget = { name: string; lng: number; lat: number };
export type Point = NavigationTarget & {
  /**
   * A distinct, verified arrival point can be supplied for broad scenic areas.
   * Set to false when there is no single safe and verifiable driving target.
   */
  navigation?: NavigationTarget | false;
};
export type TimelineItem = { time: string; title: string; detail: string; point?: Point };
export type Todo = { id: string; title: string; detail: string; important?: boolean; booking?: boolean };
export type Flight = { team: string; no: string; depart: string; arrive: string; people: string };

export type Sight = Point & {
  id: string;
  image: string;
  duration: string;
  ticket: string;
  reservation: string;
  opening: string;
  summary: string;
  caution: string;
  search: string;
  source: string;
  policyUrl: string;
};

export type Hotel = Point & {
  id: string;
  image: string;
  platform: string;
  plan?: "Plan A" | "Plan B";
  status: string;
  room: string;
  checkIn: string;
  checkOut: string;
  amount: string;
  order?: string;
  contact?: string;
  cancel?: string;
  address: string;
};

export type TripDay = {
  id: string;
  day: number;
  date: string;
  shortDate: string;
  month: string;
  dayOfMonth: string;
  week: string;
  title: string;
  route: string;
  drive: string;
  distance?: string;
  timeline: TimelineItem[];
  sightIds: string[];
  hotels: Hotel[];
  todos: Todo[];
  cautions: string[];
  suggestion?: string;
  flights?: Flight[];
  routePoints: Point[];
};

export const POINTS: Record<string, Point> = {
  urumqi: { name: "乌鲁木齐", lng: 87.6177, lat: 43.7928 },
  airport: { name: "乌鲁木齐天山国际机场", lng: 87.4742, lat: 43.9071 },
  urumqiHotel: { name: "桔子乌鲁木齐天山国际机场砂之船奥莱酒店", lng: 87.449301, lat: 43.895188 },
  ulungur: { name: "乌伦古湖黄金海岸景区", lng: 87.412829, lat: 47.244158 },
  altay: { name: "阿勒泰市", lng: 88.1396, lat: 47.8484 },
  altayHotel: { name: "阿勒泰壹号民宿", lng: 88.135913, lat: 47.83284 },
  birch: { name: "阿勒泰桦林公园", lng: 88.122383, lat: 47.864343 },
  ahe: { name: "阿禾公路", lng: 87.532, lat: 48.164, navigation: false },
  hemuTransfer: { name: "禾木入口服务区（换乘中心）", lng: 87.462861, lat: 48.576179 },
  hemu: { name: "禾木村", lng: 87.437968, lat: 48.570573 },
  hemuHotel: { name: "纳兰禾谷民宿", lng: 87.440149, lat: 48.576401 },
  hemuNew: { name: "禾木新村", lng: 87.446028, lat: 48.582581 },
  hemuOld: { name: "禾木老村", lng: 87.437968, lat: 48.570573 },
  hadeng: { name: "哈登观景台", lng: 87.430124, lat: 48.577558 },
  bridge: { name: "援疆桥", lng: 87.438921, lat: 48.581017 },
  kanasCenter: { name: "喀纳斯游客中心（换乘中心）", lng: 87.028572, lat: 48.69666 },
  shenxian: { name: "神仙湾", lng: 87.03738, lat: 48.657875 },
  moon: { name: "月亮湾", lng: 87.044915, lat: 48.63048 },
  wolong: { name: "卧龙湾", lng: 87.054892, lat: 48.620796 },
  fish: { name: "观鱼台", lng: 86.993546, lat: 48.72665 },
  kanas: {
    name: "喀纳斯湖",
    lng: 87.029115,
    lat: 48.712122,
    navigation: { name: "喀纳斯游客中心（换乘中心）", lng: 87.028572, lat: 48.69666 },
  },
  baihaba: { name: "白哈巴村", lng: 86.783596, lat: 48.695717 },
  baihabaHotel: { name: "牧峰居民宿", lng: 86.784965, lat: 48.695701 },
  buerjin: { name: "布尔津县", lng: 86.8749, lat: 47.7013 },
  buerjinHotel: { name: "阿肯的小木屋", lng: 86.857477, lat: 47.699385 },
  wucaitan: { name: "布尔津五彩滩", lng: 86.680702, lat: 47.837537 },
  ghost: { name: "世界魔鬼城", lng: 85.733205, lat: 46.135149 },
  kuitun: { name: "奎屯市", lng: 84.9033, lat: 44.4269 },
  kuitunHotel: { name: "星程奎屯酒店", lng: 84.90068, lat: 44.414348 },
  sayramEast: { name: "赛里木湖国家级风景名胜区", lng: 81.386542, lat: 44.617077 },
  sayram: {
    name: "赛里木湖",
    lng: 81.1699,
    lat: 44.6007,
    navigation: { name: "赛里木湖国家级风景名胜区", lng: 81.386542, lat: 44.617077 },
  },
  guozigou: { name: "果子沟观景台", lng: 81.164954, lat: 44.473939 },
  yining: { name: "伊宁市", lng: 81.3242, lat: 43.9169 },
  yiningHotel: { name: "桔子伊宁万容广场酒店", lng: 81.263359, lat: 43.934119 },
  teks: { name: "特克斯八卦城", lng: 81.839833, lat: 43.214965 },
  teksHotel: { name: "全季特克斯九宫新城酒店", lng: 81.865028, lat: 43.22108 },
  kalajun: { name: "喀拉峻草原", lng: 82.1686, lat: 43.1027, navigation: false },
  kalajunHotel: { name: "喀拉峻花间营·云驰谷", lng: 82.226612, lat: 43.087324 },
  nalati: {
    name: "那拉提草原",
    lng: 84.0392,
    lat: 43.2429,
    navigation: { name: "那拉提旅游风景区游客中心", lng: 84.029772, lat: 43.319864 },
  },
  kuerdening: {
    name: "库尔德宁",
    lng: 82.691226,
    lat: 43.275248,
    navigation: { name: "库尔德宁景区游客中心", lng: 82.691226, lat: 43.275248 },
  },
  tangbula: { name: "唐布拉草原", lng: 84.104, lat: 43.855 },
  xinyuanHotel: { name: "汉庭新源县天鹅湖酒店", lng: 83.238143, lat: 43.443081 },
};

const CULTURE = "https://wlt.xinjiang.gov.cn/";
const KANAS_POLICY = "https://xjdrc.xinjiang.gov.cn/xjfgw/c108396/201808/2b4475f475ea48ccbe8e8dc5406b2914.shtml";
const NALATI_POLICY = "https://www.xjyl.gov.cn/xjylz/c112876/202605/f30d3b1beb464dd59228d130ee56d423.shtml";
const GHOST_POLICY = "https://www.weh.gov.cn/weh/ly1/202504/c105f81066dc4469ae9c69d7660c93c6.shtml";
const SAYRAM_POLICY = "https://www.xjboz.gov.cn/info/2232/159030.htm";
const KALAJUN_POLICY = "https://www.xjyl.gov.cn/xjylz/c112878/201811/6eef86ca313544c0b42a77777476006b.shtml";

const sight = (
  id: string,
  point: Point,
  image: string,
  duration: string,
  ticket: string,
  reservation: string,
  summary: string,
  caution: string,
  search: string,
  policyUrl = CULTURE,
): Sight => ({
  id,
  ...point,
  image: `/images/sights/${image}`,
  duration,
  ticket,
  reservation,
  opening: "运营时间待节前公告，出发前复核",
  summary,
  caution,
  search,
  source: "迁移包景点图片 · 仅作行程参考",
  policyUrl,
});

export const SIGHTS: Record<string, Sight> = {
  ulungur: sight("ulungur", POINTS.ulungur, "ulungur.jpg", "1—2 小时", "价格待复核", "通常无需预约", "湖岸开阔，适合长途驾驶间隙散步休息。", "风大温差明显，勿在非开放区域下水。", "乌伦古湖黄金海岸"),
  birch: sight("birch", POINTS.birch, "birch-park-xhs.webp", "约 1 小时", "票价待复核", "通常现场入园", "额尔齐斯河畔的白桦林，作为阿勒泰傍晚机动行程。", "有余量再去，不挤压次日休息。", "阿勒泰桦林公园"),
  ahe: sight("ahe", POINTS.ahe, "ahe-road-xhs.webp", "沿途 5—7 小时", "通行通常免费", "当天 07:00 查看交通管制", "阿勒泰至禾木方向的景观公路，沿途雪山、河谷与森林。", "仅白天行驶；天气可能影响通行，正规位置停车。", "阿禾公路"),
  hemuNew: sight("hemuNew", POINTS.hemuNew, "hemu-new.jpg", "约 1 小时", "以禾木景区票务为准", "随禾木景区实名购票", "民宿和餐饮较集中，可先办理入住与补给。", "国庆换乘排队可能严重超时。", "禾木新村"),
  hemuOld: sight("hemuOld", POINTS.hemuOld, "hemu-old.jpg", "约 1.5 小时", "以禾木景区票务为准", "随禾木景区实名购票", "图瓦木屋、村落道路与河谷景观集中区域。", "尊重居民生活，清晨和夜间控制音量。", "禾木老村"),
  bridge: sight("bridge", POINTS.bridge, "yuanjiang-bridge.jpg", "约 20 分钟", "村内步行节点", "无需单独预约", "禾木河边的步行节点，可连接村内散步路线。", "桥面湿滑时慢行，不翻越护栏。", "禾木援疆桥"),
  hadeng: sight("hadeng", POINTS.hadeng, "hadeng.jpg", "往返约 1.5 小时", "以禾木景区票务为准", "无需单独预约", "俯瞰禾木村与河谷的经典高位视角。", "上坡路湿滑，日落后降温快；晚到可取消。", "禾木哈登观景台"),
  shenxian: sight("shenxian", POINTS.shenxian, "shenxian-bay.jpg", "约 30 分钟", "含在喀纳斯主景区门票内", "实名提前购买喀纳斯票", "晨雾、河湾与森林相伴的三湾首站。", "国庆排队集中，按区间车顺序游览。", "喀纳斯神仙湾", KANAS_POLICY),
  moon: sight("moon", POINTS.moon, "moon-bay.jpg", "约 40 分钟", "含在喀纳斯主景区门票内", "同喀纳斯主票", "喀纳斯河标志性弯道，设多个观景角度。", "栈道湿滑，按现场开放路段通行。", "喀纳斯月亮湾", KANAS_POLICY),
  wolong: sight("wolong", POINTS.wolong, "wolong-bay.jpg", "约 40 分钟", "含在喀纳斯主景区门票内", "同喀纳斯主票", "河心沙洲形似卧龙，是三湾游览的下游节点。", "根据区间车与徒步时间取舍。", "喀纳斯卧龙湾", KANAS_POLICY),
  fish: sight("fish", POINTS.fish, "fish-platform.jpg", "约 2 小时", "区间车通常另购", "看天气、余票和体力", "高位俯瞰喀纳斯湖，需预留排队与登台时间。", "天气或排队不合适就取消，不挤压湖区。", "喀纳斯观鱼台", KANAS_POLICY),
  kanas: sight("kanas", POINTS.kanas, "kanas-lake.jpg", "1—1.5 小时", "旺季门票官方基准 160 元/人·2天；区间车另计", "通过景区官方渠道实名购票，国庆务必提前", "喀纳斯核心湖区，可乘游船或沿湖步行。", "国庆期间客流集中，预留停车和排队；天气和道路规则可能临时调整。", "喀纳斯湖秋天", KANAS_POLICY),
  baihaba: sight("baihaba", POINTS.baihaba, "baihaba.jpg", "约半天", "旺季基准 30 元/人；区间车另计", "确认边境通行证与景区交通", "边境村落、木屋与山谷景观，节奏适合慢游。", "边境通行要求必须节前复核。", "白哈巴村", KANAS_POLICY),
  wucaitan: sight("wucaitan", POINTS.wucaitan, "wucaitan.jpg", "1—2 小时", "价格待复核", "购买门票并核对停止售票", "额尔齐斯河畔雅丹地貌，晨间光线层次清晰。", "控制停留，为魔鬼城和长途驾驶留足时间。", "新疆五彩滩"),
  ghost: sight("ghost", POINTS.ghost, "ghost-city.jpg", "2—3 小时", "票价、区间车金额待复核", "核对末班车和停止售票时间", "大型风蚀雅丹群，尽量在日落前两小时抵达。", "游览后仍有夜间驾驶，17:30 左右评估是否提前离开。", "世界魔鬼城日落", GHOST_POLICY),
  sayram: sight("sayram", POINTS.sayram, "sayram-xhs.webp", "4—6 小时", "门票和自驾服务为动态票价，出发前复核", "官方渠道提前购买，确认入口、方向、时限和人数", "从东门进入、逆时针环湖，按天气选择停靠点。", "控制停留，避免太晚抵达伊宁。", "赛里木湖秋天", SAYRAM_POLICY),
  guozigou: sight("guozigou", POINTS.guozigou, "guozigou.jpg", "20—30 分钟", "免费", "无需预约", "果子沟峡谷与大桥景观，只在正规观景点短停。", "严禁在高速路肩或非正规位置停车。", "果子沟大桥"),
  teks: sight("teks", POINTS.teks, "teks.jpg", "2—3 小时", "城区免费，体验项目另计", "无需预约", "以八卦格局闻名的县城，可步行看街巷与本地餐饮。", "用餐与游览后再决定是否去喀拉峻。", "特克斯八卦城"),
  kalajun: sight("kalajun", POINTS.kalajun, "kalajun.jpg", "至少半天", "旧资料门票 80、观光车往返 90，均需节前复核", "出发前核对开放项目", "高山草原和峡谷景观，10 月已进入深秋。", "天气影响较大，过中午不勉强塞入完整景区。", "喀拉峻草原", KALAJUN_POLICY),
  nalati: sight("nalati", POINTS.nalati, "nalati.jpg", "至少 4 小时", "动态票价，出发前复核", "“智游那拉提”开放 7 日内自驾预约；司机驾龄满 3 年", "河谷草原与盘山景观，按预约线路行驶。", "设置最晚离园时间，避免天黑走山路。", "那拉提草原", NALATI_POLICY),
  kuerdening: sight("kuerdening", POINTS.kuerdening, "kuerdening.jpg", "2—3 小时", "素材参考 60 元，出发前复核", "素材参考提前 3 天，出发前复核", "雪岭云杉与河谷森林，是那拉提之外的备选。", "与那拉提二选一，路况和天气优先。", "库尔德宁"),
};

const hotel = (data: Omit<Hotel, "image"> & { image: string }): Hotel => ({ ...data, image: `/images/hotels/${data.image}` });

const urumqiFirst = hotel({ id: "urumqi-first", ...POINTS.urumqiHotel, image: "urumqi-orange.jpg", platform: "华住会", status: "已预订", room: "高级大床房 2 间", checkIn: "9/29 14:00 后", checkOut: "9/30 16:00 前", amount: "¥498.90", order: "入住码 FBABMD", contact: "张** 177****2580", cancel: "9/28 23:00 前免费取消", address: "头屯河区豫清路1329号产业培育基地B地块6号楼3单元（一层至七层）" });
const altayHotel = hotel({ id: "altay", ...POINTS.altayHotel, name: "阿勒泰壹号民宿（五百里风情街店）", image: "altay-one.jpg", platform: "美团", status: "已预订", room: "大床房 2 间", checkIn: "9/30 14:00 后", checkOut: "10/1 12:00 前（出发前复核）", amount: "¥798（¥399 × 2 间）", address: "阿勒泰市五百里风情街二期二号楼二层" });
const hemuHotel = hotel({ id: "hemu", ...POINTS.hemuHotel, name: "纳兰禾谷民宿（禾木风景区店）", image: "hemu-nalan.jpg", platform: "携程", status: "已预订", room: "Field·文艺田园复古 Loft 家庭独栋别墅 1 间", checkIn: "10/1 12:00 后", checkOut: "10/2 12:00 前", amount: "¥2,560.19", order: "订单 1128149389793495", cancel: "9/24 23:59 前免费取消", address: "新疆布尔津禾木喀纳斯乡禾木村 343 号" });
const baihabaHotel = hotel({ id: "baihaba", ...POINTS.baihabaHotel, name: "牧峰居民宿（白哈巴风景区店）", image: "baihaba-mufeng.jpg", platform: "美团", status: "已预订", room: "客房 2 间", checkIn: "10/2 14:00 后", checkOut: "10/3（时间待确认）", amount: "¥1,904（¥957 + ¥947）", address: "哈巴河县白哈巴村教育路 63 号" });
const buerjinHotel = hotel({ id: "buerjin", ...POINTS.buerjinHotel, name: "阿肯的小木屋（布尔津县中俄老码头风情街店）", image: "buerjin-akken.jpg", platform: "飞猪", status: "保底预订 · 待确认", room: "库米拉·独栋木屋家庭房 1 间（4 人入住，含早）", checkIn: "10/3 14:00 后", checkOut: "10/4 12:00 前", amount: "¥947", address: "布尔津河滨路融和民俗风情园木屋 1 号商铺" });
const kuitunHotel = hotel({ id: "kuitun", ...POINTS.kuitunHotel, name: "星程奎屯站团结南街酒店", image: "kuitun-starway.jpg", platform: "华住会", status: "保底预订 · 待确认", room: "舒压·高级大床房 2 间", checkIn: "10/4 14:00 后", checkOut: "10/5 16:00 前", amount: "¥451.98", order: "入住码 DKN229", contact: "张** 177****2580", cancel: "10/3 23:00 前免费取消", address: "市区迎宾园团结南街 31 幢 21 号、72 幢、73 幢" });
const yiningHotel = hotel({ id: "yining", ...POINTS.yiningHotel, name: "桔子伊宁万容广场酒店", image: "yining-orange.jpg", platform: "华住会", status: "保底预订 · 待确认", room: "高级大床房 2 间", checkIn: "10/5 14:00 后", checkOut: "10/6 16:00 前", amount: "¥608.38", order: "入住码 DCA22S", contact: "张** 177****2580", cancel: "10/4 23:00 前免费取消", address: "伊宁市山东路心悦龙庭 446 号 A 座 1 号楼" });
const teksHotel = hotel({ id: "teks", ...POINTS.teksHotel, name: "全季特克斯九宫新城酒店", image: "teks-ji.jpg", platform: "华住会", plan: "Plan A", status: "保底预订 · 待确认", room: "商务大床房 2 间", checkIn: "10/6 14:00 后", checkOut: "10/7 16:00 前", amount: "¥498.90", order: "入住码 DKW254", contact: "张** 186****2650", cancel: "10/5 23:00 前免费取消", address: "九宫新城经六路综合商业广场 A1 栋" });
const kalajunHotel = hotel({ id: "kalajun", ...POINTS.kalajunHotel, name: "新疆喀拉峻花间营·云驰谷", image: "kalajun-blossom.jpg", platform: "华住会", plan: "Plan B", status: "保底预订 · 待确认", room: "星沉经典大床房 2 间", checkIn: "10/6 14:00 后", checkOut: "10/7 16:00 前", amount: "¥1,528.46", order: "入住码 DG624X", contact: "张** 177****2580", cancel: "10/3 18:00 前免费取消", address: "特克斯县柯尔干布拉克村托斯旅游点 354 号" });
const xinyuanHotel = hotel({ id: "xinyuan", ...POINTS.xinyuanHotel, name: "汉庭新源县天鹅湖酒店", image: "xinyuan-hanting.jpg", platform: "华住会", status: "保底预订 · 待确认", room: "高级大床房 2 间", checkIn: "10/7 14:00 后", checkOut: "10/8 16:00 前", amount: "¥467.62", order: "入住码 DXA24W", contact: "张** 177****2580", cancel: "10/6 23:00 前免费取消", address: "新源县新源镇江额尔森西街 005 号 1 号楼" });
const urumqiLast = hotel({ id: "urumqi-last", ...POINTS.urumqiHotel, image: "urumqi-orange.jpg", platform: "华住会", status: "保底预订 · 待确认", room: "高级大床房 2 间", checkIn: "10/8 14:00 后", checkOut: "10/9 16:00 前", amount: "¥498.90", order: "入住码 FCE23Z", contact: "张** 177****2580", cancel: "10/7 23:00 前免费取消", address: "头屯河区豫清路1329号产业培育基地B地块6号楼3单元（一层至七层）" });

export const DAYS: TripDay[] = [
  {
    id: "2026-09-29", day: 1, date: "9/29 周二", shortDate: "9/29", month: "九", dayOfMonth: "29", week: "周二", title: "两队出发，乌鲁木齐集合", route: "天津 / 广州 → 乌鲁木齐", drive: "航班日", timeline: [
      { time: "16:40", title: "广州队起飞", detail: "UQ2592 广州 → 乌鲁木齐", point: POINTS.airport },
      { time: "20:05", title: "天津队起飞", detail: "GS7578 天津滨海 T2 → 乌鲁木齐", point: POINTS.airport },
      { time: "21:55", title: "广州队抵达", detail: "抵达乌鲁木齐天山国际机场", point: POINTS.airport },
      { time: "次日 00:25", title: "天津队抵达", detail: "机场前往酒店，与广州队会合", point: POINTS.urumqiHotel },
    ], sightIds: [], hotels: [urumqiFirst], todos: [
      { id: "d1-flight", title: "核对航班与值机", detail: "两队分别确认行李额、座位和航班动态 · 9/28" },
      { id: "d1-hotel", title: "通知酒店深夜抵达", detail: "天津队次日凌晨抵达，提前保留房间", important: true },
    ], cautions: ["两队到达时间相差约 2.5 小时，广州队可先办理入住。", "机票和酒店订单截图需离线保存。"], flights: [
      { team: "广州队", no: "UQ2592", depart: "16:40 广州", arrive: "21:55 乌鲁木齐", people: "闫寒、刘一帆" },
      { team: "天津队", no: "GS7578", depart: "20:05 天津滨海 T2", arrive: "次日 00:25 乌鲁木齐天山", people: "王晶（截图所示）" },
    ], routePoints: [POINTS.airport, POINTS.urumqiHotel],
  },
  {
    id: "2026-09-30", day: 2, date: "9/30 周三", shortDate: "9/30", month: "三", dayOfMonth: "30", week: "周三", title: "乌鲁木齐 → 乌伦古湖 → 阿勒泰", route: "S21 沙漠高速 · 乌伦古湖黄金海岸", drive: "约 5—6 小时", distance: "约 510km", timeline: [
      { time: "09:00", title: "酒店取车", detail: "坦克 300 送车上门，拍摄车况并核对保险", point: POINTS.urumqiHotel },
      { time: "下午", title: "乌伦古湖", detail: "黄金海岸停留 1—2 小时", point: POINTS.ulungur },
      { time: "傍晚", title: "阿勒泰入住", detail: "有余量再去桦林公园", point: POINTS.altayHotel },
    ], sightIds: ["ulungur", "birch"], hotels: [altayHotel], todos: [
      { id: "d2-car", title: "取车验车", detail: "车身、轮胎、油量、里程、内饰、保险与救援电话" },
      { id: "d2-fuel", title: "出城前加满油", detail: "确认沿途补给点" },
      { id: "d2-transfer", title: "确认禾木民宿接驳", detail: "核对换乘中心与民宿接送" },
    ], cautions: ["驾驶员轮换，留意沙漠高速横风。"], suggestion: "纯驾驶约 5 小时，实际至少按 6—7 小时含停留安排。", routePoints: [POINTS.urumqiHotel, POINTS.ulungur, POINTS.altayHotel],
  },
  {
    id: "2026-10-01", day: 3, date: "10/1 周四", shortDate: "10/1", month: "四", dayOfMonth: "1", week: "周四", title: "阿禾公路穿越，抵达禾木", route: "阿勒泰 → 阿禾公路 → 禾木村", drive: "约 5—7 小时", timeline: [
      { time: "08:00", title: "阿勒泰出发", detail: "沿阿禾公路前往禾木，沿途按安全位置停车", point: POINTS.altayHotel },
      { time: "途中", title: "阿禾公路", detail: "山谷、河流与森林景观，天气可能影响通行", point: POINTS.ahe },
      { time: "下午", title: "禾木换乘中心", detail: "停车、换乘区间车、携带过夜行李", point: POINTS.hemuTransfer },
      { time: "傍晚", title: "禾木村漫步", detail: "新村、老村、木屋、白桦林、援疆桥", point: POINTS.hemu },
    ], sightIds: ["ahe", "hemuNew", "hemuOld", "bridge", "hadeng"], hotels: [hemuHotel], todos: [
      { id: "book-hemu", title: "购买禾木景区票", detail: "实名购票并确认区间车包含范围 · 建议提前 1—3 天", important: true, booking: true },
      { id: "d3-road", title: "检查阿禾公路通行", detail: "出发前查看天气、临时管制和导航路况 · 当天 07:00", important: true },
      { id: "d3-bag", title: "换乘前整理过夜行李", detail: "大件行李可留车内，证件和保暖用品随身" },
    ], cautions: ["禾木旺季门票官方基准 50 元/人，区间车另计；出发前以官方购票入口和公示为准。", "国庆第一天客流集中，换乘与排队可能明显超时。"], suggestion: "详细路线安排内容较满；若抵达较晚，哈登观景台与村内散步二选一，次日不要压缩喀纳斯时间。", routePoints: [POINTS.altayHotel, POINTS.ahe, POINTS.hemuTransfer, POINTS.hemuHotel],
  },
  {
    id: "2026-10-02", day: 4, date: "10/2 周五", shortDate: "10/2", month: "五", dayOfMonth: "2", week: "周五", title: "喀纳斯核心景区，夜宿白哈巴", route: "禾木 → 喀纳斯 → 白哈巴", drive: "约 2—3 小时 + 景区换乘", timeline: [
      { time: "07:30", title: "禾木出发", detail: "自驾约 2 小时到喀纳斯游客中心", point: POINTS.hemuHotel },
      { time: "上午", title: "三湾游览", detail: "神仙湾 → 月亮湾 → 卧龙湾，按区间车停靠", point: POINTS.shenxian },
      { time: "下午", title: "观鱼台与喀纳斯湖", detail: "观鱼台视天气和体力决定，重点安排湖区", point: POINTS.kanas },
      { time: "傍晚", title: "前往白哈巴", detail: "按景区交通规则换乘，办理民宿入住", point: POINTS.baihabaHotel },
    ], sightIds: ["shenxian", "moon", "wolong", "fish", "kanas"], hotels: [baihabaHotel], todos: [
      { id: "book-kanas", title: "购买喀纳斯景区票", detail: "核对一进/二进、区间车与观鱼台票，建议提前 3—7 天", important: true, booking: true },
      { id: "d4-border", title: "确认白哈巴边境通行要求", detail: "携带身份证；电子边境通行证和办理方式以节前官方通知为准", important: true },
      { id: "d4-transfer", title: "确认白哈巴交通与末班车", detail: "向景区和民宿确认当日换乘点及最晚抵达时间" },
      { id: "d4-offline", title: "下载离线地图", detail: "喀纳斯—白哈巴沿线信号可能不稳定" },
    ], cautions: ["10 月 2 日景点数量多，三湾、观鱼台和湖区全部走完对排队时间较敏感。", "白哈巴官方旺季门票基准 30 元/人，区间车另计；边境通行要求必须节前复核。"], suggestion: "优先三湾和湖区；若观鱼台排队或天气不佳，果断取消，确保赶上白哈巴交通。", routePoints: [POINTS.hemuHotel, POINTS.kanasCenter, POINTS.shenxian, POINTS.moon, POINTS.wolong, POINTS.kanas, POINTS.baihabaHotel],
  },
  {
    id: "2026-10-03", day: 5, date: "10/3 周六", shortDate: "10/3", month: "六", dayOfMonth: "3", week: "周六", title: "白哈巴慢游，前往布尔津", route: "白哈巴 → 布尔津", drive: "约 2.5—4 小时", timeline: [
      { time: "上午", title: "白哈巴村慢游", detail: "木屋、村落与边境山谷", point: POINTS.baihaba },
      { time: "午后", title: "衔接区间车与取车", detail: "将换乘时间计入当天行程", point: POINTS.kanasCenter },
      { time: "傍晚", title: "布尔津入住", detail: "补给、加油并确认次日门票", point: POINTS.buerjinHotel },
    ], sightIds: ["baihaba"], hotels: [buerjinHotel], todos: [
      { id: "book-backup-hotels", title: "闫寒、刘一帆确认 10/3—10/8 保底住宿", detail: "逐家确认地点、金额、停车、取消时间及是否继续保留", important: true, booking: true },
      { id: "d5-supply", title: "补给与加油", detail: "为次日长途日准备饮水和零食" },
    ], cautions: ["离开白哈巴还要计算换乘和取车时间。"], routePoints: [POINTS.baihabaHotel, POINTS.baihaba, POINTS.buerjinHotel],
  },
  {
    id: "2026-10-04", day: 6, date: "10/4 周日", shortDate: "10/4", month: "日", dayOfMonth: "4", week: "周日", title: "五彩滩与魔鬼城日落", route: "布尔津 → 五彩滩 → 世界魔鬼城 → 奎屯", drive: "约 6—7 小时", distance: "约 500km", timeline: [
      { time: "08:30", title: "布尔津出发", detail: "早餐后出发，开始长途驾驶", point: POINTS.buerjinHotel },
      { time: "上午", title: "五彩滩", detail: "控制在 1—2 小时", point: POINTS.wucaitan },
      { time: "下午", title: "世界魔鬼城", detail: "尽量日落前 2 小时抵达", point: POINTS.ghost },
      { time: "晚上", title: "奎屯入住", detail: "魔鬼城后仍有夜间驾驶", point: POINTS.kuitunHotel },
    ], sightIds: ["wucaitan", "ghost"], hotels: [kuitunHotel], todos: [
      { id: "book-west-sights", title: "购买五彩滩 / 魔鬼城门票", detail: "核对停止售票和末班区间车时间", booking: true },
    ], cautions: ["高强度长途日，魔鬼城后仍有夜间驾驶。"], suggestion: "明确两位驾驶员分段，17:30 左右开始评估是否提前离开魔鬼城。", routePoints: [POINTS.buerjinHotel, POINTS.wucaitan, POINTS.ghost, POINTS.kuitunHotel],
  },
  {
    id: "2026-10-05", day: 7, date: "10/5 周一", shortDate: "10/5", month: "一", dayOfMonth: "5", week: "周一", title: "赛里木湖环湖，夜宿伊宁", route: "奎屯 → 赛里木湖 → 果子沟 → 伊宁", drive: "约 6 小时 + 环湖", timeline: [
      { time: "07:30", title: "奎屯出发", detail: "为环湖留足白天时间", point: POINTS.kuitunHotel },
      { time: "中午", title: "赛里木湖环湖", detail: "东门进入，逆时针环湖", point: POINTS.sayramEast },
      { time: "傍晚", title: "果子沟观景", detail: "仅在正规观景点停车", point: POINTS.guozigou },
      { time: "晚上", title: "伊宁入住", detail: "控制环湖停留，避免过晚", point: POINTS.yiningHotel },
    ], sightIds: ["sayram", "guozigou"], hotels: [yiningHotel], todos: [
      { id: "book-sayram", title: "购买赛里木湖自驾票", detail: "核对入口、方向、时限和乘车人数", booking: true },
    ], cautions: ["10/5 仍按详细行程执行；控制停留，避免太晚到伊宁。"], routePoints: [POINTS.kuitunHotel, POINTS.sayramEast, POINTS.sayram, POINTS.guozigou, POINTS.yiningHotel],
  },
  {
    id: "2026-10-06", day: 8, date: "10/6 周二", shortDate: "10/6", month: "二", dayOfMonth: "6", week: "周二", title: "伊宁 → 特克斯八卦城", route: "伊宁 → 特克斯；可选喀拉峻", drive: "约 2 小时 + 可选景区", timeline: [
      { time: "上午", title: "伊宁出发", detail: "约 2 小时到特克斯", point: POINTS.yiningHotel },
      { time: "中午", title: "特克斯八卦城", detail: "城市街巷、观景点与本地餐饮", point: POINTS.teks },
      { time: "下午可选", title: "喀拉峻草原", detail: "仅在天气和时间充足时前往", point: POINTS.kalajun },
    ], sightIds: ["teks", "kalajun"], hotels: [teksHotel, kalajunHotel], todos: [
      { id: "book-oct6-choice", title: "确定 10/6 最终住宿并取消另一间", detail: "Plan A 全季特克斯九宫新城酒店 / Plan B 喀拉峻花间营·云驰谷", important: true, booking: true },
      { id: "d8-kalajun", title: "决定是否去喀拉峻", detail: "根据天气、开放情况和前一日体力决定" },
    ], cautions: ["10 月草原可能已进入深秋，风景和开放项目受天气影响明显。"], suggestion: "初步路线把喀拉峻列为近距离备选。若到特克斯已过中午，不建议勉强加入完整景区。", routePoints: [POINTS.yiningHotel, POINTS.teks, POINTS.kalajun, POINTS.teksHotel, POINTS.kalajunHotel],
  },
  {
    id: "2026-10-07", day: 9, date: "10/7 周三", shortDate: "10/7", month: "三", dayOfMonth: "7", week: "周三", title: "那拉提或库尔德宁，夜宿新源", route: "特克斯 → 那拉提 / 库尔德宁 → 新源", drive: "约 5—6 小时，不含游览", timeline: [
      { time: "07:00", title: "特克斯出发", detail: "早出发，为游览预留时间", point: POINTS.teksHotel },
      { time: "中午", title: "那拉提 / 库尔德宁", detail: "二选一，按预约、天气与道路决定", point: POINTS.nalati },
      { time: "下午", title: "返回新源", detail: "设置最晚离园时间，避免天黑走山路", point: POINTS.xinyuanHotel },
    ], sightIds: ["nalati", "kuerdening"], hotels: [xinyuanHotel], todos: [
      { id: "book-nalati", title: "预约那拉提自驾票", detail: "9/30 起关注“智游那拉提”小程序，开放 7 日内预约", important: true, booking: true },
      { id: "d9-leave", title: "设置最晚离园时间", detail: "优先天黑前抵达新源" },
    ], cautions: ["那拉提和库尔德宁二选一；自驾票不能指望现场办理。"], suggestion: "优先天黑前抵达新源。", routePoints: [POINTS.teksHotel, POINTS.nalati, POINTS.kuerdening, POINTS.xinyuanHotel],
  },
  {
    id: "2026-10-08", day: 10, date: "10/8 周四", shortDate: "10/8", month: "四", dayOfMonth: "8", week: "周四", title: "新源返乌鲁木齐", route: "新源 → 乌鲁木齐", drive: "约 7—8 小时，长途返程", timeline: [
      { time: "08:00", title: "新源出发", detail: "开始长途返程", point: POINTS.xinyuanHotel },
      { time: "下午", title: "途中轮换与查车", detail: "定时休息、加油并检查轮胎", point: POINTS.urumqi },
      { time: "傍晚", title: "机场附近入住", detail: "先处理早班机和还车安排", point: POINTS.urumqiHotel },
    ], sightIds: [], hotels: [urumqiLast], todos: [
      { id: "d10-return", title: "整理还车资料", detail: "油费、车况录像、租车联系人和还车位置" },
      { id: "d10-checkin", title: "两队分别在线值机", detail: "核对证件、行李与航站楼" },
    ], cautions: ["不要因赶路压缩休息；抵达后先处理次日早班机和还车。"], routePoints: [POINTS.xinyuanHotel, POINTS.urumqiHotel],
  },
  {
    id: "2026-10-09", day: 11, date: "10/9 周五", shortDate: "10/9", month: "五", dayOfMonth: "9", week: "周五", title: "还车，两队返程", route: "乌鲁木齐 → 香港 / 上海", drive: "还车 + 航班", timeline: [
      { time: "07:15 前", title: "广州队选座截止提醒", detail: "CZ603 选座截止", point: POINTS.airport },
      { time: "10:15", title: "广州队飞香港", detail: "15:40 抵达香港 T1", point: POINTS.airport },
      { time: "14:00", title: "完成还车", detail: "机场北航站楼国内出发，店员上门取车", point: POINTS.airport },
      { time: "14:55", title: "天津队飞上海", detail: "19:40 抵达虹桥 T2", point: POINTS.airport },
    ], sightIds: [], hotels: [], todos: [
      { id: "d11-car", title: "按时还车", detail: "由天津队完成最终还车" },
      { id: "d11-ledger", title: "所有消费录完后平账", detail: "确认两家最简一笔转账" },
      { id: "d11-proof", title: "保存还车单、油费和结算截图", detail: "离线归档行程凭证" },
    ], cautions: ["广州队早于约定还车时间起飞，需由天津队完成最终还车。", "香港航班要核对证件与入境要求。"], flights: [
      { team: "广州队", no: "CZ603", depart: "10:15 乌鲁木齐天山", arrive: "15:40 香港 T1", people: "闫寒、刘一帆" },
      { team: "天津队", no: "FM9216", depart: "14:55 乌鲁木齐天山", arrive: "19:40 上海虹桥 T2", people: "张秋晨、王晶" },
    ], routePoints: [POINTS.urumqiHotel, POINTS.airport],
  },
];

export const FULL_ROUTE: Point[] = [
  POINTS.urumqiHotel, POINTS.ulungur, POINTS.altayHotel, POINTS.ahe, POINTS.hemuHotel,
  POINTS.kanas, POINTS.baihabaHotel, POINTS.buerjinHotel, POINTS.wucaitan, POINTS.ghost,
  POINTS.kuitunHotel, POINTS.sayram, POINTS.guozigou, POINTS.yiningHotel, POINTS.teksHotel,
  POINTS.nalati, POINTS.xinyuanHotel, POINTS.urumqiHotel,
];

export const FIXED_CHECKLIST: Todo[] = [
  { id: "fixed-docs", title: "证件", detail: "四人身份证、驾驶证、港澳/入境所需证件" },
  { id: "fixed-border", title: "边境手续", detail: "白哈巴边境通行要求，出发前按官方通知办理" },
  { id: "fixed-insurance", title: "车辆保险", detail: "确认坦克300保险范围、玻璃轮胎和道路救援" },
  { id: "fixed-car", title: "车辆检查", detail: "胎压、备胎、随车工具、油量和车身录像" },
  { id: "fixed-warm", title: "保暖装备", detail: "冲锋衣、薄羽绒、帽子、手套、防水鞋" },
  { id: "fixed-sun", title: "防晒补给", detail: "防晒霜、墨镜、润唇膏、保温杯和零食" },
  { id: "fixed-offline", title: "离线准备", detail: "高德离线地图、充电宝、车充、纸质关键电话" },
  { id: "fixed-medicine", title: "常用药", detail: "肠胃药、晕车药、创可贴和个人常用药" },
];

export const BOOKING_CHECKLIST = DAYS.flatMap((day) => day.todos.filter((todo) => todo.booking));

export function navigationTarget(point: Point): NavigationTarget | null {
  if (point.navigation === false) return null;
  return point.navigation ?? point;
}

export type AmapPlatform = "ios" | "android";

export function amapMarker(point: Point): string | null {
  const target = navigationTarget(point);
  if (!target) return null;
  const name = encodeURIComponent(target.name);
  return `https://uri.amap.com/marker?position=${target.lng},${target.lat}&name=${name}&src=beijiang-trip&coordinate=gaode&callnative=1`;
}

export function amapNavigation(points: Point[]): string {
  const from = points[0];
  const to = points[points.length - 1];
  return `https://uri.amap.com/navigation?from=${from.lng},${from.lat},${encodeURIComponent(from.name)}&to=${to.lng},${to.lat},${encodeURIComponent(to.name)}&mode=car&policy=1&src=beijiang-trip&coordinate=gaode&callnative=1`;
}

function parseCoordinate(value: string | null): { lng: string; lat: string; name: string } | null {
  if (!value) return null;
  const [lng, lat, ...nameParts] = value.split(",");
  if (!lng || !lat) return null;
  return { lng, lat, name: nameParts.join(",") };
}

export function mobileAmapPlatform(userAgent: string): AmapPlatform | null {
  if (/iPhone|iPad|iPod/i.test(userAgent)) return "ios";
  if (/Android|HarmonyOS|OpenHarmony/i.test(userAgent)) return "android";
  return null;
}

export function amapDeepLink(webUrl: string, platform: AmapPlatform): string | null {
  const url = new URL(webUrl);
  const source = "beijiang-trip";
  const position = parseCoordinate(url.searchParams.get("position"));
  if (position) {
    const name = url.searchParams.get("name") || position.name;
    const scheme = platform === "ios" ? "iosamap://navi" : "androidamap://navi";
    return `${scheme}?sourceApplication=${source}&poiname=${encodeURIComponent(name)}&lat=${position.lat}&lon=${position.lng}&dev=0&style=0`;
  }

  const from = parseCoordinate(url.searchParams.get("from"));
  const to = parseCoordinate(url.searchParams.get("to"));
  if (!from || !to) return null;
  const query = `sourceApplication=${source}&sid=&slat=${from.lat}&slon=${from.lng}&sname=${encodeURIComponent(from.name)}&did=&dlat=${to.lat}&dlon=${to.lng}&dname=${encodeURIComponent(to.name)}&dev=0&t=0`;
  return platform === "ios" ? `iosamap://path?${query}` : `amapuri://route/plan/?${query}`;
}

export function xiaohongshuSearch(term: string): string {
  return `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(term)}&source=web_search_result_notes`;
}
