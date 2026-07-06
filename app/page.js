'use client';
import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';

export default function App() {
  // Tabs: 'home' | 'manage' | 'dash' | 'profile'
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [longUrl, setLongUrl] = useState('');
  const [homeLinks, setHomeLinks] = useState([]); 
  const [userLinks, setUserLinks] = useState([]); 
  const [stats, setStats] = useState({ clicks: 0, earnings: 0.00 });

  // 💸 Professional Ad Funnel Logic (Fixed Redirect & Stage 4 Suppression)
  const [isAdSystemActive, setIsAdSystemActive] = useState(false);
  const [stage, setStage] = useState(1);
  const [timer, setTimer] = useState(10);
  const [lockedTargetUrl, setLockedTargetUrl] = useState('');

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
          } catch (err) { console.error("DB Error"); }
        };
        fetchLockedNode();
      }
    }
  }, []);

  useEffect(() => {
    if (isAdSystemActive && timer > 0) {
      const interval = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(interval);
    }
  }, [isAdSystemActive, timer]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) { setUser(currentUser); fetchUserData(currentUser); } 
      else { setUser(null); setUserLinks([]); }
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
    } catch (e) { console.log("Sync core."); }
  };

  const handleAuth = async () => {
    if (!email || !password) return alert("All fields required!");
    try {
      if (isSignUp) { await createUserWithEmailAndPassword(auth, email, password); setIsSignUp(false); } 
      else { await signInWithEmailAndPassword(auth, email, password); setActiveTab('dash'); }
    } catch (err) { alert(err.message); }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setActiveTab('home');
  };

  const handleShorten = async () => {
    if (!longUrl) return alert("URL is missing!");
    const shortAlias = Math.random().toString(36).substring(2, 7);
    const shortUrl = `${window.location.origin}?go=${shortAlias}&uid=${user ? user.uid : 'guest'}`;
    const newLink = { userId: user ? user.uid : "guest", originalUrl: longUrl, shortUrl, alias: shortAlias, clicks: 0 };
    try {
      await addDoc(collection(db, "links"), newLink);
      if (user) { fetchUserData(user); } else { setHomeLinks([newLink, ...homeLinks]); }
      setLongUrl(''); 
      alert("Link Shortened Successfully! View it in the 'Manage Links' tab.");
      setActiveTab('manage'); // Short hote hi automatically Manage Links tab par le jayega
    } catch (e) { alert("Error saving link"); }
  };

  const handleNextStage = (next) => {
    if (timer > 0) return alert("Wait for countdown!");
    setStage(next);
    setTimer(next === 4 ? 5 : 8); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalRedirect = () => {
    if (lockedTargetUrl) {
      let url = lockedTargetUrl.startsWith('http') ? lockedTargetUrl : 'https://' + lockedTargetUrl;
      window.location.assign(url);
    }
  };

  // AD MATRIX: Minimum 12 Slots Per Page (Strictly No Popups on Stage 4)
  const AdMatrix = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '20px 0' }}>
      {[...Array(12)].map((_, i) => (
        <div key={i} style={{ height: '100px', background: '#111827', border: '1px dashed #38bdf8', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563', fontSize: '10px', textAlign: 'center', cursor: 'pointer' }} onClick={() => window.open('YOUR_DIRECT_LINK', '_blank')}>
          Ad Slot #{i+1}
        </div>
      ))}
    </div>
  );

  if (isAdSystemActive) {
    return (
      <div style={{ background: '#090d16', color: '#fff', minHeight: '100vh', padding: '20px', textAlign: 'center' }}>
        <h2 style={{ color: '#38bdf8' }}>Step {stage} of 4</h2>
        <AdMatrix />
        <div style={{ background: '#111827', padding: '30px', borderRadius: '16px', border: '1px solid #1f2937' }}>
          {timer > 0 ? (
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>⌛ Loading Logic: {timer}s</div>
          ) : (
            stage === 4 ? (
              <button onClick={handleFinalRedirect} style={{ width: '100%', padding: '16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: '800', cursor: 'pointer' }}>🚀 GET ORIGINAL LINK</button>
            ) : (
              <button onClick={() => handleNextStage(stage + 1)} style={{ width: '100%', padding: '16px', background: '#38bdf8', color: '#000', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>CONTINUE TO NEXT PAGE ➡️</button>
            )
          )}
        </div>
        <AdMatrix />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#090d16', color: '#f1f5f9', minHeight: '100vh', paddingBottom: '90px', fontFamily: 'sans-serif' }}>
      
      <div style={{ background: '#111827', padding: '16px', borderBottom: '1px solid #1f2937', color: '#38bdf8', fontWeight: '700', fontSize: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>LG SHORTENER PRO</span>
        {user && <span style={{ fontSize: '12px', color: '#10b981' }}>Dashboard Active</span>}
      </div>

      {/* 🏠 TAB 1: HOME PANEL */}
      {activeTab === 'home' && (
        <div style={{ padding: '24px', maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ background: '#111827', padding: '24px', borderRadius: '12px', border: '1px solid #1f2937' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>🔗 Paste Long Link Workspace</h4>
            <input type="url" style={{ width: '100%', padding: '14px', background: '#030712', border: '1px solid #374151', borderRadius: '8px', color: '#fff', boxSizing: 'border-box', marginBottom: '14px', outline: 'none' }} placeholder="https://example.com" value={longUrl} onChange={(e) => setLongUrl(e.target.value)} />
            <button style={{ width: '100%', padding: '14px', background: '#38bdf8', color: '#000', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer' }} onClick={handleShorten}>Shorten URL</button>
          </div>

          {!user && (
            <div style={{ background: '#111827', padding: '20px', borderRadius: '12px', border: '1px solid #1f2937', marginTop: '16px', textAlign: 'center' }}>
              <h4 style={{ margin: '0 0 8px 0' }}>Want to Track Clicks & Earnings?</h4>
              <button style={{ width: '100%', padding: '12px', background: '#1f2937', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }} onClick={() => setActiveTab('profile')}>Sign In / Create Portal</button>
            </div>
          )}
        </div>
      )}

      {/* 🔗 TAB 2: MANAGE LINKS (Dedicated System) */}
      {activeTab === 'manage' && (
        <div style={{ padding: '24px', maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ background: '#111827', padding: '20px', borderRadius: '12px', border: '1px solid #1f2937' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#38bdf8', fontSize: '18px' }}>📋 Managed Short Links</h3>
            
            {/* Registered User Links */}
            {user && userLinks.length === 0 && <p style={{ color: '#64748b', fontSize: '14px' }}>No links generated yet in your account.</p>}
            {user && userLinks.map((l, i) => (
              <div key={i} style={{ background: '#030712', padding: '12px', borderRadius: '8px', border: '1px solid #1f2937', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ width: '70%', overflow: 'hidden' }}>
                  <div style={{ color: '#38bdf8', fontWeight: '600', fontSize: '13px', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{l.shortUrl}</div>
                  <div style={{ color: '#64748b', fontSize: '11px', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{l.originalUrl}</div>
                </div>
                <button onClick={() => { navigator.clipboard.writeText(l.shortUrl); alert("Copied!"); }} style={{ background: '#38bdf8', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: '600', color: '#000' }}>Copy</button>
              </div>
            ))}

            {/* Guest Session Links */}
            {!user && homeLinks.length === 0 && <p style={{ color: '#64748b', fontSize: '14px' }}>No guest links available. Shorten a link on the home page first!</p>}
            {!user && homeLinks.map((l, i) => (
              <div key={i} style={{ background: '#030712', padding: '12px', borderRadius: '8px', border: '1px solid #1f2937', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#38bdf8', fontSize: '13px', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', width: '70%' }}>{l.shortUrl}</span>
                <button onClick={() => { navigator.clipboard.writeText(l.shortUrl); alert("Copied!"); }} style={{ background: '#38bdf8', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: '600', color: '#000' }}>Copy</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 📊 TAB 3: CONSOLE / DASHBOARD (Only for Logged In users) */}
      {activeTab === 'dash' && (
        <div style={{ padding: '24px', maxWidth: '500px', margin: '0 auto' }}>
          {!user ? (
            <div style={{ background: '#111827', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
              <h4>Access Denied</h4>
              <p style={{ color: '#64748b', fontSize: '14px' }}>Please login to view analytical stats.</p>
              <button style={{ padding: '10px 20px', background: '#38bdf8', color: '#000', border: 'none', borderRadius: '6px', marginTop: '10px', fontWeight: '600' }} onClick={() => setActiveTab('profile')}>Go to Login</button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div style={{ background: '#111827', padding: '16px', borderRadius: '12px', border: '1px solid #1f2937' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>Total Traffic</span>
                  <p style={{ fontSize: '26px', fontWeight: '700', margin: '4px 0 0 0' }}>{stats.clicks}</p>
                </div>
                <div style={{ background: '#111827', padding: '16px', borderRadius: '12px', border: '1px solid #1f2937' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>Total Earnings</span>
                  <p style={{ fontSize: '26px', fontWeight: '700', margin: '4px 0 0 0', color: '#10b981' }}>${stats.earnings.toFixed(2)}</p>
                </div>
              </div>
              <div style={{ background: '#111827', padding: '20px', borderRadius: '12px', textalign: 'center', border: '1px solid #10b981', color: '#10b981', fontWeight: '600' }}>
                ✓ Core Analytics Synced with Cloud Database.
              </div>
            </div>
          )}
        </div>
      )}

      {/* 👤 TAB 4: PROFILE / AUTH SYSTEM */}
      {activeTab === 'profile' && (
        <div style={{ padding: '24px', maxWidth: '500px', margin: '0 auto' }}>
          {!user ? (
            <div style={{ background: '#111827', padding: '24px', borderRadius: '12px', border: '1px solid #1f2937' }}>
              <h3 style={{ textAlign: 'center', marginBottom: '16px' }}>{isSignUp ? "Create Account" : "Welcome Login"}</h3>
              <input type="email" placeholder="Email" style={{ width: '100%', padding: '12px', background: '#030712', border: '1px solid #374151', borderRadius: '8px', color: '#fff', marginBottom: '12px', boxSizing: 'border-box' }} value={email} onChange={(e) => setEmail(e.target.value)} />
              <input type="password" placeholder="Password" style={{ width: '100%', padding: '12px', background: '#030712', border: '1px solid #374151', borderRadius: '8px', color: '#fff', marginBottom: '16px', boxSizing: 'border-box' }} value={password} onChange={(e) => setPassword(e.target.value)} />
              <button style={{ width: '100%', padding: '14px', background: '#38bdf8', color: '#000', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }} onClick={handleAuth}>{isSignUp ? "Sign Up" : "Sign In"}</button>
              <button style={{ background: 'none', border: 'none', color: '#94a3b8', width: '100%', marginTop: '12px', cursor: 'pointer', fontSize: '13px' }} onClick={() => setIsSignUp(!isSignUp)}>{isSignUp ? "Already have an account? Login" : "New user? Create an account"}</button>
            </div>
          ) : (
            <div style={{ background: '#111827', padding: '30px', borderRadius: '12px', border: '1px solid #1f2937', textAlign: 'center' }}>
              <h3 style={{ marginBottom: '8px' }}>Authenticated Session</h3>
              <p style={{ color: '#94a3b8', fontSize: '14px' }}>{user.email}</p>
              <button style={{ padding: '12px 24px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', marginTop: '20px', cursor: 'pointer', fontWeight: '600' }} onClick={handleLogout}>Secure Logout</button>
            </div>
          )}
        </div>
      )}

      {/* 📱 BOTTOM NAVIGATION SYSTEM WITH DEDICATED MANAGE LINKS TAB */}
      <div style={{ background: '#111827', position: 'fixed', bottom: 0, left: 0, right: 0, height: '65px', display: 'flex', borderTop: '1px solid #1f2937', zIndex: 99999 }}>
        <button style={{ flex: 1, background: 'none', border: 'none', color: activeTab === 'home' ? '#38bdf8' : '#94a3b8', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }} onClick={() => setActiveTab('home')}>🏠 Home</button>
        <button style={{ flex: 1, background: 'none', border: 'none', color: activeTab === 'manage' ? '#38bdf8' : '#94a3b8', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }} onClick={() => setActiveTab('manage')}>🔗 Manage Links</button>
        {user && <button style={{ flex: 1, background: 'none', border: 'none', color: activeTab === 'dash' ? '#38bdf8' : '#94a3b8', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }} onClick={() => setActiveTab('dash')}>📊 Stats</button>}
        <button style={{ flex: 1, background: 'none', border: 'none', color: activeTab === 'profile' ? '#38bdf8' : '#94a3b8', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }} onClick={() => setActiveTab('profile')}>👤 Profile</button>
      </div>

    </div>
  );
}
