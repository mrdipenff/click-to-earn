'use client';
import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

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
    } catch (e) { console.log("Data sync active."); }
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
    
    // 🔗 Ekdam saaf aur clean URL format bina kisi data leak parameter ke
    const shortUrl = `${currentHost}/visit/${shortAlias}`;

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
      setLongUrl(''); // Input box box khali!
      alert("Short link created successfully!");
    } catch (e) {
      alert("Database error.");
    }
  };

  return (
    <div style={{ backgroundColor: '#090d16', color: '#f1f5f9', minHeight: '100vh', fontFamily: 'sans-serif', paddingBottom: '90px' }}>
      
      <style dangerouslySetInnerHTML={{__html: `
        .saas-card { background: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); margin-bottom: 16px; }
        .saas-input { width: 100%; padding: 14px 16px; background: #030712; border: 1px solid #374151; border-radius: 8px; color: #fff; font-size: 14px; outline: none; margin-bottom: 12px; box-sizing: border-box; }
        .saas-btn { width: 100%; padding: 14px; background: #38bdf8; color: #000; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
        .tab-bar-item { flex: 1; background: none; border: none; color: #94a3b8; font-size: 12px; font-weight: 500; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; }
      `}} />

      <div style={{ background: '#111827', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1f2937' }}>
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
                <div key={i} style={{ background: '#030712', padding: '12px', border: '1px solid #1f2937', borderRadius: '8px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
              <div key={index} style={{ background: '#030712', padding: '12px', borderRadius: '8px', border: '1px solid #1f2937', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                
