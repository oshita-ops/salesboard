import { useState, useEffect, useCallback } from "react";

const JOBS = [
  { id: 1, title: "SaaS新規開拓営業", company: "株式会社テックブリッジ", type: "業務委託", rate: "月60〜80万円", location: "東京（一部リモート）", tags: ["新規開拓", "SaaS", "IT"], remote: true, urgent: false, highPay: true, lowExp: false, description: "急成長SaaSプロダクトの新規開拓営業。リード獲得〜クロージングまで一貫してお任せします。", requirements: "法人営業経験3年以上、SaaS業界経験歓迎", period: "長期（6ヶ月〜）", posted: "2026-04-11" },
  { id: 2, title: "人材紹介パートナー営業", company: "キャリアリンク株式会社", type: "業務委託", rate: "月40〜55万円", location: "フルリモート", tags: ["人材", "パートナー", "ルート営業"], remote: true, urgent: true, highPay: false, lowExp: true, description: "人材紹介サービスのパートナー企業開拓。既存ネットワークを活かせる方歓迎。", requirements: "営業経験1年以上、人材業界経験あれば尚可", period: "中期（3〜6ヶ月）", posted: "2026-04-12" },
  { id: 3, title: "不動産投資セミナー集客営業", company: "グローバルアセット株式会社", type: "成果報酬", rate: "1件あたり3〜5万円", location: "東京・大阪", tags: ["不動産", "セミナー", "成果報酬"], remote: false, urgent: false, highPay: true, lowExp: true, description: "富裕層向け不動産投資セミナーへの集客営業。成果報酬型で高収入を目指せます。", requirements: "営業経験不問、人脈・集客力のある方", period: "長期（継続案件）", posted: "2026-04-10" },
  { id: 4, title: "DX推進コンサルティング営業", company: "デジタルシフト株式会社", type: "業務委託", rate: "月70〜100万円", location: "東京（週2出社）", tags: ["DX", "コンサル", "IT"], remote: true, urgent: true, highPay: true, lowExp: false, description: "大手企業向けDX推進ソリューションの提案営業。経営層へのプレゼンテーション能力が求められます。", requirements: "コンサル営業経験5年以上、IT業界経験必須", period: "長期（1年〜）", posted: "2026-04-13" },
  { id: 5, title: "ECサイト広告営業", company: "アドクリエイト株式会社", type: "業務委託", rate: "月35〜50万円", location: "フルリモート", tags: ["広告", "EC", "デジタル"], remote: true, urgent: false, highPay: false, lowExp: true, description: "ECサイト運営企業へのWeb広告ソリューション提案。未経験からでも丁寧にサポートします。", requirements: "営業経験1年以上、デジタルマーケティングに興味がある方", period: "中期（3ヶ月〜）", posted: "2026-04-09" },
  { id: 6, title: "医療機器代理店営業", company: "メディカルプロ株式会社", type: "業務委託", rate: "月55〜70万円", location: "全国（出張あり）", tags: ["医療", "代理店", "BtoB"], remote: false, urgent: true, highPay: true, lowExp: false, description: "医療機器の代理店チャネル開拓・管理。医療業界での営業経験がある方を求めています。", requirements: "医療業界営業経験3年以上", period: "長期（6ヶ月〜）", posted: "2026-04-08" },
  { id: 7, title: "スタートアップ資金調達支援", company: "ベンチャーキャピタルパートナーズ", type: "業務委託", rate: "月80〜120万円", location: "東京（一部リモート）", tags: ["スタートアップ", "資金調達", "金融"], remote: true, urgent: false, highPay: true, lowExp: false, description: "スタートアップの資金調達支援。投資家とのリレーション構築・ピッチ支援を担当。", requirements: "金融・VC業界経験5年以上、広いネットワーク", period: "中期（3〜6ヶ月）", posted: "2026-04-07" },
  { id: 8, title: "保険代理店向けルート営業", company: "インシュアテック株式会社", type: "業務委託", rate: "月30〜45万円", location: "大阪・名古屋", tags: ["保険", "ルート営業", "代理店"], remote: false, urgent: false, highPay: false, lowExp: true, description: "保険代理店への新商品案内・フォローアップ営業。丁寧な対応ができる方歓迎。", requirements: "営業経験1年以上、保険業界経験あれば尚可", period: "長期（6ヶ月〜）", posted: "2026-04-06" },
  { id: 9, title: "クラウドERP導入営業", company: "クラウドワークス株式会社", type: "業務委託", rate: "月65〜85万円", location: "東京（週1出社）", tags: ["ERP", "クラウド", "IT"], remote: true, urgent: true, highPay: true, lowExp: false, description: "中堅企業向けクラウドERPの導入提案営業。業務改善提案からクロージングまで。", requirements: "IT営業経験3年以上、ERP関連知識歓迎", period: "長期（1年〜）", posted: "2026-04-13" },
  { id: 10, title: "飲食店向けデリバリーサービス営業", company: "フードコネクト株式会社", type: "成果報酬", rate: "1店舗あたり2万円", location: "全国（エリア選択可）", tags: ["飲食", "デリバリー", "成果報酬"], remote: false, urgent: true, highPay: false, lowExp: true, description: "飲食店へのデリバリーサービス加盟営業。自分のペースで取り組めます。", requirements: "営業経験不問、行動力のある方", period: "自由（好きな時に稼働）", posted: "2026-04-12" },
];

const INDUSTRIES = ["IT", "SaaS", "人材", "不動産", "広告", "医療", "金融", "保険", "飲食", "DX", "コンサル", "EC"];

function daysAgo(dateStr) {
  const d = new Date(dateStr);
  const now = new Date("2026-04-13");
  const diff = Math.floor((now - d) / 86400000);
  if (diff === 0) return "本日";
  if (diff === 1) return "1日前";
  return `${diff}日前`;
}

export default function App() {
  const [page, setPage] = useState("landing");
  const [user, setUser] = useState(null);
  const [regForm, setRegForm] = useState({ name: "", email: "", password: "", experience: "", specialties: [] });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ remote: false, urgent: false, highPay: false, lowExp: false, industries: [] });
  const [selectedJob, setSelectedJob] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyMsg, setApplyMsg] = useState("");
  const [toast, setToast] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const filteredJobs = JOBS.filter(job => {
    if (search && !job.title.includes(search) && !job.company.includes(search) && !job.tags.some(t => t.includes(search))) return false;
    if (filters.remote && !job.remote) return false;
    if (filters.urgent && !job.urgent) return false;
    if (filters.highPay && !job.highPay) return false;
    if (filters.lowExp && !job.lowExp) return false;
    if (filters.industries.length > 0 && !job.tags.some(t => filters.industries.includes(t))) return false;
    return true;
  });

  const handleRegister = () => {
    if (!regForm.name || !regForm.email || !regForm.password) {
      showToast("必須項目を入力してください");
      return;
    }
    setUser({ name: regForm.name, email: regForm.email, experience: regForm.experience, specialties: regForm.specialties });
    setPage("dashboard");
    showToast("登録が完了しました！");
  };

  const handleLogin = () => {
    if (!loginForm.email || !loginForm.password) {
      showToast("メール・パスワードを入力してください");
      return;
    }
    setUser({ name: "山田 太郎", email: loginForm.email, experience: "5年", specialties: ["IT", "SaaS"] });
    setPage("dashboard");
    showToast("ログインしました");
  };

  const handleApply = () => {
    if (selectedJob) {
      setAppliedJobs(prev => [...prev, selectedJob.id]);
      setShowApplyModal(false);
      setApplyMsg("");
      showToast(`「${selectedJob.title}」に応募しました！`);
    }
  };

  // --- STYLES ---
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;600;700;900&family=Outfit:wght@300;400;500;600;700;800&display=swap');

    :root {
      --ink: #1a1a2e;
      --paper: #fafaf7;
      --accent: #e8530e;
      --accent2: #ff7b3a;
      --green: #0d9f6e;
      --green-soft: #e6f7f0;
      --blue: #2563eb;
      --blue-soft: #eff4ff;
      --purple: #7c3aed;
      --purple-soft: #f3eeff;
      --red: #dc2626;
      --red-soft: #fef2f2;
      --gray100: #f5f5f0;
      --gray200: #e8e8e0;
      --gray300: #d4d4c8;
      --gray500: #8a8a7a;
      --gray700: #4a4a3e;
      --shadow-sm: 0 1px 3px rgba(26,26,46,0.06);
      --shadow-md: 0 4px 16px rgba(26,26,46,0.08);
      --shadow-lg: 0 8px 32px rgba(26,26,46,0.12);
      --shadow-xl: 0 16px 48px rgba(26,26,46,0.16);
      --radius: 12px;
    }

    * { margin:0; padding:0; box-sizing:border-box; }

    body { font-family: 'Noto Sans JP', sans-serif; background: var(--paper); color: var(--ink); }

    /* ===== LANDING - LIGHT THEME ===== */
    .page-landing {
      min-height: 100vh;
      background: #ffffff;
      position: relative;
      overflow: hidden;
    }

    .landing-nav {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 48px; height: 68px;
      background: white;
      border-bottom: 1px solid var(--gray200);
      position: sticky; top: 0; z-index: 100;
    }
    .logo {
      font-family: 'Outfit', sans-serif;
      font-weight: 800; font-size: 22px;
      color: var(--ink); letter-spacing: -0.5px;
      display: flex; align-items: center; gap: 10px;
      cursor: pointer;
    }
    .logo-mark {
      width: 34px; height: 34px;
      background: var(--accent);
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; font-weight: 900; color: white;
    }
    .nav-btns { display: flex; gap: 10px; align-items: center; }
    .btn-ghost {
      padding: 10px 24px; border-radius: 100px;
      background: white; border: 2px solid var(--gray200);
      color: var(--ink); font-size: 14px; font-weight: 600; cursor: pointer;
      transition: all 0.2s;
    }
    .btn-ghost:hover { border-color: var(--accent); color: var(--accent); }
    .btn-accent {
      padding: 10px 24px; border-radius: 100px;
      background: var(--accent); border: none;
      color: white; font-size: 14px; font-weight: 700; cursor: pointer;
      transition: all 0.25s;
      box-shadow: 0 4px 16px rgba(232,83,14,0.35);
    }
    .btn-accent:hover { background: var(--accent2); transform: translateY(-1px); }

    /* Hero */
    .hero-section {
      position: relative;
      min-height: 560px;
      display: flex; align-items: center;
      overflow: hidden;
      background: white;
    }
    .hero-blob {
      position: absolute; top: 0; right: 0;
      width: 58%; height: 100%;
      pointer-events: none;
    }
    .hero-left {
      position: relative; z-index: 2;
      padding: 72px 0 72px 64px;
      max-width: 520px;
    }
    .hero-right {
      position: absolute; right: 0; top: 0;
      width: 58%; height: 100%;
      display: flex; align-items: center; justify-content: center;
      z-index: 2; pointer-events: none;
    }
    .hero-illustration {
      width: 90%; max-width: 520px;
      drop-shadow: 0 20px 40px rgba(0,0,0,0.08);
    }
    .hero-eyebrow {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 13px; font-weight: 600; color: var(--accent);
      margin-bottom: 20px;
    }
    .hero-eyebrow::before {
      content: '●'; font-size: 8px;
    }
    .hero h1 {
      font-family: 'Noto Sans JP', sans-serif;
      font-size: 38px; font-weight: 900;
      color: var(--ink); line-height: 1.4;
      letter-spacing: -1px; margin-bottom: 20px;
    }
    .hero h1 .accent-line {
      display: flex; align-items: baseline; gap: 4px; flex-wrap: wrap;
      font-size: 44px;
      color: var(--ink);
    }
    .hero h1 .accent-line .num {
      font-family: 'Outfit', sans-serif;
      font-size: 64px; font-weight: 800;
      color: var(--accent);
    }
    .hero p {
      font-size: 15px; color: var(--gray500);
      line-height: 1.9; margin-bottom: 32px;
      max-width: 420px;
    }
    .hero-tags {
      display: flex; gap: 12px; flex-wrap: wrap;
      margin-bottom: 36px;
    }
    .hero-tag {
      display: flex; flex-direction: column; align-items: center;
      gap: 8px; width: 90px;
    }
    .hero-tag-icon {
      width: 56px; height: 56px; border-radius: 50%;
      background: #2B4E8C;
      display: flex; align-items: center; justify-content: center;
      font-size: 22px; color: white;
    }
    .cta-buttons { display: flex; gap: 14px; flex-wrap: wrap; align-items: center; }
    .btn-cta-primary {
      padding: 17px 44px; border-radius: 100px;
      background: var(--accent); border: none;
      color: white; font-size: 16px; font-weight: 700; cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 8px 28px rgba(232,83,14,0.45);
      letter-spacing: 0.3px;
      white-space: nowrap;
    }
    .btn-cta-primary:hover { background: var(--accent2); transform: translateY(-3px); box-shadow: 0 12px 36px rgba(232,83,14,0.55); }
    .btn-cta-secondary {
      padding: 15px 40px; border-radius: 100px;
      background: white; border: 2px solid var(--gray300);
      color: var(--ink); font-size: 16px; font-weight: 600; cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .btn-cta-secondary:hover { border-color: var(--accent); color: var(--accent); transform: translateY(-2px); }
    .about-section {
      padding: 80px 64px;
      display: flex; align-items: center; gap: 72px;
      max-width: 1100px; margin: 0 auto;
    }
    .about-illo { flex: 0 0 380px; }
    .about-illo svg { width: 100%; }
    .about-text { flex: 1; }
    .about-eyebrow {
      display: flex; align-items: center; gap: 8px;
      font-size: 13px; font-weight: 600; color: var(--gray500);
      margin-bottom: 20px;
    }
    .about-eyebrow::before {
      content: '—'; color: var(--gray300);
    }
    .about-title {
      font-size: 32px; font-weight: 900; color: var(--ink);
      line-height: 1.3; margin-bottom: 20px; letter-spacing: -0.5px;
    }
    .about-desc {
      font-size: 15px; color: var(--gray700); line-height: 1.9;
      margin-bottom: 32px;
    }
    .about-targets {
      display: flex; gap: 12px;
    }
    .target-btn {
      padding: 10px 24px; border-radius: 8px;
      background: var(--ink); color: white;
      font-size: 14px; font-weight: 600; border: none; cursor: pointer;
    }
    .target-btn.outline {
      background: white; color: var(--ink);
      border: 1.5px solid var(--gray200);
    }
    .target-list {
      margin-top: 20px; display: none;
    }
    .target-check {
      display: flex; align-items: center; gap: 8px;
      font-size: 14px; color: var(--gray700); margin-bottom: 10px;
    }
    .target-check::before {
      content: '✅'; font-size: 14px;
    }

    /* Features */
    .features-section {
      background: var(--gray100);
      border-top: 1px solid var(--gray200);
      border-bottom: 1px solid var(--gray200);
    }
    .features-strip {
      display: grid; grid-template-columns: repeat(4, 1fr);
      max-width: 1100px; margin: 0 auto;
    }
    .feature-item {
      padding: 36px 28px; text-align: center;
      border-right: 1px solid var(--gray200);
      transition: background 0.2s;
    }
    .feature-item:last-child { border-right: none; }
    .feature-item:hover { background: white; }
    .feature-icon { font-size: 28px; margin-bottom: 12px; }
    .feature-title { font-size: 14px; font-weight: 700; color: var(--ink); margin-bottom: 6px; }
    .feature-desc { font-size: 12px; color: var(--gray500); line-height: 1.6; }

    /* Case Examples Section */
    .cases-section {
      max-width: 1100px; margin: 0 auto;
      padding: 72px 48px;
    }
    .section-header { margin-bottom: 40px; }
    .section-eyebrow {
      font-size: 12px; font-weight: 700; color: var(--accent);
      text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;
    }
    .section-title {
      font-size: 28px; font-weight: 900; color: var(--ink);
      letter-spacing: -0.5px; margin-bottom: 10px;
    }
    .section-subtitle { font-size: 14px; color: var(--gray500); line-height: 1.7; }

    .cases-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
      margin-bottom: 36px;
    }
    .case-card {
      background: white; border-radius: 16px;
      border: 1px solid var(--gray200);
      padding: 28px 24px;
      box-shadow: var(--shadow-sm);
      transition: all 0.25s;
      cursor: pointer;
    }
    .case-card:hover { box-shadow: var(--shadow-md); transform: translateY(-3px); border-color: rgba(232,83,14,0.2); }
    .case-card-top {
      display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px;
    }
    .case-industry {
      font-size: 11px; font-weight: 600; color: var(--blue);
      background: var(--blue-soft); padding: 4px 12px; border-radius: 100px;
    }
    .case-type-badge {
      font-size: 11px; font-weight: 600; color: var(--purple);
      background: var(--purple-soft); padding: 4px 12px; border-radius: 100px;
    }
    .case-title {
      font-size: 16px; font-weight: 700; color: var(--ink);
      line-height: 1.5; margin-bottom: 20px;
    }
    .case-detail-row {
      display: flex; gap: 0; margin-bottom: 16px;
      border: 1px solid var(--gray200); border-radius: 10px; overflow: hidden;
    }
    .case-detail-item {
      flex: 1; padding: 10px 14px;
      border-right: 1px solid var(--gray200);
    }
    .case-detail-item:last-child { border-right: none; }
    .case-detail-label { font-size: 10px; font-weight: 700; color: var(--gray500); margin-bottom: 4px; letter-spacing: 0.5px; }
    .case-detail-value { font-size: 13px; font-weight: 700; color: var(--ink); }
    .case-detail-value.rate { color: var(--red); }

    .case-section-label {
      font-size: 11px; font-weight: 700; color: var(--gray700);
      text-transform: uppercase; letter-spacing: 0.5px;
      margin-bottom: 6px; margin-top: 14px;
    }
    .case-desc {
      font-size: 13px; color: var(--gray700); line-height: 1.7;
    }
    .case-skills {
      display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px;
    }
    .case-skill {
      font-size: 11px; padding: 4px 10px; border-radius: 100px;
      background: var(--gray100); color: var(--gray700);
      border: 1px solid var(--gray200); font-weight: 500;
    }
    .case-divider {
      height: 1px; background: var(--gray200); margin: 14px 0;
    }

    .cases-cta {
      text-align: center; padding: 40px;
      background: linear-gradient(135deg, #fff5f0 0%, #fff8f5 100%);
      border-radius: 20px;
      border: 1px solid rgba(232,83,14,0.12);
    }
    .cases-cta-title { font-size: 20px; font-weight: 700; color: var(--ink); margin-bottom: 8px; }
    .cases-cta-sub { font-size: 14px; color: var(--gray500); margin-bottom: 24px; }

    /* Footer */
    .landing-footer {
      background: var(--ink); color: rgba(255,255,255,0.5);
      text-align: center; padding: 32px 48px;
      font-size: 13px;
    }
    .landing-footer .footer-logo {
      font-family: 'Outfit', sans-serif; font-weight: 800;
      color: white; font-size: 18px; margin-bottom: 12px;
    }

    /* --- Auth Pages --- */
    .auth-page {
      min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, var(--gray100) 0%, var(--paper) 100%);
      padding: 40px 20px;
    }
    .auth-card {
      width: 100%; max-width: 480px;
      background: white; border-radius: 20px;
      padding: 48px 40px;
      box-shadow: var(--shadow-xl);
      position: relative;
    }
    .auth-card::before {
      content: '';
      position: absolute; top: 0; left: 32px; right: 32px; height: 4px;
      background: linear-gradient(90deg, var(--accent), var(--accent2));
      border-radius: 0 0 4px 4px;
    }
    .auth-back {
      font-size: 13px; color: var(--gray500); cursor: pointer;
      display: flex; align-items: center; gap: 4px; margin-bottom: 24px;
    }
    .auth-back:hover { color: var(--ink); }
    .auth-card h2 {
      font-size: 26px; font-weight: 700; margin-bottom: 8px;
      letter-spacing: -0.5px;
    }
    .auth-card .subtitle { font-size: 14px; color: var(--gray500); margin-bottom: 32px; }
    .form-group { margin-bottom: 20px; }
    .form-label {
      display: block; font-size: 13px; font-weight: 600; color: var(--gray700);
      margin-bottom: 6px;
    }
    .form-label .req { color: var(--red); margin-left: 2px; }
    .form-input {
      width: 100%; padding: 12px 16px;
      border: 1.5px solid var(--gray200); border-radius: 10px;
      font-size: 15px; font-family: 'Noto Sans JP', sans-serif;
      background: var(--gray100);
      transition: all 0.2s;
      outline: none;
    }
    .form-input:focus { border-color: var(--accent); background: white; box-shadow: 0 0 0 3px rgba(232,83,14,0.08); }
    .form-select {
      width: 100%; padding: 12px 16px;
      border: 1.5px solid var(--gray200); border-radius: 10px;
      font-size: 15px; font-family: 'Noto Sans JP', sans-serif;
      background: var(--gray100);
      outline: none; cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%238a8a7a' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 16px center;
    }
    .form-select:focus { border-color: var(--accent); background-color: white; }
    .chip-group { display: flex; flex-wrap: wrap; gap: 8px; }
    .chip {
      padding: 6px 14px; border-radius: 100px;
      font-size: 13px; cursor: pointer;
      border: 1.5px solid var(--gray200); background: white;
      transition: all 0.15s; user-select: none;
    }
    .chip:hover { border-color: var(--accent); }
    .chip.active {
      background: var(--accent); color: white;
      border-color: var(--accent);
    }
    .btn-submit {
      width: 100%; padding: 14px; border-radius: 10px;
      background: var(--accent); border: none;
      color: white; font-size: 16px; font-weight: 700; cursor: pointer;
      transition: all 0.25s;
      margin-top: 8px;
    }
    .btn-submit:hover { background: var(--accent2); transform: translateY(-1px); }
    .auth-switch {
      text-align: center; margin-top: 24px;
      font-size: 13px; color: var(--gray500);
    }
    .auth-switch span {
      color: var(--accent); font-weight: 600; cursor: pointer;
    }
    .auth-switch span:hover { text-decoration: underline; }

    /* --- Dashboard --- */
    .dashboard { min-height: 100vh; background: var(--gray100); }
    .dash-nav {
      background: white; border-bottom: 1px solid var(--gray200);
      padding: 0 32px; height: 64px;
      display: flex; align-items: center; justify-content: space-between;
      position: sticky; top: 0; z-index: 50;
    }
    .dash-nav-right { display: flex; align-items: center; gap: 20px; }
    .user-pill {
      display: flex; align-items: center; gap: 10px;
      padding: 6px 16px 6px 6px; border-radius: 100px;
      background: var(--gray100); cursor: pointer;
      transition: background 0.2s; position: relative;
    }
    .user-pill:hover { background: var(--gray200); }
    .user-avatar {
      width: 32px; height: 32px; border-radius: 50%;
      background: linear-gradient(135deg, var(--accent), var(--accent2));
      color: white; display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 700;
    }
    .user-name { font-size: 14px; font-weight: 500; }
    .dropdown {
      position: absolute; top: 48px; right: 0;
      background: white; border-radius: 12px;
      box-shadow: var(--shadow-lg); overflow: hidden;
      min-width: 180px; border: 1px solid var(--gray200);
    }
    .dropdown-item {
      padding: 12px 20px; font-size: 14px; cursor: pointer;
      transition: background 0.15s;
    }
    .dropdown-item:hover { background: var(--gray100); }
    .dropdown-item.danger { color: var(--red); }

    .applied-count {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 14px; border-radius: 8px;
      background: var(--green-soft); color: var(--green);
      font-size: 13px; font-weight: 600;
    }

    .dash-body { display: flex; max-width: 1280px; margin: 0 auto; padding: 28px 32px; gap: 28px; }

    /* Sidebar */
    .sidebar {
      width: 280px; flex-shrink: 0;
      background: white; border-radius: 16px;
      padding: 24px; box-shadow: var(--shadow-sm);
      height: fit-content; position: sticky; top: 92px;
      border: 1px solid var(--gray200);
    }
    .sidebar h3 {
      font-size: 16px; font-weight: 700; margin-bottom: 20px;
      display: flex; align-items: center; gap: 8px;
    }
    .filter-section { margin-bottom: 24px; }
    .filter-title {
      font-size: 13px; font-weight: 600; color: var(--gray500);
      text-transform: uppercase; letter-spacing: 0.5px;
      margin-bottom: 12px;
    }
    .filter-toggle {
      display: flex; align-items: center; gap: 10px;
      padding: 8px 0; cursor: pointer; user-select: none;
    }
    .toggle-box {
      width: 20px; height: 20px; border-radius: 6px;
      border: 2px solid var(--gray300); display: flex; align-items: center; justify-content: center;
      transition: all 0.15s; flex-shrink: 0;
    }
    .toggle-box.active { background: var(--accent); border-color: var(--accent); }
    .toggle-label { font-size: 14px; }
    .clear-filters {
      font-size: 13px; color: var(--accent); cursor: pointer;
      font-weight: 500; margin-top: 8px; display: inline-block;
    }
    .clear-filters:hover { text-decoration: underline; }

    /* Main */
    .main-content { flex: 1; min-width: 0; }
    .search-bar {
      display: flex; gap: 12px; margin-bottom: 20px;
    }
    .search-input-wrap {
      flex: 1; position: relative;
    }
    .search-input-wrap svg { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); }
    .search-input {
      width: 100%; padding: 14px 16px 14px 48px;
      border: 1.5px solid var(--gray200); border-radius: 12px;
      font-size: 15px; font-family: 'Noto Sans JP', sans-serif;
      background: white; outline: none;
      transition: border-color 0.2s;
    }
    .search-input:focus { border-color: var(--accent); }
    .result-count {
      font-size: 14px; color: var(--gray500);
      margin-bottom: 16px; font-weight: 500;
    }
    .result-count strong { color: var(--ink); }

    /* Job Cards */
    .job-list { display: flex; flex-direction: column; gap: 12px; }
    .job-card {
      background: white; border-radius: 14px;
      padding: 24px 28px;
      border: 1.5px solid var(--gray200);
      cursor: pointer;
      transition: all 0.2s;
    }
    .job-card:hover {
      border-color: var(--accent);
      box-shadow: var(--shadow-md);
      transform: translateY(-1px);
    }
    .job-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
    .job-type {
      padding: 4px 10px; border-radius: 6px;
      font-size: 11px; font-weight: 700;
      background: var(--green-soft); color: var(--green);
    }
    .job-type.reward { background: var(--purple-soft); color: var(--purple); }
    .job-date { font-size: 12px; color: var(--gray500); }
    .job-title {
      font-size: 18px; font-weight: 700; margin-bottom: 6px;
      line-height: 1.4; letter-spacing: -0.3px;
    }
    .job-company { font-size: 13px; color: var(--gray500); margin-bottom: 12px; }
    .job-meta { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
    .meta-pill {
      padding: 4px 10px; border-radius: 6px;
      font-size: 12px; font-weight: 500;
      background: var(--gray100); color: var(--gray700);
    }
    .meta-pill.rate { background: var(--red-soft); color: var(--red); font-weight: 600; }
    .job-tags { display: flex; flex-wrap: wrap; gap: 6px; }
    .tag {
      padding: 3px 10px; border-radius: 100px;
      font-size: 11px; font-weight: 500;
      background: var(--blue-soft); color: var(--blue);
    }
    .job-badges { display: flex; gap: 6px; margin-bottom: 10px; }
    .badge {
      padding: 3px 8px; border-radius: 4px;
      font-size: 10px; font-weight: 700;
      letter-spacing: 0.3px;
    }
    .badge.remote { background: #dbeafe; color: #1d4ed8; }
    .badge.urgent { background: #fef3c7; color: #b45309; }
    .badge.highpay { background: #fce7f3; color: #be185d; }
    .badge.lowexp { background: #d1fae5; color: #065f46; }

    /* Detail Modal */
    .modal-overlay {
      position: fixed; inset: 0;
      background: rgba(26,26,46,0.5);
      backdrop-filter: blur(4px);
      z-index: 100;
      display: flex; align-items: center; justify-content: center;
      padding: 20px;
      animation: fadeIn 0.2s;
    }
    .modal {
      background: white; border-radius: 20px;
      width: 100%; max-width: 640px;
      max-height: 85vh; overflow-y: auto;
      box-shadow: var(--shadow-xl);
      animation: slideUp 0.3s;
    }
    .modal-header {
      padding: 32px 32px 0;
      position: relative;
    }
    .modal-close {
      position: absolute; top: 20px; right: 20px;
      width: 36px; height: 36px; border-radius: 50%;
      background: var(--gray100); border: none;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      font-size: 18px; color: var(--gray500);
      transition: all 0.15s;
    }
    .modal-close:hover { background: var(--gray200); color: var(--ink); }
    .modal-body { padding: 24px 32px 32px; }
    .detail-section { margin-bottom: 20px; }
    .detail-label {
      font-size: 12px; font-weight: 700; color: var(--gray500);
      text-transform: uppercase; letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
    .detail-text { font-size: 15px; line-height: 1.7; color: var(--gray700); }
    .btn-apply {
      width: 100%; padding: 16px; border-radius: 12px;
      background: var(--accent); border: none;
      color: white; font-size: 16px; font-weight: 700;
      cursor: pointer; transition: all 0.25s;
    }
    .btn-apply:hover { background: var(--accent2); }
    .btn-apply:disabled {
      background: var(--gray300); cursor: not-allowed;
    }
    .btn-apply.applied {
      background: var(--green); cursor: default;
    }

    /* Apply modal textarea */
    .apply-textarea {
      width: 100%; min-height: 120px; padding: 14px;
      border: 1.5px solid var(--gray200); border-radius: 10px;
      font-size: 14px; font-family: 'Noto Sans JP', sans-serif;
      resize: vertical; outline: none;
      margin-bottom: 16px;
    }
    .apply-textarea:focus { border-color: var(--accent); }

    /* Toast */
    .toast {
      position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%);
      background: var(--ink); color: white;
      padding: 14px 28px; border-radius: 12px;
      font-size: 14px; font-weight: 500;
      box-shadow: var(--shadow-lg);
      z-index: 999;
      animation: slideUp 0.3s;
    }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

    @media (max-width: 900px) {
      .hero-section { min-height: auto; }
      .hero-left { padding: 48px 24px; max-width: 100%; }
      .hero h1 { font-size: 28px; }
      .hero h1 .accent-line { font-size: 36px; }
      .hero h1 .accent-line .num { font-size: 52px; }
      .hero-right { display: none; }
      .hero-blob { display: none; }
      .features-strip { grid-template-columns: repeat(2, 1fr); }
      .about-section { flex-direction: column; padding: 48px 24px; gap: 32px; }
      .about-illo { flex: none; width: 100%; max-width: 360px; margin: 0 auto; }
      .cases-grid { grid-template-columns: 1fr; }
      .cases-section { padding: 48px 20px; }
      .dash-body { flex-direction: column; padding: 16px; }
      .sidebar { width: 100%; position: static; }
      .landing-nav { padding: 0 20px; }
    }
  `;

  // --- Landing ---
  if (page === "landing") {
    const featuredJobs = JOBS.filter(j => j.highPay).slice(0, 3);
    return (
      <>
        <style>{css}</style>
        <div className="page-landing">

          {/* Nav */}
          <nav className="landing-nav">
            <div className="logo">
              <div className="logo-mark">S</div>
              SalesBoard
            </div>
            <div className="nav-btns">
              <button className="btn-ghost" onClick={() => setPage("login")}>ログイン</button>
              <button className="btn-accent" onClick={() => setPage("register")}>無料登録</button>
            </div>
          </nav>

          {/* Hero */}
          <div className="hero-section">
            {/* Blue blob background */}
            <svg className="hero-blob" viewBox="0 0 700 560" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
              <path d="M 120 560 Q 30 480 20 350 Q 10 180 140 80 Q 260 -20 430 10 Q 590 40 660 180 Q 730 320 680 460 Q 620 560 120 560 Z" fill="#DBEAFE"/>
            </svg>

            <div className="hero-left">
              <div className="hero-eyebrow">営業フリーランスのための案件紹介サービス</div>
              <h1 className="hero">
                営業フリーランスという働き方で<br/>
                <span className="accent-line"><span className="num">月100万</span>円以上の収入実績も</span>
              </h1>
              <p>目的に合わせた案件をオファーします</p>
              <div className="hero-tags">
                {[["🏠","フルリモート"],["📈","スキルアップ"],["💰","高待遇"],["🔄","副業/複業"]].map(([icon, label]) => (
                  <div key={label} className="hero-tag">
                    <div className="hero-tag-icon">{icon}</div>
                    <div className="hero-tag-label">{label}</div>
                  </div>
                ))}
              </div>
              <div className="cta-buttons">
                <button className="btn-cta-primary" onClick={() => setPage("register")}>
                  無料で会員登録 →
                </button>
                <button className="btn-cta-secondary" onClick={() => setPage("login")}>
                  案件を探す
                </button>
              </div>
            </div>

            {/* Hero Illustration */}
            <div className="hero-right">
              <img
                src="/undraw_investor-update_ou4c.svg"
                alt="営業フリーランスイメージ"
                style={{width:'85%', maxWidth:460, display:'block'}}
              />
            </div>
          </div>

          {/* Features */}
          <div className="features-section">
            <div className="features-strip">
              <div className="feature-item">
                <div className="feature-icon">💼</div>
                <div className="feature-title">営業特化</div>
                <div className="feature-desc">営業職に特化した案件のみ掲載。ミスマッチなし</div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🏠</div>
                <div className="feature-title">リモート案件</div>
                <div className="feature-desc">フルリモート・一部リモート案件を多数掲載</div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">💰</div>
                <div className="feature-title">高単価案件</div>
                <div className="feature-desc">月60万円〜の高単価案件を厳選してお届け</div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">⚡</div>
                <div className="feature-title">最短即日</div>
                <div className="feature-desc">応募から稼働開始まで最短即日マッチング</div>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="about-section">
            <div className="about-illo">
              <img src="/undraw_process_0wew.svg" alt="サービス説明イメージ" style={{width:'100%', maxWidth:380, display:'block'}} />
            </div>
            <div className="about-text">
              <div className="about-eyebrow">About us</div>
              <div className="about-title">SalesBoard<br />とは</div>
              <div className="about-desc">
                SalesBoardは、営業フリーランスのための案件紹介サービスです。<br /><br />
                豊富な案件からご希望にあった案件をご紹介。最短1週間でお仕事への参画が可能です。正社員の方も経験豊富なキャリアパートナーが案件探し・キャリア形成のサポートをします。
              </div>
              <div style={{marginBottom:16}}>
                <div style={{fontSize:13,fontWeight:700,color:'var(--ink)',marginBottom:12}}>こんな人におすすめ</div>
                {["他案件が落ち着いたので掛け持ちしたい","案件探しの負担を減らしたい","今より案件の単価を上げたい","スキルを広げたい・極めたい","独立に向けて経験を積みたい"].map(t => (
                  <div key={t} className="target-check">{t}</div>
                ))}
              </div>
              <div className="cta-buttons">
                <button className="btn-cta-primary" onClick={() => setPage("register")}>無料で会員登録 →</button>
              </div>
            </div>
          </div>

          {/* Case Examples */}
          <div style={{background:'var(--gray100)', borderTop:'1px solid var(--gray200)', borderBottom:'1px solid var(--gray200)'}}>
            <div className="cases-section">
              <div className="section-header">
                <div className="section-eyebrow">Case Examples</div>
                <div className="section-title">ご紹介案件例</div>
                <div className="section-subtitle">高単価・リモート・フレックスなど、希望に合った案件をご紹介します</div>
              </div>

              <div className="cases-grid">
                {featuredJobs.map(job => (
                  <div key={job.id} className="case-card" onClick={() => setPage("login")}>
                    <div className="case-card-top">
                      {job.tags.slice(0, 2).map(t => (
                        <span key={t} className="case-industry">{t}</span>
                      ))}
                      <span className="case-type-badge">{job.type}</span>
                    </div>
                    <div className="case-title">{job.title}</div>
                    <div className="case-detail-row">
                      <div className="case-detail-item">
                        <div className="case-detail-label">⊙ 単価</div>
                        <div className="case-detail-value rate">{job.rate}</div>
                      </div>
                      <div className="case-detail-item">
                        <div className="case-detail-label">💼 働き方</div>
                        <div className="case-detail-value">{job.remote ? "リモート可" : "常駐"}</div>
                      </div>
                      <div className="case-detail-item">
                        <div className="case-detail-label">📅 期間</div>
                        <div className="case-detail-value">{job.period}</div>
                      </div>
                    </div>
                    <div className="case-section-label">💬 職務内容</div>
                    <div className="case-desc">{job.description}</div>
                    <div className="case-divider" />
                    <div className="case-section-label">✨ 活かせるスキル</div>
                    <div className="case-skills">
                      {job.requirements.split("、").map((r, i) => (
                        <span key={i} className="case-skill">{r}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="cases-cta">
                <div className="cases-cta-title">他にも多数の案件を掲載中</div>
                <div className="cases-cta-sub">無料登録後、すべての案件にアクセスできます</div>
                <button className="btn-cta-primary" onClick={() => setPage("register")}>
                  無料で会員登録して案件を見る →
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="landing-footer">
            <div className="footer-logo">SalesBoard</div>
            <div>© 2026 SalesBoard. All rights reserved.</div>
          </div>

        </div>
        {toast && <div className="toast">{toast}</div>}
      </>
    );
  }

  // --- Register ---
  if (page === "register") {
    return (
      <>
        <style>{css}</style>
        <div className="auth-page">
          <div className="auth-card">
            <div className="auth-back" onClick={() => setPage("landing")}>← トップに戻る</div>
            <h2>フリーランス登録</h2>
            <p className="subtitle">まずは無料登録して案件を探しましょう</p>
            <div className="form-group">
              <label className="form-label">お名前<span className="req">*</span></label>
              <input className="form-input" placeholder="山田 太郎" value={regForm.name}
                onChange={e => setRegForm({...regForm, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">メールアドレス<span className="req">*</span></label>
              <input className="form-input" type="email" placeholder="taro@example.com" value={regForm.email}
                onChange={e => setRegForm({...regForm, email: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">パスワード<span className="req">*</span></label>
              <input className="form-input" type="password" placeholder="8文字以上" value={regForm.password}
                onChange={e => setRegForm({...regForm, password: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">営業経験年数</label>
              <select className="form-select" value={regForm.experience}
                onChange={e => setRegForm({...regForm, experience: e.target.value})}>
                <option value="">選択してください</option>
                <option value="1年未満">1年未満</option>
                <option value="1〜3年">1〜3年</option>
                <option value="3〜5年">3〜5年</option>
                <option value="5〜10年">5〜10年</option>
                <option value="10年以上">10年以上</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">得意業界（複数選択可）</label>
              <div className="chip-group">
                {INDUSTRIES.map(ind => (
                  <div key={ind}
                    className={`chip ${regForm.specialties.includes(ind) ? 'active' : ''}`}
                    onClick={() => {
                      setRegForm(prev => ({
                        ...prev,
                        specialties: prev.specialties.includes(ind)
                          ? prev.specialties.filter(s => s !== ind)
                          : [...prev.specialties, ind]
                      }));
                    }}>{ind}</div>
                ))}
              </div>
            </div>
            <button className="btn-submit" onClick={handleRegister}>無料登録する</button>
            <div className="auth-switch">
              すでにアカウントをお持ちの方は <span onClick={() => setPage("login")}>ログイン</span>
            </div>
          </div>
        </div>
        {toast && <div className="toast">{toast}</div>}
      </>
    );
  }

  // --- Login ---
  if (page === "login") {
    return (
      <>
        <style>{css}</style>
        <div className="auth-page">
          <div className="auth-card">
            <div className="auth-back" onClick={() => setPage("landing")}>← トップに戻る</div>
            <h2>ログイン</h2>
            <p className="subtitle">アカウントにログインして案件を探しましょう</p>
            <div className="form-group">
              <label className="form-label">メールアドレス</label>
              <input className="form-input" type="email" placeholder="taro@example.com" value={loginForm.email}
                onChange={e => setLoginForm({...loginForm, email: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">パスワード</label>
              <input className="form-input" type="password" placeholder="パスワード" value={loginForm.password}
                onChange={e => setLoginForm({...loginForm, password: e.target.value})} />
            </div>
            <button className="btn-submit" onClick={handleLogin}>ログイン</button>
            <div className="auth-switch">
              アカウントをお持ちでない方は <span onClick={() => setPage("register")}>無料登録</span>
            </div>
          </div>
        </div>
        {toast && <div className="toast">{toast}</div>}
      </>
    );
  }

  // --- Dashboard ---
  return (
    <>
      <style>{css}</style>
      <div className="dashboard">
        <nav className="dash-nav">
          <div className="logo" style={{ color: "var(--ink)" }} onClick={() => setPage("landing")}>
            <div className="logo-mark">S</div>
            SalesBoard
          </div>
          <div className="dash-nav-right">
            <div className="applied-count">
              ✓ 応募済み {appliedJobs.length}件
            </div>
            <div className="user-pill" onClick={() => setMenuOpen(!menuOpen)}>
              <div className="user-avatar">{user?.name?.[0] || "U"}</div>
              <span className="user-name">{user?.name || "ユーザー"}</span>
              {menuOpen && (
                <div className="dropdown">
                  <div className="dropdown-item">マイページ</div>
                  <div className="dropdown-item">応募履歴</div>
                  <div className="dropdown-item">プロフィール編集</div>
                  <div className="dropdown-item danger" onClick={() => { setUser(null); setPage("landing"); setMenuOpen(false); }}>
                    ログアウト
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>

        <div className="dash-body">
          {/* Sidebar */}
          <aside className="sidebar">
            <h3>🔍 絞り込み検索</h3>
            <div className="filter-section">
              <div className="filter-title">案件タイプ</div>
              {[
                { key: "remote", label: "リモート案件" },
                { key: "urgent", label: "急募案件" },
                { key: "highPay", label: "高単価案件" },
                { key: "lowExp", label: "経験少なめOK" },
              ].map(f => (
                <div key={f.key} className="filter-toggle" onClick={() => setFilters(prev => ({...prev, [f.key]: !prev[f.key]}))}>
                  <div className={`toggle-box ${filters[f.key] ? 'active' : ''}`}>
                    {filters[f.key] && <span style={{color:'white',fontSize:12,fontWeight:700}}>✓</span>}
                  </div>
                  <span className="toggle-label">{f.label}</span>
                </div>
              ))}
            </div>
            <div className="filter-section">
              <div className="filter-title">業界</div>
              <div className="chip-group">
                {INDUSTRIES.map(ind => (
                  <div key={ind}
                    className={`chip ${filters.industries.includes(ind) ? 'active' : ''}`}
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        industries: prev.industries.includes(ind)
                          ? prev.industries.filter(i => i !== ind)
                          : [...prev.industries, ind]
                      }));
                    }}>{ind}</div>
                ))}
              </div>
            </div>
            {(filters.remote || filters.urgent || filters.highPay || filters.lowExp || filters.industries.length > 0) && (
              <div className="clear-filters" onClick={() => setFilters({ remote: false, urgent: false, highPay: false, lowExp: false, industries: [] })}>
                ✕ 絞り込みをクリア
              </div>
            )}
          </aside>

          {/* Main */}
          <div className="main-content">
            <div className="search-bar">
              <div className="search-input-wrap">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8a8a7a" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <input className="search-input" placeholder="キーワードで検索（例：SaaS、新規開拓、コンサル）"
                  value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="result-count">
              検索結果: <strong>{filteredJobs.length}件</strong>
            </div>
            <div className="job-list">
              {filteredJobs.map(job => (
                <div key={job.id} className="job-card" onClick={() => setSelectedJob(job)}>
                  <div className="job-card-top">
                    <span className={`job-type ${job.type === '成果報酬' ? 'reward' : ''}`}>{job.type}</span>
                    <span className="job-date">{daysAgo(job.posted)}</span>
                  </div>
                  <div className="job-badges">
                    {job.remote && <span className="badge remote">リモート</span>}
                    {job.urgent && <span className="badge urgent">急募</span>}
                    {job.highPay && <span className="badge highpay">高単価</span>}
                    {job.lowExp && <span className="badge lowexp">経験少なめOK</span>}
                  </div>
                  <div className="job-title">{job.title}</div>
                  <div className="job-company">{job.company}</div>
                  <div className="job-meta">
                    <span className="meta-pill rate">{job.rate}</span>
                    <span className="meta-pill">{job.location}</span>
                    <span className="meta-pill">{job.period}</span>
                  </div>
                  <div className="job-tags">
                    {job.tags.map(t => <span key={t} className="tag">{t}</span>)}
                  </div>
                  {appliedJobs.includes(job.id) && (
                    <div style={{marginTop:10,fontSize:13,color:'var(--green)',fontWeight:600}}>✓ 応募済み</div>
                  )}
                </div>
              ))}
              {filteredJobs.length === 0 && (
                <div style={{textAlign:'center',padding:60,color:'var(--gray500)'}}>
                  <div style={{fontSize:40,marginBottom:12}}>📭</div>
                  <div style={{fontSize:16,fontWeight:600}}>該当する案件が見つかりませんでした</div>
                  <div style={{fontSize:13,marginTop:6}}>検索条件を変更してお試しください</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Job Detail Modal */}
      {selectedJob && !showApplyModal && (
        <div className="modal-overlay" onClick={() => setSelectedJob(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <button className="modal-close" onClick={() => setSelectedJob(null)}>✕</button>
              <span className={`job-type ${selectedJob.type === '成果報酬' ? 'reward' : ''}`}>{selectedJob.type}</span>
              <h2 style={{fontSize:22,fontWeight:700,marginTop:12,lineHeight:1.4,paddingRight:40}}>
                {selectedJob.title}
              </h2>
              <div style={{fontSize:14,color:'var(--gray500)',marginTop:4}}>{selectedJob.company}</div>
            </div>
            <div className="modal-body">
              <div className="job-badges" style={{marginBottom:16}}>
                {selectedJob.remote && <span className="badge remote">リモート</span>}
                {selectedJob.urgent && <span className="badge urgent">急募</span>}
                {selectedJob.highPay && <span className="badge highpay">高単価</span>}
                {selectedJob.lowExp && <span className="badge lowexp">経験少なめOK</span>}
              </div>
              <div className="detail-section">
                <div className="detail-label">報酬</div>
                <div className="detail-text" style={{fontWeight:600,color:'var(--red)'}}>{selectedJob.rate}</div>
              </div>
              <div className="detail-section">
                <div className="detail-label">勤務地</div>
                <div className="detail-text">{selectedJob.location}</div>
              </div>
              <div className="detail-section">
                <div className="detail-label">期間</div>
                <div className="detail-text">{selectedJob.period}</div>
              </div>
              <div className="detail-section">
                <div className="detail-label">案件概要</div>
                <div className="detail-text">{selectedJob.description}</div>
              </div>
              <div className="detail-section">
                <div className="detail-label">応募要件</div>
                <div className="detail-text">{selectedJob.requirements}</div>
              </div>
              <div className="detail-section">
                <div className="detail-label">関連タグ</div>
                <div className="job-tags">
                  {selectedJob.tags.map(t => <span key={t} className="tag">{t}</span>)}
                </div>
              </div>
              {appliedJobs.includes(selectedJob.id) ? (
                <button className="btn-apply applied">✓ 応募済み</button>
              ) : (
                <button className="btn-apply" onClick={() => setShowApplyModal(true)}>
                  この案件に応募する →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && selectedJob && (
        <div className="modal-overlay" onClick={() => setShowApplyModal(false)}>
          <div className="modal" style={{maxWidth:500}} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <button className="modal-close" onClick={() => setShowApplyModal(false)}>✕</button>
              <h2 style={{fontSize:20,fontWeight:700,paddingRight:40}}>応募する</h2>
              <div style={{fontSize:14,color:'var(--gray500)',marginTop:4}}>{selectedJob.title}</div>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">自己PR・メッセージ</label>
                <textarea className="apply-textarea" placeholder="これまでの営業経験やアピールポイントを記入してください..."
                  value={applyMsg} onChange={e => setApplyMsg(e.target.value)} />
              </div>
              <button className="btn-apply" onClick={handleApply}>
                応募を送信する
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
