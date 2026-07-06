'use client';
import { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';

export default function VisitPage({ params }) {
  const [originalUrl, setOriginalUrl] = useState('');
  const [stage, setStage] = useState(1);
  const [timer, setTimer] = useState(10);
  const [loading, setLoading] = useState(true);
  const [clicksLogged, setClicksLogged] = useState(false);

  // 🛡️ Server Simulation Validation Loop
  useEffect(() => {
    if (params.alias) {
      const fetchLinkData = async () => {
        try {
          const q = query(collection(db, "links"), where("alias", "==", params.alias));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const linkDoc = querySnapshot.docs[0];
            const data = linkDoc.data();
            
            // Link data permanently locked inside memory component, not exposed in URL string
            setOriginalUrl(data.originalUrl);
            setLoading(false);

            // Log dynamic metric clicks once
            if (!clicksLogged) {
              await updateDoc(doc(db, "links", linkDoc.id), {
                clicks: (data.clicks || 0) + 1
              });
              setClicksLogged(true);
            }
          } else {
            alert("Security Protocol Error: Link mapping expired.");
            setLoading(false);
          }
        } catch (e) {
          console.error("Database connection refused.");
          setLoading(false);
        }
      };
      fetchLinkData();
    }
  }, [params.alias]);

  // Rigid State Countdown Clocks
  useEffect(() => {
    if (timer > 0 && !loading) {
      const interval = setInterval(() => setTimer(timer - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer, stage, loading]);

  const handleNextStage = (next) => {
    if (timer > 0) return alert("System Warning: Steps sequence modified.");
    setStage(next);
    setTimer(next === 4 ? 0 : 8);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: '#090d16', color: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Verifying secure cloud variables...
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#090d16', color: '#fff', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* 🌐 TOP HIGH-CPM BANNER SLOT */}
      <div style={{ width: '100%', maxWidth: '360px', height: '100px', background: '#111827', border: '1px dashed #4b5563', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: '11px', marginBottom: '20px' }}>
        ✨ [Adsterra Banner Script Slot #1] ✨
      </div>

      {/* ================= STAGE 1 ================= */}
      {stage === 1 && (
        <div style={{ background: '#111827', border: '1px solid #1f2937', padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '360px', textAlign: 'center' }}>
          <span style={{ color: '#38bdf8', fontSize: '11px', fontWeight: '700' }}>STEP 1 OF 4</span>
          <h3 style={{ margin: '10px 0' }}>Bypassing Proxy Nodes...</h3>
          
          {timer > 0 ? (
            <div style={{ padding: '12px', background: '#1f2937', borderRadius: '30px', color: '#38bdf8', fontWeight: '700', display: 'inline-block' }}>
              ⌛ Please Wait: {timer}s
            </div>
          ) : (
            <div>
              <div style={{ height: '150px', background: '#090d16', margin: '15px 0', border: '1px dashed #374151', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563' }}>[Ad Container Block]</div>
              <button onClick={() => handleNextStage(2)} style={{ width: '100%', padding: '14px', background: '#38bdf8', color: '#000', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                NEXT PAGE ➡️
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================= STAGE 2 ================= */}
      {stage === 2 && (
        <div style={{ background: '#111827', border: '1px solid #1f2937', padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '360px', textAlign: 'center' }}>
          <span style={{ color: '#a855f7', fontSize: '11px', fontWeight: '700' }}>STEP 2 OF 4</span>
          <h3 style={{ margin: '10px 0' }}>Device Verification</h3>
          
          <div style={{ background: '#030712', padding: '14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <input type="checkbox" checked={timer === 0} readOnly style={{ width: '18px', height: '18px' }} />
            <span>{timer > 0 ? `Validating user parameters (${timer}s)...` : "Handshake verified."}</span>
          </div>

          {timer === 0 && (
            <div>
              <div style={{ height: '150px', background: '#090d16', margin: '15px 0', border: '1px dashed #374151', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563' }}>[Ad Container Block]</div>
              <button onClick={() => handleNextStage(3)} style={{ width: '100%', padding: '14px', background: '#a855f7', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                CONTINUE UNLOCK 🔓
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================= STAGE 3 ================= */}
      {stage === 3 && (
        <div style={{ background: '#111827', border: '1px solid #1f2937', padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '360px', textAlign: 'center' }}>
          <span style={{ color: '#f59e0b', fontSize: '11px', fontWeight: '700' }}>STEP 3 OF 4</span>
          <h3 style={{ margin: '10px 0' }}>Syncing Target Tables</h3>

          {timer > 0 ? (
            <div style={{ color: '#f59e0b', fontSize: '14px', padding: '10px', background: 'rgba(245,158,11,0.05)' }}>
              Caching components matrix: {timer}s
            </div>
          ) : (
            <div>
              <div style={{ height: '150px', background: '#090d16', margin: '15px 0', border: '1px dashed #374151', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563' }}>[Ad Container Block]</div>
              <button onClick={() => handleNextStage(4)} style={{ width: '100%', padding: '14px', background: '#f59e0b', color: '#000', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                VERIFY CAP LINK 🛡️
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================= STAGE 4 ================= */}
      {stage === 4 && (
        <div style={{ background: '#111827', border: '1px solid #1f2937', padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '360px', textAlign: 'center' }}>
          <span style={{ color: '#10b981', fontSize: '11px', fontWeight: '700' }}>FINAL HUB</span>
          <h3 style={{ margin: '10px 0' }}>Data Flow Unsealed!</h3>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px' }}>Click the button below to fetch destination endpoint safely.</p>

          <button 
            onClick={() => { if (originalUrl) window.location.href = originalUrl; }}
            style={{ width: '100%', padding: '16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}
          >
            🚀 GET ORIGINAL LINK
          </button>
        </div>
      )}

      {/* 🌐 BOTTOM AD BANNER SLOT */}
      <div style={{ width: '100%', maxWidth: '360px', height: '250px', background: '#111827', border: '1px dashed #4b5563', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: '11px', marginTop: '20px' }}>
        ✨ [Adsterra Large Footer Square Slot] ✨
      </div>

    </div>
  );
            }
                  
