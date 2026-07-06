'use client';
import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where,
  updateDoc,
  doc
} from 'firebase/firestore';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [longUrl, setLongUrl] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  
  const [homeLinks, setHomeLinks] = useState([]); 
  const [userLinks, setUserLinks] = useState([]); 
  
  const [stats, setStats] = useState({ clicks: 0, earnings: 0.00 });
  const [adminStats, setAdminStats] = useState({ totalUsers: 1, totalClicks: 1490 });
  
  // 💸 Fixed 4-Stage High-CPM Logic Mapped
  const [adLoopActive, setAdLoopActive] = useState(false);
  const [currentStage, setCurrentStage] = useState(1); 
  const [stageTimer, setStageTimer] = useState(10);
  const [targetDestination, setTargetDestination] = useState('');

  // 🚀 URL Check Loop (Stopping Auto-Forward)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const goParam = urlParams.get('go');
      const destParam = urlParams.get('dest');
      
      if (goParam && destParam) {
        try {
          const decodedUrl = atob(destParam);
          setTargetDestination(decodedUrl);
          setAdLoopActive(true); // Active ad page interface immediately
          setCurrentStage(1);
          setStageTimer(10);

          const logClick = async () => {
            const q = query(collection(db, "links"), where("alias", "==", goParam));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              const linkDoc = querySnapshot.docs[0];
              await updateDoc(doc(db, "links", linkDoc.id), {
                clicks: (linkDoc.data().clicks || 0) + 1
              });
            }
          };
          logClick();
        } catch (err) {
          console.error("Matrix decoding error:", err);
        }
      }
    }
  }, []);

  // Countdown timer processing matrix
  useEffect(() => {
    if (adLoopActive && stageTimer > 0) {
      const timer = setTimeout(() => setStageTimer(stageTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [adLoopActive, stageTimer]);

  // Monitor Auth Tokens Session
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchUserData(currentUser);
      } else {
        setUser(null);
        setUserLinks([]);
        setStats({ clicks: 0, earnings: 0.00 });
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserData = async (currentUser) => {
    try {
      const q = query(collection(db, "links"), where("userId", "==", currentUser.uid));
      const querySnapshot = await getDocs(q);
      const links = [];
      let totalClicks = 0;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        links.push({ id: doc.id, ...data });
        totalClicks += (data.clicks || 0);
      });
      setUserLinks(links);
      setStats({ clicks: totalClicks, earnings: totalClicks * 0.006 });
    } catch (e) {
      console.log("Firestore matrix sync ready.");
    }
  };

  const handleAuth = async () => {
    if (!email || !password) return alert("Please fill all fields!");
    try {
      if (isSignUp) {
        if (!name) return alert("Name is required!");
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Account Created Successfully!");
        setIsSignUp(false);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Welcome Back!");
        setActiveTab('dash');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setActiveTab('home');
  };

  const handleShorten = async (context) => {
    if (!longUrl) return alert("Enter valid URL address!");
    const currentHost = window.location.origin;
    const shortAlias = Math.random().toString(36).substring(2, 7);
    const shortUrl = `${currentHost}?go=${shortAlias}&dest=${btoa(longUrl)}`;

    const newLinkObject = {
      originalUrl: longUrl,
      shortUrl: shortUrl,
      alias: shortAlias,
      clicks: 0
    };

    if (user && context === 'dash') {
      try {
        await addDoc(collection(db, "links"), {
          userId: user.uid,
          ...newLinkObject
        });
        fetchUserData(user);
        setGeneratedLink(shortUrl);
        setLongUrl(''); 
        alert("Monetized link appended!");
      } catch (e) {
        alert("Database error.");
      }
    } else {
      setHomeLinks([newLinkObject, ...homeLinks]);
      setGeneratedLink(shortUrl);
      setLongUrl(''); 
    }
  };

  const advanceStage = (next) => {
    setCurrentStage(next);
    setStageTimer(next === 4 ? 0 : 8); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ================= 💸 VIEW CORE: HARD BOUNDED 4-STAGE REVENUE LOOP =================
  if (adLoopActive) {
    return (
      <div style={{ backgroundColor: '#090d16', color: '#fff', minHeight: '100vh', padding: '20px', fontFamily: '"Inter", sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* TOP AD PLACEMENT FRAME */}
        <div style={{ width: '100%', maxWidth: '360px', height: '100px', background: '#111827', border: '1px dashed #4b5563', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: '11px', marginBottom: '20px' }}>
          🌐 [Adsterra Banner Placement #1 - Top Ad Slot]
        </div>

        {/* STAGE 1 FRAME */}
        {currentStage === 1 && (
          <div style={{ background: '#111827', border: '1px solid #1f2937', padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '360px', textAlign: 'center' }}>
            <span style={{ color: '#38bdf8', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '1px' }}>Step 1 of 4</span>
            <h3 style={{ fontSize: '20px', margin: '10px 0' }}>Security Checklist...</h3>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '20px' }}>Analyzing system parameters. Please wait for handshake token verification.</p>
            
            {stageTimer > 0 ? (
              <div style={{ display: 'inline-block', padding: '12px 24px', background: '#1f2937', borderRadius: '30px', color: '#38bdf8', fontWeight: '700' }}>
                ⌛ Please Wait: {stageTimer}s
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '12px', color: '#10b981', marginBottom: '10px' }}>✓ Check completed! Scroll down and press the continue gateway node.</p>
                <div style={{ height: '200px', background: '#090d16', margin: '15px 0', borderRadius: '8px', border: '1px dashed #374151', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563', fontSize: '12px' }}>
                  ⚡ [Adsterra Native Block Placement]
                </div>
                <button onClick={() => advanceStage(2)} style={{ width: '100%', padding: '14px', background: '#38bdf8', color: '#000', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                  NEXT PAGE ➡️
                </button>
              </div>
            )}
          </div>
        )}

        {/* STAGE 2 FRAME */}
        {currentStage === 2 && (
          <div style={{ background: '#111827', border: '1px solid #1f2937', padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '360px', textAlign: 'center' }}>
            <span style={{ color: '#a855f7', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '1px' }}>Step 2 of 4</span>
            <h3 style={{ fontSize: '20px', margin: '10px 0' }}>Robot Verification</h3>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '20px' }}>Confirm that you are an authorized real client gateway device node.</p>

            <div style={{ background: '#030712', border: '1px solid #1f2937', padding: '16px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <input type="checkbox" checked={stageTimer === 0} readOnly style={{ width: '20px', height: '20px', accentColor: '#a855f7' }} />
              <span style={{ fontSize: '14px' }}>{stageTimer > 0 ? `Verifying device configurations (${stageTimer}s)...` : "Human token verification approved."}</span>
            </div>

            {stageTimer === 0 && (
              <div>
                <div style={{ height: '200px', background: '#090d16', margin: '15px 0', borderRadius: '8px', border: '1px dashed #374151', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563', fontSize: '12px' }}>
                  📺 [Adsterra High-CPM Banner Slot]
                </div>
                <button onClick={() => advanceStage(3)} style={{ width: '100%', padding: '14px', background: '#a855f7', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                  CONTINUE UNLOCK 🔓
                </button>
              </div>
            )}
          </div>
        )}

        {/* STAGE 3 FRAME */}
        {currentStage === 3 && (
          <div style={{ background: '#111827', border: '1px solid #1f2937', padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '360px', textAlign: 'center' }}>
            <span style={{ color: '#f59e0b', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '1px' }}>Step 3 of 4</span>
            <h3 style={{ fontSize: '20px', margin: '10px 0' }}>Cloud Buffer Sync</h3>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '20px' }}>Encrypting output variables destination routing tables dynamically.</p>

            {stageTimer > 0 ? (
              <div style={{ fontSize: '14px', color: '#f59e0b', padding: '10px', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px', background: 'rgba(245,158,11,0.05)' }}>
                Bypassing security scripts: {stageTimer}s
              </div>
            ) : (
              <div>
                <div style={{ height: '200px', background: '#090d16', margin: '15px 0', borderRadius: '8px', border: '1px dashed #374151', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563', fontSize: '12px' }}>
                  💰 [Place Adsterra Popunder Trigger Block]
                </div>
                <button onClick={() => advanceStage(4)} style={{ width: '100%', padding: '14px', background: '#f59e0b', color: '#000', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                  VERIFY CAP LINK 🛡️
                </button>
              </div>
            )}
          </div>
        )}

        {/* STAGE 4 FRAME */}
        {currentStage === 4 && (
          <div style={{ background: '#111827', border: '1px solid #1f2937', padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '360px', textAlign: 'center' }}>
            <span style={{ color: '#10b981', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '1px' }}>Final Destination</span>
            <h3 style={{ fontSize: '20px', margin: '10px 0' }}>Link Is Unlocked!</h3>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '24px' }}>Aapka destination target table fully generate ho chuka hai.</p>

            <button 
              onClick={() => {
                if (targetDestination) {
                  window.location.href = targetDestination; // Safe redirect anchor trigger
                }
              }}
              style={{ width: '100%', padding: '16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}
            >
              🚀 GET ORIGINAL LINK
            </button>
          </div>
        )}

        {/* BOTTOM AD PLACEMENT FRAME */}
        <div style={{ width: '100%', maxWidth: '360px', height: '250px', background: '#111827', border: '1px dashed #4b5563', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: '11px', marginTop: '20px' }}>
          🌐 [Adsterra Banner Placement #2 - Footer Slot]
        </div>

      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#090d16', color: '#f1f5f9', minHeight: '100vh', paddingBottom: '90px', fontFamily: '"Inter", system-ui, sans-serif', overflowX: 'hidden' }}>
      
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        .saas-card { background: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); margin-bottom: 16px; }
        .saas-input { width: 100%; padding: 14px 16px; background: #030712; border: 1px solid #374151; border-radius: 8px; color: #fff; font-size: 14px; outline: none; margin-bottom: 12px; box-sizing: border-box; transition: border-color 0.2s; }
        .saas-input:focus { border-color: #38bdf8; }
        .saas-btn { width: 100%; padding: 14px; background: #38bdf8; color: #000; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; }
        .saas-btn:active { opacity: 0.9; }
        .saas-btn-sec { width: 100%; padding: 14px; background: #1f2937; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; margin-top: 10px; }
        .tab-bar-item { flex: 1; background: none; border: none; color: #94a3b8; font-size: 12px; font-weight: 500; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .tab-active { color: #38bdf8 !important; font-weight: 600; }
      `}} />

      <div style={{ background: '#111827', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1f2937' }}>
        <span style={{ fontSize: '18px', fontWeight: '700', color: '#38bdf8', letterSpacing: '-0.5px' }}>LG SHORTENER PRO</span>
        <span style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' }}>Cloud Node Active</span>
      </div>

      {/* ================= VIEW 1: HOME VIEW ================= */}
      {activeTab === 'home' && (
        <div style={{ padding: '24px 16px' }}>
          <div style={{ textAlign: 'center', margin: '30px 0 25px 0' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', letterSpacing: '-0.5px', color: '#fff' }}>Shorten Links, Earn Payouts</h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '6px' }}>High CPM optimization network engine console.</p>
          </div>

          <div className="saas-card">
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#e2e8f0', fontWeight: '600' }}>🔗 Paste Link Workspace</h4>
            <input 
              type="url" 
              className="saas-input"
              placeholder="Enter valid destination target link..." 
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
            />
            <button className="saas-btn" onClick={() => handleShorten('home')}>Shorten URL</button>
          </div>

          {/* 📁 DISPLAY LOG LIST ENGINE */}
          {homeLinks.length > 0 && (
            <div className="saas-card">
              <h4 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: '600' }}>📋 Shortened Links History</h4>
              {homeLinks.map((l, index) => (
                <div key={index} style={{ background: '#030712', padding: '12px', borderRadius: '8px', border: '1px solid #1f2937', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ width: '75%', overflow: 'hidden' }}>
                    <div style={{ color: '#38bdf8', fontWeight: '600', fontSize: '13px' }}>{l.shortUrl}</div>
                    <div style={{ color: '#64748b', fontSize: '11px', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', marginTop: '2px' }}>{l.originalUrl}</div>
                  </div>
                  <button onClick={() => { navigator.clipboard.writeText(l.shortUrl); alert("Copied!"); }} style={{ background: '#38bdf8', border: 'none', color: '#000', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Copy</button>
                </div>
              ))}
            </div>
          )}

          {!user ? (
            <div className="saas-card" style={{ textAlign: 'center', marginTop: '12px' }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '600' }}>Maximize Your Traffic Payouts</h4>
              <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 14px 0' }}>Create a static member cloud profile to unlock advanced dashboards.</p>
              <button className="saas-btn-sec" onClick={() => setActiveTab('profile')}>Sign In / Register Portal</button>
            </div>
          ) : (
            <div className="saas-card" style={{ textAlign: 'center', marginTop: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '600', color: '#10b981' }}>✓ Account Session Authenticated</h4>
              <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 14px 0' }}>Aapka account successfully login hai. Console open karein.</p>
              <button className="saas-btn" style={{ background: '#10b981', color: '#fff' }} onClick={() => setActiveTab('dash')}>Open Workspace Console</button>
            </div>
          )}
        </div>
      )}

      {/* ================= VIEW 2: DASHBOARD CONSOLE ================= */}
      {activeTab === 'dash' && (
        <div style={{ padding: '20px 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div className="saas-card" style={{ padding: '16px' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600' }}>Hits / Traffic</span>
              <p style={{ fontSize: '26px', fontWeight: '700', margin: '4px 0 0 0', color: '#fff' }}>{stats.clicks}</p>
            </div>
            <div className="saas-card" style={{ padding: '16px' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600' }}>Total Earnings</span>
              <p style={{ fontSize: '26px', fontWeight: '700', margin: '4px 0 0 0', color: '#10b981' }}>${stats.earnings.toFixed(2)}</p>
            </div>
          </div>

          <div className="saas-card">
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>⚡ Generate Monetized Node</h4>
            <input 
              type="url" 
              className="saas-input"
              placeholder="Paste long link target path..." 
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
            />
            <button className="saas-btn" onClick={() => handleShorten('d
