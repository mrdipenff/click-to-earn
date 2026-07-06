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
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [longUrl, setLongUrl] = useState('');
  const [homeLinks, setHomeLinks] = useState([]); 
  const [userLinks, setUserLinks] = useState([]); 
  const [stats, setStats] = useState({ clicks: 0, earnings: 0.00 });

  // 💸 Multi-Stage Setup States
  const [isAdSystemActive, setIsAdSystemActive] = useState(false);
  const [stage, setStage] = useState(1);
  const [timer, setTimer] = useState(10);
  const [lockedTargetUrl, setLockedTargetUrl] = useState('');

  // 🔗 Dynamic Target Parameter Interceptor
  useEffect(() => {
    if (typeof window !== 'undefined') {
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
              setLockedTargetUrl(data.originalUrl);
              setIsAdSystemActive(true); 
              setStage(1);
              setTimer(10);
              await updateDoc(doc(db, "links", linkDoc.id), { clicks: (data.clicks || 0) + 1 });
            }
          } catch (err) { console.error("Database error."); }
        };
        fetchLockedNode();
      }
    }
  }, []);

  // ⏳ Strict Ad Engine Countdown Control
  useEffect(() => {
    if (isAdSystemActive && timer > 0) {
      const interval = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(interval);
    }
  }, [isAdSystemActive, timer]);

  // 🛡️ DYNAMIC SCRIPTS INJECTION MATRIX (Popunder, Banners & Social Bar)
  useEffect(() => {
    if (isAdSystemActive) {
      // 1. POPUNDER INJECTION CONTROL (Strictly Disable on Stage 4)
      if (stage !== 4 && !document.getElementById('adsterra-popunder')) {
        const popScript = document.createElement('script');
        popScript.id = 'adsterra-popunder';
        popScript.src = 'https://rightyrely.com/f0/02/71/f002719497291bd1aae6841c87eba4bf.js';
        document.body.appendChild(popScript);
      } else if (stage === 4) {
        // Remove popunder elements if migrating to Stage 4 to prevent accidental loops
        const oldPop = document.getElementById('adsterra-popunder');
        if (oldPop) oldPop.remove();
      }

      // 2. SOCIAL BAR INJECTION
      if (!document.getElementById('adsterra-socialbar')) {
        const socialScript = document.createElement('script');
        socialScript.id = 'adsterra-socialbar';
        socialScript.src = 'https://rightyrely.com/95/ae/46/95ae4674af57a43a33c9600843babfe3.js';
        document.body.appendChild(socialScript);
      }

      // 3. IFRAME & PLACEMENT NODES RE-TRIGGER ENGINE
      try {
        // Native Banner Configurations Loader
        if (!window.cfasync_loaded) {
          const nativeScript = document.createElement('script');
          nativeScript.async = true;
          nativeScript.src = 'https://rightyrely.com/cf611de77a66f7b9cc6ae3b4ca404da7/invoke.js';
          document.body.appendChild(nativeScript);
          window.cfasync_loaded = true;
        }

        // Standard 468x60 Iframe Config Binder
        window.atOptions = {
          'key' : '23591d15e448b5bf1900c3bf28352b68',
          'format' : 'iframe',
          'height' : 60,
          'width' : 468,
          'params' : {}
        };
      } catch (e) { console.log("Config maps set."); }
    }
  }, [isAdSystemActive, stage]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) { setUser(currentUser); fetchUserData(currentUser); } 
      else { setUser(null); setUserLinks([]); }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserData = async (currentUser) => {
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
  };

  const handleAuth = async () => {
    if (!email || !password) return alert("All fields required!");
    try {
      if (isSignUp) { await createUserWithEmailAndPassword(auth, email, password); setIsSignUp(false); } 
      else { await signInWithEmailAndPassword(auth, email, password); setActiveTab('dash'); }
    } catch (err) { alert(err.message); }
  };

  const handleShorten = async () => {
    if (!longUrl) return alert("URL missing!");
    const shortAlias = Math.random().toString(36).substring(2, 7);
    const shortUrl = `${window.location.origin}?go=${shortAlias}&uid=${user ? user.uid : 'guest'}`;
    const newLink = { userId: user ? user.uid : "guest", originalUrl: longUrl, shortUrl, alias: shortAlias, clicks: 0 };
    try {
      await addDoc(collection(db, "links"), newLink);
      if (user) { fetchUserData(user); } else { setHomeLinks([newLink, ...homeLinks]); }
      setLongUrl(''); 
      alert("Short link created! View in Links Tab.");
      setActiveTab('manage');
    } catch (e) { alert("Error saving link"); }
  };

  const handleNextStage = (next) => {
    if (timer > 0) return alert("Wait for countdown!");
    setStage(next);
    setTimer(next === 4 ? 5 : 8); // STAGE 4 IS EXACTLY 5 SECONDS
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalRedirect = () => {
    if (lockedTargetUrl) {
      let url = lockedTargetUrl.trim();
      if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
      }
      window.location.replace(url); // Smooth destination execution
    }
  };

  // 🔥 12 AD PLACEMENTS COMPONENT (Combines Native, Banner 468x60, and Smartlinks)
  const Render12PlacementsMatrix = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px', margin: '20px 0', width: '100%', maxWidth: '468px' }}>
      
      {/* 4x Native Banner Integrations */}
      {[...Array(4)].map((_, i) => (
        <div key={`native-${i}`} style={{ background: '#0e1726', border: '1px solid #1e293b', padding: '10px', borderRadius: '8px' }}>
          <div id="container-cf611de77a66f7b9cc6ae3b4ca404da7"></div>
          <span style={{ fontSize: '10px', color: '#4b5563' }}>Sponsored Native Content #{i+1}</span>
        </div>
      ))}

      {/* 4x Standard 468x60 Banner Integrations */}
      {[...Array(4)].map((_, i) => (
        <div key={`banner-${i}`} style={{ background: '#0e1726', padding: '10px', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <iframe src="//rightyrely.com/watch.html?key=23591d15e448b5bf1900c3bf28352b68" width="468" height="60" frameBorder="0" scrolling="no" style={{ border: 'none', maxWidth: '100%' }}></iframe>
          <span style={{ fontSize: '10px', color: '#4b5563', marginTop: '4px' }}>Display Matrix Zone #{i+1}</span>
        </div>
      ))}

      {/* 4x Smart Link CTA High-CPM Blocks */}
      {[...Array(4)].map((_, i) => (
        <div key={`smart-${i}`} onClick={() => window.open('https://rightyrely.com/zf7xraia?key=41a44697420ad362de39e8934daee4f3', '_blank')} style={{ background: 'linear-gradient(90deg, #1e293b, #0f172a)', border: '1px solid #38bdf8', padding: '16px', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', color: '#38bdf8', fontWeight: '600', fontSize: '13px' }}>
          ⚡ CLOUD DOWNLOAD SYSTEM LINK DIRECT #{i+1}
        </div>
      ))}

    </div>
  );

  if (isAdSystemActive) {
    return (
      <div style={{ background: '#030712', color: '#f3f4f6', minHeight: '100vh', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'sans-serif' }}>
        
        <div style={{ padding: '8px 16px', borderRadius: '20px', background: '#111827', display: 'inline-block', fontSize: '13px', color: '#38bdf8', border: '1px solid #1f2937', marginBottom: '10px' }}>
          🔒 Cloud Network Handshake Tunnel • Step {stage}/4
        </div>
        
        {/* Top Tier Placements Matrix */}
        <Render12PlacementsMatrix />

        <div style={{ background: '#0f172a', padding: '24px', borderRadius: '12px', border: '1px solid #1e293b', margin: '20px 0', width: '100%', maxWidth: '468px', textAlign: 'center' }}>
          {timer > 0 ? (
            <div style={{ fontSize: '18px', fontWeight: '600' }}>
              🔄 Analyzing Device Attributes... <span style={{ color: '#f59e0b' }}>{timer}s</span>
            </div>
          ) : (
            stage === 4 ? (
              <button onClick={handleFinalRedirect} style={{ width: '100%', padding: '16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)' }}>
                🚀 UNLOCK TARGET DESTINATION LINK
              </button>
            ) : (
              <button onClick={() => handleNextStage(stage + 1)} style={{ width: '100%', padding: '15px', background: '#38bdf8', color: '#030712', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>
                CONTINUE NEXT EXECUTABLE STEP ➡️
              </button>
            )
          )}
        </div>

        {/* Bottom Tier Placements Matrix */}
        <Render12PlacementsMatrix />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#030712', color: '#f3f4f6', minHeight: '100vh', paddingBottom: '90px', fontFamily: 'sans-serif' }}>
      
      <div style={{ background: '#0f172a', padding: '16px', borderBottom: '1px solid #1e293b', color: '#38bdf8', fontWeight: '700', fontSize: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>LG SHORTENER PLATFORM v4</span>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setActiveTab('home')} style={{ background: 'none', border: 'none', color: activeTab === 'home' ? '#38bdf8' : '#94a3b8', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Workspace</button>
          <button onClick={() => setActiveTab('manage')} style={{ background: 'none', border: 'none', color: activeTab === 'manage' ? '#38bdf8' : '#94a3b8', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Links</button>
          <button onClick={() => setActiveTab('profile')} style={{ background: 'none', border: 'none', color: activeTab === 'profile' ? '#38bdf8' : '#94a3b8', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Account</button>
        </div>
      </div>

      {activeTab === 'home' && (
        <div style={{ padding: '20px', maxWidth: '480px', margin: '0 auto' }}>
          <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '15px' }}>Shorten Secure Destination Node</h4>
            <input type="url" style={{ width: '100%', padding: '12px', background: '#090d16', border: '1px solid #374151', borderRadius: '6px', color: '#fff', marginBottom: '12px', boxSizing: 'border-box', outline: 'none' }} placeholder="https://targeturl.com" value={longUrl} onChange={(e) => setLongUrl(e.target.value)} />
            <button style={{ width: '100%', padding: '12px', background: '#38bdf8', color: '#030712', borderRadius: '6px', border: 'none', fontWeight: '700', cursor: 'pointer' }} onClick={handleShorten}>Generate Encrypted Link</button>
          </div>
        </div>
      )}

      {activeTab === 'manage' && (
        <div style={{ padding: '20px', maxWidth: '480px', margin: '0 auto' }}>
          <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b' }}>
            <h3 style={{ margin: '0 0 14px 0', color: '#38bdf8', fontSize: '16px' }}>📋 Saved Links History</h3>
            
            {user && userLinks.length === 0 && <p style={{ color: '#64748b', fontSize: '13px' }}>No cloud nodes generated.</p>}
            {user && userLinks.map((l, i) => (
              <div key={i} style={{ background: '#090d16', padding: '10px', borderRadius: '6px', border: '1px solid #1e293b', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#38bdf8', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '70%' }}>{l.shortUrl}</span>
                <button onClick={() => { navigator.clipboard.writeText(l.shortUrl); alert("Copied!"); }} style={{ background: '#38bdf8', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', color: '#000', fontWeight: 'bold' }}>Copy</button>
              </div>
            ))}

            {!user && homeLinks.length === 0 && <p style={{ color: '#64748b', fontSize: '13px' }}>No session logs available.</p>}
            {!user && homeLinks.map((l, i) => (
              <div key={i} style={{ background: '#090d16', padding: '10px', borderRadius: '6px', border: '1px solid #1e293b', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#38bdf8', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '70%' }}>{l.shortUrl}</span>
                <button onClick={() => { navigator.clipboard.writeText(l.shortUrl); alert("Copied!"); }} style={{ background: '#38bdf8', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', color: '#000', fontWeight: 'bold' }}>Copy</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div style={{ padding: '20px', maxWidth: '480px', margin: '0 auto' }}>
          {!user ? (
            <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b' }}>
              <h3 style={{ textAlign: 'center', marginBottom: '14px' }}>Cloud Authentication</h3>
              <input type="email" placeholder="Database Email" style={{ width: '100%', padding: '12px', background: '#090d16', border: '1px solid #374151', borderRadius: '6px', color: '#fff', marginBottom: '10px', boxSizing: 'border-box' }} value={email} onChange={(e) => setEmail(e.target.value)} />
              <input type="password" placeholder="System Password" style={{ width: '100%', padding: '12px', background: '#090d16', border: '1px solid #374151', borderRadius: '6px', color: '#fff', marginBottom: '14px', boxSizing: 'border-box' }} value={password} onChange={(e) => setPassword(e.target.value)} />
              <button style={{ width: '100%', padding: '12px', background: '#38bdf8', color: '#030712', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }} onClick={handleAuth}>{isSignUp ? "Register" : "Secure Login"}</button>
              <button style={{ background: 'none', border: 'none', color: '#94a3b8', width: '100%', marginTop: '10px', cursor: 'pointer', fontSize: '12px' }} onClick={() => setIsSignUp(!isSignUp)}>{isSignUp ? "Login Instead" : "Create Account Instance"}</button>
            </div>
          ) : (
            <div style={{ background: '#0f172a', padding: '24px', borderRadius: '12px', border: '1px solid #1e293b', textAlign: 'center' }}>
              <h4>Active Secure Identity</h4>
              <p style={{ color: '#94a3b8', fontSize: '13px', margin: '6px 0 16px 0' }}>{user.email}</p>
              <button style={{ padding: '10px 20px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }} onClick={handleLogout}>Revoke Authentication</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
        }
            
