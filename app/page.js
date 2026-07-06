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

  const handleShorten = async (context) => {
    if (!longUrl) return alert("Enter valid URL!");
    const currentHost = window.location.origin;
    const shortAlias = Math.random().toString(36).substring(2, 7);
    
    // 🔗 Fixed Absolute Path: URL ke andar se destination parameters completely delete!
    const shortUrl = `${currentHost}/visit/${shortAlias}`;

    const newLinkObject = { originalUrl: longUrl, shortUrl: shortUrl, alias: shortAlias, clicks: 0 };

    if (user && context === 'dash') {
      await addDoc(collection(db, "links"), { userId: user.uid, ...newLinkObject });
      fetchUserData(user);
    } else {
      setHomeLinks([newLinkObject, ...homeLinks]);
    }
    setLongUrl(''); 
  };

  return (
    <div style={{ backgroundColor: '#090d16', color: '#f1f5f9', minHeight: '100vh', fontFamily: 'sans-serif', paddingBottom: '80px' }}>
      <div style={{ background: '#111827', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1f2937' }}>
        <span style={{ fontSize: '18px', fontWeight: '700', color: '#38bdf8' }}>LG SHORTENER PRO</span>
      </div>

      {activeTab === 'home' && (
        <div style={{ padding: '24px 16px', maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ background: '#111827', border: '1px solid #1f2937', padding: '20px', borderRadius: '12px' }}>
            <h4 style={{ margin: '0 0 12px 0' }}>🔗 Paste Long Link</h4>
            <input type="url" style={{ width: '100%', padding: '12px', background: '#030712', border: '1px solid #374151', borderRadius: '8px', color: '#fff', marginBottom: '12px' }} value={longUrl} onChange={(e) => setLongUrl(e.target.value)} placeholder="https://example.com" />
            <button style={{ width: '100%', padding: '12px', background: '#38bdf8', color: '#000', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }} onClick={() => handleShorten('home')}>Shorten URL</button>
          </div>

          {homeLinks.length > 0 && (
            <div style={{ background: '#111827', border: '1px solid #1f2937', padding: '20px', borderRadius: '12px', marginTop: '16px' }}>
              <h4 style={{ margin: '0 0 12px 0' }}>📋 Shortened History</h4>
              {homeLinks.map((l, i) => (
                <div key={i} style={{ background: '#030712', padding: '10px', borderRadius: '8px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#38bdf8', fontSize: '13px', overflow: 'hidden' }}>{l.shortUrl}</span>
                  <button onClick={() => { navigator.clipboard.writeText(l.shortUrl); alert("Copied!"); }} style={{ background: '#38bdf8', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Copy</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ background: '#111827', position: 'fixed', bottom: 0, left: 0, right: 0, height: '60px', display: 'flex', borderTop: '1px solid #1f2937' }}>
        <button style={{ flex: 1, background: 'none', border: 'none', color: '#fff' }} onClick={() => setActiveTab('home')}>Home</button>
        <button style={{ flex: 1, background: 'none', border: 'none', color: '#fff' }} onClick={() => setActiveTab('profile')}>Account</button>
      </div>
    </div>
  );
        }
                                    
