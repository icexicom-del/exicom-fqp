"use client";
import { useState, useEffect, useRef } from "react";
import {
  signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged,
} from "firebase/auth";
import {
  collection, doc, addDoc, setDoc, deleteDoc, getDoc,
  onSnapshot, query, orderBy, serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { SHEETS, STATUS, tKey, sheetProg, siteProg } from "../lib/fqpData";

// ─── Image compression (client-side, no Storage needed) ──────────────────────
function compressImage(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const MAX = 1100;
        let w = img.width, h = img.height;
        if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useIsMobile() {
  const [m, setM] = useState(typeof window !== "undefined" && window.innerWidth < 640);
  useEffect(() => {
    const fn = () => setM(window.innerWidth < 640);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return m;
}

// ─── Shared UI ────────────────────────────────────────────────────────────────
const Bar = ({ pct, color = "#0369a1", h = 6 }) => (
  <div style={{ background: "#e2e8f0", borderRadius: 99, overflow: "hidden", height: h }}>
    <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 99, transition: "width .4s" }} />
  </div>
);
const Badge = ({ status }) => {
  const c = STATUS[status] || STATUS.pending;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 10px",
      borderRadius: 99, background: c.bg, color: c.color,
      fontSize: 11, fontWeight: 700, letterSpacing: ".02em", whiteSpace: "nowrap" }}>
      {c.dot} {c.label}
    </span>
  );
};

// ─── Login ────────────────────────────────────────────────────────────────────
function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const signIn = async () => {
    setLoading(true); setError("");
    try { await signInWithPopup(auth, new GoogleAuthProvider()); }
    catch { setError("Sign-in failed. Please try again."); }
    finally { setLoading(false); }
  };
  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex",
      alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "40px 32px",
        maxWidth: 400, width: "100%", textAlign: "center",
        boxShadow: "0 24px 64px rgba(0,0,0,.4)" }}>
        <div style={{ width: 56, height: 56, background: "#0369a1", borderRadius: 14,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 26, margin: "0 auto 20px" }}>⚡</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>
          Exicom EV FQP Manager
        </div>
        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 32, lineHeight: 1.5 }}>
          Sign in with your Google account to access the Field Quality Plan portal
        </div>
        <button onClick={signIn} disabled={loading} style={{
          width: "100%", padding: "14px 0", border: "none", borderRadius: 12,
          fontSize: 14, fontWeight: 700, cursor: loading ? "default" : "pointer",
          background: loading ? "#e2e8f0" : "#0369a1",
          color: loading ? "#94a3b8" : "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 10, transition: "background .2s" }}>
          {loading ? "Signing in…" : (
            <>
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>
        {error && <div style={{ marginTop: 14, fontSize: 12, color: "#dc2626" }}>{error}</div>}
      </div>
    </div>
  );
}

// ─── Site Card ────────────────────────────────────────────────────────────────
function SiteCard({ site, taskData, onClick }) {
  const prog  = siteProg(site.id, taskData);
  const sPcts = SHEETS.map((_, i) => sheetProg(site.id, i, taskData));
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: "#fff", borderRadius: 16, padding: 22, border: "1px solid #e2e8f0",
        cursor: "pointer", transition: "box-shadow .2s, transform .15s",
        boxShadow: hov ? "0 10px 28px rgba(0,0,0,.13)" : "0 1px 4px rgba(0,0,0,.06)",
        transform: hov ? "translateY(-3px)" : "none" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#0369a1",
            letterSpacing: ".09em", textTransform: "uppercase", marginBottom: 3 }}>{site.id}</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>{site.name}</div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{site.location}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
          <div style={{ fontSize: 26, fontWeight: 800,
            color: prog.pct === 100 ? "#059669" : "#0f172a",
            fontFamily: "JetBrains Mono, monospace", lineHeight: 1 }}>
            {prog.pct}<span style={{ fontSize: 13, color: "#94a3b8" }}>%</span>
          </div>
          {prog.failed > 0 && <div style={{ fontSize: 10, color: "#dc2626", fontWeight: 700, marginTop: 2 }}>⚠ {prog.failed} NCR</div>}
        </div>
      </div>
      <div style={{ fontSize: 11, color: "#475569", background: "#f8fafc",
        padding: "6px 11px", borderRadius: 8, marginBottom: 14 }}>
        <strong>{site.chargerCount}×</strong> {site.chargerModel}
        <span style={{ color: "#cbd5e1", margin: "0 6px" }}>·</span>
        {site.connectorType}
      </div>
      <Bar pct={prog.pct} color={prog.pct === 100 ? "#059669" : "#0369a1"} h={5} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 4, marginTop: 10 }}>
        {sPcts.map((sp, i) => (
          <div key={i} title={`${SHEETS[i].label}: ${sp.pct}%`}>
            <div style={{ fontSize: 8, color: "#94a3b8", textAlign: "center", marginBottom: 2,
              overflow: "hidden", textOverflow: "ellipsis" }}>{SHEETS[i].abbr.slice(0,4)}</div>
            <Bar pct={sp.pct} color={SHEETS[i].color} h={3} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ sites, taskData, onSelect, onAdd }) {
  const done  = sites.filter(s => siteProg(s.id, taskData).pct === 100).length;
  const ncrs  = sites.reduce((a, s) => a + siteProg(s.id, taskData).failed, 0);
  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "24px 16px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 28 }}>
        {[
          { label: "Total Sites", val: sites.length, color: "#0369a1" },
          { label: "Completed",   val: done,          color: "#059669" },
          { label: "Open NCRs",   val: ncrs, color: ncrs ? "#dc2626" : "#94a3b8" },
        ].map(x => (
          <div key={x.label} style={{ background: "#fff", borderRadius: 12, padding: "16px 20px",
            border: "1px solid #e2e8f0", textAlign: "center" }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: x.color,
              fontFamily: "JetBrains Mono, monospace" }}>{x.val}</div>
            <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700,
              textTransform: "uppercase", letterSpacing: ".06em", marginTop: 3 }}>{x.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
        {sites.map(s => <SiteCard key={s.id} site={s} taskData={taskData} onClick={() => onSelect(s)} />)}
        <AddCard onClick={onAdd} />
      </div>
    </div>
  );
}
function AddCard({ onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: hov ? "#eff6ff" : "#f8fafc",
        border: `2px dashed ${hov ? "#0369a1" : "#cbd5e1"}`,
        borderRadius: 16, padding: 24, cursor: "pointer", minHeight: 160,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        color: hov ? "#0369a1" : "#94a3b8", transition: "all .2s" }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>＋</div>
      <div style={{ fontSize: 13, fontWeight: 700 }}>Add New Site</div>
    </div>
  );
}

// ─── Site View ────────────────────────────────────────────────────────────────
function MetaCell({ label, val, sub }) {
  return (
    <div>
      <div style={{ fontSize: 9, fontWeight: 800, color: "#94a3b8",
        textTransform: "uppercase", letterSpacing: ".09em", marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{val || "—"}</div>
      <div style={{ fontSize: 11, color: "#64748b" }}>{sub || ""}</div>
    </div>
  );
}
function SiteView({ site, taskData, onTaskClick }) {
  const [si, setSi] = useState(0);
  const mob = useIsMobile();
  const sheet = SHEETS[si];
  const prog  = sheetProg(site.id, si, taskData);

  return (
    <div>
      <div style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", padding: "12px 20px" }}>
        <div style={{ maxWidth: 980, margin: "0 auto", display: "grid",
          gridTemplateColumns: mob ? "1fr 1fr" : "repeat(4,1fr)", gap: 12 }}>
          <MetaCell label="Equipment"       val={`${site.chargerCount}× ${site.chargerModel}`} sub={site.connectorType} />
          <MetaCell label="Sanctioned Load" val={site.sanctionedLoad}  sub={site.discom} />
          <MetaCell label="Project Manager" val={site.projectManager}  sub={`Contract: ${site.contractDate || "—"}`} />
          <MetaCell label="Site Engineer"   val={site.siteEngineer}    sub={site.address} />
        </div>
      </div>

      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", overflowX: "auto" }}>
        <div style={{ display: "flex", maxWidth: 980, margin: "0 auto", padding: "0 16px" }}>
          {SHEETS.map((sh, i) => {
            const p = sheetProg(site.id, i, taskData);
            const active = i === si;
            return (
              <button key={i} onClick={() => setSi(i)} style={{
                padding: "12px 14px", background: "none", border: "none",
                borderBottom: `3px solid ${active ? sh.color : "transparent"}`,
                cursor: "pointer", display: "flex", flexDirection: "column",
                alignItems: "center", gap: 3, transition: "border-color .2s", flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 800,
                  color: active ? sh.color : "#64748b", letterSpacing: ".04em" }}>{sh.abbr}</span>
                <span style={{ fontSize: 9, color: active ? sh.color : "#94a3b8",
                  fontFamily: "JetBrains Mono, monospace" }}>{p.done}/{p.total - p.na}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ maxWidth: 980, margin: "0 auto", padding: "16px 16px 80px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>{sheet.label}</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>{sheet.tasks.length} inspection checkpoints</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: sheet.color,
              fontFamily: "JetBrains Mono, monospace" }}>{prog.pct}%</div>
            <div style={{ width: 72 }}><Bar pct={prog.pct} color={sheet.color} h={5} /></div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {sheet.tasks.map(task => {
            const d = taskData[tKey(site.id, si, task.id)] || {};
            const status     = d.status || "pending";
            const photoCount = d.photoIds?.length || 0;
            const videoCount = d.videos?.length   || 0;
            return (
              <div key={task.id} onClick={() => onTaskClick(task, si)}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 2px 14px rgba(0,0,0,.09)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
                style={{ background: "#fff", borderRadius: 12,
                  padding: mob ? "12px 14px" : "12px 20px",
                  border: `1px solid ${status === "failed" ? "#fecaca" : status === "completed" || status === "verified" ? "#bbf7d0" : "#f1f5f9"}`,
                  cursor: "pointer", display: "flex", alignItems: "center",
                  gap: 12, transition: "box-shadow .15s" }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                  background: `${sheet.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: sheet.color,
                    fontFamily: "JetBrains Mono, monospace" }}>{task.id.split("-")[1]}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.activity}</div>
                  {!mob && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{task.method}</div>}
                  {(d.inspector || d.date) && (
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                      {[d.inspector, d.date].filter(Boolean).join(" · ")}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  {(photoCount + videoCount) > 0 && (
                    <span style={{ fontSize: 10, color: "#64748b", background: "#f1f5f9",
                      padding: "2px 7px", borderRadius: 99 }}>📎 {photoCount + videoCount}</span>
                  )}
                  <Badge status={status} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Task Modal ───────────────────────────────────────────────────────────────
// Photos are compressed client-side and stored in Firestore `photos` collection.
// Each photo doc: { taskKey, base64, name, size, createdAt }
// Task doc stores photoIds: [] referencing those docs.
// This means Firebase Storage is NOT needed — runs on free Spark plan.

function TaskModal({ task, si, siteId, taskData, user, onSave, onClose }) {
  const key = tKey(siteId, si, task.id);
  const ex  = taskData[key] || {};

  const [status, setStatus]       = useState(ex.status || "pending");
  const [date, setDate]           = useState(ex.date || "");
  const [inspector, setInspector] = useState(ex.inspector || "");
  const [measure, setMeasure]     = useState(ex.measurement || "");
  const [remarks, setRemarks]     = useState(ex.remarks || "");
  const [ncr, setNcr]             = useState(ex.ncr || "");
  // photos: { id?, file?, url (base64 preview or stored), name, size }
  const [photos, setPhotos]       = useState([]);
  const [photosLoading, setPL]    = useState(true);
  const [videos, setVideos]       = useState(ex.videos || []);
  const [saving, setSaving]       = useState(false);
  const [uploadMsg, setMsg]       = useState("");

  const photoRef = useRef();
  const videoRef = useRef();
  const mob   = useIsMobile();
  const sheet = SHEETS[si];

  // Load existing photos from Firestore on open
  useEffect(() => {
    const ids = ex.photoIds || [];
    if (!ids.length) { setPL(false); return; }
    Promise.all(ids.map(id => getDoc(doc(db, "photos", id))))
      .then(docs => {
        setPhotos(docs.filter(d => d.exists()).map(d => ({
          id: d.id, url: d.data().base64, name: d.data().name, size: d.data().size,
        })));
        setPL(false);
      })
      .catch(() => setPL(false));
  }, []);

  const onPhoto = e => {
    Array.from(e.target.files || []).forEach(f => {
      const r = new FileReader();
      r.onload = ev => setPhotos(p => [...p, { file: f, url: ev.target.result, name: f.name, size: f.size }]);
      r.readAsDataURL(f);
    });
    e.target.value = "";
  };
  const onVideo = e => {
    setVideos(v => [...v, ...Array.from(e.target.files || []).map(f => ({ name: f.name, size: f.size }))]);
    e.target.value = "";
  };

  const save = async () => {
    setSaving(true);
    try {
      // Delete all old photo docs, then re-save current set
      setMsg("Saving photos…");
      const oldIds = ex.photoIds || [];
      await Promise.all(oldIds.map(id => deleteDoc(doc(db, "photos", id)).catch(() => {})));

      const newIds = [];
      for (let i = 0; i < photos.length; i++) {
        const p = photos[i];
        setMsg(`Saving photo ${i + 1} / ${photos.length}…`);
        const base64 = p.file ? await compressImage(p.file) : p.url;
        const ref = await addDoc(collection(db, "photos"), {
          taskKey: key, base64, name: p.name, size: p.size, createdAt: serverTimestamp(),
        });
        newIds.push(ref.id);
      }

      setMsg("Saving task…");
      await setDoc(doc(db, "tasks", key), {
        status, date, inspector, measurement: measure, remarks,
        ncr: status === "failed" ? ncr : "",
        photoIds: newIds,
        videos: videos.map(v => ({ name: v.name, size: v.size })),
        updatedAt: serverTimestamp(),
        updatedBy: user?.email || "unknown",
      }, { merge: true });

      onSave();
    } catch (err) {
      console.error(err);
      setMsg("Error saving — please try again.");
      setSaving(false);
    }
  };

  const Lbl = ({ t }) => (
    <div style={{ fontSize: 10, fontWeight: 800, color: "#475569", marginBottom: 6,
      textTransform: "uppercase", letterSpacing: ".07em" }}>{t}</div>
  );
  const INP = { border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px",
    fontSize: 13, fontFamily: "inherit", outline: "none", background: "#f8fafc",
    width: "100%", boxSizing: "border-box", color: "#0f172a" };

  return (
    <div onClick={e => { if (e.target === e.currentTarget && !saving) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex",
        alignItems: mob ? "flex-end" : "center", justifyContent: "center",
        zIndex: 1000, padding: mob ? 0 : 16 }}>
      <div style={{ background: "#fff", width: "100%", maxWidth: 540,
        borderRadius: mob ? "20px 20px 0 0" : 20, maxHeight: mob ? "93vh" : "90vh",
        overflow: "hidden", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: sheet.color,
                textTransform: "uppercase", letterSpacing: ".09em", marginBottom: 3 }}>
                {sheet.label} · {task.id}
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", lineHeight: 1.3 }}>{task.activity}</div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>Method: {task.method}</div>
            </div>
            {!saving && (
              <button onClick={onClose} style={{ background: "none", border: "none",
                cursor: "pointer", fontSize: 18, color: "#94a3b8", padding: 4, flexShrink: 0 }}>✕</button>
            )}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 22px", overflowY: "auto", flex: 1,
          display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Status */}
          <div>
            <Lbl t="Status" />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {Object.entries(STATUS).map(([s, c]) => (
                <button key={s} onClick={() => setStatus(s)} style={{
                  padding: "5px 12px", borderRadius: 99, fontSize: 11, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit",
                  border: `2px solid ${status === s ? c.color : "#e2e8f0"}`,
                  background: status === s ? c.bg : "#fff",
                  color: status === s ? c.color : "#94a3b8",
                  transition: "all .15s" }}>{c.dot} {c.label}</button>
              ))}
            </div>
          </div>

          {/* NCR */}
          {status === "failed" && (
            <div style={{ background: "#fff7f7", border: "1px solid #fecaca", borderRadius: 10, padding: 14 }}>
              <Lbl t="NCR Description" />
              <textarea value={ncr} onChange={e => setNcr(e.target.value)} rows={3}
                placeholder="Describe the non-conformance in detail…"
                style={{ ...INP, background: "transparent", border: "none", resize: "none" }} />
            </div>
          )}

          {/* Date + Inspector */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div><Lbl t="Date" /><input type="date" value={date} onChange={e => setDate(e.target.value)} style={INP} /></div>
            <div><Lbl t="Inspector" /><input value={inspector} onChange={e => setInspector(e.target.value)} placeholder="Name / Emp ID" style={INP} /></div>
          </div>

          {/* Measurement */}
          <div>
            <Lbl t="Measurement / Reading" />
            <input value={measure} onChange={e => setMeasure(e.target.value)}
              placeholder={task.acceptance} style={INP} />
          </div>

          {/* Remarks */}
          <div>
            <Lbl t="Remarks" />
            <textarea value={remarks} onChange={e => setRemarks(e.target.value)} rows={2}
              placeholder="Field observations…" style={{ ...INP, resize: "none" }} />
          </div>

          {/* Acceptance criteria */}
          <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd",
            borderRadius: 10, padding: "10px 14px" }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: "#0369a1",
              textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 3 }}>Acceptance Criteria</div>
            <div style={{ fontSize: 12, color: "#075985", lineHeight: 1.5 }}>{task.acceptance}</div>
          </div>

          {/* Photos */}
          <div>
            <Lbl t={`Photos (${photos.length})`} />
            {photosLoading ? (
              <div style={{ fontSize: 12, color: "#94a3b8" }}>Loading photos…</div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {photos.map((p, i) => (
                  <div key={i} style={{ position: "relative", width: 70, height: 70,
                    borderRadius: 8, overflow: "hidden", background: "#f1f5f9", flexShrink: 0 }}>
                    <img src={p.url} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    {p.file && (
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0,
                        background: "rgba(3,105,161,.8)", fontSize: 8, color: "#fff",
                        textAlign: "center", padding: "2px 0" }}>NEW</div>
                    )}
                    {!saving && (
                      <button onClick={e => { e.stopPropagation(); setPhotos(ph => ph.filter((_, j) => j !== i)); }}
                        style={{ position: "absolute", top: 2, right: 2, background: "rgba(0,0,0,.65)",
                          color: "#fff", border: "none", borderRadius: "50%", width: 17, height: 17,
                          cursor: "pointer", fontSize: 9, display: "flex", alignItems: "center",
                          justifyContent: "center", padding: 0 }}>✕</button>
                    )}
                  </div>
                ))}
                {!saving && (
                  <button onClick={() => photoRef.current?.click()} style={{
                    width: 70, height: 70, borderRadius: 8, background: "#f8fafc",
                    border: "2px dashed #cbd5e1", cursor: "pointer", display: "flex",
                    flexDirection: "column", alignItems: "center", justifyContent: "center",
                    color: "#94a3b8", gap: 3, fontFamily: "inherit" }}>
                    <span style={{ fontSize: 20 }}>📷</span>
                    <span style={{ fontSize: 9, fontWeight: 700 }}>Add</span>
                  </button>
                )}
              </div>
            )}
            <input ref={photoRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={onPhoto} />
          </div>

          {/* Videos — metadata only (no cloud upload on free plan) */}
          <div>
            <Lbl t={`Videos (${videos.length}) — name & size tracked`} />
            {videos.map((v, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8,
                padding: "6px 10px", background: "#f8fafc", borderRadius: 8, marginBottom: 5 }}>
                <span>🎥</span>
                <span style={{ flex: 1, fontSize: 12, color: "#334155",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.name}</span>
                <span style={{ fontSize: 10, color: "#94a3b8", flexShrink: 0 }}>
                  {(v.size / 1048576).toFixed(1)} MB
                </span>
                {!saving && (
                  <button onClick={() => setVideos(vv => vv.filter((_, j) => j !== i))}
                    style={{ background: "none", border: "none", cursor: "pointer",
                      color: "#94a3b8", fontSize: 14, padding: 0 }}>✕</button>
                )}
              </div>
            ))}
            {!saving && (
              <button onClick={() => videoRef.current?.click()} style={{
                padding: "7px 14px", background: "#f8fafc", border: "1px solid #e2e8f0",
                borderRadius: 8, cursor: "pointer", fontSize: 12, color: "#475569", fontFamily: "inherit" }}>
                + Log Video File
              </button>
            )}
            <input ref={videoRef} type="file" accept="video/*" multiple style={{ display: "none" }} onChange={onVideo} />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 22px", borderTop: "1px solid #f1f5f9" }}>
          {uploadMsg && (
            <div style={{ fontSize: 12, color: "#0369a1", textAlign: "center",
              marginBottom: 10, fontWeight: 600 }}>{uploadMsg}</div>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} disabled={saving}
              style={{ flex: 1, padding: "11px 0", background: "#f1f5f9", border: "none",
                borderRadius: 10, fontSize: 13, fontWeight: 700,
                cursor: saving ? "default" : "pointer", color: "#475569", fontFamily: "inherit" }}>Cancel</button>
            <button onClick={save} disabled={saving}
              style={{ flex: 2, padding: "11px 0", border: "none", borderRadius: 10,
                fontSize: 13, fontWeight: 700, cursor: saving ? "default" : "pointer",
                background: saving ? "#e2e8f0" : "#0369a1",
                color: saving ? "#94a3b8" : "#fff", fontFamily: "inherit", transition: "all .2s" }}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Add Site Modal ───────────────────────────────────────────────────────────
function AddSiteModal({ user, onClose }) {
  const [form, setForm] = useState({
    name: "", location: "", address: "",
    chargerModel: "Exicom HPC-25 AC 22kW", chargerCount: "2",
    connectorType: "Type 2 (IEC 62196)",
    discom: "", sanctionedLoad: "", projectManager: "", siteEngineer: "", contractDate: "",
  });
  const [saving, setSaving] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const mob    = useIsMobile();
  const canAdd = form.name.trim().length > 0;
  const INP = { border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px",
    fontSize: 13, fontFamily: "inherit", outline: "none", background: "#f8fafc",
    width: "100%", boxSizing: "border-box", color: "#0f172a" };
  const Lbl = ({ t }) => (
    <div style={{ fontSize: 10, fontWeight: 800, color: "#475569", marginBottom: 5,
      textTransform: "uppercase", letterSpacing: ".07em" }}>{t}</div>
  );

  const handleAdd = async () => {
    if (!canAdd || saving) return;
    setSaving(true);
    try {
      const siteId = "SITE" + Date.now().toString().slice(-5);
      await setDoc(doc(db, "sites", siteId), {
        ...form, id: siteId,
        chargerCount: parseInt(form.chargerCount) || 1,
        createdAt: serverTimestamp(),
        createdBy: user?.email || "unknown",
      });
      onClose();
    } catch (err) { console.error(err); setSaving(false); }
  };

  return (
    <div onClick={e => { if (e.target === e.currentTarget && !saving) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex",
        alignItems: mob ? "flex-end" : "center", justifyContent: "center",
        zIndex: 1000, padding: mob ? 0 : 16 }}>
      <div style={{ background: "#fff", width: "100%", maxWidth: 500,
        borderRadius: mob ? "20px 20px 0 0" : 20, maxHeight: mob ? "93vh" : "90vh",
        overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>Add New Site</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>
            Creates FQP with all {SHEETS.reduce((a, s) => a + s.tasks.length, 0)} checkpoints
          </div>
        </div>
        <div style={{ padding: "20px 22px", overflowY: "auto", flex: 1,
          display: "flex", flexDirection: "column", gap: 14 }}>
          <div><Lbl t="Site Name *" /><input style={INP} value={form.name} onChange={set("name")} placeholder="e.g. Phoenix Palassio Lucknow" /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><Lbl t="City / State" /><input style={INP} value={form.location} onChange={set("location")} placeholder="e.g. Lucknow, UP" /></div>
            <div><Lbl t="Contract Date" /><input type="date" style={INP} value={form.contractDate} onChange={set("contractDate")} /></div>
          </div>
          <div><Lbl t="Full Address" /><input style={INP} value={form.address} onChange={set("address")} placeholder="Street, Pin code" /></div>
          <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: 12 }}>
            <div>
              <Lbl t="Charger Model" />
              <select style={INP} value={form.chargerModel} onChange={set("chargerModel")}>
                {["Exicom HPC-25 AC 22kW","Exicom HPC-50 AC 22kW","Exicom TRI-62 DC 62kW",
                  "Exicom HPC-60 DC 60kW","Exicom HPC-100 DC 100kW","Exicom TRI-120 DC 120kW"]
                  .map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div><Lbl t="Count" /><input type="number" style={INP} value={form.chargerCount} onChange={set("chargerCount")} min="1" max="20" /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><Lbl t="DISCOM" /><input style={INP} value={form.discom} onChange={set("discom")} placeholder="e.g. LESA" /></div>
            <div><Lbl t="Sanctioned Load" /><input style={INP} value={form.sanctionedLoad} onChange={set("sanctionedLoad")} placeholder="e.g. 200 kW" /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><Lbl t="Project Manager" /><input style={INP} value={form.projectManager} onChange={set("projectManager")} placeholder="Full name" /></div>
            <div><Lbl t="Site Engineer" /><input style={INP} value={form.siteEngineer} onChange={set("siteEngineer")} placeholder="Full name" /></div>
          </div>
        </div>
        <div style={{ padding: "14px 22px", borderTop: "1px solid #f1f5f9", display: "flex", gap: 10 }}>
          <button onClick={onClose} disabled={saving}
            style={{ flex: 1, padding: "11px 0", background: "#f1f5f9", border: "none",
              borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer",
              color: "#475569", fontFamily: "inherit" }}>Cancel</button>
          <button onClick={handleAdd} disabled={!canAdd || saving}
            style={{ flex: 2, padding: "11px 0", border: "none", borderRadius: 10,
              fontSize: 13, fontWeight: 700, cursor: canAdd && !saving ? "pointer" : "default",
              background: canAdd && !saving ? "#0369a1" : "#e2e8f0",
              color: canAdd && !saving ? "#fff" : "#94a3b8",
              fontFamily: "inherit", transition: "all .2s" }}>
            {saving ? "Creating…" : "Create Site & FQP"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────
export default function FQPApp() {
  const [authUser, setAuthUser] = useState(undefined);
  const [sites, setSites]       = useState([]);
  const [taskData, setTaskData] = useState({});
  const [view, setView]         = useState("dash");
  const [site, setSite]         = useState(null);
  const [taskModal, setTM]      = useState(null);
  const [addSite, setAddSite]   = useState(false);

  useEffect(() => onAuthStateChanged(auth, setAuthUser), []);

  useEffect(() => {
    if (!authUser) return;
    const unsubSites = onSnapshot(
      query(collection(db, "sites"), orderBy("createdAt", "asc")),
      snap => setSites(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      err => console.error("sites:", err)
    );
    const unsubTasks = onSnapshot(
      collection(db, "tasks"),
      snap => {
        const data = {};
        snap.docs.forEach(d => { data[d.id] = d.data(); });
        setTaskData(data);
      },
      err => console.error("tasks:", err)
    );
    return () => { unsubSites(); unsubTasks(); };
  }, [authUser]);

  if (authUser === undefined) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "#0f172a" }}>
        <div style={{ color: "#475569", fontSize: 13 }}>Loading…</div>
      </div>
    );
  }
  if (!authUser) return <LoginPage />;

  return (
    <div style={{ fontFamily: "Manrope, system-ui, sans-serif", background: "#f0f4f8", minHeight: "100vh" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "#0f172a", height: 54,
        display: "flex", alignItems: "center", padding: "0 18px", gap: 12,
        boxShadow: "0 1px 0 rgba(255,255,255,.07)" }}>
        {view === "site" && (
          <button onClick={() => setView("dash")}
            style={{ background: "rgba(255,255,255,.09)", border: "none", color: "#cbd5e1",
              padding: "5px 12px", borderRadius: 7, cursor: "pointer",
              fontSize: 12, fontWeight: 700, fontFamily: "inherit", flexShrink: 0 }}>← Back</button>
        )}
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <div style={{ width: 30, height: 30, background: "#0369a1", borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, flexShrink: 0 }}>⚡</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc", lineHeight: 1.2 }}>
              {view === "site" && site ? site.name : "Exicom EV FQP"}
            </div>
            <div style={{ fontSize: 10, color: "#475569", lineHeight: 1 }}>
              {view === "site" && site ? `${site.location} · ${site.id}` : "Field Quality Plan Manager"}
            </div>
          </div>
        </div>
        {view === "dash" && (
          <button onClick={() => setAddSite(true)}
            style={{ background: "#0369a1", border: "none", color: "#fff",
              padding: "7px 14px", borderRadius: 8, cursor: "pointer",
              fontSize: 12, fontWeight: 800, fontFamily: "inherit", flexShrink: 0 }}>+ New Site</button>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {authUser.photoURL && (
            <img src={authUser.photoURL} alt="" width={28} height={28}
              style={{ borderRadius: "50%", border: "2px solid rgba(255,255,255,.15)" }} />
          )}
          <button onClick={() => signOut(auth)}
            style={{ background: "rgba(255,255,255,.07)", border: "none", color: "#64748b",
              padding: "5px 10px", borderRadius: 7, cursor: "pointer", fontSize: 11, fontFamily: "inherit" }}>
            Sign out
          </button>
        </div>
      </header>

      {view === "dash" && (
        <Dashboard sites={sites} taskData={taskData}
          onSelect={s => { setSite(s); setView("site"); }}
          onAdd={() => setAddSite(true)} />
      )}
      {view === "site" && site && (
        <SiteView site={site} taskData={taskData}
          onTaskClick={(task, si) => setTM({ task, si })} />
      )}
      {taskModal && (
        <TaskModal task={taskModal.task} si={taskModal.si} siteId={site?.id}
          taskData={taskData} user={authUser}
          onSave={() => setTM(null)} onClose={() => setTM(null)} />
      )}
      {addSite && (
        <AddSiteModal user={authUser} onClose={() => setAddSite(false)} />
      )}
    </div>
  );
}
