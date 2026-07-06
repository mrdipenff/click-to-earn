'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { db } from '../../../firebase';
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';

export default function VisitPage({ params }) {
  const searchParams = useSearchParams();
  const [dest, setDest] = useState('');
  const [stage, setStage] = useState(1);
  const [timer, setTimer] = useState(10);
  const [clicksLogged, setClicksLogged] = useState(false);

  useEffect(() => {
    const destParam = searchParams.get('dest');
    if (destParam) {
      try {
        setDest(atob(destParam));
      } catch (e) { console.error("Invalid base64 string"); }
    }

    // Firestore database mein click count badhane ka logic
    if (params.alias && !clicksLogged) {
      const logClick = async () => {
        const q = query(collection(db, "links"), where("alias", "==", params.alias));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const linkDoc = querySnapshot.docs[0];
          await updateDoc(doc(db, "links", linkDoc.id), {
            clicks: (linkDoc.data().clicks || 0) + 1
          });
          setClicksLogged(true);
        }
      };
      logClick();
    }
  }, [searchParams, params.alias]);

  // Timer Countdown Matrix
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(timer - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer, stage]);

  const handleNextStage = (next) => {
    setStage(next);
    setTimer(next === 4 ? 0 : 8); // Final stage par timer nahi chalega
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ backgroundColor: '#090d16', color: '#fff', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* 🌐 TOP AD BANNER SLOT */}
      <div style={{ width: '100%', maxWidth: '360px', height: '100px', background: '#111827', border: '1px dashed #4b5563', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: '11px', marginBottom: '20px' }}>
        ✨ [Adsterra Banner Script - PLACE HERE] ✨
      </div>

      {/* ================= STAGE 1 ================= */}
      {stage === 1 && (
        <div style={{ background: '#111827', border: '1px solid #1f2937', padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '360px', textAlign: 'center' }}>
          <span style={{ color: '#38bdf8', fontSize: '11px', fontWeight: '700' }}>STEP 1 OF 4</span>
          <h3 style={{ margin: '10px 0' }}>Checking Link Safety...</h3>
          
          {timer > 0 ? (
            <div style={{ padding: '12px', background: '#1f2937', borderRadius: '30px', color: '#38bdf8', fontWeight: '700', display: 'inline-block' }}>
              ⌛ Please Wait: {timer}s
            </div>
          ) : (
            <div>
              <div style={{ height: '180px', background: '#090d16', margin: '15px 0', border: '1px dashed #374151', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563', fontSize: '12px' }}>
                [Adsterra Native Ad Block]
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>Scroll down and click NEXT to continue</p>
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
          <h3 style={{ margin: '10px 0' }}>Human Verification</h3>
          
          <div style={{ background: '#030712', padding: '14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <input type="checkbox" checked={timer === 0} readOnly style={{ width: '18px', height: '18px' }} />
            <span>{timer > 0 ? `Verifying Browser (${timer}s)...` : "I am not a robot"}</span>
          </div>

          {timer === 0 && (
            <div>
              <div style={{ height: '180px', background: '#090d16', margin: '15px 0', border: '1px dashed #374151', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563', fontSize: '12px' }}>
                [Adsterra Rectangular Banner]
              </div>
              <button onClick={() => handleNextStage(3)} style={{ width: '100%', padding: '14px', background: '#a855f7', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                CONTINUE 🔓
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================= STAGE 3 ================= */}
      {stage === 3 && (
        <div style={{ background: '#111827', border: '1px solid #1f2937', padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '360px', textAlign: 'center' }}>
          <span style={{ color: '#f59e0b', fontSize: '11px', fontWeight: '700' }}>STEP 3 OF 4</span>
          <h3 style={{ margin: '10px 0' }}>Generating Secure Route</h3>

          {timer > 0 ? (
            <div style={{ color: '#f59e0b', fontSize: '14px' }}>
              Syncing Cloud Servers: {timer}s
            </div>
          ) : (
            <div>
              <div style={{ height: '180px', background: '#090d16', margin: '15px 0', border: '1px dashed #374151', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563', fontSize: '12px' }}>
                [Adsterra High CPM Ad]
              </div>
              <button onClick={() => handleNextStage(4)} style={{ width: '100%', padding: '14px', background: '#f59e0b', color: '#000', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                VERIFY CAP 🛡️
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================= STAGE 4 ================= */}
      {stage === 4 && (
        <div style={{ background: '#111827', border: '1px solid #1f2937', padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '360px', textAlign: 'center' }}>
          <span style={{ color: '#10b981', fontSize: '11px', fontWeight: '700' }}>FINAL STAGE</span>
          <h3 style={{ margin: '10px 0' }}>Link Unlocked Successfully!</h3>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px' }}>Click the button below to visit your destination link.</p>

          <button 
            onClick={() => { if (dest) window.location.href = dest; }}
            style={{ width: '100%', padding: '16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}
          >
            🚀 GET ORIGINAL LINK
          </button>
        </div>
      )}

      {/* 🌐 BOTTOM AD BANNER SLOT */}
      <div style={{ width: '100%', maxWidth: '360px', height: '250px', background: '#111827', border: '1px dashed #4b5563', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: '11px', marginTop: '20px' }}>
        ✨ [Adsterra Large Square Ad - PLACE HERE] ✨
      </div>

    </div>
  );
                }
