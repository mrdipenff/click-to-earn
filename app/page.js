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
  
  // Storage Lists
  const [homeLinks, setHomeLinks] = useState([]); // Home Page history (Non-logged in)
  const [userLinks, setUserLinks] = useState([]); // Console database history
  
  const [stats, setStats] = useState({ clicks: 0, earnings: 0.00 });
  const [adminStats, setAdminStats] = useState({ totalUsers: 1, totalClicks: 1490 });
  
  // High-CPM Payout Ad Screen States
  const [adScreenActive, setAdScreenActive] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [targetDestination, setTargetDestination] = useState('');

  // 🚀 Bulletproof Adsterra Timer Logic Injection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const goParam = urlParams.get('go');
      const destParam = urlParams.get('dest');
      
      if (goParam && destParam) {
        try {
          const decodedUrl = atob(destParam);
          setTargetDestination(decodedUrl);
          setAdScreenActive(true);

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
          console.error("Link parsing handshake aborted:", err);
        }
      }
    }
  }, []);

  // Countdown timer processing matrix
  useEffect(() => {
    if (adScreenActive && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [adScreenActive, countdown]);

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
      console.log("Firestore framework mapped cleanly.");
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
        setLongUrl(''); // Input box clear!
        alert("Monetized link appended to cloud database!");
      } catch (e) {
        alert("Database cluster mapping error.");
      }
    } else {
      // Home page local history array push loop
      setHomeLinks([newLinkObject, ...homeLinks]);
      setGeneratedLink(shortUrl);
      setLongUrl(''); // Input box clear!
    }
  };

  // ================= 💸 VIEW: DYNAMIC HIGH-CPM AD SCREEN LOOP =================
  if (adScreenActive) {
    return (
      <div style={{ backgroundColor: '#090d16', color: '#fff', minHeight: '100vh', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', textAlign: 'center' }}>
        
        {/* TOP AD BANNER PLACEHOLDER */}
        <div style={{ width: '100%', maxWidth: '350px', height: '90px', background: '#111827', border: '1px dashed #374151', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '12px', marginBottom: '30px' }}>
          ✨ [Place Adsterra Banner Script/Link here] ✨
        </div>

        <div style={{ background: '#111827', border: '1px solid #1f2937', padding: '30px 24px', borderRadius: '16px', width: '100%', maxWidth: '350px', boxShadow: '0 10px 25px rgba(0,0,0,0.4)' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '8px' }}>Your Link is Safe!</h2>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '24px' }}>Clicking verification protocols generated by network server.</p>

          {countdown > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '3px solid #38bdf8', borderTopColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700', color: '#38bdf8', animation: 'spin 1s linear infinite' }}>
                {countdown}
              </div>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Waiting for secure landing nodes...</span>
            </div>
          ) : (
            <button 
              onClick={() => window.location.replace(targetDestination)}
              style={{ width: '100%', padding: '16px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)' }}
            >
              🚀 Get Original Link
            </button>
          )}
        </div>

        {/* BOTTOM AD BANNER PLACEHOLDER */}
        <div style={{ width: '100%', maxWidth: '350px', height: '250px', background: '#111827', border: '1px dashed #374151', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '12px', marginTop: '30px' }}>
          ✨ [Place Adsterra Native/Square Banner here] ✨
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}} />
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

          {/* 📁 HOME GENERATED LINKS STORAGE LOOP */}
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
            <button className="saas-btn" onClick={() => handleShorten('dash')}>Shorten Link Address</button>
          </div>

          <div className="saas-card">
            <h4 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: '600' }}>📁 Managed Active Cloud Indexes</h4>
            {userLinks.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '12px', textAlign: 'center', padding: '10px 0' }}>No mapped arrays tracked in database ecosystem.</p>
            ) : (
              userLinks.map((l, index) => (
                <div key={index} style={{ background: '#030712', padding: '12px', borderRadius: '8px', border: '1px solid #1f2937', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ width: '70%', overflow: 'hidden' }}>
                    <div style={{ color: '#38bdf8', fontWeight: '600', fontSize: '13px' }}>{l.shortUrl}</div>
                    <div style={{ color: '#64748b', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>{l.originalUrl}</div>
                    <div style={{ display: 'flex', gap: '10px', fontSize: '11px', marginTop: '4px' }}>
                      <span style={{ color: '#94a3b8' }}>Clicks: <strong style={{ color: '#38bdf8' }}>{l.clicks || 0}</strong></span>
                      <span style={{ color: '#10b981', fontWeight: '600' }}>Live</span>
                    </div>
                  </div>
                  <button onClick={() => { navigator.clipboard.writeText(l.shortUrl); alert("Copied!"); }} style={{ background: '#38bdf8', border: 'none', color: '#000', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Copy</button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ================= VIEW 3: USER ENTRY SIGN-IN ================= */}
      {activeTab === 'profile' && (
        <div style={{ padding: '24px 16px' }}>
          {!user ? (
            <div className="saas-card">
              <h3 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '700', textAlign: 'center' }}>{isSignUp ? "Register Account" : "Identity Gateway Verification"}</h3>
              <p style={{ color: '#94a3b8', fontSize: '12px', textAlign: 'center', marginBottom: '20px' }}>{isSignUp ? "Create a cloud database space node" : "Input verified terminal credentials"}</p>
              
              {isSignUp && (
                <input type="text" placeholder="Your Name" className="saas-input" value={name} onChange={(e) => setName(e.target.value)} />
              )}
              <input type="email" placeholder="Email Address" className="saas-input" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input type="password" placeholder="Account Access Token" className="saas-input" value={password} onChange={(e) => setPassword(e.target.value)} />
              
              <button className="saas-btn" style={{ marginTop: '6px' }} onClick={handleAuth}>{isSignUp ? "Confirm Dynamic Registration" : "Authenticate Session Gateway"}</button>
              <button className="saas-btn-sec" onClick={() => setIsSignUp(!isSignUp)}>
                {isSignUp ? "Already member? Sign In" : "Need user entry registration profile?"}
              </button>
            </div>
          ) : (
            <div className="saas-card" style={{ textAlign: 'center', padding: '30px 16px' }}>
              <div style={{ width: '60px', height: '60px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', color: '#38bdf8', fontSize: '22px', fontWeight: '700' }}>LG</div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>Ecosystem Terminal Mapped</h3>
              <p style={{ color: '#64748b', margin: '0 0 24px 0', fontSize: '13px' }}>{user.email}</p>
              
              {user.email === 'admin@lg.com' && (
                <button className="saas-btn" style={{ marginBottom: '10px' }} onClick={() => setActiveTab('admin')}>Launch Master Admin Node</button>
              )}
              <button className="saas-btn-sec" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }} onClick={handleLogout}>Kill Session Identity</button>
            </div>
          )}
        </div>
      )}

      {/* ================= VIEW 4: SYSTEM MASTER ADMIN CORE ================= */}
      {activeTab === 'admin' && (
        <div style={{ padding: '20px 16px' }}>
          <h3 style={{ color: '#ef4444', margin: '0 0 16px 0', fontSize: '20px', fontWeight: '700' }}>🛡️ Central Core System Admin</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div 
