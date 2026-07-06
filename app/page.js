'use client';
import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [longUrl, setLongUrl] = useState('');
  const [homeLinks, setHomeLinks] = useState([]); 
  const [userLinks, setUserLinks] = useState([]); 
  const [stats, setStats] = useState({ clicks: 0, earnings: 0.00 });

  // 💸 Strict 4-Stage Monetization Core Bounded States
  const [isAdSystemActive, setIsAdSystemActive] = useState(false);
  const [stage, setStage] = useState(1);
  const [timer, setTimer] = useState(10);
  const [lockedTargetUrl, setLockedTargetUrl] = useState('');

  // 🚀 Absolute Strict Target Parameter Grabber & Interceptor
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentUrl = window.location.href;
      
      // Strict Check: Agar URL me query strings hain tabhi trigger karega
      if (currentUrl.includes('?go=') && currentUrl.includes('&uid=')) {
        const urlParams = new URLSearchParams(window.location.search);
        const goParam = urlParams.get('go');
        
        if (goParam) {
          const fetchLockedNode = async () => {
            try {
              const q = query(collection(db, "links"), where("alias", "==", goParam));
              const querySnapshot = await getDocs(q);
              
              if (!querySnapshot.empty) {
                const linkDoc = querySnapshot.docs[0];
                const data = linkDoc.data();
                
                // 🔒 Strict Memory Variable - No exposed tokens anywhere inside document
                setLockedTargetUrl(data.originalUrl);
                setIsAdSystemActive(true); // Freeze interface immediately
                setStage(1);
                setTimer(10);

                // Safe Firestore hit counter logger
                await updateDoc(doc(db, "links", linkDoc.id), {
                  clicks: (data.clicks || 0) + 1
                });
              }
            } catch (err) {
              console.error("Database loop block error.");
            }
          };
          fetchLockedNode();
        }
      }
    }
  }, []);

  // Strict Sequential Counter Clock Engine
  useEffect(() => {
    if (isAdSystemActive && timer > 0) {
      const interval = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(interval);
    }
  }, [isAdSystemActive, timer]);

  // Auth States Syncing
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchUserData(currentUser);
      } else {
        setUser(null);
        setUserLinks([]);
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
    } catch (e) { console.log("Sync core operational."); }
  };

  const handleAuth = async () => {
    if (!email || !password) return alert("Please fill all fields!");
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Account Created!");
        setIsSignUp(false);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setActiveTab('dash');
      }
    } catch (err) { alert(err.message); }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setActiveTab('home');
  };

  const handleShorten = async (context) => {
    if (!longUrl) return alert("Enter valid URL!");
    const currentHost = window.location.origin;
    const shortAlias = Math.random().toString(36).substring(2, 7);
    
    // 🔗 Safe Short Clean URL Pattern using native query mappings
    const shortUrl = `${currentHost}?go=${shortAlias}&uid=${user ? user.uid : 'guest'}`;

    const newLinkObject = { 
      userId: user ? user.uid : "guest_user", 
      originalUrl: longUrl, 
      shortUrl: shortUrl, 
      alias: shortAlias, 
      clicks: 0 
    };

    try {
      await addDoc(collection(db, "links"), newLinkObject);
      if (user) {
        fetchUserData(user);
      } else {
        setHomeLinks([newLinkObject, ...homeLinks]);
      }
      setLongUrl(''); 
      alert("Short link created successfully!");
    } catch (e) { alert("Database injection error."); }
  };

  const handleNextStage = (next) => {
    if (timer > 0) return alert("Please wait until countdown unseals.");
    setStage(next);
    setTimer(next === 4 ? 0 : 8);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ================= 💸 SCREEN EXCLUSIVE: 4-STAGE REVENUE COUNTER SYSTEM =================
  if (isAdSystemActive) {
    return (
      <div style={{ backgroundColor: '#090d16', color: '#fff', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* TOP AD CONTAINER PLACEHOLDER */}
        <div style={{ width: '100%', maxWidth: '360px', height: '100px', background: '#111827', border: '1px dashed #4b5563', borderRadius: '8px', display: 'flex', alignItems: 'center', justifycontent: 'center', color: '#6b7280', fontSize: '11px', marginBottom: '20px', padding: '10px', boxSizing: 'border-box' }}>
          🌐 [Adsterra Banner Script Placement #1]
        </div>

        {/* STAGE 1 TERMINAL */}
        {stage === 1 && (
          <div style={{ background: '#111827', border: '1px solid #1f2937', padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '360px', textAlign: 'center' }}>
            <span style={{ color: '#38bdf8', fontSize: '11px', fontWeight: '700' }}>STEP 1 OF 4</span>
            <h3 style={{ margin: '10px 0' }}>Bypassing Security Tunnel...</h3>
            
            {timer > 0 ? (
              <div style={{ padding: '12px 24px', background: '#1f2937', borderRadius: '30px', color: '#38bdf8', fontWeight: '700', display: 'inline-block' }}>
                ⌛ Please Wait: {timer}s
              </div>
            ) : (
              <div>
                <div style={{ height: '160px', background: '#090d16', margin: '15px 0', border: '1px dashed #374151', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563' }}>[Ad Unit]</div>
                <button onClick={() => handleNextStage(2)} style={{ width: '100%', padding: '14px', background: '#38bdf8', color: '#000', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                  NEXT PAGE ➡️
                </button>
              </div>
            )}
          </div>
        )}

        {/* STAGE 2 TERMINAL */}
        {stage === 2 && (
          <div style={{ background: '#111827', border: '1px solid #1f2937', padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '360px', textAlign: 'center' }}>
            <span style={{ color: '#a855f7', fontSize: '11px', fontWeight: '700' }}>STEP 2 OF 4</span>
            <h3 style={{ margin: '10px 0' }}>Device Parameter Verification</h3>
            
            <div style={{ background: '#030712', padding: '14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <input type="checkbox" checked={timer === 0} readOnly style={{ width: '18px', height: '18px' }} />
              <span>{timer > 0 ? `Checking configurations (${timer}s)...` : "Device authentication verified."}</span>
            </div>

            {timer === 0 && (
              <div>
                <div style={{ height: '160px', background: '#090d16', margin: '15px 0', border: '1px dashed #374151', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563' }}>[Ad Unit]</div>
                <button onClick={() => handleNextStage(3)} style={{ width: '100%', padding: '14px', background: '#a855f7', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                  CONTINUE STEP 🔓
                </button>
              </div>
            )}
          </div>
        )}

        {/* STAGE 3 TERMINAL */}
        {stage === 3 && (
          <div style={{ background: '#111827', border: '1px solid #1f2937', padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '360px', textAlign: 'center' }}>
            <span style={{ color: '#f59e0b', fontSize: '11px', fontWeight: '700' }}>STEP 3 OF 4</span>
            <h3 style={{ margin: '10px 0' }}>Syncing Target Nodes</h3>

          {timer > 0 ? (
            <div style={{ color: '#f59e0b', fontSize: '14px', padding: '10px', background: 'rgba(245,158,11,0.05)', borderRadius: '8px' }}>
              Compiling cloud data loops: {timer}s
            </div>
          ) : (
            <div>
              <div style={{ height: '160px', background: '#090d16', margin: '15px 0', border: '1px dashed #374151', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563' }}>[Ad Unit]</div>
              <button onClick={() => handleNextStage(4)} style={{ width: '100%', padding: '14px', background: '#f59e0b', color: '#000', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                VERIFY CAP NODE 🛡️
              </button>
            </div>
          )}
        </div>
      )}

      {/* STAGE 4 TERMINAL */}
      {stage === 4 && (
        <div style={{ background: '#111827', border: '1px solid #1f2937', padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '360px', textAlign: 'center' }}>
          <span style={{ color: '#10b981', fontSize: '11px', fontWeight: '700' }}>FINAL UNSEAL</span>
          <h3 style={{ margin: '10px 0' }}>Link Generation Approved!</h3>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px' }}>Target destination stream unlocked successfully.</p>

          <button 
            onClick={() => { if (lockedTargetUrl) window.location.href = lockedTargetUrl; }}
            style={{ width: '100%', padding: '16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}
          >
            🚀 GET ORIGINAL LINK
          </button>
        </div>
      )}

      {/* BOTTOM AD CONTAINER PLACEHOLDER */}
      <div style={{ width: '100%', maxWidth: '360px', height: '250px', background: '#111827', border: '1px dashed #4b5563', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: '11px', marginTop: '20px' }}>
        🌐 [Adsterra Large Footer Square Slot]
      </div>

    </div>
  );
}

  return (
    <div style={{ backgroundColor: '#090d16', color: '#f1f5f9', minHeight: '100vh', fontFamily: 'sans-serif', paddingBottom: '90px' }}>
      
      <style dangerouslySetInnerHTML={{__html: `
        .saas-card { background: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); margin-bottom: 16px; }
        .saas-input { width: 100%; padding: 14px 16px; background: #030712; border: 1px solid #374151; border-radius: 8px; color: #fff; font-size: 14px; outline: none; margin-bottom: 12px; box-sizing: border-box; }
        .saas-btn { width: 100%; padding: 14px; background: #38bdf8; color: #000; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
        .tab-bar-item { flex: 1; background: none; border: none; color: #94a3b8; font-size: 12px; font-weight: 500; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; }
      `}} />

      <div style={{ background: '#111827', padding: '16px 20px', display: 'flex', justifycontent: 'space-between', borderBottom: '1px solid #1f2937' }}>
        <span style={{ fontSize: '18px', fontWeight: '700', color: '#38bdf8' }}>LG SHORTENER PRO</span>
      </div>

      {activeTab === 'home' && (
        <div style={{ padding: '24px 16px', maxWidth: '500px', margin: '0 auto' }}>
          <div className="saas-card">
            <h4 style={{ margin: '0 0 12px 0' }}>🔗 Paste Long Link Workspace</h4>
            <input type="url" className="saas-input" value={longUrl} onChange={(e) => setLongUrl(e.target.value)} placeholder="https://example.com" />
            <button className="saas-btn" onClick={() => handleShorten('home')}>Shorten URL</button>
          </div>

          {homeLinks.length > 0 && (
            <div className="saas-card">
              <h4 style={{ margin: '0 0 12px 0' }}>📋 Shortened History</h4>
              {homeLinks.map((l, i) => (
                <div key={i} style={{ background: '#030712', padding: '12px', border: '1px solid #1f2937', borderRadius: '8px', marginBottom: '8px', display: 'flex', justifycontent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#38bdf8', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '70%' }}>{l.shortUrl}</span>
                  <button onClick={() => { navigator.clipboard.writeText(l.shortUrl); alert("Copied!"); }} style={{ background: '#38bdf8', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', color: '#000' }}>Copy</button>
                </div>
              ))}
            </div>
          )}

          {!user ? (
            <div className="saas-card" style={{ textAlign: 'center', marginTop: '12px' }}>
              <h4 style={{ margin: '0 0 4px 0' }}>Maximize Your Traffic Payouts</h4>
              <button style={{ width: '100%', padding: '12px', background: '#1f2937', color: '#fff', border: 'none', borderRadius: '8px', marginTop: '10px', cursor: 'pointer' }} onClick={() => setActiveTab('profile')}>Sign In / Register Portal</button>
            </div>
          ) : (
            <div className="saas-card" style={{ textAlign: 'center', marginTop: '12px', border: '1px solid #10b981' }}>
              <h4 style={{ color: '#10b981', margin: '0 0 4px 0' }}>✓ Session Authenticated</h4>
              <button className="saas-btn" style={{ background: '#10b981', color: '#fff', marginTop: '10px' }} onClick={() => setActiveTab('dash')}>Open Workspace Console</button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'dash' && (
        <div style={{ padding: '20px 16px', maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div className="saas-card" style={{ padding: '16px', marginBottom: 0 }}>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Hits / Traffic</span>
              <p style={{ fontSize: '26px', fontWeight: '700', margin: '4px 0 0 0' }}>{stats.clicks}</p>
            </div>
            <div className="saas-card" style={{ padding: '16px', marginBottom: 0 }}>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Total Earnings</span>
              <p style={{ fontSize: '26px', fontWeight: '700', margin: '4px 0 0 0', color: '#10b981' }}>${stats.earnings.toFixed(2)}</p>
            </div>
          </div>

          <div className="saas-card">
            <h4 style={{ margin: '0 0 12px 0' }}>⚡ Generate Monetized Node</h4>
            <input type="url" className="saas-input" placeholder="Paste link..." value={longUrl} onChange={(e) => setLongUrl(e.target.value)} />
            <button className="saas-btn" onClick={() => handleShorten('dash')}>Shorten Link</button>
          </div>

          <div className="saas-card">
            <h4 style={{ margin: '0 0 14px 0' }}>📁 Managed Active Cloud Indexes</h4>
            {userLinks.map((l, index) => (
              <div key={index} style={{ background: '#030712', padding: '12px', borderRadius: '8px', border: '1px solid #1f2937', marginBottom: '10px', display: 'flex', justifycontent: 'space-between', alignItems: 'center' }}>
                <div style={{ width: '70%', overflow: 'hidden' }}>
                  <div style={{ color: '#38bdf8', fontWeight: '600', fontSize: '13px' }}>{l.shortUrl}</div>
                  <div style={{ color: '#64748b', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.originalUrl}</div>
                </div>
                <button onClick={() => { navigator.clipboard.writeText(l.shortUrl); alert("Copied!"); }} style={{ background: '#38bdf8', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>Copy</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div style={{ padding: '24px 16px', maxWidth: '500px', margin: '0 auto' }}>
          {!user ? (
            <div className="saas-card">
              <h3 style={{ textAlign: 'center', marginBottom: '16px' }}>{isSignUp ? "Register" : "Login"}</h3>
              <input type="email" placeholder="Email" className="saas-input" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input type="password" placeholder="Password" className="saas-input" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button className="saas-btn" onClick={handleAuth}>{isSignUp ? "Sign Up" : "Sign In"}</button>
              <button style={{ background: 'none', border: 'none', color: '#94a3b8', width: '100%', marginTop: '10px', cursor: 'pointer' }} onClick={() => setIsSignUp(!isSignUp)}>{isSignUp ? "Login instead" : "Create account"}</button>
            </div>
          ) : (
            <div className="saas-card" style={{ textAlign: 'center', padding: '30px 16px' }}>
              <h3>Logged in as {user.email}</h3>
              <button style={{ padding: '12px 24px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', marginTop: '16px', cursor: 'pointer' }} onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      )}

      <div style={{ background: '#111827', position: 'fixed', bottom: 0, left: 0, right: 0, height: '65px', display: 'flex', borderTop: '1px solid #1f2937', zIndex: 99999 }}>
        <button className="tab-bar-item" onClick={() => setActiveTab('home')}>🏠 Home</button>
        <button className="tab-bar-item" onClick={() => setActiveTab('profile')}>👤 Account</button>
      </div>
    </div>
  );
          }
