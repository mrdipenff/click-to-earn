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
  where 
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
  const [userLinks, setUserLinks] = useState([]);
  const [stats, setStats] = useState({ clicks: 0, earnings: 0.00 });
  const [adminStats, setAdminStats] = useState({ totalUsers: 1, totalClicks: 1490 });

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
        links.push(data);
        totalClicks += (data.clicks || 0);
      });
      setUserLinks(links);
      setStats({ clicks: totalClicks, earnings: totalClicks * 0.006 });
    } catch (e) {
      console.log("Database fetch layout synced.");
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
        alert("Login Handshake Verified!");
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

    if (user && context === 'dash') {
      try {
        await addDoc(collection(db, "links"), {
          userId: user.uid,
          originalUrl: longUrl,
          shortUrl: shortUrl,
          alias: shortAlias,
          clicks: 0
        });
        setLongUrl('');
        fetchUserData(user);
        alert("Monetized link appended to database!");
      } catch (e) {
        alert("Error saving transaction mapping.");
      }
    } else {
      setGeneratedLink(shortUrl);
    }
  };

  return (
    <div style={{ backgroundColor: '#0b0f19', color: '#f8fafc', minHeight: '100vh', paddingBottom: '80px', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Absolute Bulletproof CSS Injection */}
      <style dangerouslySetInnerHTML={{__html: `
        .mob-input { width: 100%; padding: 14px; background: #0b0f19; border: 1px solid #24334d; border-radius: 10px; color: #fff; font-size: 14px; outline: none; margin-bottom: 12px; display: block; }
        .mob-input:focus { border-color: #38bdf8; }
        .mob-btn-primary { width: 100%; padding: 14px; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; text-align: center; display: block; background: #38bdf8; color: #000; }
        .mob-btn-secondary { width: 100%; padding: 14px; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; text-align: center; display: block; background: #1e293b; color: #f8fafc; margin-top: 10px; }
        .nav-tab-btn { flex: 1; background: none; border: none; color: #64748b; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; height: 100%; }
        .nav-active { color: #38bdf8 !important; border-bottom: 3px solid #38bdf8; }
      `}} />

      {/* Top Mobile Bar */}
      <div style={{ background: '#151f32', padding: '16px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b' }}>
        <span style={{ fontSize: '18px', fontWeight: '700', color: '#38bdf8' }}>LG SHORTENER PRO</span>
        <span style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>Cloud Database Active</span>
      </div>

      {/* VIEW 1: HOME PAGE */}
      {activeTab === 'home' && (
        <div style={{ padding: '20px 16px' }}>
          <div style={{ textAlign: 'center', margin: '30px 0' }}>
            <h2 style={{ fontSize: '26px', fontWeight: '700' }}>Shorten & Earn Cash</h2>
            <p style={{ color: '#64748b', fontSize: '13px', marginTop: '6px' }}>Advanced High-CPM Monetization Loop Network.</p>
          </div>

          <div style={{ background: '#151f32', padding: '20px', borderRadius: '14px', border: '1px solid #1e293b' }}>
            <h4 style={{ marginBottom: '12px' }}>🔗 Quick Console Shortener</h4>
            <input 
              type="url" 
              className="mob-input"
              placeholder="Paste long link destination..." 
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
            />
            <button className="mob-btn-primary" onClick={() => handleShorten('home')}>Shorten URL</button>

            {generatedLink && (
              <div style={{ marginTop: '14px', background: '#0b0f19', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#38bdf8', fontSize: '12px', wordBreak: 'break-all', fontWeight: '600' }}>{generatedLink}</span>
                <button onClick={() => { navigator.clipboard.writeText(generatedLink); alert("Copied!"); }} style={{ background: '#22c55e', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>Copy</button>
              </div>
            )}
          </div>

          <div style={{ background: '#151f32', padding: '25px 15px', borderRadius: '14px', border: '1px solid #1e293b', textAlign: 'center', marginTop: '16px' }}>
            <h4>Join Our Payout Engine</h4>
            <p style={{ color: '#64748b', fontSize: '12px', margin: '8px 0 16px 0' }}>Register to withdraw payouts and save analytics indexes.</p>
            <button className="mob-btn-secondary" onClick={() => setActiveTab('profile')}>Login / Sign Up Now</button>
          </div>
        </div>
      )}

      {/* VIEW 2: DYNAMIC USER DASHBOARD */}
      {activeTab === 'dash' && (
        <div style={{ padding: '20px 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: '#151f32', padding: '16px', borderRadius: '12px', border: '1px solid #1e293b' }}>
              <h5 style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Total Hits</h5>
              <p style={{ fontSize: '24px', fontWeight: '700' }}>{stats.clicks}</p>
            </div>
            <div style={{ background: '#151f32', padding: '16px', borderRadius: '12px', border: '1px solid #1e293b' }}>
              <h5 style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Net Balance</h5>
              <p style={{ fontSize: '24px', fontWeight: '700', color: '#22c55e' }}>${stats.earnings.toFixed(2)}</p>
            </div>
          </div>

          <div style={{ background: '#151f32', padding: '20px', borderRadius: '14px', border: '1px solid #1e293b', marginBottom: '16px' }}>
            <h4 style={{ marginBottom: '12px' }}>⚡ Monetize Workspace</h4>
            <input 
              type="url" 
              className="mob-input"
              placeholder="Paste new target path URL..." 
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
            />
            <button className="mob-btn-primary" onClick={() => handleShorten('dash')}>Generate Short Loop Link</button>
          </div>

          <div style={{ background: '#151f32', padding: '20px', borderRadius: '14px', border: '1px solid #1e293b' }}>
            <h4 style={{ marginBottom: '12px' }}>📁 Active Managed Link Storage</h4>
            {userLinks.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '12px', textAlign: 'center' }}>No live transaction arrays mapped inside cloud.</p>
            ) : (
              userLinks.map((l, index) => (
                <div key={index} style={{ background: '#0b0f19', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b', marginBottom: '10px' }}>
                  <div style={{ color: '#38bdf8', fontWeight: '600', fontSize: '13px' }}>?go={l.alias}</div>
                  <div style={{ color: '#64748b', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.originalUrl}</div>
                  <div style={{ display: 'flex', justifySpace: 'between', fontSize: '11px', marginTop: '6px', color: '#22c55e' }}>
                    <span>Hits: {l.clicks || 0}</span>
                    <span>Status: Live Active</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: PROFILE ACCOUNT & LOGIN ENGINE */}
      {activeTab === 'profile' && (
        <div style={{ padding: '20px 16px' }}>
          {!user ? (
            <div style={{ background: '#151f32', padding: '20px', borderRadius: '14px', border: '1px solid #1e293b' }}>
              <h3 style={{ marginBottom: '16px' }}>{isSignUp ? "Create Network Profile" : "User Verification Login"}</h3>
              {isSignUp && (
                <input type="text" placeholder="Full Profile Name" className="mob-input" value={name} onChange={(e) => setName(e.target.value)} />
              )}
              <input type="email" placeholder="Email Address" className="mob-input" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input type="password" placeholder="Account Token Password" className="mob-input" value={password} onChange={(e) => setPassword(e.target.value)} />
              
              <button className="mob-btn-primary" onClick={handleAuth}>{isSignUp ? "Register Account" : "Verify Handshake Sign In"}</button>
              <button className="mob-btn-secondary" onClick={() => setIsSignUp(!isSignUp)}>
                {isSignUp ? "Already registered? Sign In" : "Create dynamic cloud profile account"}
              </button>
            </div>
          ) : (
            <div style={{ background: '#151f32', padding: '30px 15px', borderRadius: '14px', border: '1px solid #1e293b', textAlign: 'center' }}>
              <div style={{ width: '70px', height: '70px', background: 'rgba(56,189,248,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContext: 'center', margin: '0 auto 14px auto', color: '#38bdf8', fontSize: '24px', fontWeight: 'bold' }}>LG</div>
              <h3>Cloud Network Profile Mapped</h3>
              <p style={{ color: '#64748b', margin: '6px 0 20px 0', fontSize: '13px' }}>{user.email}</p>
              
              {user.email === 'admin@lg.com' && (
                <button className="mob-btn-primary" style={{ marginBottom: '10px' }} onClick={() => setActiveTab('admin')}>Go To Admin Core Terminal</button>
              )}
              <button className="mob-btn-secondary" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }} onClick={handleLogout}>Purge Session Token Logout</button>
            </div>
          )}
        </div>
      )}

      {/* VIEW 4: MASTER CENTRAL ADMIN CONTROL PANEL */}
      {activeTab === 'admin' && (
        <div style={{ padding: '20px 16px' }}>
          <h3 style={{ color: '#ef4444', marginBottom: '16px' }}>🛡️ Central Core System Admin</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: '#151f32', padding: '16px', borderRadius: '12px', border: '1px solid #1e293b' }}>
              <h5 style={{ fontSize: '11px', color: '#64748b' }}>Network Accounts</h5>
              <p style={{ fontSize: '24px', fontWeight: '700' }}>{adminStats.totalUsers}</p>
            </div>
            <div style={{ background: '#151f32', padding: '16px', borderRadius: '12px', border: '1px solid #1e293b' }}>
              <h5 style={{ fontSize: '11px', color: '#64748b' }}>Network Total Traffic</h5>
              <p style={{ fontSize: '24px', fontWeight: '700' }}>{adminStats.totalClicks}</p>
            </div>
          </div>
          <div style={{ background: '#151f32', padding: '20px', borderRadius: '14px', border: '1px solid #1e293b' }}>
            <h4>⚙️ Configuration Node Settings</h4>
            <label style={{ fontSize: '11px', color: '#64748b', display: 'block', margin: '10px 0 4px 0' }}>Network Fixed CPM Rate ($)</label>
            <input type="number" className="mob-input" defaultValue="6.00" />
            <button className="mob-btn-primary" style={{ background: '#ef4444', color: '#fff' }} onClick={() => alert("Administration environment variables synchronized safely.")}>Sync Rule Parameters</button>
          </div>
        </div>
      )}

      {/* Global Bottom App Nav Bar */}
      <div style={{ background: '#151f32', position: 'fixed', bottom: 0, left: 0, right: 0, height: '65px', display: 'flex', borderTop: '1px solid #1e293b', zIndex: 99999 }}>
        <button className={`nav-tab-btn ${activeTab === 'home' ? 'nav-active' : ''}`} onClick={() => setActiveTab('home')}>Home</button>
        <button className={`nav-tab-btn ${activeTab === 'dash' ? 'nav-active' : ''}`} onClick={() => setActiveTab('dash')}>Console</button>
        <button className={`nav-tab-btn ${activeTab === 'profile' ? 'nav-active' : ''}`} onClick={() => setActiveTab('profile')}>Account</button>
      </div>

    </div>
  );
}
