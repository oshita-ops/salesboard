import { useState, useEffect, useCallback } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "firebase/auth";
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp, setDoc, getDoc } from "firebase/firestore";

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
const ADMIN_EMAIL = "oshita@jcon.co.jp";

const SAMPLE_JOBS = [
  { id:"s1", title:"SaaS新規開拓営業", company:"株式会社テックブリッジ", type:"業務委託", rate:"月60〜80万円", location:"東京（一部リモート）", tags:["新規開拓","SaaS","IT"], remote:true, urgent:false, highPay:true, lowExp:false, description:"急成長SaaSプロダクトの新規開拓営業。リード獲得〜クロージングまで一貫してお任せします。", requirements:"法人営業経験3年以上、SaaS業界経験歓迎", period:"長期（6ヶ月〜）", posted:"2026-04-11", published:true },
  { id:"s2", title:"人材紹介パートナー営業", company:"キャリアリンク株式会社", type:"業務委託", rate:"月40〜55万円", location:"フルリモート", tags:["人材","パートナー","ルート営業"], remote:true, urgent:true, highPay:false, lowExp:true, description:"人材紹介サービスのパートナー企業開拓。既存ネットワークを活かせる方歓迎。", requirements:"営業経験1年以上、人材業界経験あれば尚可", period:"中期（3〜6ヶ月）", posted:"2026-04-12", published:true },
  { id:"s3", title:"DX推進コンサルティング営業", company:"デジタルシフト株式会社", type:"業務委託", rate:"月70〜100万円", location:"東京（週2出社）", tags:["DX","コンサル","IT"], remote:true, urgent:true, highPay:true, lowExp:false, description:"大手企業向けDX推進ソリューションの提案営業。経営層へのプレゼンテーション能力が求められます。", requirements:"コンサル営業経験5年以上、IT業界経験必須", period:"長期（1年〜）", posted:"2026-04-13", published:true },
  { id:"s4", title:"医療機器代理店営業", company:"メディカルプロ株式会社", type:"業務委託", rate:"月55〜70万円", location:"全国（出張あり）", tags:["医療","代理店","BtoB"], remote:false, urgent:true, highPay:true, lowExp:false, description:"医療機器の代理店チャネル開拓・管理。医療業界での営業経験がある方を求めています。", requirements:"医療業界営業経験3年以上", period:"長期（6ヶ月〜）", posted:"2026-04-08", published:true },
  { id:"s5", title:"スタートアップ資金調達支援", company:"ベンチャーキャピタルパートナーズ", type:"業務委託", rate:"月80〜120万円", location:"東京（一部リモート）", tags:["スタートアップ","資金調達","金融"], remote:true, urgent:false, highPay:true, lowExp:false, description:"スタートアップの資金調達支援。投資家とのリレーション構築・ピッチ支援を担当。", requirements:"金融・VC業界経験5年以上、広いネットワーク", period:"中期（3〜6ヶ月）", posted:"2026-04-07", published:true },
  { id:"s6", title:"ECサイト広告営業", company:"アドクリエイト株式会社", type:"業務委託", rate:"月35〜50万円", location:"フルリモート", tags:["広告","EC","デジタル"], remote:true, urgent:false, highPay:false, lowExp:true, description:"ECサイト運営企業へのWeb広告ソリューション提案。丁寧にサポートします。", requirements:"営業経験1年以上、デジタルマーケティングに興味がある方", period:"中期（3ヶ月〜）", posted:"2026-04-09", published:true },
  { id:"s7", title:"保険代理店向けルート営業", company:"インシュアテック株式会社", type:"業務委託", rate:"月30〜45万円", location:"大阪・名古屋", tags:["保険","ルート営業","代理店"], remote:false, urgent:false, highPay:false, lowExp:true, description:"保険代理店への新商品案内・フォローアップ営業。丁寧な対応ができる方歓迎。", requirements:"営業経験1年以上、保険業界経験あれば尚可", period:"長期（6ヶ月〜）", posted:"2026-04-06", published:true },
  { id:"s8", title:"クラウドERP導入営業", company:"クラウドワークス株式会社", type:"業務委託", rate:"月65〜85万円", location:"東京（週1出社）", tags:["ERP","クラウド","IT"], remote:true, urgent:true, highPay:true, lowExp:false, description:"中堅企業向けクラウドERPの導入提案営業。業務改善提案からクロージングまで。", requirements:"IT営業経験3年以上、ERP関連知識歓迎", period:"長期（1年〜）", posted:"2026-04-13", published:true },
  { id:"s9", title:"不動産投資セミナー集客営業", company:"グローバルアセット株式会社", type:"成果報酬", rate:"1件あたり3〜5万円", location:"東京・大阪", tags:["不動産","セミナー","成果報酬"], remote:false, urgent:false, highPay:true, lowExp:true, description:"富裕層向け不動産投資セミナーへの集客営業。成果報酬型で高収入を目指せます。", requirements:"営業経験不問、人脈・集客力のある方", period:"長期（継続案件）", posted:"2026-04-10", published:true },
  { id:"s10", title:"飲食店向けデリバリーサービス営業", company:"フードコネクト株式会社", type:"成果報酬", rate:"1店舗あたり2万円", location:"全国（エリア選択可）", tags:["飲食","デリバリー","成果報酬"], remote:false, urgent:true, highPay:false, lowExp:true, description:"飲食店へのデリバリーサービス加盟営業。自分のペースで取り組めます。", requirements:"営業経験不問、行動力のある方", period:"自由（好きな時に稼働）", posted:"2026-04-12", published:true },
];

const INDUSTRIES = ["IT","SaaS","人材","不動産","広告","医療","金融","保険","飲食","DX","コンサル","EC"];

function daysAgo(dateStr) {
  const d = new Date(dateStr);
  const now = new Date("2026-04-18");
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

  // Forms
  const [regForm, setRegForm] = useState({ name:"", email:"", password:"", experience:"", specialties:[] });
  const [loginForm, setLoginForm] = useState({ email:"", password:"" });
  const [authError, setAuthError] = useState("");

  // Jobs
  const [jobs, setJobs] = useState(SAMPLE_JOBS);

  // Dashboard
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ remote:false, urgent:false, highPay:false, lowExp:false, industries:[] });
  const [selectedJob, setSelectedJob] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyMsg, setApplyMsg] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [dashTab, setDashTab] = useState("jobs");

  // Profile
  const [profileForm, setProfileForm] = useState({ name:"", experience:"", specialties:[], pr:"", desiredRate:"", desiredStyle:"" });

  // Applications
  const [myApplications, setMyApplications] = useState([]);

  // Admin
  const [adminTab, setAdminTab] = useState("jobs");
  const [adminApplications, setAdminApplications] = useState([]);
  const [adminForm, setAdminForm] = useState({ title:"", company:"", type:"業務委託", rate:"", location:"", tags:"", remote:false, urgent:false, highPay:false, lowExp:false, description:"", requirements:"", period:"", published:true });
  const [editingJob, setEditingJob] = useState(null);
  const [adminLoading, setAdminLoading] = useState(false);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const isAdmin = user?.email === ADMIN_EMAIL;

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fu) => {
      if (fu) {
        setUser({ name: fu.displayName || fu.email, email: fu.email });
        setPage("dashboard");
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  // Firestore jobs listener
  useEffect(() => {
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
  }, []);

  // Profile listener
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "profiles", user.email), (snap) => {
      if (snap.exists()) setProfileForm(snap.data());
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
    if (search && !job.title.includes(search) && !job.company.includes(search) && !job.tags.some(t=>t.includes(search))) return false;
    if (filters.remote && !job.remote) return false;
    if (filters.urgent && !job.urgent) return false;
    if (filters.highPay && !job.highPay) return false;
    if (filters.lowExp && !job.lowExp) return false;
    if (filters.industries.length > 0 && !job.tags.some(t=>filters.industries.includes(t))) return false;
    return true;
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
      try {
        await fetch("https://api.emailjs.com/api/v1.0/email/send", {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ service_id:"service_kgfb1pp", template_id:"template_hfoiagq", user_id:"l-4JMsbbRt5ETL0Su", template_params:{ name:regForm.name, email:regForm.email } })
        });
      } catch(e) {}
      showToast("登録が完了しました！");
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
    try {
      await setDoc(doc(db, "profiles", user.email), { ...profileForm, email: user.email });
      showToast("プロフィールを保存しました！");
    } catch(e) { showToast("保存に失敗しました"); }
  };

  // Admin functions
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
      --ink:#1a1a2e; --paper:#fafaf7; --accent:#e8530e; --accent2:#ff7b3a;
      --green:#0d9f6e; --green-soft:#e6f7f0; --blue:#2563eb; --blue-soft:#eff4ff;
      --purple:#7c3aed; --purple-soft:#f3eeff; --red:#dc2626; --red-soft:#fef2f2;
      --gray100:#f5f5f0; --gray200:#e8e8e0; --gray300:#d4d4c8; --gray500:#8a8a7a; --gray700:#4a4a3e;
      --shadow-sm:0 1px 3px rgba(26,26,46,0.06); --shadow-md:0 4px 16px rgba(26,26,46,0.08);
      --shadow-lg:0 8px 32px rgba(26,26,46,0.12); --shadow-xl:0 16px 48px rgba(26,26,46,0.16);
    }
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Noto Sans JP',sans-serif;background:var(--paper);color:var(--ink);}

    /* NAV */
    .landing-nav{display:flex;align-items:center;justify-content:space-between;padding:0 48px;height:68px;background:white;border-bottom:1px solid var(--gray200);position:sticky;top:0;z-index:100;}
    .logo{font-family:'Outfit',sans-serif;font-weight:800;font-size:22px;color:var(--ink);display:flex;align-items:center;gap:10px;cursor:pointer;}
    .logo-mark{width:34px;height:34px;background:var(--accent);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:900;color:white;}
    .nav-btns{display:flex;gap:10px;align-items:center;}
    .btn-ghost{padding:10px 24px;border-radius:100px;background:white;border:2px solid var(--gray200);color:var(--ink);font-size:14px;font-weight:600;cursor:pointer;transition:all 0.2s;}
    .btn-ghost:hover{border-color:var(--accent);color:var(--accent);}
    .btn-accent{padding:10px 24px;border-radius:100px;background:var(--accent);border:none;color:white;font-size:14px;font-weight:700;cursor:pointer;box-shadow:0 4px 16px rgba(232,83,14,0.35);transition:all 0.25s;}
    .btn-accent:hover{background:var(--accent2);transform:translateY(-1px);}

    /* HERO */
    .hero-section{position:relative;min-height:560px;display:flex;align-items:center;overflow:hidden;background:white;}
    .hero-blob{position:absolute;top:0;right:0;width:58%;height:100%;pointer-events:none;}
    .hero-left{position:relative;z-index:2;padding:72px 0 72px 64px;max-width:520px;}
    .hero-right{position:absolute;right:0;top:0;width:58%;height:100%;display:flex;align-items:center;justify-content:center;z-index:2;pointer-events:none;}
    .hero-eyebrow{font-size:13px;font-weight:600;color:var(--accent);margin-bottom:20px;display:flex;align-items:center;gap:6px;}
    .hero-eyebrow::before{content:'●';font-size:8px;}
    .hero h1{font-family:'Noto Sans JP',sans-serif;font-size:38px;font-weight:900;color:var(--ink);line-height:1.4;letter-spacing:-1px;margin-bottom:20px;}
    .hero h1 .accent-line{display:flex;align-items:baseline;gap:4px;flex-wrap:wrap;font-size:44px;color:var(--ink);}
    .hero h1 .accent-line .num{font-family:'Outfit',sans-serif;font-size:64px;font-weight:800;color:var(--accent);}
    .hero p{font-size:15px;color:var(--gray500);line-height:1.9;margin-bottom:32px;max-width:420px;}
    .hero-tags{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:36px;}
    .hero-tag{display:flex;flex-direction:column;align-items:center;gap:8px;width:90px;}
    .hero-tag-icon{width:56px;height:56px;border-radius:50%;background:#2B4E8C;display:flex;align-items:center;justify-content:center;font-size:22px;color:white;}
    .hero-tag-label{font-size:12px;font-weight:600;color:var(--ink);}
    .cta-buttons{display:flex;gap:14px;flex-wrap:wrap;align-items:center;}
    .btn-cta-primary{padding:17px 44px;border-radius:100px;background:var(--accent);border:none;color:white;font-size:16px;font-weight:700;cursor:pointer;box-shadow:0 8px 28px rgba(232,83,14,0.45);transition:all 0.3s;}
    .btn-cta-primary:hover{background:var(--accent2);transform:translateY(-3px);}
    .btn-cta-secondary{padding:15px 40px;border-radius:100px;background:white;border:2px solid var(--gray300);color:var(--ink);font-size:16px;font-weight:600;cursor:pointer;transition:all 0.2s;}
    .btn-cta-secondary:hover{border-color:var(--accent);color:var(--accent);}

    /* FEATURES */
    .features-section{background:var(--gray100);border-top:1px solid var(--gray200);border-bottom:1px solid var(--gray200);}
    .features-strip{display:grid;grid-template-columns:repeat(4,1fr);max-width:1100px;margin:0 auto;}
    .feature-item{padding:36px 28px;text-align:center;border-right:1px solid var(--gray200);transition:background 0.2s;}
    .feature-item:last-child{border-right:none;}
    .feature-item:hover{background:white;}
    .feature-icon{font-size:28px;margin-bottom:12px;}
    .feature-title{font-size:14px;font-weight:700;color:var(--ink);margin-bottom:6px;}
    .feature-desc{font-size:12px;color:var(--gray500);line-height:1.6;}

    /* ABOUT */
    .about-section{padding:80px 64px;display:flex;align-items:center;gap:72px;max-width:1100px;margin:0 auto;}
    .about-illo{flex:0 0 380px;}
    .about-illo img{width:100%;}
    .about-text{flex:1;}
    .about-eyebrow{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--gray500);margin-bottom:20px;}
    .about-eyebrow::before{content:'—';color:var(--gray300);}
    .about-title{font-size:32px;font-weight:900;color:var(--ink);line-height:1.3;margin-bottom:20px;letter-spacing:-0.5px;}
    .about-desc{font-size:15px;color:var(--gray700);line-height:1.9;margin-bottom:32px;}
    .target-check{display:flex;align-items:center;gap:8px;font-size:14px;color:var(--gray700);margin-bottom:10px;}
    .target-check::before{content:'✅';font-size:14px;}

    /* CASES */
    .cases-section{max-width:1100px;margin:0 auto;padding:72px 48px;}
    .section-eyebrow{font-size:12px;font-weight:700;color:var(--accent);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;}
    .section-title{font-size:28px;font-weight:900;color:var(--ink);letter-spacing:-0.5px;margin-bottom:10px;}
    .section-subtitle{font-size:14px;color:var(--gray500);line-height:1.7;margin-bottom:40px;}
    .cases-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:36px;}
    .case-card{background:white;border-radius:16px;border:1px solid var(--gray200);padding:28px 24px;box-shadow:var(--shadow-sm);transition:all 0.25s;cursor:pointer;}
    .case-card:hover{box-shadow:var(--shadow-md);transform:translateY(-3px);border-color:rgba(232,83,14,0.2);}
    .case-card-top{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;}
    .case-industry{font-size:11px;font-weight:600;color:var(--blue);background:var(--blue-soft);padding:4px 12px;border-radius:100px;}
    .case-type-badge{font-size:11px;font-weight:600;color:var(--purple);background:var(--purple-soft);padding:4px 12px;border-radius:100px;}
    .case-title{font-size:16px;font-weight:700;color:var(--ink);line-height:1.5;margin-bottom:20px;}
    .case-detail-row{display:flex;gap:0;margin-bottom:16px;border:1px solid var(--gray200);border-radius:10px;overflow:hidden;}
    .case-detail-item{flex:1;padding:10px 14px;border-right:1px solid var(--gray200);}
    .case-detail-item:last-child{border-right:none;}
    .case-detail-label{font-size:10px;font-weight:700;color:var(--gray500);margin-bottom:4px;}
    .case-detail-value{font-size:13px;font-weight:700;color:var(--ink);}
    .case-detail-value.rate{color:var(--red);}
    .case-section-label{font-size:11px;font-weight:700;color:var(--gray700);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;margin-top:14px;}
    .case-desc{font-size:13px;color:var(--gray700);line-height:1.7;}
    .case-skills{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;}
    .case-skill{font-size:11px;padding:4px 10px;border-radius:100px;background:var(--gray100);color:var(--gray700);border:1px solid var(--gray200);font-weight:500;}
    .case-divider{height:1px;background:var(--gray200);margin:14px 0;}
    .cases-cta{text-align:center;padding:40px;background:linear-gradient(135deg,#fff5f0 0%,#fff8f5 100%);border-radius:20px;border:1px solid rgba(232,83,14,0.12);}
    .cases-cta-title{font-size:20px;font-weight:700;color:var(--ink);margin-bottom:8px;}
    .cases-cta-sub{font-size:14px;color:var(--gray500);margin-bottom:24px;}
    .landing-footer{background:var(--ink);color:rgba(255,255,255,0.5);text-align:center;padding:32px 48px;font-size:13px;}
    .landing-footer .footer-logo{font-family:'Outfit',sans-serif;font-weight:800;color:white;font-size:18px;margin-bottom:12px;}

    /* AUTH */
    .auth-page{min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,var(--gray100) 0%,var(--paper) 100%);padding:40px 20px;}
    .auth-card{width:100%;max-width:480px;background:white;border-radius:20px;padding:48px 40px;box-shadow:var(--shadow-xl);position:relative;}
    .auth-card::before{content:'';position:absolute;top:0;left:32px;right:32px;height:4px;background:linear-gradient(90deg,var(--accent),var(--accent2));border-radius:0 0 4px 4px;}
    .auth-back{font-size:13px;color:var(--gray500);cursor:pointer;display:flex;align-items:center;gap:4px;margin-bottom:24px;}
    .auth-card h2{font-size:26px;font-weight:700;margin-bottom:8px;}
    .auth-card .subtitle{font-size:14px;color:var(--gray500);margin-bottom:32px;}
    .form-group{margin-bottom:20px;}
    .form-label{display:block;font-size:13px;font-weight:600;color:var(--gray700);margin-bottom:6px;}
    .form-label .req{color:var(--red);margin-left:2px;}
    .form-input{width:100%;padding:12px 16px;border:1.5px solid var(--gray200);border-radius:10px;font-size:15px;font-family:'Noto Sans JP',sans-serif;background:var(--gray100);transition:all 0.2s;outline:none;}
    .form-input:focus{border-color:var(--accent);background:white;box-shadow:0 0 0 3px rgba(232,83,14,0.08);}
    .form-select{width:100%;padding:12px 16px;border:1.5px solid var(--gray200);border-radius:10px;font-size:15px;font-family:'Noto Sans JP',sans-serif;background:var(--gray100);outline:none;cursor:pointer;}
    .chip-group{display:flex;flex-wrap:wrap;gap:8px;}
    .chip{padding:6px 14px;border-radius:100px;font-size:13px;cursor:pointer;border:1.5px solid var(--gray200);background:white;transition:all 0.15s;user-select:none;}
    .chip.active{background:var(--accent);color:white;border-color:var(--accent);}
    .btn-submit{width:100%;padding:14px;border-radius:10px;background:var(--accent);border:none;color:white;font-size:16px;font-weight:700;cursor:pointer;transition:all 0.25s;margin-top:8px;}
    .btn-submit:hover{background:var(--accent2);transform:translateY(-1px);}
    .auth-switch{text-align:center;margin-top:24px;font-size:13px;color:var(--gray500);}
    .auth-switch span{color:var(--accent);font-weight:600;cursor:pointer;}
    .error-box{background:#fef2f2;color:#dc2626;padding:12px 16px;border-radius:8px;font-size:13px;margin-bottom:16px;border:1px solid #fecaca;}

    /* DASHBOARD */
    .dashboard{min-height:100vh;background:var(--gray100);}
    .dash-nav{background:white;border-bottom:1px solid var(--gray200);padding:0 32px;height:64px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:50;}
    .dash-nav-right{display:flex;align-items:center;gap:20px;}
    .user-pill{display:flex;align-items:center;gap:10px;padding:6px 16px 6px 6px;border-radius:100px;background:var(--gray100);cursor:pointer;transition:background 0.2s;position:relative;}
    .user-pill:hover{background:var(--gray200);}
    .user-avatar{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--accent2));color:white;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;}
    .user-name{font-size:14px;font-weight:500;}
    .dropdown{position:absolute;top:48px;right:0;background:white;border-radius:12px;box-shadow:var(--shadow-lg);overflow:hidden;min-width:180px;border:1px solid var(--gray200);}
    .dropdown-item{padding:12px 20px;font-size:14px;cursor:pointer;transition:background 0.15s;}
    .dropdown-item:hover{background:var(--gray100);}
    .dropdown-item.danger{color:var(--red);}
    .dropdown-item.admin-link{color:var(--accent);font-weight:700;}
    .applied-count{display:flex;align-items:center;gap:6px;padding:6px 14px;border-radius:8px;background:var(--green-soft);color:var(--green);font-size:13px;font-weight:600;}
    .dash-tabs{display:flex;gap:0;background:white;border-bottom:1px solid var(--gray200);padding:0 32px;}
    .dash-tab{padding:14px 20px;font-size:14px;font-weight:600;color:var(--gray500);cursor:pointer;border-bottom:2px solid transparent;transition:all 0.2s;}
    .dash-tab.active{color:var(--accent);border-bottom-color:var(--accent);}
    .dash-body{display:flex;max-width:1280px;margin:0 auto;padding:28px 32px;gap:28px;}
    .sidebar{width:280px;flex-shrink:0;background:white;border-radius:16px;padding:24px;box-shadow:var(--shadow-sm);height:fit-content;position:sticky;top:92px;border:1px solid var(--gray200);}
    .sidebar h3{font-size:16px;font-weight:700;margin-bottom:20px;}
    .filter-section{margin-bottom:24px;}
    .filter-title{font-size:13px;font-weight:600;color:var(--gray500);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;}
    .filter-toggle{display:flex;align-items:center;gap:10px;padding:8px 4px;cursor:pointer;transition:all 0.15s;}
    .toggle-box{width:18px;height:18px;border-radius:4px;border:2px solid var(--gray300);display:flex;align-items:center;justify-content:center;transition:all 0.15s;}
    .toggle-box.active{background:var(--accent);border-color:var(--accent);}
    .toggle-label{font-size:14px;color:var(--gray700);}
    .clear-filters{font-size:13px;color:var(--accent);cursor:pointer;font-weight:600;padding:8px 0;}
    .main-content{flex:1;}
    .search-bar{background:white;border-radius:12px;padding:14px 20px;box-shadow:var(--shadow-sm);border:1px solid var(--gray200);display:flex;align-items:center;gap:12px;margin-bottom:16px;}
    .search-input-wrap{display:flex;align-items:center;gap:10px;flex:1;}
    .search-input{border:none;outline:none;font-size:15px;font-family:'Noto Sans JP',sans-serif;flex:1;background:transparent;}
    .result-count{font-size:14px;color:var(--gray500);margin-bottom:16px;}
    .job-list{display:flex;flex-direction:column;gap:14px;}
    .job-card{background:white;border-radius:16px;padding:24px;box-shadow:var(--shadow-sm);border:1px solid var(--gray200);cursor:pointer;transition:all 0.25s;}
    .job-card:hover{box-shadow:var(--shadow-md);transform:translateY(-2px);border-color:rgba(232,83,14,0.15);}
    .job-card-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;}
    .job-type{font-size:11px;font-weight:700;padding:3px 10px;border-radius:4px;background:var(--blue-soft);color:var(--blue);}
    .job-type.reward{background:var(--purple-soft);color:var(--purple);}
    .job-date{font-size:12px;color:var(--gray500);}
    .job-badges{display:flex;gap:6px;margin-bottom:10px;}
    .badge{padding:3px 8px;border-radius:4px;font-size:10px;font-weight:700;}
    .badge.remote{background:#dbeafe;color:#1d4ed8;}
    .badge.urgent{background:#fef3c7;color:#b45309;}
    .badge.highpay{background:#fce7f3;color:#be185d;}
    .badge.lowexp{background:#d1fae5;color:#065f46;}
    .job-title{font-size:16px;font-weight:700;margin-bottom:4px;}
    .job-company{font-size:13px;color:var(--gray500);margin-bottom:12px;}
    .job-meta{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;}
    .meta-pill{padding:4px 10px;border-radius:6px;font-size:12px;font-weight:500;background:var(--gray100);color:var(--gray700);}
    .meta-pill.rate{background:var(--red-soft);color:var(--red);font-weight:600;}
    .job-tags{display:flex;flex-wrap:wrap;gap:6px;}
    .tag{padding:3px 10px;border-radius:100px;font-size:11px;font-weight:500;background:var(--blue-soft);color:var(--blue);}

    /* MODAL */
    .modal-overlay{position:fixed;inset:0;background:rgba(26,26,46,0.5);backdrop-filter:blur(4px);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn 0.2s;}
    .modal{background:white;border-radius:20px;width:100%;max-width:640px;max-height:85vh;overflow-y:auto;box-shadow:var(--shadow-xl);animation:slideUp 0.3s;}
    .modal-header{padding:32px 32px 0;position:relative;}
    .modal-close{position:absolute;top:20px;right:20px;width:36px;height:36px;border-radius:50%;background:var(--gray100);border:none;cursor:pointer;font-size:18px;color:var(--gray500);}
    .modal-body{padding:24px 32px 32px;}
    .detail-section{margin-bottom:20px;}
    .detail-label{font-size:12px;font-weight:700;color:var(--gray500);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;}
    .detail-text{font-size:15px;line-height:1.7;color:var(--gray700);}
    .btn-apply{width:100%;padding:16px;border-radius:12px;background:var(--accent);border:none;color:white;font-size:16px;font-weight:700;cursor:pointer;margin-top:24px;box-shadow:0 4px 20px rgba(232,83,14,0.3);transition:all 0.2s;}
    .btn-apply:hover{background:var(--accent2);}
    .btn-apply.applied{background:var(--green-soft);color:var(--green);cursor:default;box-shadow:none;}
    .apply-textarea{width:100%;padding:14px;border:1.5px solid var(--gray200);border-radius:10px;font-size:14px;font-family:'Noto Sans JP',sans-serif;resize:vertical;min-height:120px;outline:none;background:var(--gray100);}
    .apply-textarea:focus{border-color:var(--accent);background:white;}

    /* MYPAGE */
    .mypage-wrap{max-width:800px;margin:0 auto;padding:32px;}
    .mypage-card{background:white;border-radius:16px;padding:32px;box-shadow:var(--shadow-sm);border:1px solid var(--gray200);margin-bottom:20px;}
    .mypage-card h3{font-size:18px;font-weight:700;margin-bottom:24px;display:flex;align-items:center;gap:8px;}
    .mypage-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
    .mypage-label{font-size:13px;font-weight:600;color:var(--gray700);margin-bottom:6px;display:block;}
    .mypage-input{width:100%;padding:12px 16px;border:1.5px solid var(--gray200);border-radius:10px;font-size:14px;font-family:'Noto Sans JP',sans-serif;background:var(--gray100);outline:none;transition:all 0.2s;}
    .mypage-input:focus{border-color:var(--accent);background:white;}
    .mypage-textarea{width:100%;padding:12px 16px;border:1.5px solid var(--gray200);border-radius:10px;font-size:14px;font-family:'Noto Sans JP',sans-serif;background:var(--gray100);outline:none;resize:vertical;min-height:100px;transition:all 0.2s;}
    .mypage-textarea:focus{border-color:var(--accent);background:white;}
    .save-btn{padding:14px 40px;border-radius:100px;background:var(--accent);border:none;color:white;font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 4px 16px rgba(232,83,14,0.3);transition:all 0.2s;}
    .save-btn:hover{background:var(--accent2);}
    .app-history-item{padding:16px;border-radius:12px;border:1px solid var(--gray200);background:var(--gray100);margin-bottom:12px;}
    .app-history-title{font-size:14px;font-weight:700;margin-bottom:4px;}
    .app-history-meta{font-size:12px;color:var(--gray500);}
    .status-badge{font-size:11px;font-weight:700;padding:3px 10px;border-radius:100px;}
    .status-badge.pending{background:#fef3c7;color:#b45309;}
    .status-badge.done{background:var(--green-soft);color:var(--green);}

    /* ADMIN */
    .admin-page{min-height:100vh;background:var(--gray100);}
    .admin-nav{background:var(--ink);color:white;padding:0 32px;height:60px;display:flex;align-items:center;justify-content:space-between;}
    .admin-nav-title{font-size:16px;font-weight:700;}
    .admin-tabs{display:flex;gap:0;background:rgba(255,255,255,0.05);border-bottom:1px solid rgba(255,255,255,0.1);}
    .admin-tab{padding:14px 24px;font-size:14px;font-weight:600;color:rgba(255,255,255,0.5);cursor:pointer;border-bottom:2px solid transparent;transition:all 0.2s;}
    .admin-tab.active{color:white;border-bottom-color:var(--accent);}
    .admin-body{max-width:1200px;margin:0 auto;padding:32px;}
    .admin-grid{display:grid;grid-template-columns:1fr 1fr;gap:28px;}
    .admin-card{background:white;border-radius:16px;padding:28px;box-shadow:var(--shadow-sm);border:1px solid var(--gray200);}
    .admin-card h3{font-size:16px;font-weight:700;margin-bottom:20px;}
    .admin-row{margin-bottom:14px;}
    .admin-label{font-size:12px;font-weight:700;color:var(--gray700);margin-bottom:4px;display:block;}
    .admin-input{width:100%;padding:10px 14px;border:1.5px solid var(--gray200);border-radius:8px;font-size:14px;font-family:'Noto Sans JP',sans-serif;background:var(--gray100);outline:none;transition:all 0.2s;}
    .admin-input:focus{border-color:var(--accent);background:white;}
    .admin-textarea{width:100%;padding:10px 14px;border:1.5px solid var(--gray200);border-radius:8px;font-size:14px;font-family:'Noto Sans JP',sans-serif;background:var(--gray100);outline:none;resize:vertical;min-height:80px;}
    .admin-select{width:100%;padding:10px 14px;border:1.5px solid var(--gray200);border-radius:8px;font-size:14px;background:var(--gray100);outline:none;}
    .admin-checks{display:flex;gap:16px;flex-wrap:wrap;margin-top:6px;}
    .admin-check{display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer;}
    .admin-btn{width:100%;padding:13px;border-radius:10px;background:var(--accent);border:none;color:white;font-size:15px;font-weight:700;cursor:pointer;margin-top:8px;transition:all 0.2s;}
    .admin-btn:hover{background:var(--accent2);}
    .admin-btn.secondary{background:var(--gray200);color:var(--gray700);}
    .admin-job-list{display:flex;flex-direction:column;gap:10px;max-height:600px;overflow-y:auto;}
    .admin-job-item{padding:14px;border-radius:10px;border:1px solid var(--gray200);background:var(--gray100);display:flex;align-items:center;justify-content:space-between;gap:12px;}
    .admin-job-info{flex:1;}
    .admin-job-title{font-size:14px;font-weight:700;margin-bottom:3px;}
    .admin-job-meta{font-size:12px;color:var(--gray500);}
    .admin-job-actions{display:flex;gap:6px;flex-shrink:0;}
    .admin-action-btn{padding:5px 12px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;border:none;transition:all 0.15s;}
    .admin-action-btn.edit{background:var(--blue-soft);color:var(--blue);}
    .admin-action-btn.delete{background:var(--red-soft);color:var(--red);}
    .admin-action-btn.pub{background:var(--green-soft);color:var(--green);}
    .admin-action-btn.unpub{background:var(--gray200);color:var(--gray500);}
    .pub-badge{font-size:10px;padding:2px 8px;border-radius:100px;font-weight:600;}
    .pub-badge.on{background:var(--green-soft);color:var(--green);}
    .pub-badge.off{background:var(--gray200);color:var(--gray500);}
    .app-card{background:white;border-radius:12px;padding:20px;border:1px solid var(--gray200);margin-bottom:12px;}
    .app-card-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
    .app-card-title{font-size:15px;font-weight:700;}
    .app-card-body{font-size:13px;color:var(--gray700);line-height:1.7;}
    .app-card-meta{font-size:12px;color:var(--gray500);margin-top:8px;}

    /* TOAST */
    .toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--ink);color:white;padding:12px 28px;border-radius:100px;font-size:14px;font-weight:600;z-index:999;animation:slideUp 0.3s;}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    @media(max-width:900px){
      .hero-section{min-height:auto;}.hero-left{padding:48px 24px;max-width:100%;}.hero h1{font-size:28px;}.hero h1 .accent-line{font-size:36px;}.hero h1 .accent-line .num{font-size:52px;}.hero-right{display:none;}.hero-blob{display:none;}.features-strip{grid-template-columns:repeat(2,1fr);}.about-section{flex-direction:column;padding:48px 24px;gap:32px;}.about-illo{flex:none;width:100%;max-width:360px;margin:0 auto;}.cases-grid{grid-template-columns:1fr;}.cases-section{padding:48px 20px;}.dash-body{flex-direction:column;padding:16px;}.sidebar{width:100%;position:static;}.landing-nav{padding:0 20px;}.admin-grid{grid-template-columns:1fr;}
    }
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
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {toast && <div className="toast">{toast}</div>}
      </>
    );
  }


  // LANDING PAGE
  if (page === "landing") {
    const featuredJobs = jobs.filter(j=>j.highPay && j.published!==false).slice(0,3);
    return (
      <>
        <style>{css}</style>
        <div className="page-landing" style={{background:"white"}}>
          <nav className="landing-nav">
            <div className="logo"><div className="logo-mark">S</div>SalesBoard</div>
            <div className="nav-btns">
              <button className="btn-ghost" onClick={()=>setPage("login")}>ログイン</button>
              <button className="btn-accent" onClick={()=>setPage("register")}>無料登録</button>
            </div>
          </nav>

          <div className="hero-section">
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
                {[["🏠","フルリモート"],["📈","スキルアップ"],["💰","高待遇"],["🔄","副業/複業"]].map(([icon,label])=>(
                  <div key={label} className="hero-tag">
                    <div className="hero-tag-icon">{icon}</div>
                    <div className="hero-tag-label">{label}</div>
                  </div>
                ))}
              </div>
              <div className="cta-buttons">
                <button className="btn-cta-primary" onClick={()=>setPage("register")}>無料で会員登録 →</button>
                <button className="btn-cta-secondary" onClick={()=>setPage("login")}>案件を探す</button>
              </div>
            </div>
            <div className="hero-right">
              <img src="/undraw_investor-update_ou4c.svg" alt="イメージ" style={{width:"85%",maxWidth:460,display:"block"}} />
            </div>
          </div>

          <div className="features-section">
            <div className="features-strip">
              {[["💼","営業特化","営業職に特化した案件のみ掲載。ミスマッチなし"],["🏠","リモート案件","フルリモート・一部リモート案件を多数掲載"],["💰","高単価案件","月60万円〜の高単価案件を厳選してお届け"],["⚡","最短即日","応募から稼働開始まで最短即日マッチング"]].map(([icon,title,desc])=>(
                <div key={title} className="feature-item">
                  <div className="feature-icon">{icon}</div>
                  <div className="feature-title">{title}</div>
                  <div className="feature-desc">{desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="about-section">
            <div className="about-illo">
              <img src="/undraw_process_0wew.svg" alt="サービス説明" style={{width:"100%",maxWidth:380,display:"block"}} />
            </div>
            <div className="about-text">
              <div className="about-eyebrow">About us</div>
              <div className="about-title">SalesBoard<br/>とは</div>
              <div className="about-desc">SalesBoardは、営業フリーランスのための案件紹介サービスです。豊富な案件からご希望にあった案件をご紹介。最短1週間でお仕事への参画が可能です。</div>
              <div style={{marginBottom:20}}>
                <div style={{fontSize:13,fontWeight:700,color:"var(--ink)",marginBottom:12}}>こんな人におすすめ</div>
                {["他案件が落ち着いたので掛け持ちしたい","案件探しの負担を減らしたい","今より案件の単価を上げたい","スキルを広げたい・極めたい","独立に向けて経験を積みたい"].map(t=>(
                  <div key={t} className="target-check">{t}</div>
                ))}
              </div>
              <button className="btn-cta-primary" onClick={()=>setPage("register")}>無料で会員登録 →</button>
            </div>
          </div>

          <div style={{background:"var(--gray100)",borderTop:"1px solid var(--gray200)",borderBottom:"1px solid var(--gray200)"}}>
            <div className="cases-section">
              <div className="section-eyebrow">Case Examples</div>
              <div className="section-title">ご紹介案件例</div>
              <div className="section-subtitle">高単価・リモート・フレックスなど、希望に合った案件をご紹介します</div>
              <div className="cases-grid">
                {featuredJobs.map(job=>(
                  <div key={job.id} className="case-card" onClick={()=>setPage("login")}>
                    <div className="case-card-top">
                      {job.tags.slice(0,2).map(t=><span key={t} className="case-industry">{t}</span>)}
                      <span className="case-type-badge">{job.type}</span>
                    </div>
                    <div className="case-title">{job.title}</div>
                    <div className="case-detail-row">
                      <div className="case-detail-item"><div className="case-detail-label">⊙ 単価</div><div className="case-detail-value rate">{job.rate}</div></div>
                      <div className="case-detail-item"><div className="case-detail-label">💼 働き方</div><div className="case-detail-value">{job.remote?"リモート可":"常駐"}</div></div>
                      <div className="case-detail-item"><div className="case-detail-label">📅 期間</div><div className="case-detail-value">{job.period}</div></div>
                    </div>
                    <div className="case-section-label">💬 職務内容</div>
                    <div className="case-desc">{job.description}</div>
                    <div className="case-divider"/>
                    <div className="case-section-label">✨ 活かせるスキル</div>
                    <div className="case-skills">{job.requirements.split("、").map((r,i)=><span key={i} className="case-skill">{r}</span>)}</div>
                  </div>
                ))}
              </div>
              <div className="cases-cta">
                <div className="cases-cta-title">他にも多数の案件を掲載中</div>
                <div className="cases-cta-sub">無料登録後、すべての案件にアクセスできます</div>
                <button className="btn-cta-primary" onClick={()=>setPage("register")}>無料で会員登録して案件を見る →</button>
              </div>
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
            <div key={t} className={`dash-tab ${dashTab===t?"active":""}`} onClick={()=>setDashTab(t)}>{l}</div>
          ))}
        </div>

        {/* 案件一覧 */}
        {dashTab === "jobs" && (
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
              {(filters.remote||filters.urgent||filters.highPay||filters.lowExp||filters.industries.length>0)&&(
                <div className="clear-filters" onClick={()=>setFilters({remote:false,urgent:false,highPay:false,lowExp:false,industries:[]})}>✕ 絞り込みをクリア</div>
              )}
            </aside>
            <div className="main-content">
              <div className="search-bar">
                <div className="search-input-wrap">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8a8a7a" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  <input className="search-input" placeholder="キーワードで検索（例：SaaS、新規開拓）" value={search} onChange={e=>setSearch(e.target.value)} />
                </div>
              </div>
              <div className="result-count">検索結果: <strong>{filteredJobs.length}件</strong></div>
              <div className="job-list">
                {filteredJobs.map(job=>(
                  <div key={job.id} className="job-card" onClick={()=>setSelectedJob(job)}>
                    <div className="job-card-top">
                      <span className={`job-type ${job.type==="成果報酬"?"reward":""}`}>{job.type}</span>
                      <span className="job-date">{daysAgo(job.posted)}</span>
                    </div>
                    <div className="job-badges">
                      {job.remote&&<span className="badge remote">リモート</span>}
                      {job.urgent&&<span className="badge urgent">急募</span>}
                      {job.highPay&&<span className="badge highpay">高単価</span>}
                      {job.lowExp&&<span className="badge lowexp">経験少なめOK</span>}
                    </div>
                    <div className="job-title">{job.title}</div>
                    <div className="job-company">{job.company}</div>
                    <div className="job-meta">
                      <span className="meta-pill rate">{job.rate}</span>
                      <span className="meta-pill">{job.location}</span>
                      <span className="meta-pill">{job.period}</span>
                    </div>
                    <div className="job-tags">{job.tags.map(t=><span key={t} className="tag">{t}</span>)}</div>
                    {appliedJobs.includes(job.id)&&<div style={{marginTop:10,fontSize:13,color:"var(--green)",fontWeight:600}}>✓ 応募済み</div>}
                  </div>
                ))}
                {filteredJobs.length===0&&<div style={{textAlign:"center",padding:60,color:"var(--gray500)"}}>
                  <div style={{fontSize:40,marginBottom:12}}>📭</div>
                  <div style={{fontSize:16,fontWeight:600}}>該当する案件が見つかりませんでした</div>
                </div>}
              </div>
            </div>
          </div>
        )}

        {/* マイページ */}
        {dashTab === "mypage" && (
          <div className="mypage-wrap">
            <div className="mypage-card">
              <h3>👤 プロフィール・職務経歴</h3>
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
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 案件詳細モーダル */}
      {selectedJob && !showApplyModal && (
        <div className="modal-overlay" onClick={()=>setSelectedJob(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <button className="modal-close" onClick={()=>setSelectedJob(null)}>✕</button>
              <span className={`job-type ${selectedJob.type==="成果報酬"?"reward":""}`}>{selectedJob.type}</span>
              <h2 style={{fontSize:22,fontWeight:700,marginTop:12,lineHeight:1.4,paddingRight:40}}>{selectedJob.title}</h2>
              <div style={{fontSize:14,color:"var(--gray500)",marginTop:4}}>{selectedJob.company}</div>
            </div>
            <div className="modal-body">
              <div className="job-badges" style={{marginBottom:16}}>
                {selectedJob.remote&&<span className="badge remote">リモート</span>}
                {selectedJob.urgent&&<span className="badge urgent">急募</span>}
                {selectedJob.highPay&&<span className="badge highpay">高単価</span>}
                {selectedJob.lowExp&&<span className="badge lowexp">経験少なめOK</span>}
              </div>
              <div className="detail-section"><div className="detail-label">報酬</div><div className="detail-text" style={{fontWeight:600,color:"var(--red)"}}>{selectedJob.rate}</div></div>
              <div className="detail-section"><div className="detail-label">勤務地</div><div className="detail-text">{selectedJob.location}</div></div>
              <div className="detail-section"><div className="detail-label">期間</div><div className="detail-text">{selectedJob.period}</div></div>
              <div className="detail-section"><div className="detail-label">案件概要</div><div className="detail-text">{selectedJob.description}</div></div>
              <div className="detail-section"><div className="detail-label">応募要件</div><div className="detail-text">{selectedJob.requirements}</div></div>
              <div className="detail-section"><div className="detail-label">関連タグ</div><div className="job-tags">{selectedJob.tags.map(t=><span key={t} className="tag">{t}</span>)}</div></div>
              {appliedJobs.includes(selectedJob.id)
                ? <button className="btn-apply applied">✓ 応募済み</button>
                : <button className="btn-apply" onClick={()=>setShowApplyModal(true)}>この案件に応募する →</button>
              }
            </div>
          </div>
        </div>
      )}

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
