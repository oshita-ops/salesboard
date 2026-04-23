import { useState, useEffect, useCallback, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "firebase/auth";
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp, setDoc, getDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD_qPMCgHHYJOzjV-LCzPvyKT4R5Qu7jgY",
  authDomain: "salesbord-afdd5.firebaseapp.com",
  projectId: "salesbord-afdd5",
  storageBucket: "salesbord-afdd5.firebasestorage.app",
  messagingSenderId: "541122683226",
  appId: "1:541122683226:web:3e5bfb691c2dcd8c78d363",
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);
const ADMIN_EMAIL = "oshita@jcon.co.jp";

const SAMPLE_JOBS = [
  {
    id:"s1", title:"SaaS新規開拓営業", company:"株式会社テックブリッジ", type:"業務委託",
    rate:"月60〜80万円", location:"東京（一部リモート）", tags:["新規開拓","SaaS","IT"],
    remote:true, urgent:false, highPay:true, lowExp:false,
    description:"急成長中のSaaSプロダクト（顧客管理・MA系ツール）の新規開拓営業をお任せします。\n\n主な業務：\n・ターゲットリストの選定とアウトバウンドアプローチ\n・オンライン商談によるデモ実施・ヒアリング\n・提案書作成〜クロージングまでの一気通貫対応\n・CRMへの商談記録・進捗管理\n\n直販×インサイドセールスのハイブリッドスタイルです。月次目標KPI達成に応じてインセンティブが付与されます。",
    requirements:"【必須】法人向け新規営業経験3年以上\n【歓迎】SaaS・IT系プロダクトの販売経験\n【歓迎】SalesforceやHubSpotなどCRM操作経験\n\n自己管理能力が高く、裁量を持って動ける方を歓迎します。",
    period:"長期（6ヶ月〜）", posted:"2026-04-11", published:true,
    companyInfo:"2018年設立・東京都渋谷区。SaaS型の顧客管理・MAツール「BridgeCRM」を開発・販売。従業員数80名。年間成長率200%超の急成長スタートアップ。シリーズB資金調達済み。"
  },
  {
    id:"s2", title:"人材紹介パートナー営業", company:"キャリアリンク株式会社", type:"業務委託",
    rate:"月40〜55万円", location:"フルリモート", tags:["人材","パートナー","ルート営業"],
    remote:true, urgent:true, highPay:false, lowExp:true,
    description:"人材紹介サービスのパートナー企業開拓・既存代理店フォローをお任せします。\n\n主な業務：\n・新規パートナー企業への提案・説明会の実施\n・既存パートナーへの活用支援・定期訪問（オンライン可）\n・パートナー経由の求人獲得数の最大化\n・月次レポートの作成と報告\n\nリモートで完結できる環境が整っており、自分の裁量で動けます。経験の浅い方もOKです。",
    requirements:"【必須】営業経験1年以上（業界不問）\n【歓迎】人材業界・採用支援での経験\n【歓迎】オンライン商談ツール（Zoom・Meet）の使用経験\n\nコミュニケーションを大切にでき、丁寧な対応が得意な方歓迎。",
    period:"中期（3〜6ヶ月）", posted:"2026-04-12", published:true
  },
  {
    id:"s3", title:"DX推進コンサルティング営業", company:"デジタルシフト株式会社", type:"業務委託",
    rate:"月70〜100万円", location:"東京（週2出社）", tags:["DX","コンサル","IT"],
    remote:true, urgent:true, highPay:true, lowExp:false,
    description:"大手・中堅企業のDX推進を支援するコンサルティングサービスの提案営業を担当いただきます。\n\n主な業務：\n・既存顧客へのDXソリューション提案（業務自動化・データ活用など）\n・新規顧客開拓（経営企画・IT担当役員へのアプローチ）\n・提案書・RFP対応・見積もり作成\n・プロジェクト受注後の引き継ぎ・関係継続\n\n高度な提案力と経営レベルでのコミュニケーション能力が求められる、やりがいの高いポジションです。",
    requirements:"【必須】コンサルティング営業経験5年以上\n【必須】IT業界または製造業・金融でのソリューション提案経験\n【歓迎】RFP対応・IT調達プロセスの理解\n【歓迎】PMP・ITストラテジスト等の資格\n\n論理的思考力・プレゼン力・自己管理能力が高い方を求めています。",
    period:"長期（1年〜）", posted:"2026-04-13", published:true
  },
  {
    id:"s4", title:"医療機器代理店営業", company:"メディカルプロ株式会社", type:"業務委託",
    rate:"月55〜70万円", location:"全国（出張あり）", tags:["医療","代理店","BtoB"],
    remote:false, urgent:true, highPay:true, lowExp:false,
    description:"医療機器（診断・治療機器）の代理店チャネル開拓および関係管理をお任せします。\n\n主な業務：\n・医療機器専門商社・代理店へのアプローチ\n・新規代理店の開拓と契約交渉\n・既存代理店の売上管理・フォロー訪問\n・学会・展示会での情報収集・名刺交換活動\n\n医療業界特有の規制・商習慣への理解が必要なポジションです。専門性が高いぶん、報酬も高水準です。",
    requirements:"【必須】医療業界での営業経験3年以上\n【必須】医療機器・医薬品・検査機器等の知識\n【歓迎】代理店管理・チャネルセールス経験\n【歓迎】MR・薬剤師免許（あれば優遇）\n\n出張が発生します（月数回、関東〜全国）。医療従事者とのコミュニケーションが得意な方。",
    period:"長期（6ヶ月〜）", posted:"2026-04-08", published:true
  },
  {
    id:"s5", title:"スタートアップ資金調達支援", company:"ベンチャーキャピタルパートナーズ", type:"業務委託",
    rate:"月80〜120万円", location:"東京（一部リモート）", tags:["スタートアップ","資金調達","金融"],
    remote:true, urgent:false, highPay:true, lowExp:false,
    description:"シード〜シリーズBのスタートアップ向けに、資金調達支援・投資家マッチングを担うポジションです。\n\n主な業務：\n・スタートアップCEO・CFOへのヒアリングと課題整理\n・投資家（VC・CVC・エンジェル）とのリレーション構築\n・ピッチ資料のレビュー・改善支援\n・投資家紹介・アレンジメント\n・条件交渉のサポート\n\n業界全体への深い知見とネットワークが求められる高度なポジションです。",
    requirements:"【必須】金融・VC・投資銀行・FAS等での経験5年以上\n【必須】スタートアップエコシステムへの理解\n【必須】VC・機関投資家との広いネットワーク\n【歓迎】公認会計士・中小企業診断士・MBA\n\n守秘義務の意識が高く、オーナーシップを持って動ける方。",
    period:"中期（3〜6ヶ月）", posted:"2026-04-07", published:true
  },
  {
    id:"s6", title:"ECサイト向けWeb広告営業", company:"アドクリエイト株式会社", type:"業務委託",
    rate:"月35〜50万円", location:"フルリモート", tags:["広告","EC","デジタル"],
    remote:true, urgent:false, highPay:false, lowExp:true,
    description:"ECサイト運営企業へ、Meta広告・Google広告・LINE広告などのデジタル広告ソリューションを提案します。\n\n主な業務：\n・新規EC事業者へのテレアポ・問い合わせ対応\n・オンラインでのヒアリング・提案プレゼン\n・広告効果レポートの説明・改善提案\n・月次の継続受注管理\n\n未経験でも入社後に広告の基礎を学べる環境があります。デジタルマーケティングに興味のある方歓迎。",
    requirements:"【必須】営業経験1年以上\n【歓迎】デジタル広告（Meta/Google等）の基礎知識\n【歓迎】EC業界・物販の知識\n\nコツコツ取り組める方、数字管理が得意な方に向いています。",
    period:"中期（3ヶ月〜）", posted:"2026-04-09", published:true
  },
  {
    id:"s7", title:"保険代理店向けルート営業", company:"インシュアテック株式会社", type:"業務委託",
    rate:"月30〜45万円", location:"大阪・名古屋", tags:["保険","ルート営業","代理店"],
    remote:false, urgent:false, highPay:false, lowExp:true,
    description:"保険代理店（独立系・銀行系・不動産系）へ、新商品の案内とフォローアップ営業を担当します。\n\n主な業務：\n・既存代理店への定期訪問・新商品説明\n・販促ツール・資料の提供と活用支援\n・代理店担当者のモチベーション向上施策\n・月次の販売実績管理・報告\n\n対面でのコミュニケーションが中心のルート営業です。大阪・名古屋エリアが主な活動範囲です。",
    requirements:"【必須】営業経験1年以上（ルート営業経験があれば尚可）\n【歓迎】保険・金融業界での経験\n【歓迎】FP資格（1〜3級）\n\n誠実に丁寧な対応ができる方、長期的な関係構築が好きな方に向いています。",
    period:"長期（6ヶ月〜）", posted:"2026-04-06", published:true
  },
  {
    id:"s8", title:"クラウドERP導入営業", company:"クラウドワークス株式会社", type:"業務委託",
    rate:"月65〜85万円", location:"東京（週1出社）", tags:["ERP","クラウド","IT"],
    remote:true, urgent:true, highPay:true, lowExp:false,
    description:"中堅〜大手企業へのクラウドERP（会計・在庫・人事管理等）の導入提案営業を担当します。\n\n主な業務：\n・新規企業への課題ヒアリングと要件定義支援\n・ERP導入提案書・ROI試算書の作成\n・競合比較・評価選定プロセスへの対応\n・受注後の導入プロジェクト引き継ぎ・関係継続\n\nSI・ITベンダー出身者歓迎。提案型の営業が得意な方に最適なポジションです。",
    requirements:"【必須】IT・システム営業経験3年以上\n【必須】ERP・基幹システム関連知識（SAP・Oracle・弥生等）\n【歓迎】ITコーディネーター・システムアーキテクト等の資格\n【歓迎】製造業・流通業などの業務プロセス理解\n\n顧客の業務課題を深く理解し、長期にわたって関係を構築できる方。",
    period:"長期（1年〜）", posted:"2026-04-13", published:true
  },
  {
    id:"s9", title:"不動産投資セミナー集客営業", company:"グローバルアセット株式会社", type:"成果報酬",
    rate:"1件あたり3〜5万円", location:"東京・大阪", tags:["不動産","セミナー","成果報酬"],
    remote:false, urgent:false, highPay:true, lowExp:true,
    description:"富裕層・資産形成層向けの不動産投資セミナーへの集客営業をお任せします。\n\n主な業務：\n・個人ネットワーク・SNSを活用した集客\n・セミナー参加者の事前ヒアリング・アテンド\n・クロージングは専門スタッフが担当するため、集客に集中できます\n・月次の集客件数報告\n\n完全成果報酬型のため、動いた分だけ収入が得られます。副業としても取り組みやすい案件です。",
    requirements:"【必須】人脈・集客力のある方\n【歓迎】不動産投資・資産運用に関する基礎知識\n【歓迎】SNSを活用した集客経験（Instagram・Facebook・Voicy等）\n\n営業未経験でも可。ネットワークをお持ちの方を歓迎します。",
    period:"長期（継続案件）", posted:"2026-04-10", published:true
  },
  {
    id:"s10", title:"飲食店向けデリバリーサービス加盟営業", company:"フードコネクト株式会社", type:"成果報酬",
    rate:"1店舗あたり2万円", location:"全国（エリア選択可）", tags:["飲食","デリバリー","成果報酬"],
    remote:false, urgent:true, highPay:false, lowExp:true,
    description:"Uber Eats・出前館等のデリバリープラットフォームへの飲食店加盟促進営業を担当します。\n\n主な業務：\n・担当エリアの飲食店（個人店・小規模チェーン）への訪問営業\n・デリバリー導入のメリット説明・疑問対応\n・加盟申し込みのサポート・導入フォロー\n・月次の新規加盟件数管理\n\n自分のスケジュールで動ける完全成果報酬型です。エリアは全国から選択可能です。",
    requirements:"【必須】行動力・コミュニケーション能力がある方\n【歓迎】飲食業界・F&B系の知識または経験\n【歓迎】個人事業主・フリーランスとして独立志向がある方\n\n営業未経験OK。車・バイクがあるとより活動しやすいです。",
    period:"自由（好きな時に稼働）", posted:"2026-04-12", published:true
  },
];

const INDUSTRIES = ["IT","SaaS","人材","不動産","広告","医療","金融","保険","飲食","DX","コンサル","EC"];

// 業界ごとのビジュアル設定
const INDUSTRY_VISUAL = {
  "IT":     { icon:"💻", bg:"#EFF6FF", accent:"#2563eb", label:"IT" },
  "SaaS":   { icon:"☁️", bg:"#F0F9FF", accent:"#0284c7", label:"SaaS" },
  "人材":   { icon:"👥", bg:"#F0FDF4", accent:"#16a34a", label:"人材" },
  "不動産": { icon:"🏢", bg:"#FFF7ED", accent:"#ea580c", label:"不動産" },
  "広告":   { icon:"📢", bg:"#FDF4FF", accent:"#9333ea", label:"広告" },
  "医療":   { icon:"🏥", bg:"#FFF1F2", accent:"#e11d48", label:"医療" },
  "金融":   { icon:"💴", bg:"#FEFCE8", accent:"#ca8a04", label:"金融" },
  "保険":   { icon:"🛡️", bg:"#F0FDF4", accent:"#15803d", label:"保険" },
  "飲食":   { icon:"🍽️", bg:"#FFF7ED", accent:"#c2410c", label:"飲食" },
  "DX":     { icon:"🔄", bg:"#EFF6FF", accent:"#1d4ed8", label:"DX" },
  "コンサル":{ icon:"📊", bg:"#F5F3FF", accent:"#7c3aed", label:"コンサル" },
  "EC":     { icon:"🛒", bg:"#FFF7ED", accent:"#b45309", label:"EC" },
  "ERP":    { icon:"⚙️", bg:"#F1F5F9", accent:"#475569", label:"ERP" },
  "スタートアップ": { icon:"🚀", bg:"#FFF1F2", accent:"#be123c", label:"スタートアップ" },
  "default":{ icon:"💼", bg:"#F5F5F0", accent:"#24A64A", label:"営業" },
};

function getJobVisual(job) {
  for (const tag of (job.tags || [])) {
    if (INDUSTRY_VISUAL[tag]) return INDUSTRY_VISUAL[tag];
  }
  return INDUSTRY_VISUAL["default"];
}

// 業界別SVGバナーを生成（SOKUDAN風ヘッダー画像の代わり）
// showText=true のときだけタイトル・会社名をSVG内に描画（フルページ詳細用）
function JobBannerSVG({ job, height = 200, showText = false }) {
  const vis = getJobVisual(job);
  const c1 = vis.accent;
  const shapes = [
    { cx: "80%", cy: "30%", r: 120, op: 0.08 },
    { cx: "90%", cy: "80%", r: 80,  op: 0.06 },
    { cx: "10%", cy: "60%", r: 60,  op: 0.05 },
    { cx: "50%", cy: "10%", r: 100, op: 0.04 },
  ];
  return (
    <svg width="100%" height={height} viewBox={`0 0 800 ${height}`} preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`bg-${job.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c1} stopOpacity="1"/>
          <stop offset="100%" stopColor={c1} stopOpacity="0.75"/>
        </linearGradient>
      </defs>
      {/* 背景 */}
      <rect width="800" height={height} fill={`url(#bg-${job.id})`}/>
      {/* 幾何学的装飾円 */}
      {shapes.map((s,i)=>(
        <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="white" fillOpacity={s.op}/>
      ))}
      {/* グリッドライン */}
      {[0,1,2,3,4].map(i=>(
        <line key={i} x1={i*200} y1="0" x2={i*200} y2={height} stroke="white" strokeOpacity="0.04" strokeWidth="1"/>
      ))}
      {/* 大きいアイコン装飾（右寄り、半透明） */}
      <text x="88%" y="55%" fontSize={height*0.75} textAnchor="middle" dominantBaseline="middle" opacity="0.15">{vis.icon}</text>
      {/* 業界ラベル（左上） */}
      <rect x="20" y="16" rx="16" ry="16" width={vis.label.length*13+28} height="28" fill="white" fillOpacity="0.25"/>
      <text x="34" y="34" fontSize="12" fontWeight="700" fill="white" opacity="0.95" fontFamily="'Noto Sans JP',sans-serif">{vis.label}専門</text>
      {/* showText=true のときのみタイトル・会社名を描画（フルページ詳細専用） */}
      {showText && (
        <>
          <text x="32" y={height*0.55} fontSize="26" fontWeight="800" fill="white" fontFamily="'Noto Sans JP',sans-serif" opacity="0.95">
            {job.title.length > 26 ? job.title.substring(0,26)+'…' : job.title}
          </text>
          <text x="32" y={height*0.55+36} fontSize="14" fill="white" opacity="0.85" fontFamily="'Noto Sans JP',sans-serif">{job.company}</text>
        </>
      )}
    </svg>
  );
}

// 単価文字列から最低金額を数値で抽出（並び順用）
function extractMinRate(rateStr) {
  if (!rateStr) return 0;
  const m = rateStr.match(/(\d[\d,]*)/);
  if (!m) return 0;
  return parseInt(m[1].replace(/,/g,''), 10);
}

function daysAgo(dateStr) {
  const d = new Date(dateStr);
  const now = new Date("2026-04-23");
  const diff = Math.floor((now - d) / 86400000);
  if (diff === 0) return "本日";
  if (diff === 1) return "1日前";
  return `${diff}日前`;
}


export default function App() {
  // Auth
  const [page, setPage] = useState("landing");
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);

  // Forms
  const [regForm, setRegForm] = useState({ name:"", email:"", password:"", experience:"", specialties:[] });
  const [loginForm, setLoginForm] = useState({ email:"", password:"" });
  const [authError, setAuthError] = useState("");

  // Jobs
  const [jobs, setJobs] = useState(SAMPLE_JOBS);

  // Dashboard
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    remote:false, urgent:false, highPay:false, lowExp:false,
    shortTime:false,  // 週2日〜
    reward:false,     // 成果報酬型
    industries:[],
    minRate: 0,       // 単価下限（万円）
  });
  const [sortBy, setSortBy] = useState("newest"); // newest | rateDesc | rateAsc
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobDetailPage, setJobDetailPage] = useState(false); // true=フル画面詳細
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyMsg, setApplyMsg] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [dashTab, setDashTab] = useState("jobs");

  // Profile
  const [profileForm, setProfileForm] = useState({ name:"", experience:"", specialties:[], pr:"", desiredRate:"", desiredStyle:"" });
  const [resumeUrl, setResumeUrl] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [resumeUploading, setResumeUploading] = useState(false);
  const [careers, setCareers] = useState([]);
  const [careerForm, setCareerForm] = useState({ company:"", startYear:"", startMonth:"", endYear:"", endMonth:"", isCurrent:false, role:"", description:"" });
  const [editingCareerId, setEditingCareerId] = useState(null);
  const resumeInputRef = useRef(null);

  const YEARS = Array.from({length:30}, (_,i) => String(new Date().getFullYear() - i));
  const MONTHS = ["1","2","3","4","5","6","7","8","9","10","11","12"];

  const formatPeriod = (form) => {
    const start = `${form.startYear}年${form.startMonth}月`;
    const end = form.isCurrent ? "現在" : `${form.endYear}年${form.endMonth}月`;
    return `${start}〜${end}`;
  };

  // Applications
  const [myApplications, setMyApplications] = useState([]);

  // Admin
  const [adminTab, setAdminTab] = useState("jobs");
  const [adminApplications, setAdminApplications] = useState([]);
  const [adminForm, setAdminForm] = useState({ title:"", company:"", type:"業務委託", rate:"", location:"", tags:"", remote:false, urgent:false, highPay:false, lowExp:false, description:"", requirements:"", period:"", published:true });
  const [editingJob, setEditingJob] = useState(null);
  const [adminLoading, setAdminLoading] = useState(false);

  // Chat
  const [chatAppId, setChatAppId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  // Guest job browse
  const [guestSearch, setGuestSearch] = useState("");
  const [guestFilters, setGuestFilters] = useState({ remote:false, urgent:false, highPay:false, lowExp:false, shortTime:false, reward:false, minRate:0, sortBy:"newest" });
  const [guestSelectedJob, setGuestSelectedJob] = useState(null);

  // Consultation form
  const [consultForm, setConsultForm] = useState({ company:"", name:"", email:"", phone:"", jobType:"", headcount:"", budget:"", message:"" });
  const [consultSending, setConsultSending] = useState(false);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const isAdmin = user?.email === ADMIN_EMAIL;

  // プロフィール入力完了チェック（名前・経験年数・希望単価 + 経歴1社以上）
  const isProfileComplete = !!(
    profileForm.name &&
    profileForm.experience &&
    profileForm.desiredRate &&
    careers.length >= 1
  );

  // ── Auth listener（onAuthStateChanged） ──
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fu) => {
      try {
        if (fu) {
          setUser({ name: fu.displayName || fu.email, email: fu.email });
          setEmailVerified(true);
          setPage("dashboard");
        } else {
          setUser(null);
          setEmailVerified(false);
          setPage("landing");
        }
      } catch(e) {
        setPage("landing");
      } finally {
        setAuthLoading(false);
      }
    });
    return () => unsub();
  }, []);

  // Firestore jobs listener（ログイン済みユーザーのみ）
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, "jobs"), (snap) => {
      if (!snap.empty) {
        const fsJobs = snap.docs.map(d => ({
          ...d.data(),
          id: d.id,
          tags: Array.isArray(d.data().tags) ? d.data().tags : [],
        })).sort((a,b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0));
        setJobs(fsJobs);
      }
    }, () => {});
    return () => unsub();
  }, [user]);

  // Profile listener
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "profiles", user.email), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setProfileForm(data);
        if (data.resumeUrl) setResumeUrl(data.resumeUrl);
        if (data.resumeFileName) setResumeFileName(data.resumeFileName);
      }
    });
    return () => unsub();
  }, [user]);

  // Careers listener
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, "profiles", user.email, "careers"), (snap) => {
      const list = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a,b) => (a.order||0) - (b.order||0));
      setCareers(list);
    });
    return () => unsub();
  }, [user]);

  // Applications listener
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, "applications"), (snap) => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (isAdmin) {
        setAdminApplications(all.sort((a,b) => (b.appliedAt?.seconds||0) - (a.appliedAt?.seconds||0)));
      }
      const mine = all.filter(a => a.userEmail === user.email);
      setMyApplications(mine);
      setAppliedJobs(mine.map(a => a.jobId));
    });
    return () => unsub();
  }, [user, isAdmin]);

  const filteredJobs = jobs.filter(job => {
    if (job.published === false) return false;
    const kw = search.toLowerCase();
    if (kw && !job.title.toLowerCase().includes(kw) && !job.company.toLowerCase().includes(kw) && !job.tags.some(t=>t.toLowerCase().includes(kw))) return false;
    if (filters.remote && !job.remote) return false;
    if (filters.urgent && !job.urgent) return false;
    if (filters.highPay && !job.highPay) return false;
    if (filters.lowExp && !job.lowExp) return false;
    if (filters.shortTime && !job.period?.includes("週")) return false;
    if (filters.reward && job.type !== "成果報酬") return false;
    if (filters.industries.length > 0 && !job.tags.some(t=>filters.industries.includes(t))) return false;
    if (filters.minRate > 0 && extractMinRate(job.rate) < filters.minRate) return false;
    return true;
  }).sort((a,b) => {
    if (sortBy === "rateDesc") return extractMinRate(b.rate) - extractMinRate(a.rate);
    if (sortBy === "rateAsc")  return extractMinRate(a.rate) - extractMinRate(b.rate);
    // newest: posted日時降順 (Firestore createdAt or posted string)
    const da = a.createdAt?.seconds || new Date(a.posted||0).getTime()/1000;
    const db2 = b.createdAt?.seconds || new Date(b.posted||0).getTime()/1000;
    return db2 - da;
  });

  const getErrorMessage = (code) => {
    switch(code) {
      case "auth/email-already-in-use": return "このメールアドレスはすでに登録されています";
      case "auth/invalid-email": return "メールアドレスの形式が正しくありません";
      case "auth/weak-password": return "パスワードは6文字以上にしてください";
      case "auth/invalid-credential": return "メールアドレスまたはパスワードが正しくありません";
      case "auth/too-many-requests": return "しばらくしてからお試しください";
      default: return "エラーが発生しました。もう一度お試しください";
    }
  };

  const handleRegister = async () => {
    setAuthError("");
    if (!regForm.name || !regForm.email || !regForm.password) { showToast("必須項目を入力してください"); return; }
    if (regForm.password.length < 6) { setAuthError("パスワードは6文字以上にしてください"); return; }
    try {
      const result = await createUserWithEmailAndPassword(auth, regForm.email, regForm.password);
      await updateProfile(result.user, { displayName: regForm.name });
      // 登録完了メール送信（EmailJS）
      try {
        await fetch("https://api.emailjs.com/api/v1.0/email/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            service_id: "service_kgfb1pp",
            template_id: "template_welcome",
            user_id: "l-4JMsbbRt5ETL0Su",
            template_params: {
              to_name: regForm.name,
              to_email: regForm.email,
              message: `SalesBoardへのご登録ありがとうございます！\n\n${regForm.name}様のアカウントが正常に作成されました。\n\nまずはプロフィールを入力して、案件への応募を開始しましょう。\n\nhttps://salesboard.jcon.co.jp/`,
            }
          })
        });
      } catch(emailErr) {
        // メール送信失敗はサイレントに（登録自体は成功）
        console.warn("welcome email failed:", emailErr);
      }
      showToast("登録が完了しました！プロフィールを入力してください😊");
      setDashTab("mypage");
    } catch(e) { setAuthError(getErrorMessage(e.code)); }
  };

  const handleLogin = async () => {
    setAuthError("");
    if (!loginForm.email || !loginForm.password) { showToast("メール・パスワードを入力してください"); return; }
    try {
      await signInWithEmailAndPassword(auth, loginForm.email, loginForm.password);
      showToast("ログインしました");
    } catch(e) { setAuthError(getErrorMessage(e.code)); }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null); setPage("landing"); setMenuOpen(false);
    showToast("ログアウトしました");
  };

  const handleApply = async () => {
    if (!selectedJob || !user) return;
    try {
      await addDoc(collection(db, "applications"), {
        jobId: selectedJob.id, jobTitle: selectedJob.title, company: selectedJob.company,
        userEmail: user.email, userName: user.name, message: applyMsg,
        status: "未対応", appliedAt: serverTimestamp(), profile: profileForm,
      });
      setShowApplyModal(false); setApplyMsg("");
      showToast(`「${selectedJob.title}」に応募しました！`);
    } catch(e) { showToast("応募に失敗しました"); }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    if (!profileForm.name || !profileForm.experience || !profileForm.desiredRate) {
      showToast("氏名・営業経験年数・希望単価は必須です");
      return;
    }
    try {
      await setDoc(doc(db, "profiles", user.email), { ...profileForm, email: user.email, resumeUrl, resumeFileName });
      showToast("プロフィールを保存しました！");
    } catch(e) {
      console.error("save error:", e);
      showToast("保存に失敗しました（権限エラーの場合はページを再読み込みしてください）");
    }
  };

  // 相談フォーム送信（EmailJSでoshita@jcon.co.jpへ通知）
  const handleConsult = async () => {
    if (!consultForm.company || !consultForm.name || !consultForm.email) {
      showToast("会社名・担当者名・メールアドレスは必須です");
      return;
    }
    setConsultSending(true);
    try {
      // Firestoreに問い合わせを保存
      await addDoc(collection(db, "consultations"), {
        ...consultForm,
        submittedAt: serverTimestamp(),
        status: "未対応",
      });
    } catch(e) {
      // Firestore保存失敗はサイレント（メール送信は試みる）
      console.warn("consultation save error:", e);
    }
    try {
      // EmailJSでoshita@jcon.co.jpへ通知メール送信
      const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: "service_kgfb1pp",
          template_id: "template_consult_notify",
          user_id: "l-4JMsbbRt5ETL0Su",
          template_params: {
            to_email: "oshita@jcon.co.jp",
            from_company: consultForm.company,
            from_name: consultForm.name,
            from_email: consultForm.email,
            phone: consultForm.phone || "未記入",
            job_type: consultForm.jobType || "未選択",
            headcount: consultForm.headcount || "未選択",
            budget: consultForm.budget || "未選択",
            message: consultForm.message || "（メッセージなし）",
            reply_to: consultForm.email,
          }
        })
      });
      if (!res.ok) throw new Error("EmailJS error: " + res.status);
    } catch(emailErr) {
      console.warn("consult notify email failed:", emailErr);
      // メール送信失敗でもフォーム送信は成功扱い
    }
    setConsultSending(false);
    setConsultForm({ company:"", name:"", email:"", phone:"", jobType:"", headcount:"", budget:"", message:"" });
    showToast("お問い合わせを受け付けました！担当者より1営業日以内にご連絡します。");
    setPage("landing");
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { showToast("ファイルサイズは10MB以下にしてください"); return; }
    setResumeUploading(true);
    try {
      const storageRef = ref(storage, `resumes/${user.email}/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setResumeUrl(url);
      setResumeFileName(file.name);
      await setDoc(doc(db, "profiles", user.email), { ...profileForm, email: user.email, resumeUrl: url, resumeFileName: file.name }, { merge: true });
      showToast("職務経歴書をアップロードしました！");
    } catch(e) { showToast("アップロードに失敗しました"); }
    setResumeUploading(false);
  };

  const handleSaveCareer = async () => {
    if (!careerForm.company || !careerForm.startYear || !careerForm.startMonth) { showToast("企業名・開始年月は必須です"); return; }
    const period = formatPeriod(careerForm);
    try {
      if (editingCareerId) {
        await updateDoc(doc(db, "profiles", user.email, "careers", editingCareerId), { ...careerForm, period });
        showToast("経歴を更新しました");
      } else {
        await addDoc(collection(db, "profiles", user.email, "careers"), { ...careerForm, period, order: careers.length, createdAt: serverTimestamp() });
        showToast("経歴を追加しました");
      }
      setCareerForm({ company:"", startYear:"", startMonth:"", endYear:"", endMonth:"", isCurrent:false, role:"", description:"" });
      setEditingCareerId(null);
    } catch(e) { showToast("保存に失敗しました"); }
  };

  const handleEditCareer = (career) => {
    setCareerForm({
      company: career.company||"",
      startYear: career.startYear||"",
      startMonth: career.startMonth||"",
      endYear: career.endYear||"",
      endMonth: career.endMonth||"",
      isCurrent: career.isCurrent||false,
      role: career.role||"",
      description: career.description||""
    });
    setEditingCareerId(career.id);
  };

  const handleDeleteCareer = async (careerId) => {
    if (!window.confirm("この経歴を削除しますか？")) return;
    try { await deleteDoc(doc(db, "profiles", user.email, "careers", careerId)); showToast("削除しました"); } catch(e) {}
  };

  // Chat listener
  useEffect(() => {
    if (!chatAppId) return;
    const unsub = onSnapshot(
      collection(db, "applications", chatAppId, "messages"),
      (snap) => {
        const msgs = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a,b) => (a.sentAt?.seconds||0) - (b.sentAt?.seconds||0));
        setChatMessages(msgs);
      }
    );
    return () => unsub();
  }, [chatAppId]);


  const handleSendMessage = async () => {
    if (!chatInput.trim() || !chatAppId) return;
    const msg = chatInput.trim();
    setChatInput("");
    try {
      await addDoc(collection(db, "applications", chatAppId, "messages"), {
        text: msg,
        senderEmail: user.email,
        senderName: user.name,
        isAdmin: isAdmin,
        sentAt: serverTimestamp(),
      });
      // 管理者へのメール通知（ユーザーからのメッセージの場合）
      if (!isAdmin) {
        try {
          await fetch("https://api.emailjs.com/api/v1.0/email/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              service_id: "service_kgfb1pp",
              template_id: "template_hfoiagq",
              user_id: "l-4JMsbbRt5ETL0Su",
              template_params: {
                name: `【メッセージ通知】${user.name}さんからメッセージが届きました`,
                email: user.email,
              }
            })
          });
        } catch(e) {}
      }
    } catch(e) { showToast("送信に失敗しました"); }
  };
  const resetAdminForm = () => {
    setAdminForm({ title:"", company:"", type:"業務委託", rate:"", location:"", tags:"", remote:false, urgent:false, highPay:false, lowExp:false, description:"", requirements:"", period:"", published:true });
    setEditingJob(null);
  };

  const handleSaveJob = async () => {
    if (!adminForm.title || !adminForm.company || !adminForm.rate) { showToast("タイトル・企業名・報酬は必須です"); return; }
    setAdminLoading(true);
    try {
      const jobData = { ...adminForm, tags: adminForm.tags.split(",").map(t=>t.trim()).filter(Boolean), posted: new Date().toISOString().split("T")[0], createdAt: serverTimestamp() };
      if (editingJob) {
        await updateDoc(doc(db, "jobs", editingJob.id), jobData);
        showToast("案件を更新しました！");
      } else {
        await addDoc(collection(db, "jobs"), jobData);
        showToast("案件を追加しました！");
      }
      resetAdminForm();
    } catch(e) { showToast("エラーが発生しました"); }
    setAdminLoading(false);
  };

  const handleEditJob = (job) => {
    setAdminForm({ title:job.title||"", company:job.company||"", type:job.type||"業務委託", rate:job.rate||"", location:job.location||"", tags:Array.isArray(job.tags)?job.tags.join(", "):(job.tags||""), remote:job.remote||false, urgent:job.urgent||false, highPay:job.highPay||false, lowExp:job.lowExp||false, description:job.description||"", requirements:job.requirements||"", period:job.period||"", published:job.published!==false });
    setEditingJob(job);
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("この案件を削除しますか？")) return;
    try { await deleteDoc(doc(db, "jobs", jobId)); showToast("削除しました"); } catch(e) { showToast("削除に失敗しました"); }
  };

  const handleTogglePublish = async (job) => {
    try { await updateDoc(doc(db, "jobs", job.id), { published: !job.published }); showToast(job.published ? "非公開にしました" : "公開しました"); } catch(e) {}
  };

  if (authLoading) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",fontFamily:"sans-serif",color:"#8a8a7a"}}>読み込み中...</div>;


  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;600;700;900&family=Outfit:wght@300;400;500;600;700;800&display=swap');
    :root {
      --ink:#1a1a2e; --paper:#F5F5F0; --white:#FFFFFF;
      --brand:#24A64A; --brand-dark:#1a7a36; --brand-soft:#EAF7EE; --brand-mid:#DCF3E3;
      --orange:#FF8A00; --orange-dark:#e07a00; --orange-soft:#FFF3E0;
      --green:#0d9f6e; --green-soft:#e6f7f0;
      --blue:#2563eb; --blue-soft:#eff4ff;
      --purple:#7c3aed; --purple-soft:#f3eeff;
      --red:#dc2626; --red-soft:#fef2f2;
      --gray50:#FAFAFA; --gray100:#F5F5F0; --gray200:#E8E8E0; --gray300:#D4D4C8;
      --gray400:#BABAB0; --gray500:#8a8a7a; --gray700:#4a4a3e; --gray900:#1a1a2e;
      --shadow-sm:0 1px 3px rgba(0,0,0,0.05),0 1px 6px rgba(0,0,0,0.04);
      --shadow-md:0 2px 8px rgba(0,0,0,0.06),0 4px 16px rgba(0,0,0,0.05);
      --shadow-lg:0 8px 32px rgba(0,0,0,0.08);
      --shadow-xl:0 16px 48px rgba(0,0,0,0.12);
      --radius-sm:6px; --radius-md:10px; --radius-lg:16px; --radius-xl:24px; --radius-2xl:32px;
    }
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Noto Sans JP',sans-serif;background:var(--paper);color:var(--ink);-webkit-font-smoothing:antialiased;}

    /* NAV */
    .landing-nav{display:flex;align-items:center;justify-content:space-between;padding:0 40px;height:72px;background:var(--white);border-bottom:1px solid var(--gray200);position:sticky;top:0;z-index:100;}
    .logo{font-family:'Outfit',sans-serif;font-weight:800;font-size:20px;color:var(--ink);display:flex;align-items:center;gap:10px;cursor:pointer;letter-spacing:-0.3px;}
    .logo-mark{width:32px;height:32px;background:var(--brand);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:900;color:white;}
    .nav-btns{display:flex;gap:10px;align-items:center;}
    .btn-ghost{padding:9px 22px;border-radius:100px;background:var(--white);border:1.5px solid var(--gray300);color:var(--gray700);font-size:14px;font-weight:600;cursor:pointer;transition:all 0.2s;}
    .btn-ghost:hover{border-color:var(--brand);color:var(--brand);}
    .btn-accent{padding:10px 22px;border-radius:100px;background:var(--orange);border:none;color:white;font-size:14px;font-weight:700;cursor:pointer;transition:all 0.2s;}
    .btn-accent:hover{background:var(--orange-dark);transform:translateY(-1px);}

    /* HERO */
    .hero-section{display:grid;grid-template-columns:1fr 1fr;min-height:580px;background:var(--white);overflow:hidden;}
    .hero-left{display:flex;flex-direction:column;justify-content:center;padding:72px 56px 72px 64px;}
    .hero-right{position:relative;overflow:hidden;background:#f0f4f0;}
    .hero-right img{width:100%;height:100%;object-fit:cover;object-position:center top;display:block;}
    .hero-eyebrow{font-size:12px;font-weight:700;color:var(--brand);margin-bottom:20px;display:inline-flex;align-items:center;gap:6px;background:var(--brand-soft);padding:6px 16px;border-radius:100px;letter-spacing:0.3px;width:fit-content;}
    .hero h1{font-family:'Noto Sans JP',sans-serif;font-size:38px;font-weight:900;color:var(--ink);line-height:1.4;letter-spacing:-0.8px;margin-bottom:18px;}
    .hero h1 .highlight{color:var(--orange);}
    .hero-desc{font-size:15px;color:var(--gray500);line-height:1.95;margin-bottom:28px;max-width:400px;}
    .hero-trust{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:36px;}
    .hero-trust-badge{display:inline-flex;align-items:center;gap:5px;background:var(--white);border:1.5px solid var(--brand-mid);border-radius:100px;padding:6px 14px;font-size:12px;font-weight:600;color:var(--brand-dark);box-shadow:var(--shadow-sm);}
    .hero-trust-badge::before{content:"✓";color:var(--brand);font-weight:800;}
    .cta-buttons{display:flex;gap:12px;flex-wrap:wrap;align-items:center;}
    .btn-cta-primary{padding:16px 40px;border-radius:100px;background:var(--orange);border:none;color:white;font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 4px 24px rgba(255,138,0,0.32);transition:all 0.25s;letter-spacing:0.2px;}
    .btn-cta-primary:hover{background:var(--orange-dark);transform:translateY(-2px);box-shadow:0 6px 28px rgba(255,138,0,0.42);}
    .btn-cta-secondary{padding:14px 30px;border-radius:100px;background:transparent;border:2px solid var(--brand);color:var(--brand);font-size:15px;font-weight:600;cursor:pointer;transition:all 0.2s;}
    .btn-cta-secondary:hover{background:var(--brand-soft);}

    /* CATEGORY BANNERS */
    .cat-strip{background:var(--white);border-top:1px solid var(--gray200);border-bottom:1px solid var(--gray200);}
    .category-banners{max-width:1080px;margin:0 auto;padding:28px 40px;display:grid;grid-template-columns:repeat(4,1fr);gap:10px;}
    .cat-banner{background:var(--paper);border:1px solid var(--gray200);border-radius:var(--radius-lg);padding:16px 18px;display:flex;align-items:center;gap:12px;cursor:pointer;transition:all 0.2s;}
    .cat-banner:hover{background:var(--white);border-color:var(--brand);box-shadow:var(--shadow-md);transform:translateY(-1px);}
    .cat-banner-icon{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;}
    .cat-banner-text{flex:1;}
    .cat-banner-title{font-size:13px;font-weight:700;color:var(--ink);margin-bottom:2px;}
    .cat-banner-sub{font-size:11px;color:var(--gray500);line-height:1.4;}

    /* WHY CARD — image-led */
    .why-section{background:var(--white);padding:96px 40px;}
    .why-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:28px;max-width:1040px;margin:0 auto;}
    .why-card{background:var(--white);border-radius:var(--radius-xl);border:1px solid var(--gray200);overflow:hidden;box-shadow:var(--shadow-sm);transition:all 0.3s;}
    .why-card:hover{box-shadow:var(--shadow-lg);transform:translateY(-4px);}
    .why-card-img{aspect-ratio:1/1;overflow:hidden;background:#f4f7f4;}
    .why-card-img img{width:100%;height:100%;object-fit:cover;object-position:center;display:block;transition:transform 0.4s;}
    .why-card:hover .why-card-img img{transform:scale(1.03);}
    .why-card-body{padding:28px 28px 32px;}
    .why-label{font-size:11px;font-weight:700;color:var(--brand);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:10px;}
    .why-title{font-size:19px;font-weight:800;color:var(--ink);margin-bottom:10px;letter-spacing:-0.3px;line-height:1.35;}
    .why-desc{font-size:14px;color:var(--gray500);line-height:1.9;}

    /* ABOUT */
    .about-section{padding:80px 64px;display:flex;align-items:center;gap:72px;max-width:1100px;margin:0 auto;}
    .about-illo{flex:0 0 360px;}
    .about-illo img{width:100%;}
    .about-text{flex:1;}
    .about-eyebrow{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:var(--brand);background:var(--brand-soft);padding:5px 14px;border-radius:100px;margin-bottom:20px;}
    .about-title{font-size:30px;font-weight:900;color:var(--ink);line-height:1.35;margin-bottom:18px;letter-spacing:-0.5px;}
    .about-desc{font-size:15px;color:var(--gray700);line-height:1.9;margin-bottom:28px;}
    .target-check{display:flex;align-items:center;gap:10px;font-size:14px;color:var(--gray700);margin-bottom:10px;}
    .target-check-icon{width:20px;height:20px;border-radius:50%;background:var(--brand-soft);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:11px;}

    /* FLOW SECTION */
    .flow-section{background:var(--paper);border-top:1px solid var(--gray200);padding:96px 40px;}
    .flow-img-wrap{max-width:960px;margin:0 auto 48px;border-radius:var(--radius-xl);overflow:hidden;box-shadow:var(--shadow-lg);background:var(--white);}
    .flow-img-wrap img{width:100%;height:auto;display:block;object-fit:contain;}
    .flow-steps{display:grid;grid-template-columns:repeat(4,1fr);gap:0;max-width:960px;margin:0 auto;}
    .flow-step{padding:20px 20px 24px;border-right:1px solid var(--gray200);position:relative;}
    .flow-step:last-child{border-right:none;}
    .flow-step-num{width:32px;height:32px;border-radius:50%;background:var(--brand);color:white;font-family:'Outfit',sans-serif;font-weight:800;font-size:15px;display:flex;align-items:center;justify-content:center;margin-bottom:12px;}
    .flow-step-title{font-size:14px;font-weight:700;color:var(--ink);margin-bottom:6px;line-height:1.4;}
    .flow-step-desc{font-size:12px;color:var(--gray500);line-height:1.75;}
    .flow-badge{display:inline-block;background:var(--brand-soft);color:var(--brand-dark);font-size:11px;font-weight:700;padding:3px 10px;border-radius:100px;margin-bottom:8px;}

    /* CASES */
    .cases-section{max-width:1100px;margin:0 auto;padding:64px 40px;}
    .section-header{margin-bottom:36px;}
    .section-eyebrow{font-size:11px;font-weight:700;color:var(--brand);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;}
    .section-title{font-size:30px;font-weight:900;color:var(--ink);letter-spacing:-0.5px;margin-bottom:8px;}
    .section-subtitle{font-size:14px;color:var(--gray500);line-height:1.7;}
    .cases-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-bottom:32px;}
    .case-card{background:var(--white);border-radius:var(--radius-lg);border:1px solid var(--gray200);padding:0;box-shadow:var(--shadow-sm);transition:all 0.25s;cursor:pointer;overflow:hidden;}
    .case-card:hover{box-shadow:var(--shadow-lg);transform:translateY(-3px);border-color:var(--brand);}
    .case-card-banner{background:linear-gradient(135deg,var(--brand-soft) 0%,var(--brand-mid) 100%);padding:18px 20px 14px;border-bottom:1px solid var(--brand-mid);}
    .case-card-body{padding:20px;}
    .case-card-top{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;}
    .case-industry{font-size:11px;font-weight:600;color:var(--brand-dark);background:var(--brand-soft);padding:3px 10px;border-radius:100px;border:1px solid var(--brand-mid);}
    .case-type-badge{font-size:11px;font-weight:600;color:var(--orange);background:var(--orange-soft);padding:3px 10px;border-radius:100px;}
    .case-title{font-size:15px;font-weight:700;color:var(--ink);line-height:1.5;margin-bottom:0;}
    .case-detail-row{display:flex;gap:0;margin:14px 0;border:1px solid var(--brand-mid);border-radius:var(--radius-md);overflow:hidden;}
    .case-detail-item{flex:1;padding:10px 12px;border-right:1px solid var(--brand-mid);background:var(--white);}
    .case-detail-item:last-child{border-right:none;}
    .case-detail-label{font-size:10px;font-weight:700;color:var(--brand-dark);margin-bottom:3px;}
    .case-detail-value{font-size:12px;font-weight:700;color:var(--ink);}
    .case-detail-value.rate{color:var(--orange);}
    .case-section-label{font-size:11px;font-weight:700;color:var(--gray500);letter-spacing:0.5px;margin-bottom:5px;margin-top:12px;}
    .case-desc{font-size:12px;color:var(--gray700);line-height:1.7;}
    .case-skills{display:flex;flex-wrap:wrap;gap:5px;margin-top:5px;}
    .case-skill{font-size:11px;padding:3px 9px;border-radius:100px;background:var(--gray100);color:var(--gray700);border:1px solid var(--gray200);font-weight:500;}
    .case-divider{height:1px;background:var(--gray200);margin:12px 0;}
    .cases-cta{text-align:center;padding:52px 40px;background:var(--brand-soft);border-radius:var(--radius-xl);}
    .cases-cta-title{font-size:22px;font-weight:800;color:var(--ink);margin-bottom:8px;letter-spacing:-0.3px;}
    .cases-cta-sub{font-size:14px;color:var(--gray500);margin-bottom:32px;line-height:1.7;}
    .landing-footer{background:var(--ink);color:rgba(255,255,255,0.4);text-align:center;padding:56px 48px 48px;font-size:13px;}
    .landing-footer .footer-logo{font-family:'Outfit',sans-serif;font-weight:800;color:white;font-size:22px;margin-bottom:16px;letter-spacing:-0.5px;}
    .landing-footer .footer-links{display:flex;justify-content:center;gap:32px;margin-bottom:20px;}
    .landing-footer .footer-links a{color:rgba(255,255,255,0.55);text-decoration:none;font-size:13px;transition:color 0.2s;}
    .landing-footer .footer-links a:hover{color:white;}
    /* CONSULTATION PAGE */
    .consult-page{min-height:100vh;background:var(--paper);}
    .consult-hero{background:var(--white);border-bottom:1px solid var(--gray200);padding:56px 40px;text-align:center;}
    .consult-form-wrap{max-width:640px;margin:0 auto;padding:56px 24px;}
    .consult-card{background:var(--white);border-radius:var(--radius-xl);border:1px solid var(--gray200);padding:40px;box-shadow:var(--shadow-md);}

    /* AUTH */
    .auth-page{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--paper);padding:40px 20px;}
    .auth-card{width:100%;max-width:480px;background:var(--white);border-radius:var(--radius-xl);padding:48px 40px;box-shadow:var(--shadow-xl);position:relative;border:1px solid var(--gray200);}
    .auth-card::before{content:'';position:absolute;top:0;left:32px;right:32px;height:3px;background:linear-gradient(90deg,var(--brand),var(--orange));border-radius:0 0 4px 4px;}
    .auth-back{font-size:13px;color:var(--gray500);cursor:pointer;display:flex;align-items:center;gap:4px;margin-bottom:24px;}
    .auth-card h2{font-size:26px;font-weight:700;margin-bottom:8px;}
    .auth-card .subtitle{font-size:14px;color:var(--gray500);margin-bottom:32px;}
    .form-group{margin-bottom:18px;}
    .form-label{display:block;font-size:13px;font-weight:600;color:var(--gray700);margin-bottom:5px;}
    .form-label .req{color:var(--red);margin-left:2px;}
    .form-input{width:100%;padding:12px 16px;border:1.5px solid var(--gray200);border-radius:var(--radius-md);font-size:14px;font-family:'Noto Sans JP',sans-serif;background:var(--gray100);transition:all 0.2s;outline:none;}
    .form-input:focus{border-color:var(--brand);background:var(--white);box-shadow:0 0 0 3px rgba(36,166,74,0.1);}
    .form-select{width:100%;padding:12px 16px;border:1.5px solid var(--gray200);border-radius:var(--radius-md);font-size:14px;font-family:'Noto Sans JP',sans-serif;background:var(--gray100);outline:none;cursor:pointer;}
    .chip-group{display:flex;flex-wrap:wrap;gap:7px;}
    .chip{padding:5px 13px;border-radius:100px;font-size:12px;cursor:pointer;border:1.5px solid var(--gray200);background:var(--white);transition:all 0.15s;user-select:none;color:var(--gray700);}
    .chip.active{background:var(--brand);color:white;border-color:var(--brand);}
    .btn-submit{width:100%;padding:14px;border-radius:var(--radius-md);background:var(--orange);border:none;color:white;font-size:16px;font-weight:700;cursor:pointer;transition:all 0.2s;margin-top:8px;}
    .btn-submit:hover{background:var(--orange-dark);transform:translateY(-1px);}
    .auth-switch{text-align:center;margin-top:24px;font-size:13px;color:var(--gray500);}
    .auth-switch span{color:var(--brand);font-weight:600;cursor:pointer;}
    .error-box{background:#fef2f2;color:#dc2626;padding:12px 16px;border-radius:var(--radius-sm);font-size:13px;margin-bottom:16px;border:1px solid #fecaca;}

    /* DASHBOARD */
    .dashboard{min-height:100vh;background:var(--paper);}
    .dash-nav{background:var(--white);border-bottom:1px solid var(--gray200);padding:0 32px;height:64px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:50;}
    .dash-nav-right{display:flex;align-items:center;gap:16px;}
    .user-pill{display:flex;align-items:center;gap:8px;padding:5px 14px 5px 5px;border-radius:100px;background:var(--gray100);cursor:pointer;transition:background 0.2s;position:relative;}
    .user-pill:hover{background:var(--gray200);}
    .user-avatar{width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,var(--brand),var(--orange));color:white;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;}
    .user-name{font-size:14px;font-weight:500;}
    .dropdown{position:absolute;top:46px;right:0;background:var(--white);border-radius:var(--radius-lg);box-shadow:var(--shadow-lg);overflow:hidden;min-width:180px;border:1px solid var(--gray200);}
    .dropdown-item{padding:12px 20px;font-size:14px;cursor:pointer;transition:background 0.15s;}
    .dropdown-item:hover{background:var(--gray100);}
    .dropdown-item.danger{color:var(--red);}
    .dropdown-item.admin-link{color:var(--brand);font-weight:700;}
    .applied-count{display:flex;align-items:center;gap:6px;padding:6px 14px;border-radius:8px;background:var(--brand-soft);color:var(--brand-dark);font-size:13px;font-weight:600;}
    .dash-tabs{display:flex;gap:0;background:var(--white);border-bottom:1px solid var(--gray200);padding:0 32px;}
    .dash-tab{padding:14px 20px;font-size:14px;font-weight:600;color:var(--gray500);cursor:pointer;border-bottom:2px solid transparent;transition:all 0.2s;}
    .dash-tab.active{color:var(--brand);border-bottom-color:var(--brand);}
    .dash-body{display:flex;max-width:1280px;margin:0 auto;padding:24px 32px;gap:24px;}
    .sidebar{width:260px;flex-shrink:0;background:var(--white);border-radius:var(--radius-lg);padding:22px;box-shadow:var(--shadow-sm);height:fit-content;position:sticky;top:88px;border:1px solid var(--gray200);}
    .sidebar h3{font-size:15px;font-weight:700;margin-bottom:18px;display:flex;align-items:center;gap:8px;}
    .filter-section{margin-bottom:22px;}
    .filter-title{font-size:12px;font-weight:700;color:var(--gray500);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;}
    .filter-toggle{display:flex;align-items:center;gap:10px;padding:7px 4px;cursor:pointer;border-radius:6px;transition:all 0.15s;}
    .filter-toggle:hover{background:var(--gray100);}
    .toggle-box{width:17px;height:17px;border-radius:4px;border:2px solid var(--gray300);display:flex;align-items:center;justify-content:center;transition:all 0.15s;flex-shrink:0;}
    .toggle-box.active{background:var(--brand);border-color:var(--brand);}
    .toggle-label{font-size:13px;color:var(--gray700);}
    .clear-filters{font-size:12px;color:var(--brand);cursor:pointer;font-weight:600;padding:8px 4px;}
    .main-content{flex:1;min-width:0;}
    .search-bar{background:var(--white);border-radius:var(--radius-lg);padding:14px 20px;box-shadow:var(--shadow-sm);border:1px solid var(--gray200);display:flex;align-items:center;gap:12px;margin-bottom:14px;transition:border-color 0.2s;}
    .search-bar:focus-within{border-color:var(--brand);}
    .search-input-wrap{display:flex;align-items:center;gap:10px;flex:1;}
    .search-input{border:none;outline:none;font-size:14px;font-family:'Noto Sans JP',sans-serif;flex:1;background:transparent;}
    .result-count{font-size:13px;color:var(--gray500);margin-bottom:14px;}
    .job-list{display:flex;flex-direction:column;gap:12px;}
    .job-card{background:var(--white);border-radius:var(--radius-lg);padding:0;box-shadow:var(--shadow-sm);border:1px solid var(--gray200);cursor:pointer;transition:all 0.25s;overflow:hidden;display:flex;flex-direction:column;}
    .job-card:hover{box-shadow:var(--shadow-lg);transform:translateY(-3px);border-color:transparent;}
    .job-card-visual{height:7px;flex-shrink:0;}
    .job-card-header{padding:14px 20px 10px;border-bottom:1px solid var(--gray200);background:var(--white);}
    .job-card-body{padding:16px 20px 20px;flex:1;display:flex;flex-direction:column;}
    .job-card-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}
    .job-type{font-size:11px;font-weight:700;padding:3px 10px;border-radius:100px;background:var(--brand-soft);color:var(--brand-dark);border:1px solid var(--brand-mid);}
    .job-type.reward{background:var(--orange-soft);color:var(--orange);border-color:#FFD699;}
    .job-date{font-size:12px;color:var(--gray500);}
    .job-badges{display:flex;gap:5px;flex-wrap:wrap;}
    .badge{padding:3px 9px;border-radius:100px;font-size:10px;font-weight:700;}
    .badge.remote{background:var(--brand-soft);color:var(--brand-dark);border:1px solid var(--brand-mid);}
    .badge.urgent{background:#FFF3CD;color:#996600;border:1px solid #FFD699;}
    .badge.highpay{background:#FEE2E2;color:#991B1B;border:1px solid #FECACA;}
    .badge.lowexp{background:#EDE9FE;color:#5B21B6;border:1px solid #DDD6FE;}
    .job-industry-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:10px;flex-shrink:0;}
    .job-title{font-size:15px;font-weight:700;margin-bottom:4px;color:var(--ink);line-height:1.5;}
    .job-company{font-size:12px;color:var(--gray500);margin-bottom:12px;display:flex;align-items:center;gap:4px;}
    .job-meta{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;}
    .meta-pill{padding:4px 10px;border-radius:6px;font-size:12px;font-weight:500;background:var(--gray100);color:var(--gray700);}
    .meta-pill.rate{background:var(--orange-soft);color:var(--orange);font-weight:700;}
    .job-tags{display:flex;flex-wrap:wrap;gap:5px;margin-top:auto;padding-top:10px;}
    .tag{padding:3px 10px;border-radius:100px;font-size:11px;font-weight:500;background:var(--brand-soft);color:var(--brand-dark);border:1px solid var(--brand-mid);}

    /* MODAL */
    .modal-overlay{position:fixed;inset:0;background:rgba(10,10,30,0.55);backdrop-filter:blur(6px);z-index:100;display:flex;align-items:center;justify-content:center;padding:16px;animation:fadeIn 0.2s;}
    .modal{background:var(--white);border-radius:var(--radius-xl);width:100%;max-width:680px;max-height:92vh;overflow-y:auto;box-shadow:0 24px 64px rgba(0,0,0,0.18);animation:slideUp 0.3s;border:1px solid var(--gray200);}
    .modal-top-bar{height:6px;border-radius:var(--radius-xl) var(--radius-xl) 0 0;}
    .modal-header{padding:24px 28px 0;position:relative;}
    .modal-close{position:absolute;top:16px;right:16px;width:36px;height:36px;border-radius:50%;background:var(--gray100);border:none;cursor:pointer;font-size:16px;color:var(--gray500);transition:all 0.15s;display:flex;align-items:center;justify-content:center;}
    .modal-close:hover{background:var(--gray200);color:var(--ink);}
    .modal-body{padding:20px 28px 32px;}
    .modal-rate-bar{display:flex;align-items:center;gap:12px;margin:16px 0;padding:16px 20px;border-radius:var(--radius-md);border-left:4px solid var(--orange);background:var(--orange-soft);}
    .modal-rate-label{font-size:11px;font-weight:700;color:var(--gray500);text-transform:uppercase;letter-spacing:0.5px;white-space:nowrap;}
    .modal-rate-value{font-size:17px;font-weight:800;color:var(--orange);line-height:1.2;word-break:break-word;}
    .modal-detail-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin:16px 0;}
    .modal-detail-box{border:1px solid var(--gray200);border-radius:var(--radius-md);padding:12px 14px;background:var(--gray50);}
    .detail-section{margin-bottom:20px;}
    .detail-label{font-size:11px;font-weight:700;color:var(--brand-dark);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;display:flex;align-items:center;gap:4px;}
    .detail-text{font-size:14px;line-height:1.9;color:var(--gray700);white-space:pre-wrap;word-break:break-word;}
    .modal-divider{height:1px;background:var(--gray200);margin:20px 0;}
    .btn-apply{width:100%;padding:16px;border-radius:100px;background:var(--orange);border:none;color:white;font-size:16px;font-weight:700;cursor:pointer;margin-top:4px;box-shadow:0 4px 20px rgba(255,138,0,0.35);transition:all 0.2s;letter-spacing:0.3px;}
    .btn-apply:hover{background:var(--orange-dark);transform:translateY(-1px);box-shadow:0 6px 24px rgba(255,138,0,0.45);}
    .btn-apply.applied{background:var(--brand-soft);color:var(--brand-dark);cursor:default;box-shadow:none;border:1.5px solid var(--brand-mid);transform:none;}
    .apply-textarea{width:100%;padding:14px;border:1.5px solid var(--gray200);border-radius:var(--radius-md);font-size:14px;font-family:'Noto Sans JP',sans-serif;resize:vertical;min-height:120px;outline:none;background:var(--gray100);box-sizing:border-box;}
    .apply-textarea:focus{border-color:var(--brand);background:var(--white);}

    /* MYPAGE */
    .mypage-wrap{max-width:820px;margin:0 auto;padding:28px 32px;}
    .mypage-card{background:var(--white);border-radius:var(--radius-lg);padding:28px;box-shadow:var(--shadow-sm);border:1px solid var(--gray200);margin-bottom:18px;}
    .mypage-card-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:22px;padding-bottom:16px;border-bottom:1px solid var(--gray200);}
    .mypage-card-title{font-size:16px;font-weight:700;display:flex;align-items:center;gap:8px;color:var(--ink);}
    .mypage-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
    .mypage-label{font-size:12px;font-weight:600;color:var(--gray700);margin-bottom:5px;display:block;}
    .mypage-input{width:100%;padding:11px 14px;border:1.5px solid var(--gray200);border-radius:var(--radius-md);font-size:14px;font-family:'Noto Sans JP',sans-serif;background:var(--gray100);outline:none;transition:all 0.2s;}
    .mypage-input:focus{border-color:var(--brand);background:var(--white);box-shadow:0 0 0 3px rgba(36,166,74,0.1);}
    .mypage-textarea{width:100%;padding:11px 14px;border:1.5px solid var(--gray200);border-radius:var(--radius-md);font-size:14px;font-family:'Noto Sans JP',sans-serif;background:var(--gray100);outline:none;resize:vertical;min-height:90px;transition:all 0.2s;}
    .mypage-textarea:focus{border-color:var(--brand);background:var(--white);}
    .save-btn{padding:13px 36px;border-radius:100px;background:var(--orange);border:none;color:white;font-size:14px;font-weight:700;cursor:pointer;box-shadow:0 3px 12px rgba(255,138,0,0.25);transition:all 0.2s;}
    .save-btn:hover{background:var(--orange-dark);}
    .app-history-item{padding:16px;border-radius:var(--radius-md);border:1px solid var(--gray200);background:var(--gray100);margin-bottom:10px;transition:all 0.15s;}
    .app-history-item:hover{border-color:var(--brand);background:var(--brand-soft);}
    .app-history-title{font-size:14px;font-weight:700;margin-bottom:4px;}
    .app-history-meta{font-size:12px;color:var(--gray500);}
    .status-badge{font-size:11px;font-weight:700;padding:3px 10px;border-radius:100px;}
    .status-badge.pending{background:#FFF3CD;color:#996600;}
    .status-badge.done{background:var(--brand-soft);color:var(--brand-dark);}

    /* VERIFY EMAIL */
    .verify-page{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--paper);padding:40px 20px;}
    .verify-card{width:100%;max-width:480px;background:var(--white);border-radius:var(--radius-xl);padding:48px 40px;box-shadow:var(--shadow-xl);text-align:center;position:relative;border:1px solid var(--gray200);}
    .verify-card::before{content:'';position:absolute;top:0;left:32px;right:32px;height:3px;background:linear-gradient(90deg,var(--brand),var(--orange));border-radius:0 0 4px 4px;}
    .verify-icon{font-size:56px;margin-bottom:20px;}
    .verify-title{font-size:24px;font-weight:700;margin-bottom:12px;}
    .verify-desc{font-size:14px;color:var(--gray500);line-height:1.8;margin-bottom:28px;}
    .verify-email-badge{background:var(--gray100);border-radius:8px;padding:10px 20px;font-size:14px;font-weight:600;color:var(--ink);margin-bottom:28px;display:inline-block;}
    .verify-btn{width:100%;padding:14px;border-radius:var(--radius-md);background:var(--orange);border:none;color:white;font-size:15px;font-weight:700;cursor:pointer;margin-bottom:12px;transition:all 0.2s;}
    .verify-btn:hover{background:var(--orange-dark);}
    .verify-btn.secondary{background:var(--white);border:1.5px solid var(--gray200);color:var(--gray700);}
    .verify-note{font-size:12px;color:var(--gray500);margin-top:16px;}
    .resume-upload-area{border:2px dashed var(--gray300);border-radius:var(--radius-lg);padding:32px;text-align:center;cursor:pointer;transition:all 0.2s;background:var(--gray100);}
    .resume-upload-area:hover{border-color:var(--brand);background:var(--brand-soft);}
    .resume-upload-icon{font-size:36px;margin-bottom:12px;}
    .resume-upload-title{font-size:15px;font-weight:700;color:var(--ink);margin-bottom:6px;}
    .resume-upload-sub{font-size:12px;color:var(--gray500);}
    .resume-uploaded{display:flex;align-items:center;gap:12px;background:var(--brand-soft);border:1px solid var(--brand-mid);border-radius:var(--radius-lg);padding:16px 20px;}
    .resume-uploaded-icon{font-size:24px;}
    .resume-uploaded-name{font-size:14px;font-weight:600;color:var(--brand-dark);flex:1;}
    .resume-uploaded-actions{display:flex;gap:8px;}
    .resume-view-btn{padding:6px 16px;border-radius:8px;background:var(--brand);border:none;color:white;font-size:12px;font-weight:700;cursor:pointer;}
    .resume-change-btn{padding:6px 16px;border-radius:8px;background:var(--white);border:1px solid var(--gray300);color:var(--gray700);font-size:12px;font-weight:600;cursor:pointer;}
    .section-divider{display:flex;align-items:center;gap:12px;margin:24px 0;}
    .section-divider-line{flex:1;height:1px;background:var(--gray200);}
    .section-divider-text{font-size:12px;font-weight:700;color:var(--gray500);white-space:nowrap;}
    .career-list{display:flex;flex-direction:column;gap:10px;margin-bottom:18px;}
    .career-item{background:var(--white);border-radius:var(--radius-md);padding:16px 20px;border:1px solid var(--gray200);display:flex;gap:16px;transition:border-color 0.15s;}
    .career-item:hover{border-color:var(--brand);}
    .career-item-left{flex:0 0 130px;}
    .career-period{font-size:11px;font-weight:700;color:var(--brand);margin-bottom:4px;}
    .career-company{font-size:14px;font-weight:700;color:var(--ink);}
    .career-role{font-size:12px;color:var(--gray500);margin-top:2px;}
    .career-item-right{flex:1;}
    .career-desc{font-size:13px;color:var(--gray700);line-height:1.7;}
    .career-actions{display:flex;gap:6px;margin-top:8px;}
    .career-edit-btn{padding:4px 12px;border-radius:6px;background:var(--brand-soft);color:var(--brand-dark);border:1px solid var(--brand-mid);font-size:11px;font-weight:600;cursor:pointer;}
    .career-delete-btn{padding:4px 12px;border-radius:6px;background:var(--red-soft);color:var(--red);border:none;font-size:11px;font-weight:600;cursor:pointer;}
    .career-form{background:var(--brand-soft);border:1.5px solid var(--brand-mid);border-radius:var(--radius-lg);padding:20px;}

    /* ADMIN */
    .admin-page{min-height:100vh;background:var(--paper);}
    .admin-nav{background:var(--ink);color:white;padding:0 32px;height:60px;display:flex;align-items:center;justify-content:space-between;}
    .admin-nav-title{font-size:16px;font-weight:700;}
    .admin-tabs{display:flex;gap:0;background:rgba(255,255,255,0.05);border-bottom:1px solid rgba(255,255,255,0.1);}
    .admin-tab{padding:14px 24px;font-size:14px;font-weight:600;color:rgba(255,255,255,0.5);cursor:pointer;border-bottom:2px solid transparent;transition:all 0.2s;}
    .admin-tab.active{color:white;border-bottom-color:var(--brand);}
    .admin-body{max-width:1200px;margin:0 auto;padding:32px;}
    .admin-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;}
    .admin-card{background:var(--white);border-radius:var(--radius-lg);padding:24px;box-shadow:var(--shadow-sm);border:1px solid var(--gray200);}
    .admin-card h3{font-size:16px;font-weight:700;margin-bottom:20px;}
    .admin-row{margin-bottom:14px;}
    .admin-label{font-size:12px;font-weight:700;color:var(--gray700);margin-bottom:4px;display:block;}
    .admin-input{width:100%;padding:10px 14px;border:1.5px solid var(--gray200);border-radius:var(--radius-sm);font-size:14px;font-family:'Noto Sans JP',sans-serif;background:var(--gray100);outline:none;transition:all 0.2s;}
    .admin-input:focus{border-color:var(--brand);background:var(--white);}
    .admin-textarea{width:100%;padding:10px 14px;border:1.5px solid var(--gray200);border-radius:var(--radius-sm);font-size:14px;font-family:'Noto Sans JP',sans-serif;background:var(--gray100);outline:none;resize:vertical;min-height:80px;}
    .admin-select{width:100%;padding:10px 14px;border:1.5px solid var(--gray200);border-radius:var(--radius-sm);font-size:14px;background:var(--gray100);outline:none;}
    .admin-checks{display:flex;gap:16px;flex-wrap:wrap;margin-top:6px;}
    .admin-check{display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer;}
    .admin-btn{width:100%;padding:13px;border-radius:var(--radius-md);background:var(--brand);border:none;color:white;font-size:15px;font-weight:700;cursor:pointer;margin-top:8px;transition:all 0.2s;}
    .admin-btn:hover{background:var(--brand-dark);}
    .admin-btn.secondary{background:var(--gray200);color:var(--gray700);}
    .admin-job-list{display:flex;flex-direction:column;gap:10px;max-height:600px;overflow-y:auto;}
    .admin-job-item{padding:14px;border-radius:var(--radius-md);border:1px solid var(--gray200);background:var(--gray100);display:flex;align-items:center;justify-content:space-between;gap:12px;}
    .admin-job-info{flex:1;}
    .admin-job-title{font-size:14px;font-weight:700;margin-bottom:3px;}
    .admin-job-meta{font-size:12px;color:var(--gray500);}
    .admin-job-actions{display:flex;gap:6px;flex-shrink:0;}
    .admin-action-btn{padding:5px 12px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;border:none;transition:all 0.15s;}
    .admin-action-btn.edit{background:var(--blue-soft);color:var(--blue);}
    .admin-action-btn.delete{background:var(--red-soft);color:var(--red);}
    .admin-action-btn.pub{background:var(--brand-soft);color:var(--brand-dark);}
    .admin-action-btn.unpub{background:var(--gray200);color:var(--gray500);}
    .pub-badge{font-size:10px;padding:2px 8px;border-radius:100px;font-weight:600;}
    .pub-badge.on{background:var(--brand-soft);color:var(--brand-dark);}
    .pub-badge.off{background:var(--gray200);color:var(--gray500);}
    .app-card{background:var(--white);border-radius:var(--radius-lg);padding:20px;border:1px solid var(--gray200);margin-bottom:12px;}
    .app-card-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
    .app-card-title{font-size:15px;font-weight:700;}
    .app-card-body{font-size:13px;color:var(--gray700);line-height:1.7;}
    .app-card-meta{font-size:12px;color:var(--gray500);margin-top:8px;}

    /* TOAST */
    .toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--ink);color:white;padding:12px 28px;border-radius:100px;font-size:14px;font-weight:600;z-index:999;animation:slideUp 0.3s;}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    @media(max-width:900px){
      /* HERO */
      .hero-section{grid-template-columns:1fr;min-height:auto;}
      .hero-left{padding:52px 24px 36px;order:1;}
      .hero h1{font-size:28px;}
      .hero-desc{max-width:100%;}
      .hero-right{order:2;height:300px;width:100%;position:relative;}
      .hero-right img{width:100%;height:100%;object-fit:contain;object-position:center center;}
      /* WHY */
      .why-section{padding:64px 20px;}
      .why-grid{grid-template-columns:1fr;gap:20px;}
      /* FLOW */
      .flow-section{padding:64px 20px;}
      .flow-steps{grid-template-columns:1fr 1fr;}
      .flow-step{border-right:none;border-bottom:1px solid var(--gray200);padding:16px;}
      .flow-step:nth-child(odd){border-right:1px solid var(--gray200);}
      .flow-step:last-child{border-bottom:none;}
      /* COMMON */
      .category-banners{grid-template-columns:repeat(2,1fr);padding:20px;}
      .about-section{flex-direction:column;padding:48px 24px;gap:32px;}
      .about-illo{flex:none;width:100%;max-width:320px;margin:0 auto;}
      .cases-grid{grid-template-columns:1fr;}
      .cases-section{padding:40px 20px;}
      .dash-body{flex-direction:column;padding:16px;}
      .sidebar{width:100%;position:static;}
      .landing-nav{padding:0 20px;}
      .admin-grid{grid-template-columns:1fr;}
      .mypage-wrap{padding:16px;}
      .mypage-grid{grid-template-columns:1fr;}
      .consult-card{padding:24px 20px;}
      .consult-form-wrap{padding:32px 16px;}
    }
    /* CHAT */
    .chat-overlay{position:fixed;inset:0;background:rgba(26,26,46,0.5);backdrop-filter:blur(4px);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;}
    .chat-panel{background:white;border-radius:20px;width:100%;max-width:560px;height:80vh;display:flex;flex-direction:column;box-shadow:var(--shadow-xl);}
    .chat-header{padding:20px 24px;border-bottom:1px solid var(--gray200);display:flex;align-items:center;justify-content:space-between;}
    .chat-header-title{font-size:16px;font-weight:700;}
    .chat-header-sub{font-size:12px;color:var(--gray500);margin-top:2px;}
    .chat-close{width:32px;height:32px;border-radius:50%;background:var(--gray100);border:none;cursor:pointer;font-size:16px;color:var(--gray500);}
    .chat-messages{flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:12px;}
    .chat-bubble{max-width:75%;padding:12px 16px;border-radius:16px;font-size:14px;line-height:1.6;}
    .chat-bubble.mine{background:var(--accent);color:white;align-self:flex-end;border-bottom-right-radius:4px;}
    .chat-bubble.theirs{background:var(--gray100);color:var(--ink);align-self:flex-start;border-bottom-left-radius:4px;}
    .chat-bubble-name{font-size:11px;font-weight:700;margin-bottom:4px;opacity:0.7;}
    .chat-bubble-time{font-size:10px;margin-top:4px;opacity:0.6;text-align:right;}
    .chat-empty{flex:1;display:flex;align-items:center;justify-content:center;color:var(--gray500);font-size:14px;flex-direction:column;gap:8px;}
    .chat-input-area{padding:16px;border-top:1px solid var(--gray200);display:flex;gap:10px;align-items:flex-end;}
    .chat-textarea{flex:1;padding:12px 16px;border:1.5px solid var(--gray200);border-radius:12px;font-size:14px;font-family:'Noto Sans JP',sans-serif;resize:none;outline:none;max-height:120px;min-height:44px;transition:border-color 0.2s;}
    .chat-textarea:focus{border-color:var(--accent);}
    .chat-send-btn{padding:12px 20px;border-radius:12px;background:var(--accent);border:none;color:white;font-size:14px;font-weight:700;cursor:pointer;flex-shrink:0;transition:all 0.2s;}
    .chat-send-btn:hover{background:var(--accent2);}
    .chat-link{color:var(--accent);font-size:13px;font-weight:600;cursor:pointer;text-decoration:underline;margin-top:8px;display:inline-block;}
  `;


  // ADMIN PAGE
  if (page === "admin") {
    if (!isAdmin) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh"}}>アクセス権限がありません</div>;
    const allJobs = jobs;
    return (
      <>
        <style>{css}</style>
        <div className="admin-page">
          <nav className="admin-nav">
            <div className="admin-nav-title">⚙️ SalesBoard 管理者画面</div>
            <div style={{display:"flex",gap:12,alignItems:"center"}}>
              <span style={{fontSize:13,color:"rgba(255,255,255,0.6)"}}>{user?.email}</span>
              <button onClick={()=>setPage("dashboard")} style={{padding:"6px 16px",borderRadius:8,background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",color:"white",cursor:"pointer",fontSize:13}}>ダッシュボードへ</button>
            </div>
          </nav>
          <div style={{background:"#0f172a",padding:"0 32px"}}>
            <div style={{display:"flex",gap:0}}>
              {[["jobs","📋 案件管理"],["applications","📨 応募者一覧"]].map(([t,l])=>(
                <div key={t} onClick={()=>setAdminTab(t)} style={{padding:"14px 24px",fontSize:14,fontWeight:600,color:adminTab===t?"white":"rgba(255,255,255,0.4)",cursor:"pointer",borderBottom:`2px solid ${adminTab===t?"#e8530e":"transparent"}`,transition:"all 0.2s"}}>{l}</div>
              ))}
            </div>
          </div>

          <div className="admin-body">
            {adminTab === "jobs" && (
              <div className="admin-grid">
                <div className="admin-card">
                  <h3>{editingJob ? "✏️ 案件を編集" : "➕ 案件を追加"}</h3>
                  {[["title","案件タイトル *","例：SaaS新規開拓営業"],["company","企業名 *","例：株式会社〇〇"],["rate","報酬 *","例：月60〜80万円"],["location","勤務地","例：東京（一部リモート）"],["period","契約期間","例：長期（6ヶ月〜）"],["tags","タグ（カンマ区切り）","例：SaaS, IT, 新規開拓"]].map(([key,label,placeholder])=>(
                    <div className="admin-row" key={key}>
                      <label className="admin-label">{label}</label>
                      <input className="admin-input" placeholder={placeholder} value={adminForm[key]} onChange={e=>setAdminForm({...adminForm,[key]:e.target.value})} />
                    </div>
                  ))}
                  <div className="admin-row">
                    <label className="admin-label">契約タイプ</label>
                    <select className="admin-select" value={adminForm.type} onChange={e=>setAdminForm({...adminForm,type:e.target.value})}>
                      <option value="業務委託">業務委託</option>
                      <option value="成果報酬">成果報酬</option>
                    </select>
                  </div>
                  <div className="admin-row">
                    <label className="admin-label">案件概要</label>
                    <textarea className="admin-textarea" value={adminForm.description} onChange={e=>setAdminForm({...adminForm,description:e.target.value})} />
                  </div>
                  <div className="admin-row">
                    <label className="admin-label">応募要件</label>
                    <textarea className="admin-textarea" value={adminForm.requirements} onChange={e=>setAdminForm({...adminForm,requirements:e.target.value})} />
                  </div>
                  <div className="admin-row">
                    <label className="admin-label">フラグ</label>
                    <div className="admin-checks">
                      {[["remote","リモート可"],["urgent","急募"],["highPay","高単価"],["lowExp","経験少なめOK"],["published","公開する"]].map(([key,label])=>(
                        <label key={key} className="admin-check">
                          <input type="checkbox" checked={adminForm[key]} onChange={e=>setAdminForm({...adminForm,[key]:e.target.checked})} /> {label}
                        </label>
                      ))}
                    </div>
                  </div>
                  <button className="admin-btn" onClick={handleSaveJob} disabled={adminLoading}>{adminLoading ? "保存中..." : editingJob ? "更新する" : "追加する"}</button>
                  {editingJob && <button className="admin-btn secondary" onClick={resetAdminForm}>キャンセル</button>}
                </div>
                <div className="admin-card">
                  <h3>📋 登録済み案件（{allJobs.length}件）</h3>
                  <div className="admin-job-list">
                    {allJobs.length === 0 && <div style={{textAlign:"center",color:"var(--gray500)",padding:40}}>まだ案件がありません</div>}
                    {allJobs.map(job=>(
                      <div key={job.id} className="admin-job-item">
                        <div className="admin-job-info">
                          <div className="admin-job-title">{job.title} <span className={`pub-badge ${job.published!==false?"on":"off"}`}>{job.published!==false?"公開中":"非公開"}</span></div>
                          <div className="admin-job-meta">{job.company} ・ {job.rate}</div>
                        </div>
                        <div className="admin-job-actions">
                          <button className={`admin-action-btn ${job.published!==false?"unpub":"pub"}`} onClick={()=>handleTogglePublish(job)}>{job.published!==false?"非公開":"公開"}</button>
                          <button className="admin-action-btn edit" onClick={()=>handleEditJob(job)}>編集</button>
                          <button className="admin-action-btn delete" onClick={()=>handleDeleteJob(job.id)}>削除</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {adminTab === "applications" && (
              <div>
                <h3 style={{fontSize:18,fontWeight:700,marginBottom:20}}>📨 応募者一覧（{adminApplications.length}件）</h3>
                {adminApplications.length === 0 && <div style={{background:"white",borderRadius:16,padding:60,textAlign:"center",color:"var(--gray500)"}}>まだ応募がありません</div>}
                {adminApplications.map(app=>(
                  <div key={app.id} className="app-card">
                    <div className="app-card-top">
                      <div className="app-card-title">{app.jobTitle}</div>
                      <span className={`status-badge ${app.status==="対応済み"?"done":"pending"}`}>{app.status||"未対応"}</span>
                    </div>
                    <div className="app-card-body">
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 24px",marginBottom:12}}>
                        <div><span style={{fontSize:11,fontWeight:700,color:"var(--gray500)"}}>応募者</span><br/>{app.userName}</div>
                        <div><span style={{fontSize:11,fontWeight:700,color:"var(--gray500)"}}>メール</span><br/>{app.userEmail}</div>
                        {app.profile?.experience && <div><span style={{fontSize:11,fontWeight:700,color:"var(--gray500)"}}>経験年数</span><br/>{app.profile.experience}</div>}
                        {app.profile?.desiredRate && <div><span style={{fontSize:11,fontWeight:700,color:"var(--gray500)"}}>希望単価</span><br/>{app.profile.desiredRate}</div>}
                        {app.profile?.desiredStyle && <div><span style={{fontSize:11,fontWeight:700,color:"var(--gray500)"}}>希望働き方</span><br/>{app.profile.desiredStyle}</div>}
                      </div>
                      {app.profile?.pr && <div style={{background:"var(--gray100)",borderRadius:8,padding:"10px 14px",fontSize:13,marginBottom:8}}><span style={{fontSize:11,fontWeight:700,color:"var(--gray500)",display:"block",marginBottom:4}}>自己PR</span>{app.profile.pr}</div>}
                      {app.message && <div style={{background:"var(--blue-soft)",borderRadius:8,padding:"10px 14px",fontSize:13}}><span style={{fontSize:11,fontWeight:700,color:"var(--blue)",display:"block",marginBottom:4}}>応募メッセージ</span>{app.message}</div>}
                    </div>
                    <div className="app-card-meta">{app.company} への応募</div>
                    <span className="chat-link" onClick={()=>setChatAppId(app.id)}>💬 メッセージを送る</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {toast && <div className="toast">{toast}</div>}

        {/* Chat Panel */}
        {chatAppId && (
          <div className="chat-overlay" onClick={e=>{if(e.target.className==="chat-overlay")setChatAppId(null);}}>
            <div className="chat-panel">
              <div className="chat-header">
                <div>
                  <div className="chat-header-title">💬 メッセージ</div>
                  <div className="chat-header-sub">{adminApplications.find(a=>a.id===chatAppId)?.jobTitle}</div>
                </div>
                <button className="chat-close" onClick={()=>setChatAppId(null)}>✕</button>
              </div>
              <div className="chat-messages">
                {chatMessages.length===0 && <div className="chat-empty"><div style={{fontSize:32}}>💬</div><div>まだメッセージはありません</div></div>}
                {chatMessages.map(msg=>(
                  <div key={msg.id} style={{display:"flex",flexDirection:"column",alignItems:msg.senderEmail===user?.email?"flex-end":"flex-start"}}>
                    <div className={`chat-bubble ${msg.senderEmail===user?.email?"mine":"theirs"}`}>
                      <div className="chat-bubble-name">{msg.isAdmin?"管理者":msg.senderName}</div>
                      {msg.text}
                      <div className="chat-bubble-time">{msg.sentAt?.toDate?.()?.toLocaleTimeString("ja-JP",{hour:"2-digit",minute:"2-digit"})||""}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="chat-input-area">
                <textarea className="chat-textarea" placeholder="メッセージを入力..." value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();handleSendMessage();}}} rows={1} />
                <button className="chat-send-btn" onClick={handleSendMessage}>送信</button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // EMPLOYER PAGE → consultation にリダイレクト
  if (page === "employer") {
    setPage("consultation");
    return null;
  }

  // GUEST JOBS PAGE（ログイン不要の案件一覧）
  if (page === "guest-jobs") {
    const allJobs = jobs.filter(j=>j.published!==false);
    const guestFiltered = allJobs.filter(j=>{
      const kw = guestSearch.toLowerCase();
      const matchKw = !kw || j.title.toLowerCase().includes(kw) || j.tags.some(t=>t.toLowerCase().includes(kw)) || j.company.toLowerCase().includes(kw);
      const matchRemote = !guestFilters.remote || j.remote;
      const matchUrgent = !guestFilters.urgent || j.urgent;
      const matchHighPay = !guestFilters.highPay || j.highPay;
      const matchLowExp = !guestFilters.lowExp || j.lowExp;
      const matchShortTime = !guestFilters.shortTime || j.period?.includes("週");
      const matchReward = !guestFilters.reward || j.type === "成果報酬";
      const matchMinRate = !guestFilters.minRate || extractMinRate(j.rate) >= guestFilters.minRate;
      return matchKw && matchRemote && matchUrgent && matchHighPay && matchLowExp && matchShortTime && matchReward && matchMinRate;
    }).sort((a,b)=>{
      if (guestFilters.sortBy === "rateDesc") return extractMinRate(b.rate) - extractMinRate(a.rate);
      if (guestFilters.sortBy === "rateAsc")  return extractMinRate(a.rate) - extractMinRate(b.rate);
      const da = a.createdAt?.seconds || new Date(a.posted||0).getTime()/1000;
      const db2 = b.createdAt?.seconds || new Date(b.posted||0).getTime()/1000;
      return db2 - da;
    });
    return (
      <>
        <style>{css}</style>
        <div style={{minHeight:"100vh",background:"var(--paper)"}}>
          {/* NAV */}
          <nav className="landing-nav">
            <div className="logo" onClick={()=>setPage("landing")}><div className="logo-mark">S</div>SalesBoard</div>
            <div className="nav-btns">
              <button className="btn-ghost" onClick={()=>setPage("landing")}>← トップへ</button>
              <button className="btn-ghost" onClick={()=>setPage("login")}>ログイン</button>
              <button className="btn-accent" onClick={()=>setPage("register")}>無料登録</button>
            </div>
          </nav>
          {/* ゲスト向けバナー */}
          <div style={{background:"linear-gradient(135deg,var(--brand) 0%,var(--brand-dark) 100%)",padding:"28px 40px",color:"white"}}>
            <div style={{maxWidth:900,margin:"0 auto"}}>
              <div style={{fontSize:13,opacity:0.85,marginBottom:6}}>📋 案件一覧（ログイン不要で閲覧可能）</div>
              <div style={{fontSize:22,fontWeight:800,marginBottom:8}}>掲載中の案件一覧</div>
              <div style={{fontSize:14,opacity:0.9,marginBottom:16}}>気になる案件は無料登録後すぐに応募できます。登録は30秒、利用料は完全無料です。</div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                <button style={{padding:"10px 24px",borderRadius:100,background:"white",color:"var(--brand-dark)",fontSize:14,fontWeight:700,border:"none",cursor:"pointer"}} onClick={()=>setPage("register")}>無料で登録して応募する →</button>
                <button style={{padding:"10px 24px",borderRadius:100,background:"transparent",color:"white",fontSize:14,fontWeight:600,border:"2px solid rgba(255,255,255,0.6)",cursor:"pointer"}} onClick={()=>setPage("login")}>ログイン</button>
              </div>
            </div>
          </div>
          {/* 案件リスト */}
          <div style={{maxWidth:960,margin:"0 auto",padding:"28px 24px"}}>
            {/* 検索・フィルター */}
            <div style={{background:"white",borderRadius:"var(--radius-lg)",border:"1px solid var(--gray200)",padding:"20px",boxShadow:"var(--shadow-sm)",marginBottom:20}}>
              {/* 検索バー */}
              <div style={{display:"flex",alignItems:"center",gap:10,background:"var(--gray50)",border:"1.5px solid var(--gray200)",borderRadius:10,padding:"10px 16px",marginBottom:14}}>
                <span style={{color:"var(--gray400)"}}>🔍</span>
                <input style={{border:"none",outline:"none",fontSize:14,fontFamily:"'Noto Sans JP',sans-serif",flex:1,background:"transparent"}} placeholder="キーワードで検索（例：SaaS、新規開拓、DX）" value={guestSearch} onChange={e=>setGuestSearch(e.target.value)} />
              </div>
              {/* フィルターボタン */}
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
                {[["remote","🏠 リモート可"],["urgent","⚡ 急募"],["highPay","💰 高単価"],["lowExp","🌱 未経験OK"],["shortTime","📅 週2日〜"],["reward","💎 成果報酬"]].map(([key,label])=>(
                  <button key={key} onClick={()=>setGuestFilters(f=>({...f,[key]:!f[key]}))} style={{padding:"8px 14px",borderRadius:100,fontSize:12,fontWeight:600,border:`1.5px solid ${guestFilters[key]?"var(--brand)":"var(--gray300)"}`,background:guestFilters[key]?"var(--brand-soft)":"white",color:guestFilters[key]?"var(--brand-dark)":"var(--gray700)",cursor:"pointer",transition:"all 0.15s"}}>{label}</button>
                ))}
              </div>
              {/* 単価スライダー */}
              <div style={{marginBottom:14}}>
                <div style={{fontSize:12,fontWeight:700,color:"var(--gray600)",marginBottom:6}}>
                  単価下限: <span style={{color:"var(--brand-dark)"}}>{guestFilters.minRate===0?"指定なし":`${guestFilters.minRate}万円/月 以上`}</span>
                </div>
                <input type="range" min={0} max={100} step={10} value={guestFilters.minRate}
                  onChange={e=>setGuestFilters(f=>({...f,minRate:Number(e.target.value)}))}
                  style={{width:"100%",accentColor:"var(--brand)",cursor:"pointer"}}
                />
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"var(--gray400)",marginTop:2}}>
                  <span>指定なし</span><span>50万円</span><span>100万円</span>
                </div>
              </div>
              {/* 並び順・結果数 */}
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
                <div style={{fontSize:13,color:"var(--gray600)"}}>検索結果: <strong style={{color:"var(--ink)"}}>{guestFiltered.length}件</strong></div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:12,color:"var(--gray500)",fontWeight:600}}>並び順：</span>
                  <select value={guestFilters.sortBy} onChange={e=>setGuestFilters(f=>({...f,sortBy:e.target.value}))} style={{fontSize:13,padding:"6px 12px",borderRadius:8,border:"1.5px solid var(--gray200)",background:"white",color:"var(--ink)",fontFamily:"'Noto Sans JP',sans-serif",cursor:"pointer",outline:"none"}}>
                    <option value="newest">掲載が新しい順</option>
                    <option value="rateDesc">単価が高い順</option>
                    <option value="rateAsc">単価が低い順</option>
                  </select>
                </div>
              </div>
            </div>
            {/* 案件カード */}
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              {guestFiltered.map(job=>{
                const vis = getJobVisual(job);
                return (
                  <div key={job.id} style={{background:"white",borderRadius:"var(--radius-lg)",border:"1px solid var(--gray200)",boxShadow:"var(--shadow-sm)",overflow:"hidden",transition:"all 0.25s"}}
                    onMouseEnter={e=>{e.currentTarget.style.boxShadow="var(--shadow-lg)";e.currentTarget.style.transform="translateY(-2px)";}}
                    onMouseLeave={e=>{e.currentTarget.style.boxShadow="var(--shadow-sm)";e.currentTarget.style.transform="translateY(0)";}}
                  >
                    {/* SOKUDANスタイルのバナー */}
                    <div style={{position:"relative",overflow:"hidden",cursor:"pointer"}} onClick={()=>setGuestSelectedJob(job)}>
                      <JobBannerSVG job={job} height={100}/>
                      <div style={{position:"absolute",top:10,right:10}}>
                        <span style={{background:"rgba(0,0,0,0.35)",color:"white",borderRadius:100,padding:"3px 10px",fontSize:11,fontWeight:600}}>{daysAgo(job.posted)}</span>
                      </div>
                    </div>
                    <div style={{padding:"14px 20px 8px",cursor:"pointer"}} onClick={()=>setGuestSelectedJob(job)}>
                      <div style={{fontSize:16,fontWeight:700,color:"var(--ink)",lineHeight:1.45,marginBottom:4}}>{job.title}</div>
                      <div style={{fontSize:12,color:"var(--gray500)",marginBottom:10}}>🏢 {job.company}</div>
                      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
                        <span style={{fontSize:11,fontWeight:700,padding:"2px 9px",borderRadius:100,background:"var(--brand-soft)",color:"var(--brand-dark)",border:"1px solid var(--brand-mid)"}}>{job.type}</span>
                        {job.remote&&<span className="badge remote">🏠 リモート</span>}
                        {job.urgent&&<span className="badge urgent">⚡ 急募</span>}
                        {job.highPay&&<span className="badge highpay">💰 高単価</span>}
                        {job.lowExp&&<span className="badge lowexp">🌱 未経験OK</span>}
                      </div>
                    </div>
                    <div style={{padding:"0 20px 16px"}}>
                      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
                        <span style={{padding:"4px 10px",borderRadius:6,fontSize:12,fontWeight:700,background:"var(--orange-soft)",color:"var(--orange)"}}>💴 {job.rate}</span>
                        <span style={{padding:"4px 10px",borderRadius:6,fontSize:12,background:"var(--gray100)",color:"var(--gray700)"}}>📍 {job.location}</span>
                        <span style={{padding:"4px 10px",borderRadius:6,fontSize:12,background:"var(--gray100)",color:"var(--gray700)"}}>📅 {job.period}</span>
                      </div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:14}}>
                        {job.tags.map(t=><span key={t} style={{padding:"3px 10px",borderRadius:100,fontSize:11,fontWeight:500,background:"var(--brand-soft)",color:"var(--brand-dark)",border:"1px solid var(--brand-mid)"}}>{t}</span>)}
                      </div>
                      <div style={{display:"flex",gap:8}}>
                        <button onClick={()=>setGuestSelectedJob(job)} style={{flex:1,padding:"10px",borderRadius:100,background:"var(--brand-soft)",border:"1.5px solid var(--brand-mid)",color:"var(--brand-dark)",fontSize:13,fontWeight:700,cursor:"pointer",transition:"all 0.15s"}}
                          onMouseEnter={e=>{e.currentTarget.style.background="var(--brand)";e.currentTarget.style.color="white";}}
                          onMouseLeave={e=>{e.currentTarget.style.background="var(--brand-soft)";e.currentTarget.style.color="var(--brand-dark)";}}>
                          詳細を見る
                        </button>
                        <button onClick={()=>{setSelectedJob(job);setPage("job-detail");}} style={{padding:"10px 16px",borderRadius:100,background:"var(--gray100)",border:"1.5px solid var(--gray200)",color:"var(--gray600)",fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}
                          title="別ページで詳細を開く"
                          onMouseEnter={e=>{e.currentTarget.style.background="var(--gray200)";}}
                          onMouseLeave={e=>{e.currentTarget.style.background="var(--gray100)";}}>
                          ↗ 別ページ
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {guestFiltered.length===0&&<div style={{textAlign:"center",padding:60,color:"var(--gray500)",background:"white",borderRadius:"var(--radius-lg)",border:"1px solid var(--gray200)"}}>
                <div style={{fontSize:40,marginBottom:12}}>📭</div>
                <div style={{fontSize:16,fontWeight:600}}>該当する案件が見つかりませんでした</div>
                <div style={{fontSize:13,marginTop:6}}>条件を変えてお試しください</div>
              </div>}
            </div>
            {/* 登録促進バナー */}
            <div style={{marginTop:32,padding:"28px 32px",background:"linear-gradient(135deg,var(--brand-soft),var(--brand-mid))",borderRadius:"var(--radius-lg)",border:"1px solid var(--brand-mid)",textAlign:"center"}}>
              <div style={{fontSize:18,fontWeight:700,color:"var(--ink)",marginBottom:8}}>気になる案件はありましたか？</div>
              <div style={{fontSize:14,color:"var(--gray700)",marginBottom:16}}>無料登録するだけで応募・担当エージェントとのやり取りが可能になります</div>
              <button style={{padding:"14px 40px",borderRadius:100,background:"var(--orange)",color:"white",fontSize:15,fontWeight:700,border:"none",cursor:"pointer",boxShadow:"0 4px 20px rgba(255,138,0,0.35)"}} onClick={()=>setPage("register")}>無料で登録して応募する →</button>
              <div style={{fontSize:12,color:"var(--gray500)",marginTop:10}}>登録・利用料は完全無料</div>
            </div>
          </div>
        </div>
        {/* ゲスト用案件詳細モーダル */}
        {guestSelectedJob&&(()=>{
          const vis = getJobVisual(guestSelectedJob);
          return (
          <div className="modal-overlay" onClick={()=>setGuestSelectedJob(null)}>
            <div className="modal" onClick={e=>e.stopPropagation()}>
              {/* SOKUDANスタイルのヘッダーバナー */}
              <div style={{position:"relative",overflow:"hidden",borderRadius:"var(--radius-xl) var(--radius-xl) 0 0"}}>
                <JobBannerSVG job={guestSelectedJob} height={150}/>
                <button className="modal-close" style={{position:"absolute",top:12,right:12,background:"rgba(0,0,0,0.4)",color:"white",border:"none"}} onClick={()=>setGuestSelectedJob(null)}>✕</button>
                <div style={{position:"absolute",bottom:14,left:20,display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:44,height:44,borderRadius:10,background:"white",boxShadow:"0 2px 8px rgba(0,0,0,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{vis.icon}</div>
                  <div>
                    <div style={{fontSize:12,color:"rgba(255,255,255,0.85)",fontWeight:600}}>{vis.label}業界</div>
                    <div style={{fontSize:14,color:"white",fontWeight:700}}>{guestSelectedJob.company}</div>
                  </div>
                </div>
                <button onClick={()=>{setSelectedJob(guestSelectedJob);setPage("job-detail");}} style={{position:"absolute",bottom:14,right:14,padding:"6px 12px",borderRadius:100,background:"rgba(255,255,255,0.2)",border:"1.5px solid rgba(255,255,255,0.5)",color:"white",fontSize:11,fontWeight:700,cursor:"pointer",backdropFilter:"blur(4px)"}}>
                  ↗ 全画面で見る
                </button>
              </div>
              <div className="modal-header" style={{paddingTop:16}}>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
                  <span className={`job-type ${guestSelectedJob.type==="成果報酬"?"reward":""}`}>{guestSelectedJob.type}</span>
                  {guestSelectedJob.remote&&<span className="badge remote">🏠 リモート</span>}
                  {guestSelectedJob.urgent&&<span className="badge urgent">⚡ 急募</span>}
                  {guestSelectedJob.highPay&&<span className="badge highpay">💰 高単価</span>}
                  {guestSelectedJob.lowExp&&<span className="badge lowexp">🌱 未経験OK</span>}
                </div>
                <h2 style={{fontSize:19,fontWeight:700,lineHeight:1.55,color:"var(--ink)",marginBottom:4}}>{guestSelectedJob.title}</h2>
                <div style={{fontSize:13,color:"var(--gray500)",display:"flex",alignItems:"center",gap:4,paddingBottom:16}}>🏢 {guestSelectedJob.company}</div>
              </div>
              <div className="modal-body">
                <div className="modal-rate-bar">
                  <div className="modal-rate-label">報酬</div>
                  <div className="modal-rate-value">{guestSelectedJob.rate}</div>
                </div>
                <div className="modal-detail-grid">
                  <div className="modal-detail-box"><div className="detail-label">📍 勤務地</div><div style={{fontSize:14,fontWeight:600,color:"var(--ink)",lineHeight:1.5}}>{guestSelectedJob.location}</div></div>
                  <div className="modal-detail-box"><div className="detail-label">📅 契約期間</div><div style={{fontSize:14,fontWeight:600,color:"var(--ink)",lineHeight:1.5}}>{guestSelectedJob.period}</div></div>
                  <div className="modal-detail-box"><div className="detail-label">🏠 働き方</div><div style={{fontSize:14,fontWeight:600,color:"var(--ink)",lineHeight:1.5}}>{guestSelectedJob.remote?"リモート可":"常駐"}</div></div>
                  <div className="modal-detail-box"><div className="detail-label">🏷️ 業界</div><div style={{fontSize:14,fontWeight:600,color:"var(--ink)",lineHeight:1.5}}>{guestSelectedJob.tags[0]||"営業"}</div></div>
                </div>
                <div className="modal-divider"/>
                <div className="detail-section"><div className="detail-label">📋 案件概要</div><div className="detail-text">{guestSelectedJob.description}</div></div>
                <div className="detail-section"><div className="detail-label">✅ 応募要件</div><div className="detail-text">{guestSelectedJob.requirements}</div></div>
                {/* 掲載企業情報 */}
                {guestSelectedJob.companyInfo && (
                  <div className="detail-section">
                    <div className="detail-label">🏢 掲載企業について</div>
                    <div style={{fontSize:14,color:"var(--gray700)",lineHeight:1.9,padding:"14px 16px",background:"var(--gray50)",borderRadius:10,marginTop:6,borderLeft:`4px solid ${getJobVisual(guestSelectedJob).accent}`}}>
                      {guestSelectedJob.companyInfo}
                    </div>
                  </div>
                )}
                <div className="detail-section"><div className="detail-label">🏷️ 関連タグ</div><div className="job-tags" style={{marginTop:6}}>{guestSelectedJob.tags.map(t=><span key={t} className="tag">{t}</span>)}</div></div>
                {/* 応募はログイン必須 */}
                <div style={{marginTop:20,padding:"20px 24px",background:"var(--brand-soft)",borderRadius:"var(--radius-md)",border:"1px solid var(--brand-mid)",textAlign:"center"}}>
                  <div style={{fontSize:14,fontWeight:600,color:"var(--ink)",marginBottom:10}}>この案件に応募するには無料登録が必要です</div>
                  <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
                    <button className="btn-apply" style={{width:"auto",padding:"12px 28px",marginTop:0}} onClick={()=>setPage("register")}>無料登録して応募する →</button>
                    <button style={{padding:"12px 24px",borderRadius:100,background:"transparent",border:"1.5px solid var(--gray300)",color:"var(--gray700)",fontSize:14,fontWeight:600,cursor:"pointer"}} onClick={()=>setPage("login")}>ログインして応募</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );})()}
      </>
    );
  }

  // LANDING PAGE
  if (page === "landing") {
    const featuredJobs = jobs.filter(j=>j.highPay && j.published!==false).slice(0,3);
    const sampleFeatured = SAMPLE_JOBS.filter(j=>j.highPay).slice(0,3);
    const displayJobs = featuredJobs.length > 0 ? featuredJobs : sampleFeatured;
    return (
      <>
        <style>{css}</style>
        <div className="page-landing" style={{background:"var(--paper)"}}>
          {/* NAV */}
          <nav className="landing-nav">
            <div className="logo"><div className="logo-mark">S</div>SalesBoard</div>
            <div style={{display:"flex",alignItems:"center",gap:20}}>
              <span style={{fontSize:13,color:"var(--gray500)",cursor:"pointer",fontWeight:500}} onClick={()=>setPage("consultation")}>採用担当者様はこちら</span>
              <span style={{fontSize:13,color:"var(--gray700)",cursor:"pointer",fontWeight:600}} onClick={()=>setPage("login")}>案件を探す</span>
              <div className="nav-btns">
                <button className="btn-ghost" onClick={()=>setPage("login")}>ログイン</button>
                <button className="btn-accent" onClick={()=>setPage("register")}>無料登録</button>
              </div>
            </div>
          </nav>

          {/* HERO */}
          <div className="hero-section">
            <div className="hero-left">
              <div className="hero-eyebrow">営業フリーランス専門マッチング</div>
              <h1 className="hero">
                あなたの営業スキルで<br/>
                <span className="highlight">自由な働き方</span>を<br/>実現しませんか
              </h1>
              <p className="hero-desc">SalesBoardは、営業フリーランス専門のマッチングサービス。高単価・リモート・副業OKな案件を厳選してご紹介します。</p>
              <div className="hero-trust">
                <span className="hero-trust-badge">高単価案件が豊富</span>
                <span className="hero-trust-badge">リモート案件多数</span>
                <span className="hero-trust-badge">週2日〜OK</span>
              </div>
              <div className="cta-buttons">
                <button className="btn-cta-primary" onClick={()=>setPage("register")}>無料で登録する →</button>
                <button className="btn-cta-secondary" onClick={()=>setPage("guest-jobs")}>案件一覧を見る</button>
              </div>
              <div style={{marginTop:10,fontSize:12,color:"var(--gray500)"}}>登録・利用料は完全無料 ・ 30秒で登録完了</div>
            </div>
            <div className="hero-right">
              <img src="/assets/hero.jpg" alt="営業フリーランスとして活躍する人材" />
            </div>
          </div>

          {/* CATEGORY BANNERS */}
          <div className="cat-strip">
            <div className="category-banners">
              {[
                {icon:"🏠",bg:"#EAF7EE",title:"リモート案件",sub:"場所を選ばず働ける"},
                {icon:"⚡",bg:"#FFF9E6",title:"急募案件",sub:"すぐに稼働できる"},
                {icon:"💰",bg:"#FFF0E6",title:"高単価案件",sub:"月60万円以上"},
                {icon:"🌱",bg:"#EDE9FE",title:"副業・週2日〜",sub:"本業と並行可能"},
              ].map(cat=>(
                <div key={cat.title} className="cat-banner" onClick={()=>setPage("register")}>
                  <div className="cat-banner-icon" style={{background:cat.bg}}>{cat.icon}</div>
                  <div className="cat-banner-text">
                    <div className="cat-banner-title">{cat.title}</div>
                    <div className="cat-banner-sub">{cat.sub}</div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gray400)" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
                </div>
              ))}
            </div>
          </div>

          {/* SalesBoardが選ばれる3つの理由 */}
          <div className="why-section">
            <div style={{textAlign:"center",marginBottom:60}}>
              <div style={{fontSize:12,fontWeight:700,color:"var(--brand)",letterSpacing:"2px",textTransform:"uppercase",marginBottom:12}}>Why SalesBoard</div>
              <div style={{fontSize:34,fontWeight:900,color:"var(--ink)",letterSpacing:"-0.6px",lineHeight:1.25}}>SalesBoardが選ばれる<br/>3つの理由</div>
            </div>
            <div className="why-grid">
              {[
                {
                  img:"/assets/high-value.jpg",
                  label:"HIGH VALUE",
                  title:"高単価案件が豊富",
                  desc:"月60万円〜の高単価案件を厳選して掲載。業務内容・スキルに見合った報酬で、フリーランスとして理想の収入を目指せます。"
                },
                {
                  img:"/assets/remote-work.jpg",
                  label:"REMOTE FIRST",
                  title:"リモート案件多数",
                  desc:"フルリモート〜週1出社まで、多様な働き方に対応した案件をラインナップ。場所を選ばず、自分のライフスタイルに合わせて活躍できます。"
                },
                {
                  img:"/assets/flexible-schedule.jpg",
                  label:"FLEXIBLE",
                  title:"週2日〜・副業OK",
                  desc:"週2日〜の稼働が可能な案件が多数。本業と並行しながら、自分のペースで着実にキャリアを広げられます。"
                },
              ].map((c,i)=>(
                <div key={i} className="why-card">
                  <div className="why-card-img">
                    <img src={c.img} alt={c.title} />
                  </div>
                  <div className="why-card-body">
                    <div className="why-label">{c.label}</div>
                    <div className="why-title">{c.title}</div>
                    <div className="why-desc">{c.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 登録から稼働開始まで */}
          <div className="flow-section">
            <div style={{textAlign:"center",marginBottom:52}}>
              <div style={{fontSize:12,fontWeight:700,color:"var(--brand)",letterSpacing:"2px",textTransform:"uppercase",marginBottom:12}}>How it works</div>
              <div style={{fontSize:34,fontWeight:900,color:"var(--ink)",letterSpacing:"-0.6px",lineHeight:1.25}}>登録から稼働開始まで</div>
              <div style={{fontSize:15,color:"var(--gray500)",marginTop:12,lineHeight:1.8}}>最短1週間でお仕事への参画が可能。シンプルな4ステップで始められます。</div>
            </div>

            {/* メインのフロー画像 */}
            <div className="flow-img-wrap">
              <img src="/assets/flow.jpg" alt="登録から稼働開始までの流れ" />
            </div>

            {/* 画像下のHTML補足ステップ */}
            <div className="flow-steps">
              {[
                {num:"1",badge:"30秒で完了",title:"基本情報を登録",desc:"メールアドレスだけで登録完了。必要な情報はあとから入力できます。"},
                {num:"2",badge:"面談率UP",title:"経歴・スキルを入力",desc:"得意分野や実績を入力。充実した情報が企業とのマッチング精度を高めます。"},
                {num:"3",badge:"応募上限なし",title:"希望案件へ応募",desc:"興味のある案件に何件でも応募OK。担当がしっかりサポートします。"},
                {num:"4",badge:"最短翌週〜",title:"面談・稼働スタート",desc:"条件が合えばそのまま契約へ。スピーディーに稼働開始できます。"},
              ].map((s,i)=>(
                <div key={i} className="flow-step">
                  <div className="flow-badge">{s.badge}</div>
                  <div className="flow-step-num">{s.num}</div>
                  <div className="flow-step-title">{s.title}</div>
                  <div className="flow-step-desc">{s.desc}</div>
                </div>
              ))}
            </div>

            <div style={{textAlign:"center",marginTop:52}}>
              <button className="btn-cta-primary" onClick={()=>setPage("register")}>無料で会員登録する →</button>
              <div style={{fontSize:13,color:"var(--gray400)",marginTop:14}}>登録費用・利用料は一切無料です</div>
            </div>
          </div>

          {/* CASES */}
          <div style={{background:"var(--white)",padding:"96px 40px"}}>
            <div style={{maxWidth:1060,margin:"0 auto"}}>
              <div style={{marginBottom:44}}>
                <div className="section-eyebrow">Case Examples</div>
                <div className="section-title">ご紹介案件例</div>
                <div className="section-subtitle">高単価・リモート・フレックスなど、あなたの希望に合った案件をご紹介します</div>
              </div>
              <div className="cases-grid">
                {displayJobs.map(job=>(
                  <div key={job.id} className="case-card" onClick={()=>setPage("register")}>
                    <div className="case-card-banner">
                      <div className="case-card-top">
                        {job.tags.slice(0,2).map(t=><span key={t} className="case-industry">{t}</span>)}
                        <span className="case-type-badge">{job.type}</span>
                      </div>
                      <div className="case-title">{job.title}</div>
                    </div>
                    <div className="case-card-body">
                      <div className="case-detail-row">
                        <div className="case-detail-item"><div className="case-detail-label">単価</div><div className="case-detail-value rate">{job.rate}</div></div>
                        <div className="case-detail-item"><div className="case-detail-label">働き方</div><div className="case-detail-value">{job.remote?"リモート可":"常駐"}</div></div>
                        <div className="case-detail-item"><div className="case-detail-label">期間</div><div className="case-detail-value">{job.period}</div></div>
                      </div>
                      <div className="case-section-label">職務内容</div>
                      <div className="case-desc">{job.description}</div>
                      <div className="case-divider"/>
                      <div className="case-section-label">活かせるスキル</div>
                      <div className="case-skills">{job.requirements.split("、").slice(0,3).map((r,i)=><span key={i} className="case-skill">{r}</span>)}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="cases-cta" style={{marginTop:32}}>
                <div className="cases-cta-title">登録後すべての案件が閲覧できます</div>
                <div className="cases-cta-sub">無料・1分で登録完了</div>
                <button className="btn-cta-primary" onClick={()=>setPage("register")}>無料で会員登録して案件を見る →</button>
              </div>
            </div>
          </div>

          {/* 他社比較テーブル */}
          <div style={{background:"var(--white)",borderTop:"1px solid var(--gray200)",padding:"80px 40px"}}>
            <div style={{maxWidth:800,margin:"0 auto"}}>
              <div style={{textAlign:"center",marginBottom:44}}>
                <div className="section-eyebrow">Comparison</div>
                <div className="section-title">他社サービスとの比較</div>
                <div className="section-subtitle">営業フリーランスに特化した圧倒的な強み</div>
              </div>
              <div style={{borderRadius:20,overflow:"hidden",border:"1px solid var(--gray200)",boxShadow:"0 4px 24px rgba(0,0,0,0.06)"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead>
                    <tr style={{background:"var(--gray50)"}}>
                      <th style={{padding:"16px 24px",textAlign:"left",fontSize:12,fontWeight:700,color:"var(--gray500)",letterSpacing:"0.5px",textTransform:"uppercase",borderBottom:"2px solid var(--gray200)",width:"38%"}}>比較項目</th>
                      <th style={{padding:"16px 20px",textAlign:"center",fontSize:14,fontWeight:800,color:"var(--brand-dark)",background:"var(--brand-soft)",borderBottom:"2px solid var(--brand)",width:"20%"}}>
                        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                          <span style={{fontSize:18}}>🌟</span>
                          <span>SalesBoard</span>
                        </div>
                      </th>
                      <th style={{padding:"16px 20px",textAlign:"center",fontSize:13,fontWeight:600,color:"var(--gray400)",borderBottom:"2px solid var(--gray200)",width:"21%"}}>A社<div style={{fontSize:11,fontWeight:400,marginTop:2}}>総合型</div></th>
                      <th style={{padding:"16px 20px",textAlign:"center",fontSize:13,fontWeight:600,color:"var(--gray400)",borderBottom:"2px solid var(--gray200)",width:"21%"}}>B社<div style={{fontSize:11,fontWeight:400,marginTop:2}}>大手</div></th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["🎯 営業職に完全特化",true,false,false],
                      ["🏠 フルリモート案件あり",true,true,false],
                      ["💴 高単価案件（専門領域）",true,true,false],
                      ["📅 週2日〜の副業案件",true,false,true],
                      ["👤 専任エージェントサポート",true,false,false],
                      ["✅ 登録・利用料は無料",true,true,true],
                    ].map(([label,sb,a,b],i)=>(
                      <tr key={i} style={{borderBottom:"1px solid var(--gray200)",background: i%2===0 ? "var(--white)" : "var(--gray50)"}}>
                        <td style={{padding:"14px 24px",fontSize:14,fontWeight:500,color:"var(--ink)"}}>{label}</td>
                        <td style={{padding:"14px 20px",textAlign:"center",background:"rgba(36,166,74,0.05)"}}>
                          {sb
                            ? <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:26,height:26,borderRadius:"50%",background:"var(--brand)",color:"white",fontSize:14,fontWeight:800}}>✓</span>
                            : <span style={{color:"var(--gray300)",fontSize:16,fontWeight:500}}>—</span>}
                        </td>
                        <td style={{padding:"14px 20px",textAlign:"center"}}>
                          <span style={{fontSize:16,color:a?"var(--gray600)":"var(--gray200)",fontWeight:a?500:400}}>{a?"✓":"—"}</span>
                        </td>
                        <td style={{padding:"14px 20px",textAlign:"center"}}>
                          <span style={{fontSize:16,color:b?"var(--gray600)":"var(--gray200)",fontWeight:b?500:400}}>{b?"✓":"—"}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{textAlign:"center",marginTop:28}}>
                <button className="btn-cta-primary" onClick={()=>setPage("register")}>無料で登録する →</button>
              </div>
            </div>
          </div>

          {/* フッター */}
          <footer style={{background:"#111827",color:"rgba(255,255,255,0.5)",padding:"52px 40px 36px"}}>
            <div style={{maxWidth:900,margin:"0 auto"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:40,flexWrap:"wrap",marginBottom:40}}>
                <div>
                  <div style={{fontFamily:"'Outfit',sans-serif",fontWeight:800,color:"white",fontSize:22,marginBottom:10,letterSpacing:"-0.5px"}}>
                    <span style={{display:"inline-flex",alignItems:"center",gap:8}}><span style={{width:28,height:28,borderRadius:7,background:"var(--brand)",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:900,color:"white"}}>S</span>SalesBoard</span>
                  </div>
                  <div style={{fontSize:13,color:"rgba(255,255,255,0.45)",lineHeight:1.7,maxWidth:260}}>営業フリーランス専門の<br/>案件紹介プラットフォーム</div>
                </div>
                <div style={{display:"flex",gap:60,flexWrap:"wrap"}}>
                  <div>
                    <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:14}}>フリーランスの方</div>
                    <div style={{display:"flex",flexDirection:"column",gap:10}}>
                      <span style={{cursor:"pointer",color:"rgba(255,255,255,0.65)",fontSize:13,transition:"color 0.2s"}} onClick={()=>setPage("guest-jobs")}>案件一覧（ログイン不要）</span>
                      <span style={{cursor:"pointer",color:"rgba(255,255,255,0.65)",fontSize:13}} onClick={()=>setPage("register")}>無料登録</span>
                      <span style={{cursor:"pointer",color:"rgba(255,255,255,0.65)",fontSize:13}} onClick={()=>setPage("login")}>ログイン</span>
                    </div>
                  </div>
                  <div>
                    <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:14}}>採用担当者様</div>
                    <div style={{display:"flex",flexDirection:"column",gap:10}}>
                      <span style={{cursor:"pointer",color:"rgba(255,255,255,0.65)",fontSize:13}} onClick={()=>setPage("consultation")}>案件掲載相談</span>
                      <span style={{cursor:"pointer",color:"rgba(255,255,255,0.65)",fontSize:13}} onClick={()=>setPage("consultation")}>無料掲載のご案内</span>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{borderTop:"1px solid rgba(255,255,255,0.08)",paddingTop:24,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
                <div style={{fontSize:12,color:"rgba(255,255,255,0.3)"}}>© 2026 SalesBoard / ジェイコンサルティング株式会社</div>
                <div style={{fontSize:12,color:"rgba(255,255,255,0.3)"}}>All rights reserved.</div>
              </div>
            </div>
          </footer>
        </div>
        {toast && <div className="toast">{toast}</div>}
      </>
    );
  }


  // JOB DETAIL PAGE（案件詳細フルページ）
  if (page === "job-detail" && selectedJob) {
    const vis = getJobVisual(selectedJob);
    const isApplied = appliedJobs.includes(selectedJob.id);
    return (
      <>
        <style>{css}</style>
        <div style={{minHeight:"100vh",background:"var(--paper)"}}>
          {/* NAV */}
          <nav className="landing-nav">
            <div className="logo" style={{cursor:"pointer"}} onClick={()=>{setPage(user?"dashboard":"guest-jobs");}}><div className="logo-mark">S</div>SalesBoard</div>
            <div className="nav-btns">
              <button className="btn-ghost" onClick={()=>{setPage(user?"dashboard":"guest-jobs");}}>← 案件一覧に戻る</button>
              {user ? (
                <button className="btn-accent" onClick={()=>setShowApplyModal(true)} disabled={isApplied}>{isApplied?"✓ 応募済み":"この案件に応募する"}</button>
              ) : (
                <button className="btn-accent" onClick={()=>setPage("register")}>無料登録して応募する</button>
              )}
            </div>
          </nav>

          {/* ヘッダーバナー（SOKUDAN風） */}
          <div style={{position:"relative",overflow:"hidden"}}>
            <JobBannerSVG job={selectedJob} height={220}/>
            {/* 会社ロゴプレート */}
            <div style={{position:"absolute",bottom:20,left:32,display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:52,height:52,borderRadius:12,background:"white",boxShadow:"0 2px 12px rgba(0,0,0,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>
                {vis.icon}
              </div>
              <div>
                <div style={{fontSize:12,color:"rgba(255,255,255,0.8)",fontWeight:600}}>{vis.label}業界</div>
                <div style={{fontSize:14,color:"white",fontWeight:700}}>{selectedJob.company}</div>
              </div>
            </div>
          </div>

          {/* メインコンテンツ */}
          <div style={{maxWidth:860,margin:"0 auto",padding:"32px 24px 60px",display:"grid",gridTemplateColumns:"1fr 300px",gap:28,alignItems:"start"}}>

            {/* 左：案件詳細 */}
            <div>
              {/* バッジ行 */}
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
                <span className={`job-type ${selectedJob.type==="成果報酬"?"reward":""}`}>{selectedJob.type}</span>
                {selectedJob.remote&&<span className="badge remote">🏠 リモート</span>}
                {selectedJob.urgent&&<span className="badge urgent">⚡ 急募</span>}
                {selectedJob.highPay&&<span className="badge highpay">💰 高単価</span>}
                {selectedJob.lowExp&&<span className="badge lowexp">🌱 未経験OK</span>}
              </div>

              {/* タイトル */}
              <h1 style={{fontSize:24,fontWeight:800,lineHeight:1.5,color:"var(--ink)",marginBottom:8}}>{selectedJob.title}</h1>
              <div style={{fontSize:13,color:"var(--gray500)",marginBottom:24,display:"flex",alignItems:"center",gap:6}}>
                🏢 {selectedJob.company} ・ {daysAgo(selectedJob.posted)}掲載
              </div>

              {/* 基本情報グリッド */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,marginBottom:28,padding:"20px",background:"var(--white)",borderRadius:16,border:"1px solid var(--gray200)",boxShadow:"var(--shadow-sm)"}}>
                {[
                  {icon:"💴",label:"報酬",val:selectedJob.rate,color:"var(--orange)",bold:true},
                  {icon:"📍",label:"勤務地",val:selectedJob.location},
                  {icon:"📅",label:"契約期間",val:selectedJob.period},
                  {icon:"🏠",label:"働き方",val:selectedJob.remote?"リモート可":"常駐"},
                ].map((item,i)=>(
                  <div key={i} style={{padding:"14px 16px",background:"var(--gray50)",borderRadius:10,border:"1px solid var(--gray200)"}}>
                    <div style={{fontSize:11,fontWeight:700,color:"var(--gray500)",marginBottom:4,display:"flex",alignItems:"center",gap:4}}>{item.icon} {item.label}</div>
                    <div style={{fontSize:item.bold?18:14,fontWeight:item.bold?800:600,color:item.color||"var(--ink)",lineHeight:1.4}}>{item.val}</div>
                  </div>
                ))}
              </div>

              {/* タブ風セクション */}
              {[
                {label:"📋 案件概要",content:selectedJob.description},
                {label:"✅ 応募要件・スキル",content:selectedJob.requirements},
              ].map((sec,i)=>(
                <div key={i} style={{marginBottom:24,background:"var(--white)",borderRadius:16,border:"1px solid var(--gray200)",overflow:"hidden",boxShadow:"var(--shadow-sm)"}}>
                  <div style={{padding:"16px 24px",borderBottom:"1px solid var(--gray200)",background:"var(--gray50)"}}>
                    <div style={{fontSize:15,fontWeight:700,color:"var(--ink)"}}>{sec.label}</div>
                  </div>
                  <div style={{padding:"20px 24px",fontSize:14,lineHeight:1.9,color:"var(--gray700)",whiteSpace:"pre-wrap",wordBreak:"break-word"}}>{sec.content}</div>
                </div>
              ))}

              {/* 関連タグ */}
              <div style={{marginBottom:24}}>
                <div style={{fontSize:13,fontWeight:700,color:"var(--gray500)",marginBottom:10}}>🏷️ 関連タグ</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                  {selectedJob.tags.map(t=><span key={t} className="tag" style={{fontSize:13,padding:"5px 14px"}}>{t}</span>)}
                </div>
              </div>

              {/* 会社情報 */}
              <div style={{background:"var(--white)",borderRadius:16,border:"1px solid var(--gray200)",overflow:"hidden",boxShadow:"var(--shadow-sm)"}}>
                <div style={{padding:"16px 24px",borderBottom:"1px solid var(--gray200)",background:"var(--gray50)"}}>
                  <div style={{fontSize:15,fontWeight:700,color:"var(--ink)"}}>🏢 掲載企業について</div>
                </div>
                <div style={{padding:"20px 24px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
                    <div style={{width:64,height:64,borderRadius:16,background:vis.bg,border:`2px solid ${vis.accent}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32}}>{vis.icon}</div>
                    <div>
                      <div style={{fontSize:18,fontWeight:700,color:"var(--ink)"}}>{selectedJob.company}</div>
                      <div style={{fontSize:13,color:vis.accent,fontWeight:600,marginTop:2}}>{vis.label}業界</div>
                    </div>
                  </div>
                  {selectedJob.companyInfo ? (
                    <div style={{fontSize:14,color:"var(--gray700)",lineHeight:1.9,padding:"16px 18px",background:"var(--gray50)",borderRadius:12,borderLeft:`4px solid ${vis.accent}`}}>
                      {selectedJob.companyInfo}
                    </div>
                  ) : (
                    <div style={{fontSize:13,color:"var(--gray600)",lineHeight:1.8,padding:"14px 16px",background:"var(--gray50)",borderRadius:10}}>
                      本案件はSalesBoardを通じて掲載されています。企業の詳細情報・担当者へのご質問は、応募後にエージェントを通じてお伝えします。
                    </div>
                  )}
                  <div style={{marginTop:14,padding:"12px 16px",background:"var(--brand-soft)",borderRadius:10,border:"1px solid var(--brand-mid)",fontSize:13,color:"var(--brand-dark)"}}>
                    💬 企業への質問は、応募後に担当エージェントを通じてお伝えできます
                  </div>
                </div>
              </div>
            </div>

            {/* 右：サイドバー（固定CTA） */}
            <div style={{position:"sticky",top:90}}>
              <div style={{background:"var(--white)",borderRadius:16,border:"1px solid var(--gray200)",padding:"24px",boxShadow:"var(--shadow-md)",marginBottom:16}}>
                <div style={{fontSize:13,fontWeight:700,color:"var(--gray500)",marginBottom:4}}>報酬</div>
                <div style={{fontSize:22,fontWeight:800,color:"var(--orange)",marginBottom:20,lineHeight:1.3}}>{selectedJob.rate}</div>
                {user ? (
                  <>
                    {isApplied ? (
                      <div style={{padding:"14px",textAlign:"center",background:"var(--brand-soft)",borderRadius:100,color:"var(--brand-dark)",fontWeight:700,border:"1.5px solid var(--brand-mid)"}}>✓ 応募済みです</div>
                    ) : (
                      <button className="btn-apply" style={{marginTop:0}} onClick={()=>setShowApplyModal(true)}>この案件に応募する →</button>
                    )}
                  </>
                ) : (
                  <div>
                    <button className="btn-apply" style={{marginTop:0}} onClick={()=>setPage("register")}>無料登録して応募する →</button>
                    <div style={{textAlign:"center",marginTop:10,fontSize:12,color:"var(--gray500)"}}>登録・利用料は完全無料</div>
                  </div>
                )}
              </div>
              {/* 案件情報サマリー */}
              <div style={{background:"var(--white)",borderRadius:16,border:"1px solid var(--gray200)",padding:"20px",boxShadow:"var(--shadow-sm)"}}>
                <div style={{fontSize:13,fontWeight:700,color:"var(--gray500)",marginBottom:12}}>📊 案件情報</div>
                {[
                  ["契約形態",selectedJob.type],
                  ["稼働期間",selectedJob.period],
                  ["勤務地",selectedJob.location],
                  ["リモート",selectedJob.remote?"リモート可":"常駐"],
                  ["掲載日",daysAgo(selectedJob.posted)],
                ].map(([k,v])=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid var(--gray100)",fontSize:13}}>
                    <span style={{color:"var(--gray500)"}}>{k}</span>
                    <span style={{fontWeight:600,color:"var(--ink)"}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 応募モーダル */}
        {showApplyModal && selectedJob && (
          <div className="modal-overlay" onClick={()=>setShowApplyModal(false)}>
            <div className="modal" style={{maxWidth:500}} onClick={e=>e.stopPropagation()}>
              <div className="modal-header">
                <button className="modal-close" onClick={()=>setShowApplyModal(false)}>✕</button>
                <h2 style={{fontSize:20,fontWeight:700,paddingRight:40}}>応募する</h2>
                <div style={{fontSize:14,color:"var(--gray500)",marginTop:4}}>{selectedJob.title}</div>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">自己PR・メッセージ</label>
                  <textarea className="apply-textarea" placeholder="これまでの営業経験やアピールポイントを記入してください..." value={applyMsg} onChange={e=>setApplyMsg(e.target.value)} />
                </div>
                <button className="btn-apply" onClick={handleApply}>応募を送信する</button>
              </div>
            </div>
          </div>
        )}
        {toast && <div className="toast">{toast}</div>}
      </>
    );
  }

  // CONSULTATION PAGE（案件掲載相談）
  if (page === "consultation") {
    return (
      <>
        <style>{css}</style>
        <div className="consult-page">
          {/* NAV */}
          <nav className="landing-nav">
            <div className="logo" onClick={()=>setPage("landing")}><div className="logo-mark">S</div>SalesBoard</div>
            <div style={{display:"flex",alignItems:"center",gap:16}}>
              <span style={{fontSize:13,color:"var(--gray700)",cursor:"pointer",fontWeight:600}} onClick={()=>setPage("login")}>案件を探す（求職者）</span>
              <button className="btn-ghost" onClick={()=>setPage("login")}>ログイン</button>
              <button className="btn-accent" onClick={()=>setPage("register")}>無料登録</button>
            </div>
          </nav>

          {/* HERO */}
          <div className="consult-hero">
            <div style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:12,fontWeight:700,color:"var(--brand)",background:"var(--brand-soft)",padding:"5px 14px",borderRadius:100,marginBottom:16}}>採用担当者様向け</div>
            <h1 style={{fontSize:38,fontWeight:900,color:"var(--ink)",lineHeight:1.35,marginBottom:16,letterSpacing:"-0.5px"}}>優秀な営業フリーランスと<br/><span style={{color:"var(--brand)"}}>マッチングしませんか？</span></h1>
            <p style={{fontSize:15,color:"var(--gray500)",lineHeight:1.9,maxWidth:540,margin:"0 auto 32px"}}>SalesBoardには即戦力の営業フリーランスが多数登録しています。<br/>まずはお気軽にご相談ください。担当者より1営業日以内にご連絡します。</p>
            {/* 3つのポイント */}
            <div style={{display:"flex",gap:24,justifyContent:"center",flexWrap:"wrap",marginTop:8}}>
              {[
                {icon:"⚡",text:"最短1週間で稼働開始"},
                {icon:"💼",text:"即戦力の営業プロのみ"},
                {icon:"✉️",text:"相談・掲載費用は無料"},
              ].map((p,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:8,background:"var(--brand-soft)",border:"1px solid var(--brand-mid)",borderRadius:100,padding:"8px 18px",fontSize:14,fontWeight:600,color:"var(--brand-dark)"}}>
                  <span>{p.icon}</span><span>{p.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* FORM */}
          <div className="consult-form-wrap">
            <div className="consult-card">
              <h2 style={{fontSize:22,fontWeight:800,color:"var(--ink)",marginBottom:6}}>案件掲載・相談フォーム</h2>
              <p style={{fontSize:13,color:"var(--gray500)",marginBottom:28,lineHeight:1.7}}>以下のフォームにご記入いただくか、直接メールにてお問い合わせください。<br/>
                <a href="mailto:info@jcon.co.jp" style={{color:"var(--brand)",fontWeight:700}}>info@jcon.co.jp</a>
              </p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
                <div className="form-group" style={{marginBottom:0}}>
                  <label className="form-label">会社名 <span className="req">*</span></label>
                  <input className="form-input" placeholder="株式会社〇〇" value={consultForm.company} onChange={e=>setConsultForm(f=>({...f,company:e.target.value}))} />
                </div>
                <div className="form-group" style={{marginBottom:0}}>
                  <label className="form-label">ご担当者名 <span className="req">*</span></label>
                  <input className="form-input" placeholder="山田 太郎" value={consultForm.name} onChange={e=>setConsultForm(f=>({...f,name:e.target.value}))} />
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
                <div className="form-group" style={{marginBottom:0}}>
                  <label className="form-label">メールアドレス <span className="req">*</span></label>
                  <input className="form-input" type="email" placeholder="taro@example.com" value={consultForm.email} onChange={e=>setConsultForm(f=>({...f,email:e.target.value}))} />
                </div>
                <div className="form-group" style={{marginBottom:0}}>
                  <label className="form-label">電話番号</label>
                  <input className="form-input" placeholder="03-0000-0000" value={consultForm.phone} onChange={e=>setConsultForm(f=>({...f,phone:e.target.value}))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">募集したい営業の種類</label>
                <select className="form-select" value={consultForm.jobType} onChange={e=>setConsultForm(f=>({...f,jobType:e.target.value}))}>
                  <option value="">選択してください</option>
                  {["新規開拓営業","ルート営業","インサイドセールス","カスタマーサクセス","営業マネージャー","その他"].map(v=><option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
                <div className="form-group" style={{marginBottom:0}}>
                  <label className="form-label">募集人数</label>
                  <select className="form-select" value={consultForm.headcount} onChange={e=>setConsultForm(f=>({...f,headcount:e.target.value}))}>
                    <option value="">選択してください</option>
                    {["1名","2〜3名","4〜5名","5名以上","未定"].map(v=><option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{marginBottom:0}}>
                  <label className="form-label">想定予算（月額）</label>
                  <select className="form-select" value={consultForm.budget} onChange={e=>setConsultForm(f=>({...f,budget:e.target.value}))}>
                    <option value="">選択してください</option>
                    {["〜30万円","30〜50万円","50〜80万円","80万円以上","応相談"].map(v=><option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">その他・ご要望</label>
                <textarea className="form-input" rows={4} placeholder="業種、必要なスキル、稼働条件など、ご自由にご記入ください" style={{resize:"vertical",lineHeight:1.7}} value={consultForm.message} onChange={e=>setConsultForm(f=>({...f,message:e.target.value}))} />
              </div>
              <button className="btn-submit" onClick={handleConsult} disabled={consultSending} style={{opacity:consultSending?0.7:1,cursor:consultSending?"not-allowed":"pointer"}}>
                {consultSending ? "送信中..." : "送信する（無料）"}
              </button>
              <p style={{fontSize:12,color:"var(--gray400)",textAlign:"center",marginTop:16}}>送信後、担当者（oshita@jcon.co.jp）より1営業日以内にご連絡いたします。</p>
            </div>

            {/* 実績紹介 */}
            <div style={{marginTop:32,background:"var(--white)",borderRadius:14,border:"1px solid var(--gray200)",padding:"28px 32px",boxShadow:"var(--shadow-sm)"}}>
              <div style={{fontSize:13,fontWeight:700,color:"var(--brand)",marginBottom:12}}>SalesBoardが選ばれる理由</div>
              {[
                "✅ 即戦力の営業フリーランスが多数登録",
                "✅ 案件掲載・初期費用は完全無料",
                "✅ 営業特化のため的確なマッチングが可能",
                "✅ 担当エージェントが採用まで一貫サポート",
              ].map((t,i)=>(
                <div key={i} style={{fontSize:14,color:"var(--gray700)",padding:"8px 0",borderBottom:i<3?"1px solid var(--gray200)":"none"}}>{t}</div>
              ))}
            </div>
          </div>

          <div className="landing-footer">
            <div className="footer-logo">SalesBoard</div>
            <div>© 2026 SalesBoard. All rights reserved.</div>
          </div>
        </div>
        {toast && <div className="toast">{toast}</div>}
      </>
    );
  }

  // REGISTER
  if (page === "register") {
    return (
      <>
        <style>{css}</style>
        <div className="auth-page">
          <div className="auth-card">
            <div className="auth-back" onClick={()=>setPage("landing")}>← トップに戻る</div>
            <h2>フリーランス登録</h2>
            <p className="subtitle">まずは無料登録して案件を探しましょう</p>
            <div className="form-group"><label className="form-label">お名前<span className="req">*</span></label><input className="form-input" placeholder="山田 太郎" value={regForm.name} onChange={e=>setRegForm({...regForm,name:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">メールアドレス<span className="req">*</span></label><input className="form-input" type="email" placeholder="taro@example.com" value={regForm.email} onChange={e=>setRegForm({...regForm,email:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">パスワード<span className="req">*</span></label><input className="form-input" type="password" placeholder="6文字以上" value={regForm.password} onChange={e=>setRegForm({...regForm,password:e.target.value})} /></div>
            <div className="form-group">
              <label className="form-label">営業経験年数</label>
              <select className="form-select" value={regForm.experience} onChange={e=>setRegForm({...regForm,experience:e.target.value})}>
                <option value="">選択してください</option>
                {["1年未満","1〜3年","3〜5年","5〜10年","10年以上"].map(v=><option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">得意業界（複数選択可）</label>
              <div className="chip-group">
                {["IT","SaaS","人材","不動産","広告","医療","金融","保険","飲食","DX","コンサル","EC"].map(ind=>(
                  <div key={ind} className={`chip ${regForm.specialties.includes(ind)?"active":""}`} onClick={()=>setRegForm(prev=>({...prev,specialties:prev.specialties.includes(ind)?prev.specialties.filter(s=>s!==ind):[...prev.specialties,ind]}))}>
                    {ind}
                  </div>
                ))}
              </div>
            </div>
            {authError && <div className="error-box">{authError}</div>}
            <button className="btn-submit" onClick={handleRegister}>無料登録する</button>
            <div className="auth-switch">すでにアカウントをお持ちの方は <span onClick={()=>setPage("login")}>ログイン</span></div>
          </div>
        </div>
        {toast && <div className="toast">{toast}</div>}
      </>
    );
  }

  // LOGIN
  if (page === "login") {
    return (
      <>
        <style>{css}</style>
        <div className="auth-page">
          <div className="auth-card">
            <div className="auth-back" onClick={()=>setPage("landing")}>← トップに戻る</div>
            <h2>ログイン</h2>
            <p className="subtitle">アカウントにログインして案件を探しましょう</p>
            <div className="form-group"><label className="form-label">メールアドレス</label><input className="form-input" type="email" placeholder="taro@example.com" value={loginForm.email} onChange={e=>setLoginForm({...loginForm,email:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">パスワード</label><input className="form-input" type="password" placeholder="パスワード" value={loginForm.password} onChange={e=>setLoginForm({...loginForm,password:e.target.value})} /></div>
            {authError && <div className="error-box">{authError}</div>}
            <button className="btn-submit" onClick={handleLogin}>ログイン</button>
            <div className="auth-switch">アカウントをお持ちでない方は <span onClick={()=>setPage("register")}>無料登録</span></div>
          </div>
        </div>
        {toast && <div className="toast">{toast}</div>}
      </>
    );
  }


  // DASHBOARD
  return (
    <>
      <style>{css}</style>
      <div className="dashboard">
        <nav className="dash-nav">
          <div className="logo" style={{color:"var(--ink)"}} onClick={()=>setPage("landing")}>
            <div className="logo-mark">S</div>SalesBoard
          </div>
          <div className="dash-nav-right">
            <div className="applied-count">✓ 応募済み {appliedJobs.length}件</div>
            <div className="user-pill" onClick={()=>setMenuOpen(!menuOpen)}>
              <div className="user-avatar">{user?.name?.[0]||"U"}</div>
              <span className="user-name">{user?.name||"ユーザー"}</span>
              {menuOpen && (
                <div className="dropdown">
                  <div className="dropdown-item" onClick={()=>{setDashTab("mypage");setMenuOpen(false);}}>マイページ</div>
                  <div className="dropdown-item" onClick={()=>{setDashTab("history");setMenuOpen(false);}}>応募履歴</div>
                  {isAdmin && <div className="dropdown-item admin-link" onClick={()=>{setPage("admin");setMenuOpen(false);}}>⚙️ 管理者画面</div>}
                  <div className="dropdown-item danger" onClick={handleLogout}>ログアウト</div>
                </div>
              )}
            </div>
          </div>
        </nav>

        <div className="dash-tabs">
          {[["jobs","案件を探す"],["mypage","マイページ"],["history","応募履歴"]].map(([t,l])=>(
            <div key={t}
              className={`dash-tab ${dashTab===t?"active":""} ${t==="jobs"&&!isProfileComplete?"disabled":""}`}
              onClick={()=>{
                if(t==="jobs"&&!isProfileComplete){
                  showToast("プロフィール・経歴を入力してから案件を見られます");
                  setDashTab("mypage");
                } else {
                  setDashTab(t);
                }
              }}
              style={t==="jobs"&&!isProfileComplete?{color:"var(--gray300)",cursor:"default",position:"relative"}:{}}
            >
              {l}
              {t==="jobs"&&!isProfileComplete&&<span style={{fontSize:10,background:"var(--accent)",color:"white",borderRadius:4,padding:"1px 5px",marginLeft:6}}>要入力</span>}
            </div>
          ))}
        </div>

        {/* プロフィール未完了バナー */}
        {!isProfileComplete && dashTab !== "mypage" && (
          <div style={{background:"#fff7ed",borderBottom:"2px solid var(--accent)",padding:"12px 32px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:16}}>
            <div style={{fontSize:14,color:"var(--ink)"}}>
              📝 <strong>プロフィールと経歴（1社以上）を入力する</strong>と案件を閲覧できます
            </div>
            <button onClick={()=>setDashTab("mypage")} style={{background:"var(--accent)",color:"white",border:"none",borderRadius:8,padding:"8px 18px",fontWeight:700,cursor:"pointer",fontSize:13,whiteSpace:"nowrap"}}>
              入力する →
            </button>
          </div>
        )}

        {/* プロフィール完了バナー */}
        {isProfileComplete && dashTab === "mypage" && (
          <div style={{background:"#f0fdf4",borderBottom:"2px solid var(--green)",padding:"12px 32px",display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:16}}>✅</span>
            <span style={{fontSize:14,color:"var(--green)",fontWeight:600}}>プロフィールが完成しています！案件を探してみましょう</span>
            <button onClick={()=>setDashTab("jobs")} style={{marginLeft:"auto",background:"var(--green)",color:"white",border:"none",borderRadius:8,padding:"8px 18px",fontWeight:700,cursor:"pointer",fontSize:13}}>
              案件を探す →
            </button>
          </div>
        )}

        {/* 案件一覧 */}
        {dashTab === "jobs" && isProfileComplete && (
          <div className="dash-body">
            <aside className="sidebar">
              <h3>🔍 絞り込み検索</h3>
              <div className="filter-section">
                <div className="filter-title">案件タイプ</div>
                {[["remote","リモート案件"],["urgent","急募案件"],["highPay","高単価案件"],["lowExp","経験少なめOK"]].map(f=>(
                  <div key={f[0]} className="filter-toggle" onClick={()=>setFilters(prev=>({...prev,[f[0]]:!prev[f[0]]}))}>
                    <div className={`toggle-box ${filters[f[0]]?"active":""}`}>{filters[f[0]]&&<span style={{color:"white",fontSize:12,fontWeight:700}}>✓</span>}</div>
                    <span className="toggle-label">{f[1]}</span>
                  </div>
                ))}
              </div>
              <div className="filter-section">
                <div className="filter-title">業界</div>
                <div className="chip-group">
                  {INDUSTRIES.map(ind=>(
                    <div key={ind} className={`chip ${filters.industries.includes(ind)?"active":""}`} onClick={()=>setFilters(prev=>({...prev,industries:prev.industries.includes(ind)?prev.industries.filter(i=>i!==ind):[...prev.industries,ind]}))}>
                      {ind}
                    </div>
                  ))}
                </div>
              </div>
              <div className="filter-section">
                <div className="filter-title">勤務形態</div>
                {[["shortTime","週2日〜OK"],["reward","成果報酬型"]].map(f=>(
                  <div key={f[0]} className="filter-toggle" onClick={()=>setFilters(prev=>({...prev,[f[0]]:!prev[f[0]]}))}
                  >
                    <div className={`toggle-box ${filters[f[0]]?"active":""}`}>{filters[f[0]]&&<span style={{color:"white",fontSize:12,fontWeight:700}}>✓</span>}</div>
                    <span className="toggle-label">{f[1]}</span>
                  </div>
                ))}
              </div>
              <div className="filter-section">
                <div className="filter-title">単価下限（万円/月）</div>
                <div style={{padding:"4px 0"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6,fontSize:13,color:"var(--ink)",fontWeight:600}}>
                    <span>{filters.minRate===0?"下限なし":`${filters.minRate}万円以上`}</span>
                  </div>
                  <input type="range" min={0} max={100} step={10} value={filters.minRate}
                    onChange={e=>setFilters(prev=>({...prev,minRate:Number(e.target.value)}))}
                    style={{width:"100%",accentColor:"var(--brand)",cursor:"pointer"}}
                  />
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"var(--gray400)",marginTop:2}}>
                    <span>0万</span><span>50万</span><span>100万</span>
                  </div>
                </div>
              </div>
              {(filters.remote||filters.urgent||filters.highPay||filters.lowExp||filters.shortTime||filters.reward||filters.industries.length>0||filters.minRate>0)&&(
                <div className="clear-filters" onClick={()=>setFilters({remote:false,urgent:false,highPay:false,lowExp:false,shortTime:false,reward:false,industries:[],minRate:0})}>✕ 絞り込みをクリア</div>
              )}
            </aside>
            <div className="main-content">
              <div className="search-bar">
                <div className="search-input-wrap">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8a8a7a" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  <input className="search-input" placeholder="キーワードで検索（例：SaaS、新規開拓）" value={search} onChange={e=>setSearch(e.target.value)} />
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:8}}>
                <div className="result-count" style={{margin:0}}>検索結果: <strong>{filteredJobs.length}件</strong></div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:12,color:"var(--gray500)",fontWeight:600}}>並び順：</span>
                  <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{fontSize:13,padding:"6px 12px",borderRadius:8,border:"1.5px solid var(--gray200)",background:"white",color:"var(--ink)",fontFamily:"'Noto Sans JP',sans-serif",cursor:"pointer",outline:"none"}}>
                    <option value="newest">掲載が新しい順</option>
                    <option value="rateDesc">単価が高い順</option>
                    <option value="rateAsc">単価が低い順</option>
                  </select>
                </div>
              </div>
              <div className="job-list">
                {filteredJobs.map(job=>{
                  const vis = getJobVisual(job);
                  return (
                  <div key={job.id} className="job-card" style={{"--job-accent":vis.accent}}>
                    {/* SOKUDAN風ヘッダーバナー */}
                    <div style={{position:"relative",overflow:"hidden",cursor:"pointer"}} onClick={()=>setSelectedJob(job)}>
                      <JobBannerSVG job={job} height={110}/>
                      <div style={{position:"absolute",top:10,right:10}}>
                        <span className="job-date" style={{background:"rgba(0,0,0,0.35)",color:"white",borderRadius:100,padding:"3px 10px",fontSize:11,fontWeight:600}}>{daysAgo(job.posted)}</span>
                      </div>
                    </div>
                    <div className="job-card-header" style={{cursor:"pointer"}} onClick={()=>setSelectedJob(job)}>
                      <div className="job-card-top">
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div>
                            <div className="job-title">{job.title}</div>
                            <div className="job-company">🏢 {job.company}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="job-card-body">
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,flexWrap:"wrap"}}>
                        <span className={`job-type ${job.type==="成果報酬"?"reward":""}`}>{job.type}</span>
                        {job.remote&&<span className="badge remote">🏠 リモート</span>}
                        {job.urgent&&<span className="badge urgent">⚡ 急募</span>}
                        {job.highPay&&<span className="badge highpay">💰 高単価</span>}
                        {job.lowExp&&<span className="badge lowexp">🌱 未経験OK</span>}
                      </div>
                      <div className="job-meta">
                        <span className="meta-pill rate">💴 {job.rate}</span>
                        <span className="meta-pill">📍 {job.location}</span>
                        <span className="meta-pill">📅 {job.period}</span>
                      </div>
                      <div className="job-tags" style={{marginBottom:12}}>{job.tags.map(t=><span key={t} className="tag">{t}</span>)}</div>
                      {appliedJobs.includes(job.id)&&<div style={{marginBottom:10,fontSize:12,color:"var(--brand-dark)",fontWeight:700,background:"var(--brand-soft)",display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:100,border:"1px solid var(--brand-mid)"}}>✓ 応募済み</div>}
                      <div style={{display:"flex",gap:8,marginTop:"auto"}}>
                        <button onClick={e=>{e.stopPropagation();setSelectedJob(job);}} style={{flex:1,padding:"10px",borderRadius:100,background:"var(--brand-soft)",border:"1.5px solid var(--brand-mid)",color:"var(--brand-dark)",fontSize:13,fontWeight:700,cursor:"pointer",transition:"all 0.15s"}}
                          onMouseEnter={e=>{e.currentTarget.style.background="var(--brand)";e.currentTarget.style.color="white";}}
                          onMouseLeave={e=>{e.currentTarget.style.background="var(--brand-soft)";e.currentTarget.style.color="var(--brand-dark)";}}>
                          詳細を見る
                        </button>
                        <button onClick={e=>{e.stopPropagation();setSelectedJob(job);setPage("job-detail");}} style={{padding:"10px 16px",borderRadius:100,background:"var(--gray100)",border:"1.5px solid var(--gray200)",color:"var(--gray600)",fontSize:12,fontWeight:600,cursor:"pointer",transition:"all 0.15s",whiteSpace:"nowrap"}}
                          title="別ページで詳細を開く"
                          onMouseEnter={e=>{e.currentTarget.style.background="var(--gray200)";}}
                          onMouseLeave={e=>{e.currentTarget.style.background="var(--gray100)";}}>
                          ↗ 別ページ
                        </button>
                      </div>
                    </div>
                  </div>
                );})}

                {filteredJobs.length===0&&<div style={{textAlign:"center",padding:60,color:"var(--gray500)",background:"var(--white)",borderRadius:"var(--radius-lg)",border:"1px solid var(--gray200)"}}>
                  <div style={{fontSize:40,marginBottom:12}}>📭</div>
                  <div style={{fontSize:16,fontWeight:600}}>該当する案件が見つかりませんでした</div>
                  <div style={{fontSize:13,marginTop:6,color:"var(--gray400)"}}>条件を変えて検索してみてください</div>
                </div>}
              </div>
            </div>
          </div>
        )}

        {/* マイページ */}
        {dashTab === "mypage" && (
          <div className="mypage-wrap">
            {/* 基本プロフィール */}
            <div className="mypage-card">
              <div className="mypage-card-header">
                <div className="mypage-card-title">👤 基本プロフィール</div>
                {isProfileComplete && <span style={{fontSize:12,background:"var(--brand-soft)",color:"var(--brand-dark)",padding:"3px 10px",borderRadius:100,fontWeight:700,border:"1px solid var(--brand-mid)"}}>✓ 完成</span>}
              </div>
              <div className="mypage-grid">
                <div>
                  <label className="mypage-label">氏名</label>
                  <input className="mypage-input" value={profileForm.name} onChange={e=>setProfileForm({...profileForm,name:e.target.value})} placeholder="山田 太郎" />
                </div>
                <div>
                  <label className="mypage-label">営業経験年数</label>
                  <select className="mypage-input" value={profileForm.experience} onChange={e=>setProfileForm({...profileForm,experience:e.target.value})}>
                    <option value="">選択してください</option>
                    {["1年未満","1〜3年","3〜5年","5〜10年","10年以上"].map(v=><option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mypage-label">希望単価</label>
                  <input className="mypage-input" value={profileForm.desiredRate} onChange={e=>setProfileForm({...profileForm,desiredRate:e.target.value})} placeholder="例：月60〜80万円" />
                </div>
                <div>
                  <label className="mypage-label">希望働き方</label>
                  <select className="mypage-input" value={profileForm.desiredStyle} onChange={e=>setProfileForm({...profileForm,desiredStyle:e.target.value})}>
                    <option value="">選択してください</option>
                    {["フルリモート","一部リモート","常駐","どちらでも可"].map(v=><option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div style={{marginTop:16}}>
                <label className="mypage-label">得意業界</label>
                <div className="chip-group">
                  {INDUSTRIES.map(ind=>(
                    <div key={ind} className={`chip ${(profileForm.specialties||[]).includes(ind)?"active":""}`} onClick={()=>setProfileForm(prev=>({...prev,specialties:(prev.specialties||[]).includes(ind)?(prev.specialties||[]).filter(s=>s!==ind):[...(prev.specialties||[]),ind]}))}>
                      {ind}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{marginTop:16}}>
                <label className="mypage-label">自己PR・強み</label>
                <textarea className="mypage-textarea" value={profileForm.pr} onChange={e=>setProfileForm({...profileForm,pr:e.target.value})} placeholder="これまでの経験・スキル・実績などを記入してください..." />
              </div>
              <div style={{marginTop:20,display:"flex",justifyContent:"flex-end"}}>
                <button className="save-btn" onClick={handleSaveProfile}>保存する</button>
              </div>
            </div>

            {/* 職務経歴書 */}
            <div className="mypage-card">
              <div className="mypage-card-header">
                <div className="mypage-card-title">📄 職務経歴書・経歴</div>
                {careers.length > 0 && <span style={{fontSize:12,background:"var(--brand-soft)",color:"var(--brand-dark)",padding:"3px 10px",borderRadius:100,fontWeight:700,border:"1px solid var(--brand-mid)"}}>✓ {careers.length}社登録済</span>}
              </div>
              <input type="file" ref={resumeInputRef} style={{display:"none"}} accept=".pdf,.doc,.docx" onChange={handleResumeUpload} />
              {resumeUrl ? (
                <div className="resume-uploaded">
                  <div className="resume-uploaded-icon">📎</div>
                  <div className="resume-uploaded-name">{resumeFileName}</div>
                  <div className="resume-uploaded-actions">
                    <button className="resume-view-btn" onClick={()=>window.open(resumeUrl,"_blank")}>開く</button>
                    <button className="resume-change-btn" onClick={()=>resumeInputRef.current?.click()}>変更</button>
                  </div>
                </div>
              ) : (
                <div className="resume-upload-area" onClick={()=>resumeInputRef.current?.click()}>
                  <div className="resume-upload-icon">{resumeUploading ? "⏳" : "📤"}</div>
                  <div className="resume-upload-title">{resumeUploading ? "アップロード中..." : "職務経歴書をアップロード"}</div>
                  <div className="resume-upload-sub">PDF・Word対応 / 最大10MB<br/>クリックまたはドラッグ＆ドロップ</div>
                </div>
              )}

              <div className="section-divider">
                <div className="section-divider-line"/>
                <div className="section-divider-text">または経歴を手入力</div>
                <div className="section-divider-line"/>
              </div>

              {/* 経歴一覧 */}
              {careers.length > 0 && (
                <div className="career-list">
                  {careers.map(career=>(
                    <div key={career.id} className="career-item">
                      <div className="career-item-left">
                        <div className="career-period">{career.period}</div>
                        <div className="career-company">{career.company}</div>
                        <div className="career-role">{career.role}</div>
                      </div>
                      <div className="career-item-right">
                        <div className="career-desc">{career.description}</div>
                        <div className="career-actions">
                          <button className="career-edit-btn" onClick={()=>handleEditCareer(career)}>編集</button>
                          <button className="career-delete-btn" onClick={()=>handleDeleteCareer(career.id)}>削除</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 経歴入力フォーム */}
              <div className="career-form">
                <div style={{fontSize:14,fontWeight:700,color:"var(--accent)",marginBottom:16}}>{editingCareerId ? "✏️ 経歴を編集" : "➕ 経歴を追加"}</div>
                <div style={{marginBottom:12}}>
                  <label className="mypage-label">企業名 *</label>
                  <input className="mypage-input" value={careerForm.company} onChange={e=>setCareerForm({...careerForm,company:e.target.value})} placeholder="例：株式会社〇〇" />
                </div>
                <div style={{marginBottom:12}}>
                  <label className="mypage-label">在職期間 *</label>
                  <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                    <select className="mypage-input" style={{flex:"0 0 110px"}} value={careerForm.startYear} onChange={e=>setCareerForm({...careerForm,startYear:e.target.value})}>
                      <option value="">開始年</option>
                      {YEARS.map(y=><option key={y} value={y}>{y}年</option>)}
                    </select>
                    <select className="mypage-input" style={{flex:"0 0 80px"}} value={careerForm.startMonth} onChange={e=>setCareerForm({...careerForm,startMonth:e.target.value})}>
                      <option value="">月</option>
                      {MONTHS.map(m=><option key={m} value={m}>{m}月</option>)}
                    </select>
                    <span style={{fontSize:14,color:"var(--gray500)"}}>〜</span>
                    {!careerForm.isCurrent && <>
                      <select className="mypage-input" style={{flex:"0 0 110px"}} value={careerForm.endYear} onChange={e=>setCareerForm({...careerForm,endYear:e.target.value})}>
                        <option value="">終了年</option>
                        {YEARS.map(y=><option key={y} value={y}>{y}年</option>)}
                      </select>
                      <select className="mypage-input" style={{flex:"0 0 80px"}} value={careerForm.endMonth} onChange={e=>setCareerForm({...careerForm,endMonth:e.target.value})}>
                        <option value="">月</option>
                        {MONTHS.map(m=><option key={m} value={m}>{m}月</option>)}
                      </select>
                    </>}
                    <label style={{display:"flex",alignItems:"center",gap:6,fontSize:13,cursor:"pointer",whiteSpace:"nowrap"}}>
                      <input type="checkbox" checked={careerForm.isCurrent} onChange={e=>setCareerForm({...careerForm,isCurrent:e.target.checked,endYear:"",endMonth:""})} />
                      現在在籍中
                    </label>
                  </div>
                </div>
                <div style={{marginBottom:12}}>
                  <label className="mypage-label">役職・ポジション</label>
                  <input className="mypage-input" value={careerForm.role} onChange={e=>setCareerForm({...careerForm,role:e.target.value})} placeholder="例：営業部 主任" />
                </div>
                <div style={{marginBottom:16}}>
                  <label className="mypage-label">主な業務内容・実績</label>
                  <textarea className="mypage-textarea" value={careerForm.description} onChange={e=>setCareerForm({...careerForm,description:e.target.value})} placeholder="担当した業務・達成した実績などを記入してください..." />
                </div>
                <div style={{display:"flex",gap:10}}>
                  <button className="save-btn" style={{flex:1,padding:"12px"}} onClick={handleSaveCareer}>{editingCareerId ? "更新する" : "追加する"}</button>
                  {editingCareerId && <button style={{padding:"12px 24px",borderRadius:100,background:"var(--gray200)",border:"none",cursor:"pointer",fontWeight:600}} onClick={()=>{setCareerForm({company:"",startYear:"",startMonth:"",endYear:"",endMonth:"",isCurrent:false,role:"",description:""});setEditingCareerId(null);}}>キャンセル</button>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 応募履歴 */}
        {dashTab === "history" && (
          <div className="mypage-wrap">
            <div className="mypage-card">
              <h3>📋 応募履歴（{myApplications.length}件）</h3>
              {myApplications.length===0&&<div style={{textAlign:"center",padding:40,color:"var(--gray500)"}}>まだ応募した案件はありません</div>}
              {myApplications.map(app=>(
                <div key={app.id} className="app-history-item">
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                    <div className="app-history-title">{app.jobTitle}</div>
                    <span className={`status-badge ${app.status==="対応済み"?"done":"pending"}`}>{app.status||"未対応"}</span>
                  </div>
                  <div className="app-history-meta">{app.company} ・ {app.message ? `メッセージ: ${app.message.slice(0,40)}...` : "メッセージなし"}</div>
                  <span className="chat-link" onClick={()=>setChatAppId(app.id)}>💬 メッセージを見る・送る</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 案件詳細モーダル */}
      {selectedJob && !showApplyModal && (()=>{
        const vis = getJobVisual(selectedJob);
        return (
        <div className="modal-overlay" onClick={()=>setSelectedJob(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            {/* SOKUDANスタイルのヘッダーバナー */}
            <div style={{position:"relative",overflow:"hidden",borderRadius:"var(--radius-xl) var(--radius-xl) 0 0"}}>
              <JobBannerSVG job={selectedJob} height={150}/>
              <button className="modal-close" style={{position:"absolute",top:12,right:12,background:"rgba(0,0,0,0.4)",color:"white",border:"none"}} onClick={()=>setSelectedJob(null)}>✕</button>
              {/* 会社情報オーバーレイ */}
              <div style={{position:"absolute",bottom:14,left:20,display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:44,height:44,borderRadius:10,background:"white",boxShadow:"0 2px 8px rgba(0,0,0,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{vis.icon}</div>
                <div>
                  <div style={{fontSize:12,color:"rgba(255,255,255,0.85)",fontWeight:600}}>{vis.label}業界</div>
                  <div style={{fontSize:14,color:"white",fontWeight:700}}>{selectedJob.company}</div>
                </div>
              </div>
              {/* 別ページで開くボタン */}
              <button onClick={()=>setPage("job-detail")} style={{position:"absolute",bottom:14,right:14,padding:"6px 12px",borderRadius:100,background:"rgba(255,255,255,0.2)",border:"1.5px solid rgba(255,255,255,0.5)",color:"white",fontSize:11,fontWeight:700,cursor:"pointer",backdropFilter:"blur(4px)"}}
                title="別ページで詳細を開く">
                ↗ 全画面で見る
              </button>
            </div>
            <div className="modal-header" style={{paddingTop:16}}>
              {/* バッジ行 */}
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
                <span className={`job-type ${selectedJob.type==="成果報酬"?"reward":""}`}>{selectedJob.type}</span>
                {selectedJob.remote&&<span className="badge remote">🏠 リモート</span>}
                {selectedJob.urgent&&<span className="badge urgent">⚡ 急募</span>}
                {selectedJob.highPay&&<span className="badge highpay">💰 高単価</span>}
                {selectedJob.lowExp&&<span className="badge lowexp">🌱 未経験OK</span>}
              </div>
              <h2 style={{fontSize:19,fontWeight:700,lineHeight:1.55,color:"var(--ink)",marginBottom:4}}>{selectedJob.title}</h2>
            </div>
            <div className="modal-body">
              {/* 報酬バー（目立たせるが折り返し可能に） */}
              <div className="modal-rate-bar">
                <div className="modal-rate-label">報酬</div>
                <div className="modal-rate-value">{selectedJob.rate}</div>
              </div>
              {/* 詳細グリッド（勤務地・期間・働き方） */}
              <div className="modal-detail-grid">
                <div className="modal-detail-box">
                  <div className="detail-label">📍 勤務地</div>
                  <div style={{fontSize:14,fontWeight:600,color:"var(--ink)",lineHeight:1.5}}>{selectedJob.location}</div>
                </div>
                <div className="modal-detail-box">
                  <div className="detail-label">📅 契約期間</div>
                  <div style={{fontSize:14,fontWeight:600,color:"var(--ink)",lineHeight:1.5}}>{selectedJob.period}</div>
                </div>
                <div className="modal-detail-box">
                  <div className="detail-label">🏠 働き方</div>
                  <div style={{fontSize:14,fontWeight:600,color:"var(--ink)",lineHeight:1.5}}>{selectedJob.remote?"リモート可":"常駐"}</div>
                </div>
                <div className="modal-detail-box">
                  <div className="detail-label">🏷️ 業界</div>
                  <div style={{fontSize:14,fontWeight:600,color:"var(--ink)",lineHeight:1.5}}>{selectedJob.tags[0]||"営業"}</div>
                </div>
              </div>
              <div className="modal-divider"/>
              <div className="detail-section">
                <div className="detail-label">📋 案件概要</div>
                <div className="detail-text">{selectedJob.description}</div>
              </div>
              <div className="detail-section">
                <div className="detail-label">✅ 応募要件</div>
                <div className="detail-text">{selectedJob.requirements}</div>
              </div>
              {selectedJob.companyInfo && (
                <div className="detail-section">
                  <div className="detail-label">🏢 掲載企業について</div>
                  <div style={{fontSize:13,color:"var(--gray700)",lineHeight:1.9,padding:"12px 14px",background:"var(--gray50)",borderRadius:10,marginTop:6,borderLeft:`4px solid ${vis.accent}`}}>
                    {selectedJob.companyInfo}
                  </div>
                </div>
              )}
              <div className="detail-section">
                <div className="detail-label">🏷️ 関連タグ</div>
                <div className="job-tags" style={{marginTop:6}}>{selectedJob.tags.map(t=><span key={t} className="tag">{t}</span>)}</div>
              </div>
              {appliedJobs.includes(selectedJob.id)
                ? <button className="btn-apply applied">✓ 応募済み</button>
                : <button className="btn-apply" onClick={()=>setShowApplyModal(true)}>この案件に応募する →</button>
              }
            </div>
          </div>
        </div>
      );})()}

      {/* 応募モーダル */}
      {showApplyModal && selectedJob && (
        <div className="modal-overlay" onClick={()=>setShowApplyModal(false)}>
          <div className="modal" style={{maxWidth:500}} onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <button className="modal-close" onClick={()=>setShowApplyModal(false)}>✕</button>
              <h2 style={{fontSize:20,fontWeight:700,paddingRight:40}}>応募する</h2>
              <div style={{fontSize:14,color:"var(--gray500)",marginTop:4}}>{selectedJob.title}</div>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">自己PR・メッセージ</label>
                <textarea className="apply-textarea" placeholder="これまでの営業経験やアピールポイントを記入してください..." value={applyMsg} onChange={e=>setApplyMsg(e.target.value)} />
              </div>
              <button className="btn-apply" onClick={handleApply}>応募を送信する</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}

      {/* Chat Panel */}
      {chatAppId && (
        <div className="chat-overlay" onClick={e=>{if(e.target.className==="chat-overlay")setChatAppId(null);}}>
          <div className="chat-panel">
            <div className="chat-header">
              <div>
                <div className="chat-header-title">💬 メッセージ</div>
                <div className="chat-header-sub">{myApplications.find(a=>a.id===chatAppId)?.jobTitle}</div>
              </div>
              <button className="chat-close" onClick={()=>setChatAppId(null)}>✕</button>
            </div>
            <div className="chat-messages">
              {chatMessages.length===0 && <div className="chat-empty"><div style={{fontSize:32}}>💬</div><div>まだメッセージはありません</div><div style={{fontSize:12,color:"var(--gray500)"}}>最初のメッセージを送ってみましょう</div></div>}
              {chatMessages.map(msg=>(
                <div key={msg.id} style={{display:"flex",flexDirection:"column",alignItems:msg.senderEmail===user?.email?"flex-end":"flex-start"}}>
                  <div className={`chat-bubble ${msg.senderEmail===user?.email?"mine":"theirs"}`}>
                    <div className="chat-bubble-name">{msg.isAdmin?"管理者":msg.senderName}</div>
                    {msg.text}
                    <div className="chat-bubble-time">{msg.sentAt?.toDate?.()?.toLocaleTimeString("ja-JP",{hour:"2-digit",minute:"2-digit"})||""}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="chat-input-area">
              <textarea className="chat-textarea" placeholder="メッセージを入力... (Enterで送信)" value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();handleSendMessage();}}} rows={1} />
              <button className="chat-send-btn" onClick={handleSendMessage}>送信</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
