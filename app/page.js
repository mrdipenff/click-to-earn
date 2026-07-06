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

  const handleShorten = async () => {
    if (!longUrl) return alert("URL is missing!");
    const shortAlias = Math.random().toString(36).substring(2, 7);
    const shortUrl = `${window.location.origin}?go=${shortAlias}&uid=${user ? user.uid : 'guest'}`;
    const newLink = { userId: user ? user.uid : "guest", originalUrl: longUrl, shortUrl, alias: shortAlias, clicks: 0 };
    try {
      await addDoc(collection(db, "links"), newLink);
      if (user) { fetchUserData(user); } else { setHomeLinks([newLink, ...homeLinks]); }
      setLongUrl(''); alert("Success!");
    } catch (e) { alert("Error"); }
  };

  const handleNextStage = (next) => {
    if (timer > 0) return alert("Wait for countdown!");
    setStage(next);
    // STAGE 4 TIMER FIXED TO 5 SECONDS
    setTimer(next === 4 ? 5 : 8); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Popup Suppression Logic (Only triggers if stage is NOT 4)
    if (next !== 4) {
      // Logic for triggering Adsterra Popunder can go here
      console.log("Stage Popup Triggered");
    }
  };

  const handleFinalRedirect = () => {
    if (lockedTargetUrl) {
      let url = lockedTargetUrl.startsWith('http') ? lockedTargetUrl : 'https://' + lockedTargetUrl;
      window.location.assign(url); // Hard assigned redirect
    }
  };

  // AD SLOT MATRIX: 12 Slots Per Stage
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
    <div style={{ backgroundColor: '#090d16', color: '#f1f5f9', minHeight: '100vh', paddingBottom: '80px' }}>
      <div style={{ background: '#111827', padding: '16px', borderBottom: '1px solid #1f2937', color: '#38bdf8', fontWeight: '700' }}>LG SHORTENER PRO</div>
      <div style={{ padding: '24px' }}>
        <div style={{ background: '#111827', padding: '20px', borderRadius: '12px' }}>
          <h4>🔗 Paste Long Link</h4>
          <input type="url" style={{ width: '100%', padding: '12px', background: '#030712', border: '1px solid #374151', borderRadius: '8px', color: '#fff', margin: '12px 0' }} value={longUrl} onChange={(e) => setLongUrl(e.target.value)} />
          <button style={{ width: '100%', padding: '12px', background: '#38bdf8', color: '#000', borderRadius: '8px', border: 'none' }} onClick={handleShorten}>Shorten URL</button>
        </div>
        {homeLinks.map((l, i) => (
          <div key={i} style={{ background: '#111827', padding: '12px', marginTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
            <span>{l.shortUrl}</span>
            <button onClick={() => { navigator.clipboard.writeText(l.shortUrl); alert("Copied!"); }}>Copy</button>
          </div>
        ))}
      </div>
    </div>
  );
}

Bhai, ye slide deck aur code implement karke dekh lo, ab system ekdam high-revenue mode mein chalega!

Your slide deck on High-CPM Ad Funnel Strategy is ready! Feel free to take a look and let me know if you'd like to make any edits.
        
