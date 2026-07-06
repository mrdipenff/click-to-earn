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
      console.log("Firestore sync ready.");
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
    if (!longUrl) return alert("Enter valid URL!");
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
        alert("Monetized link generated!");
      } catch (e) {
        alert("Database error.");
      }
    } else {
      setGeneratedLink(shortUrl);
    }
  };

  return (
    <div style={{ backgroundColor: '#030712', color: '#f3f4f6', minHeight: '100vh', paddingBottom: '90px', fontFamily: '"Poppins", system-ui, sans-serif', overflowX: 'hidden' }}>
      
      {/* Dynamic CSS Styling for Premium UI */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');
        .glass-card { background: rgba(17, 24, 39, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37); }
        .neon-input { width: 100%; padding: 16px; background: rgba(31, 41, 55, 0.5); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; color: #fff; font-size: 14px; transition: all 0.3s ease; outline: none; margin-bottom: 14px; box-sizing: border-box; }
        .neon-input:focus { border-color: #06b6d4; box-shadow: 0 0 15px rgba(6, 182, 212, 0.4); background: rgba(31, 41, 55, 0.8); }
        .btn-gradient { width: 100%; padding: 16px; border: none; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; text-align: center; color: #fff; background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); box-shadow: 0 4px 20px rgba(6, 182, 212, 0.3); transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .btn-gradient:active { transform: scale(0.98); }
        .btn-secondary { width: 100%; padding: 16px; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; font-size: 14px; font-weight: 500; cursor: pointer; background: transparent; color: #9ca3af; transition: all 0.3s ease; margin-top: 12px; }
        .btn-secondary:hover { background: rgba(255, 255, 255, 0.05); color: #fff; }
        .nav-btn { flex: 1; background: none; border: none; color: #6b7280; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; transition: all 0.3s ease; }
        .nav-btn-active { color: #06b6d4 !important; text-shadow: 0 0 10px rgba(6, 182, 212, 0.5); }
      `}} />

      {/* Top Header Navigation */}
      <div style={{ background: 'rgba(17, 24, 39, 0.8)', backdropFilter: 'blur(8px)', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', sticky: 'top', zIndex: 1000 }}>
        <span style={{ fontSize: '20px', fontWeight: '700', background: 'linear-gradient(to right, #06b6d4, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '0.5px' }}>LG SHORTENER PRO</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }}></span>
          <span style={{ color: '#10b981', fontSize: '12px', fontWeight: '600' }}>Live</span>
        </div>
      </div>

      {/* ================= VIEW 1: PREMIUM HOME ================= */}
      {activeTab === 'home' && (
        <div style={{ padding: '30px 20px' }}>
          <div style={{ textAlign: 'center', margin: '40px 0 35px 0' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', lineHeight: '1.2', letterSpacing: '-0.5px', background: 'linear-gradient(to bottom, #ffffff 60%, #9ca3af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Shorten Links,<br/>Earn Smart Cash</h2>
            <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '10px', fontWeight: '300' }}>Highest CPM payouts with advanced analytics tracking.</p>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#e5e7eb', display: 'flex', alignItems: 'center', gap: '8px' }}>🔗 Instant Shortener</h4>
            <input 
              type="url" 
              className="neon-input"
              placeholder="Enter your long URL here..." 
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
            />
            <button className="btn-gradient" onClick={() => handleShorten('home')}>Shorten Link</button>

            {generatedLink && (
              <div style={{ marginTop: '18px', background: 'rgba(3, 7, 18, 0.6)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(6, 182, 212, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#06b6d4', fontSize: '13px', wordBreak: 'break-all', fontWeight: '600', paddingRight: '10px' }}>{generatedLink}</span>
                <button onClick={() => { navigator.clipboard.writeText(generatedLink); alert("Copied to clipboard!"); }} style={{ background: '#06b6d4', border: 'none', color: '#000', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 10px rgba(6, 182, 212, 0.3)' }}>Copy</button>
              </div>
            )}
          </div>

          <div className="glass-card" style={{ padding: '24px', textAlign: 'center', marginTop: '20px' }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '16px' }}>Ready to Maximize Earnings?</h4>
            <p style={{ color: '#9ca3af', fontSize: '13px', margin: '0 0 20px 0' }}>Create an account to track detailed clicks, custom alias logs and secure withdrawals.</p>
            <button className="btn-secondary" onClick={() => setActiveTab('profile')}>Sign In / Register App</button>
          </div>
        </div>
      )}

      {/* ================= VIEW 2: PREMIUM DASHBOARD ================= */}
      {activeTab === 'dash' && (
        <div style={{ padding: '25px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
            <div className="glass-card" style={{ padding: '18px' }}>
              <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '500' }}>Total Clicks</span>
              <p style={{ fontSize: '28px', fontWeight: '700', margin: '6px 0 0 0', color: '#fff' }}>{stats.clicks}</p>
            </div>
            <div className="glass-card" style={{ padding: '18px' }}>
              <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '500' }}>Available Payout</span>
              <p style={{ fontSize: '28px', fontWeight: '700', margin: '6px 0 0 0', color: '#10b981' }}>${stats.earnings.toFixed(2)}</p>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 14px 0', fontSize: '16px' }}>⚡ Premium Monetize Workspace</h4>
            <input 
              type="url" 
              className="neon-input"
              placeholder="Paste destination link address..." 
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
            />
            <button className="btn-gradient" onClick={() => handleShorten('dash')}>Generate Short Loop Link</button>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>📁 Active Managed Links</h4>
            {userLinks.length === 0 ? (
              <p style={{ color: '#6b7280', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>No active cloud nodes generated yet.</p>
            ) : (
              userLinks.map((l, index) => (
                <div key={index} style={{ background: 'rgba(3, 7, 18, 0.4)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)', marginBottom: '12px' }}>
                  <div style={{ color: '#06b6d4', fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>?go={l.alias}</div>
                  <div style={{ color: '#6b7280', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.originalUrl}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: '#e5e7eb' }}>Clicks: <strong style={{ color: '#3b82f6' }}>{l.clicks || 0}</strong></span>
                    <span style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '6px', fontSize: '11px' }}>Active</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ================= VIEW 3: PREMIUM AUTH PORTAL ================= */}
      {activeTab === 'profile' && (
        <div style={{ padding: '30px 20px' }}>
          {!user ? (
            <div className="glass-card" style={{ padding: '26px' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '22px', fontWeight: '700', textAlign: 'center' }}>{isSignUp ? "Create Account" : "Secure Gate Login"}</h3>
              <p style={{ color: '#9ca3af', fontSize: '13px', textAlign: 'center', marginBottom: '24px' }}>{isSignUp ? "Join the network matrix node" : "Verify account authorization credentials"}</p>
              
              {isSignUp && (
                <input type="text" placeholder="Full Username" className="neon-input" value={name} onChange={(e) => setName(e.target.value)} />
              )}
              <input type="email" placeholder="Email Address" className="neon-input" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input type="password" placeholder="Account Key Password" className="neon-input" value={password} onChange={(e) => setPassword(e.target.value)} />
              
              <button className="btn-gradient" style={{ marginTop: '10px' }} onClick={handleAuth}>{isSignUp ? "Register Master Account" : "Authorize Session Login"}</button>
              <button className="btn-secondary" onClick={() => setIsSignUp(!isSignUp)}>
                {isSignUp ? "Already a member? Sign In" : "Don't have an account? Register Profile"}
              </button>
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)', border: '1px solid rgba(6, 182, 212, 0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', color: '#06b6d4', fontSize: '28px', fontWeight: '700', boxShadow: '0 0 20px rgba(6, 182, 212, 0.2)' }}>LG</div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '20px' }}>Authorized Device Node</h3>
              <p style={{ color: '#6b7280', margin: '0 0 30px 0', fontSize: '14px' }}>{user.email}</p>
              
              {user.email === 'admin@lg.com' && (
                <button className="btn-gradient" style={{ marginBottom: '12px' }} onClick={() => setActiveTab('admin')}>Launch Admin Terminal</button>
              )}
              <button className="btn-secondary" style={{ border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444' }} onClick={handleLogout}>Terminate Secure Session</button>
            </div>
          )}
        </div>
      )}

      {/* ================= VIEW 4: MASTER CENTRAL ADMIN ================= */}
      {activeTab === 'admin' && (
        <div style={{ padding: '25px 20px' }}>
          <h3 style={{ color: '#ef4444', margin: '0 0 20px 0', fontSize: '22px', fontWeight: '700' }}>🛡️ Central Core System Admin</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
            <div className="glass-card" style={{ padding: '18px' }}>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>Network Profiles</span>
              <p style={{ fontSize: '26px', fontWeight: '700', margin: '4px 0 0 0' }}>{adminStats.totalUsers}</p>
            </div>
            <div className="glass-card" style={{ padding: '18px' }}>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>Cumulative Traffic</span>
              <p style={{ fontSize: '26px', fontWeight: '700', margin: '4px 0 0 0', color: '#3b82f6' }}>{adminStats.totalClicks}</p>
            </div>
          </div>
          <div className="glass-card" style={{ padding: '24px' }}>
            <h4 style={{ margin: '0 0 16px 0' }}>⚙️ Global Runtime Configurations</h4>
            <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>Fixed Baseline CPM Rate ($)</label>
            <input type="number" className="neon-input" defaultValue="6.00" />
            <button className="btn-gradient" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', boxShadow: '0 4px 20px rgba(239, 68, 68, 0.2)' }} onClick={() => alert("Global configuration synchronized successfully.")}>Sync Configuration Rules</button>
          </div>
        </div>
      )}

      {/* Global Bottom Sticky Glass Bar */}
      <div style={{ background: 'rgba(17, 24, 39, 0.75)', backdropFilter: 'blur(20px)', position: 'fixed', bottom: 0, left: 0, right: 0, height: '70px', display: 'flex', borderTop: '1px solid rgba(255, 255, 255, 0.06)', zIndex: 99999 }}>
        <button className={`nav-btn ${activeTab === 'home' ? 'nav-btn-active' : ''}`} onClick={() => setActiveTab('home')}>
          <span style={{ fontSize: '18px', marginBottom: '2px' }}>🏠</span>
          <span>Home</span>
        </button>
        <button className={`nav-btn ${activeTab === 'dash' ? 'nav-btn-active' : ''}`} onClick={() => setActiveTab('dash')}>
          <span style={{ fontSize: '18px', marginBottom: '2px' }}>⚡</span>
          <span>Console</span>
        </button>
        <button className={`nav-btn ${activeTab === 'profile' ? 'nav-btn-active' : ''}`} onClick={() => setActiveTab('profile')}>
          <span style={{ fontSize: '18px', marginBottom: '2px' }}>👤</span>
          <span>Account</span>
        </button>
      </div>

    </div>
  );
        }
        
