import { useState, useMemo } from "react";
import {
  Gavel,
  Building,
  TrendingUp,
  Percent,
  Users,
  MapPin,
  Search,
  Calculator,
  ShieldCheck,
  DollarSign,
  ArrowUpRight,
  X,
  FileText,
  Clock,
  Landmark
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: CourtAuctionDashboard,
});

// 1. Types & Interfaces
export interface AuctionItem {
  id: string;
  caseNumber: string; // 사건번호
  court: string; // 관할법원 (예: 서울중앙지방법원)
  dept: string; // 경매계 (예: 경매3계)
  category: "아파트" | "다세대/빌라" | "상가/오피스텔" | "토지/공장";
  address: string; // 소재지
  buildingName: string; // 건물명
  areaM2: number; // 전용면적
  pyeong: number; // 평수
  appraisedPrice: number; // 감정가 (원)
  minimumPrice: number; // 최저매각가격 (원)
  failureCount: number; // 유찰 횟수
  auctionDate: string; // 매각기일 (YYYY-MM-DD)
  dDay: number; // 잔여일수
  riskLevel: "안전" | "주의" | "고위험";
  rightsSummary: string; // 권리분석 요약
  hasResistantTenant: boolean; // 대항력 있는 임차인 여부
  marketPriceEst: number; // 인근 급매 시세 추정가
  expectedBidCompetition: number; // 예상 입찰 경쟁률 (명)
  viewCount: number;
  featured?: boolean;
}

// 2. 예시 데이터 (스냅샷) — 실시간 API 연동 전. 실제 입찰 전 법원경매정보에서 사건번호를 직접 확인해야 함.
const INITIAL_AUCTION_ITEMS: AuctionItem[] = [
  {
    id: "auc-01",
    caseNumber: "2026타경 10482",
    court: "서울중앙지방법원",
    dept: "경매 3계",
    category: "아파트",
    address: "서울특별시 서초구 반포동 20-43",
    buildingName: "반포자이 112동 1803호",
    areaM2: 84.98,
    pyeong: 25.7,
    appraisedPrice: 3850000000,
    minimumPrice: 3080000000,
    failureCount: 1,
    auctionDate: "2026-12-04",
    dDay: 9,
    riskLevel: "안전",
    rightsSummary: "말소기준권리(국민은행 근저당) 이후 전세권 소멸, 임차인 대항력 없음(인도명령 대상)",
    hasResistantTenant: false,
    marketPriceEst: 3900000000,
    expectedBidCompetition: 12,
    viewCount: 1420,
    featured: true
  },
  {
    id: "auc-02",
    caseNumber: "2026타경 8912",
    court: "수원지방법원",
    dept: "경매 7계",
    category: "아파트",
    address: "경기도 수원시 영통구 이의동 1332",
    buildingName: "광교자연앤힐스테이트 5408동 702호",
    areaM2: 84.92,
    pyeong: 25.6,
    appraisedPrice: 1520000000,
    minimumPrice: 972800000,
    failureCount: 2,
    auctionDate: "2026-12-08",
    dDay: 13,
    riskLevel: "안전",
    rightsSummary: "1순위 근저당권자 임의경매 신청. 임차인 소액임차인 최우선변제권 충족, 명도 무난",
    hasResistantTenant: false,
    marketPriceEst: 1480000000,
    expectedBidCompetition: 19,
    viewCount: 2310,
    featured: true
  },
  {
    id: "auc-03",
    caseNumber: "2026타경 55104",
    court: "인천지방법원",
    dept: "경매 12계",
    category: "상가/오피스텔",
    address: "인천광역시 연수구 송도동 22-8",
    buildingName: "더샵센트럴파크 상가 1층 108호",
    areaM2: 59.4,
    pyeong: 18.0,
    appraisedPrice: 980000000,
    minimumPrice: 480200000,
    failureCount: 2,
    auctionDate: "2026-12-11",
    dDay: 16,
    riskLevel: "주의",
    rightsSummary: "임차인 대항력 미상, 체납관리비 850만원 확인 요망, 공실 상태이나 유치권 신고서 접수됨",
    hasResistantTenant: true,
    marketPriceEst: 850000000,
    expectedBidCompetition: 6,
    viewCount: 980
  },
  {
    id: "auc-04",
    caseNumber: "2026타경 3201",
    court: "서울동부지방법원",
    dept: "경매 5계",
    category: "아파트",
    address: "서울특별시 송파구 가락동 99",
    buildingName: "헬리오시티 308동 1501호",
    areaM2: 84.95,
    pyeong: 25.7,
    appraisedPrice: 2280000000,
    minimumPrice: 2280000000,
    failureCount: 0,
    auctionDate: "2026-12-15",
    dDay: 20,
    riskLevel: "안전",
    rightsSummary: "신건 경매. 채무자 겸 소유자 점유 중, 등기상 인수 권리 일체 없음. 취하 가능성 낮음",
    hasResistantTenant: false,
    marketPriceEst: 2350000000,
    expectedBidCompetition: 8,
    viewCount: 1890,
    featured: true
  },
  {
    id: "auc-05",
    caseNumber: "2026타경 7741",
    court: "대전지방법원",
    dept: "경매 2계",
    category: "아파트",
    address: "대전광역시 유성구 도룡동 381",
    buildingName: "스마트시티 2단지 203동 1102호",
    areaM2: 134.8,
    pyeong: 40.8,
    appraisedPrice: 1450000000,
    minimumPrice: 928000000,
    failureCount: 2,
    auctionDate: "2026-12-18",
    dDay: 23,
    riskLevel: "안전",
    rightsSummary: "2회 유찰로 감정가 대비 64%. 말소기준권리 이후 전부 소멸. 실수요/투자 매력도 최상",
    hasResistantTenant: false,
    marketPriceEst: 1400000000,
    expectedBidCompetition: 15,
    viewCount: 1650
  },
  {
    id: "auc-06",
    caseNumber: "2026타경 1198",
    court: "부산지방법원",
    dept: "경매 8계",
    category: "다세대/빌라",
    address: "부산광역시 해운대구 우동 1408",
    buildingName: "마린시티 빌라트 402호",
    areaM2: 74.2,
    pyeong: 22.4,
    appraisedPrice: 620000000,
    minimumPrice: 317440000,
    failureCount: 3,
    auctionDate: "2026-12-22",
    dDay: 27,
    riskLevel: "고위험",
    rightsSummary: "선순위 전세권자 배당요구 미신청 상태로 낙찰자 전액 인수(보증금 2.8억원 인수 주의)",
    hasResistantTenant: true,
    marketPriceEst: 580000000,
    expectedBidCompetition: 3,
    viewCount: 840
  }
];

// Historical rate trend data (6 months)
const AUCTION_TREND_DATA = [
  { month: "2026.06", seoul: 86.4, capital: 81.2, regional: 73.5 },
  { month: "2026.07", seoul: 87.8, capital: 82.5, regional: 74.1 },
  { month: "2026.08", seoul: 85.1, capital: 80.9, regional: 72.8 },
  { month: "2026.09", seoul: 84.3, capital: 81.7, regional: 73.9 },
  { month: "2026.10", seoul: 88.2, capital: 83.9, regional: 75.2 },
  { month: "2026.11", seoul: 89.6, capital: 84.8, regional: 76.4 }
];

// Price drop rate by failure count
const FAILURE_DROP_STATS = [
  { stage: "신건 (1회차)", rate: 100, avgBidRate: 94.2, count: 4820 },
  { stage: "1회 유찰 (2회차)", rate: 80, avgBidRate: 85.6, count: 6580 },
  { stage: "2회 유찰 (3회차)", rate: 64, avgBidRate: 74.8, count: 2410 },
  { stage: "3회 이상 유찰", rate: 51.2, avgBidRate: 61.3, count: 1010 }
];

export function CourtAuctionDashboard() {
  const [items] = useState<AuctionItem[]>(INITIAL_AUCTION_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [selectedCourt, setSelectedCourt] = useState<string>("전체");
  const [selectedRisk, setSelectedRisk] = useState<string>("전체");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedItemForCalc, setSelectedItemForCalc] = useState<AuctionItem | null>(null);

  // Calculator State
  const [bidPrice, setBidPrice] = useState<number>(0);
  const [ltvPercent, setLtvPercent] = useState<number>(70);
  const [interestRate, setInterestRate] = useState<number>(4.2);
  const [repairCost, setRepairCost] = useState<number>(10000000); // 1천만원 기본 수리비
  const [evictionCost, setEvictionCost] = useState<number>(5000000); // 500만원 명도비

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchCategory = selectedCategory === "전체" || item.category === selectedCategory;
      const matchCourt = selectedCourt === "전체" || item.court.includes(selectedCourt);
      const matchRisk = selectedRisk === "전체" || item.riskLevel === selectedRisk;
      const matchSearch =
        searchQuery.trim() === "" ||
        item.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.buildingName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.court.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchCourt && matchRisk && matchSearch;
    });
  }, [items, selectedCategory, selectedCourt, selectedRisk, searchQuery]);

  // Handle calculator open
  const openCalculator = (item: AuctionItem) => {
    setSelectedItemForCalc(item);
    setBidPrice(item.minimumPrice);
  };

  // Calculator Outputs
  const calcResult = useMemo(() => {
    if (!selectedItemForCalc) return null;
    const loanAmount = Math.round(bidPrice * (ltvPercent / 100));
    // 취득세 대략 (84m2 이하 1주택 기준 1.1%~3.5% 단순 계산: 1.5% 적용)
    const acquisitionTax = Math.round(bidPrice * 0.015);
    const totalExtraCost = acquisitionTax + repairCost + evictionCost;
    const realEquityNeeded = bidPrice - loanAmount + totalExtraCost;
    const expectedMargin = selectedItemForCalc.marketPriceEst - bidPrice - totalExtraCost;
    const expectedRoe = realEquityNeeded > 0 ? ((expectedMargin / realEquityNeeded) * 100).toFixed(1) : "0";
    const monthlyInterest = Math.round((loanAmount * (interestRate / 100)) / 12);

    return {
      loanAmount,
      acquisitionTax,
      totalExtraCost,
      realEquityNeeded,
      expectedMargin,
      expectedRoe,
      monthlyInterest
    };
  }, [selectedItemForCalc, bidPrice, ltvPercent, interestRate, repairCost, evictionCost]);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 p-4 md:p-8 font-sans selection:bg-blue-600 selection:text-white">
      {/* Header */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg shadow-blue-500/20 text-white">
              <Gavel className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">K-Auction Pulse</h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
                  예시 스냅샷 모드
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                예시 경매 물건 스냅샷 · 실전 입찰 전 법원경매정보에서 사건번호를 직접 확인하세요
              </p>
            </div>
          </div>
        </div>

        {/* Global Stats Badge & Timestamp */}
        <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 px-4 py-2.5 rounded-xl text-xs text-slate-300">
          <Clock className="w-4 h-4 text-blue-400" />
          <span>기준일시: 2026-11-25 12:00 KST</span>
          <span className="text-slate-600">|</span>
          <Landmark className="w-4 h-4 text-amber-400" />
          <span>예시 물건 6건 · 스냅샷 기준 2026-11-25</span>
        </div>
      </header>

      {/* Honest data notice */}
      <div className="max-w-7xl mx-auto mt-4 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 text-xs text-amber-200 leading-relaxed">
        예시 데이터 안내: 이 대시보드의 물건·지표·추이는 예시 스냅샷(2026-11-25 기준)이며 실시간 API 연동 전입니다. 실제 입찰 전에는 대법원 법원경매정보(courtauction.go.kr)에서 사건번호·매각기일·최저매각가격을 직접 확인하세요. 본 화면의 수치는 투자 권유가 아닙니다.
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto mt-6 space-y-6">
        {/* KPI Cards Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition">
            <div className="flex justify-between items-start">
              <span className="text-xs font-medium text-slate-400">전국 진행 경매 물건</span>
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                <Building className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">14,820</span>
              <span className="text-xs text-slate-400">건</span>
              <span className="text-xs font-semibold text-emerald-400 flex items-center ml-auto">
                <ArrowUpRight className="w-3 h-3" /> +8.4%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">전월 대비 매각 물건 공급량 증가세</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition">
            <div className="flex justify-between items-start">
              <span className="text-xs font-medium text-slate-400">아파트 평균 낙찰가율</span>
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">83.4%</span>
              <span className="text-xs font-semibold text-emerald-400 flex items-center ml-auto">
                <ArrowUpRight className="w-3 h-3" /> +1.5%p
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">수도권 주요 단지 낙찰가율 89.6% 돌파</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition">
            <div className="flex justify-between items-start">
              <span className="text-xs font-medium text-slate-400">평균 입찰 경쟁률</span>
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">8.2</span>
              <span className="text-xs text-slate-400">명/건</span>
              <span className="text-xs font-semibold text-amber-400 flex items-center ml-auto">
                경쟁 심화
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">1회 이상 유찰된 84㎡ 아파트에 집중</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition">
            <div className="flex justify-between items-start">
              <span className="text-xs font-medium text-slate-400">2회+ 유찰 고수익 타깃</span>
              <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">3,412</span>
              <span className="text-xs text-slate-400">건</span>
              <span className="text-xs font-semibold text-purple-400 flex items-center ml-auto">
                최저가 64%↓
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">안전마진 15% 이상 분석 완료 물건</p>
          </div>
        </section>

        {/* Charts Row */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trend Line Chart */}
          <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-400" /> 권역별 아파트 낙찰가율 동향 (최근 6개월)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">서울권 매각가율 회복세와 지방 낙찰가율 양극화</p>
              </div>
              <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md">단위: %</span>
            </div>
            <div className="h-[230px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={AUCTION_TREND_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" domain={[60, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      fontSize: "12px",
                      borderRadius: "8px"
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Line type="monotone" dataKey="seoul" name="서울" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="capital" name="수도권" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="regional" name="지방" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart: Failure Drop Rates */}
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Percent className="w-4 h-4 text-emerald-400" /> 차수별 최저매각가 & 낙찰가율
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">유찰 횟수에 따른 최저가 저감률</p>
              </div>
            </div>
            <div className="h-[230px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={FAILURE_DROP_STATS}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="stage" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      fontSize: "12px",
                      borderRadius: "8px"
                    }}
                  />
                  <Bar dataKey="rate" name="최저입찰가율(%)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="avgBidRate" name="평균낙찰가율(%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Filter & Search Bar */}
        <section className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="사건번호, 아파트명, 관할법원, 도로명 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
              {["전체", "아파트", "다세대/빌라", "상가/오피스텔", "토지/공장"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Sub Filters: Court & Risk Level */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/60 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium flex items-center gap-1">
                <Landmark className="w-3.5 h-3.5" /> 관할법원:
              </span>
              <div className="flex flex-wrap gap-1">
                {["전체", "서울중앙", "수원", "인천", "대전", "부산"].map((court) => (
                  <button
                    key={court}
                    onClick={() => setSelectedCourt(court)}
                    className={`px-2 py-1 rounded text-[11px] transition ${
                      selectedCourt === court
                        ? "bg-slate-700 text-white font-semibold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {court}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 권리안전도:
              </span>
              <div className="flex gap-1">
                {["전체", "안전", "주의", "고위험"].map((risk) => (
                  <button
                    key={risk}
                    onClick={() => setSelectedRisk(risk)}
                    className={`px-2 py-1 rounded text-[11px] transition ${
                      selectedRisk === risk
                        ? "bg-slate-700 text-white font-semibold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {risk}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Auction Items Grid */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" /> 예시 경매 물건 목록 (스냅샷 {filteredItems.length}건)
            </h2>
            <span className="text-xs text-slate-400">사건별 권리분석 및 실전 투자 계산기 지원</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar of Card */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">
                        {item.category}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[11px] font-medium rounded border ${
                          item.riskLevel === "안전"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : item.riskLevel === "주의"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}
                      >
                        {item.riskLevel}
                      </span>
                    </div>

                    <span className="text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
                      D-{item.dDay}
                    </span>
                  </div>

                  {/* Case & Court Info */}
                  <div className="flex items-baseline justify-between text-xs text-slate-400 mb-1">
                    <span className="font-semibold text-slate-300">{item.caseNumber}</span>
                    <span>{item.court} {item.dept}</span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition leading-snug">
                    {item.buildingName}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0" /> {item.address}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    전용 {item.areaM2}㎡ ({item.pyeong}평)
                  </p>

                  {/* Price Box */}
                  <div className="mt-4 p-3 bg-slate-950/80 rounded-xl border border-slate-800/60 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">감정평가액</span>
                      <span className="text-slate-300">{(item.appraisedPrice / 100000000).toFixed(2)}억원</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-300">
                        최저매각가 ({item.failureCount > 0 ? `${item.failureCount}회 유찰` : "신건"})
                      </span>
                      <span className="text-sm font-bold text-emerald-400">
                        {(item.minimumPrice / 100000000).toFixed(2)}억원
                        <span className="text-[11px] font-normal text-slate-400 ml-1">
                          ({Math.round((item.minimumPrice / item.appraisedPrice) * 100)}%)
                        </span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-800/80">
                      <span className="text-slate-400">인근 급매 시세</span>
                      <span className="text-blue-400 font-medium">
                        {(item.marketPriceEst / 100000000).toFixed(2)}억원
                      </span>
                    </div>
                  </div>

                  {/* Rights & AI Assessment */}
                  <div className="mt-3 text-[11px] text-slate-400 bg-slate-900 p-2.5 rounded-lg border border-slate-800/40">
                    <div className="font-medium text-slate-300 flex items-center gap-1 mb-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> 권리분석 요약 (예시)
                    </div>
                    <p className="line-clamp-2 leading-relaxed">{item.rightsSummary}</p>
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex gap-2">
                  <button
                    onClick={() => openCalculator(item)}
                    className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10 transition"
                  >
                    <Calculator className="w-3.5 h-3.5" /> 실전 수익률 & 입찰 계산기
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="max-w-7xl mx-auto mt-8 pt-4 border-t border-slate-800 text-[11px] text-slate-500 leading-relaxed">
        출처: 예시 스냅샷 (2026-11-25 기준) · 실제 경매 정보는 대법원 법원경매정보(courtauction.go.kr) 참조 · 본 앱의 수치는 투자 권유가 아닙니다.
      </footer>

      {/* Calculator Modal */}
      {selectedItemForCalc && calcResult && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">
                    {selectedItemForCalc.caseNumber}
                  </span>
                  <h3 className="text-lg font-bold text-white">{selectedItemForCalc.buildingName}</h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">{selectedItemForCalc.address}</p>
              </div>
              <button
                onClick={() => setSelectedItemForCalc(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-5 space-y-6 text-xs">
              {/* Target Price Row */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-200">목표 입찰 희망가 설정</span>
                  <span className="text-base font-bold text-emerald-400">
                    {(bidPrice / 100000000).toFixed(3)}억원 ({(bidPrice).toLocaleString()}원)
                  </span>
                </div>
                <input
                  type="range"
                  min={selectedItemForCalc.minimumPrice}
                  max={selectedItemForCalc.marketPriceEst * 1.1}
                  step={10000000}
                  value={bidPrice}
                  onChange={(e) => setBidPrice(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>최저가: {(selectedItemForCalc.minimumPrice / 100000000).toFixed(2)}억</span>
                  <span>감정가: {(selectedItemForCalc.appraisedPrice / 100000000).toFixed(2)}억</span>
                  <span>시세: {(selectedItemForCalc.marketPriceEst / 100000000).toFixed(2)}억</span>
                </div>
              </div>

              {/* Financing Parameters */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <label className="text-slate-400 block mb-1">대출 LTV (%)</label>
                  <input
                    type="number"
                    value={ltvPercent}
                    onChange={(e) => setLtvPercent(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-bold"
                  />
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <label className="text-slate-400 block mb-1">대출 금리 (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-bold"
                  />
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <label className="text-slate-400 block mb-1">예상 명도비 (원)</label>
                  <input
                    type="number"
                    step="1000000"
                    value={evictionCost}
                    onChange={(e) => setEvictionCost(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-bold"
                  />
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <label className="text-slate-400 block mb-1">수리/인테리어 (원)</label>
                  <input
                    type="number"
                    step="1000000"
                    value={repairCost}
                    onChange={(e) => setRepairCost(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-bold"
                  />
                </div>
              </div>

              {/* Calculation Summary Table */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
                <h4 className="font-bold text-white text-xs flex items-center gap-1.5 pb-2 border-b border-slate-800">
                  <DollarSign className="w-4 h-4 text-emerald-400" /> 실투자금 및 예상 수익률 정밀 분석
                </h4>

                <div className="flex justify-between py-1">
                  <span className="text-slate-400">경락잔금대출 (LTV {ltvPercent}%)</span>
                  <span className="text-slate-200 font-semibold">{(calcResult.loanAmount).toLocaleString()}원</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">취득세 및 부대비용 (약 1.5%)</span>
                  <span className="text-slate-200 font-semibold">{(calcResult.acquisitionTax).toLocaleString()}원</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">명도비 + 수리비용</span>
                  <span className="text-slate-200 font-semibold">{(repairCost + evictionCost).toLocaleString()}원</span>
                </div>
                <div className="flex justify-between py-1.5 border-t border-slate-800 font-bold">
                  <span className="text-slate-300">필요 자기자본 (실투자금)</span>
                  <span className="text-blue-400 text-sm">{(calcResult.realEquityNeeded).toLocaleString()}원</span>
                </div>

                <div className="flex justify-between py-2 border-t border-slate-800 bg-slate-900/50 px-3 rounded-lg">
                  <div>
                    <span className="text-slate-400 block text-[11px]">시세 대비 안전마진 (기대차익)</span>
                    <span className="text-emerald-400 font-bold text-sm">
                      {(calcResult.expectedMargin).toLocaleString()}원
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[11px]">예상 자기자본수익률 (ROE)</span>
                    <span className="text-emerald-400 font-bold text-sm">
                      +{calcResult.expectedRoe}%
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 pt-1">
                  * 월 예상 대출이자: 약 {(calcResult.monthlyInterest).toLocaleString()}원 (원리금 균등상환 별도)
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setSelectedItemForCalc(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition"
              >
                닫기
              </button>
              <button
                onClick={() => {
                  alert("입찰 분석 보고서가 저장되었습니다.");
                  setSelectedItemForCalc(null);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-md shadow-blue-500/20 transition"
              >
                입찰 전략 리포트 저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourtAuctionDashboard;
