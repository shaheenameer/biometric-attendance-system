import { useState, useMemo, createContext, useContext } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_STUDENTS = [
  { id: "1", name: "Alice Johnson",   studentId: "STU001", class: "10-A", email: "alice@school.edu",    biometricRegistered: true,  enrolledDate: "2023-09-01" },
  { id: "2", name: "Bob Martinez",    studentId: "STU002", class: "10-A", email: "bob@school.edu",      biometricRegistered: true,  enrolledDate: "2023-09-01" },
  { id: "3", name: "Carol Williams",  studentId: "STU003", class: "10-B", email: "carol@school.edu",    biometricRegistered: false, enrolledDate: "2023-09-01" },
  { id: "4", name: "David Brown",     studentId: "STU004", class: "10-B", email: "david@school.edu",    biometricRegistered: true,  enrolledDate: "2023-09-01" },
  { id: "5", name: "Eva Garcia",      studentId: "STU005", class: "11-A", email: "eva@school.edu",      biometricRegistered: true,  enrolledDate: "2022-09-01" },
  { id: "6", name: "Frank Lee",       studentId: "STU006", class: "11-A", email: "frank@school.edu",    biometricRegistered: true,  enrolledDate: "2022-09-01" },
  { id: "7", name: "Grace Kim",       studentId: "STU007", class: "11-B", email: "grace@school.edu",    biometricRegistered: false, enrolledDate: "2022-09-01" },
  { id: "8", name: "Henry Patel",     studentId: "STU008", class: "12-A", email: "henry@school.edu",    biometricRegistered: true,  enrolledDate: "2021-09-01" },
  { id: "9", name: "Isabella Chen",   studentId: "STU009", class: "12-A", email: "isabella@school.edu", biometricRegistered: true,  enrolledDate: "2021-09-01" },
  { id:"10", name: "James Wilson",    studentId: "STU010", class: "12-B", email: "james@school.edu",    biometricRegistered: true,  enrolledDate: "2021-09-01" },
];

const genAttendance = (students) => {
  const records = [];
  const statuses = ["present","present","present","present","absent","late"];
  const today = new Date();
  for (let d = 29; d >= 0; d--) {
    const date = new Date(today);
    date.setDate(date.getDate() - d);
    if ([0,6].includes(date.getDay())) continue;
    const ds = date.toISOString().split("T")[0];
    students.forEach(s => {
      if (!s.biometricRegistered) return;
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      records.push({ id:`${s.id}-${ds}`, studentId:s.id, date:ds, status, time: status==="present"?"08:05":status==="late"?"08:48":null, method:"biometric" });
    });
  }
  return records;
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  card: { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"16px", padding:"24px" },
  input: { padding:"10px 14px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"8px", color:"#f1f5f9", fontSize:"14px", outline:"none", width:"100%", boxSizing:"border-box", fontFamily:"inherit" },
  badge: (status) => ({
    padding:"3px 10px", borderRadius:"20px", fontSize:"12px", fontWeight:600,
    background: status==="present"?"rgba(16,185,129,0.15)":status==="late"?"rgba(245,158,11,0.15)":"rgba(239,68,68,0.15)",
    color: status==="present"?"#34d399":status==="late"?"#fbbf24":"#f87171",
  }),
  th: { padding:"12px 16px", textAlign:"left", fontSize:"11px", color:"#475569", textTransform:"uppercase", letterSpacing:"0.5px", fontWeight:600 },
  td: { padding:"12px 16px", borderBottom:"1px solid rgba(255,255,255,0.03)" },
};

const Avatar = ({ name, size=32 }) => (
  <div style={{ width:size, height:size, borderRadius:"50%", background:"linear-gradient(135deg,#3b82f6,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.4, fontWeight:700, color:"white", flexShrink:0 }}>
    {name.charAt(0)}
  </div>
);

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [u, setU] = useState(""); const [p, setP] = useState(""); const [err, setErr] = useState(""); const [loading, setLoading] = useState(false);
  const submit = (e) => { e.preventDefault(); setLoading(true); setTimeout(() => {
    if ((u==="admin"&&p==="admin123")) onLogin({name:"Dr. Sarah Thompson",role:"Administrator",username:"admin"});
    else if ((u==="teacher"&&p==="teacher123")) onLogin({name:"Mr. John Davis",role:"Teacher",username:"teacher"});
    else { setErr("Invalid credentials. Try admin/admin123"); setLoading(false); }
  }, 700); };
  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#0f1117 0%,#1a1f2e 50%,#0f1117 100%)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"system-ui,sans-serif" }}>
      <div style={{ ...S.card, width:"100%", maxWidth:"400px", padding:"48px" }}>
        <div style={{ textAlign:"center", marginBottom:"40px" }}>
          <div style={{ width:64, height:64, background:"linear-gradient(135deg,#3b82f6,#8b5cf6)", borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", fontSize:28 }}>
            <FpIcon size={32} color="white" />
          </div>
          <h1 style={{ margin:0, fontSize:26, fontWeight:700, color:"#f1f5f9" }}>BioAttend</h1>
          <p style={{ margin:"8px 0 0", color:"#64748b", fontSize:14 }}>School Attendance System</p>
        </div>
        <form onSubmit={submit}>
          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", marginBottom:6, fontSize:12, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.5px", fontWeight:500 }}>Username</label>
            <input style={S.input} value={u} onChange={e=>setU(e.target.value)} placeholder="Enter username" required />
          </div>
          <div style={{ marginBottom:24 }}>
            <label style={{ display:"block", marginBottom:6, fontSize:12, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.5px", fontWeight:500 }}>Password</label>
            <input style={S.input} type="password" value={p} onChange={e=>setP(e.target.value)} placeholder="Enter password" required />
          </div>
          {err && <div style={{ padding:"10px 14px", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:8, color:"#fca5a5", fontSize:13, marginBottom:16 }}>{err}</div>}
          <button type="submit" disabled={loading} style={{ width:"100%", padding:13, background:loading?"rgba(59,130,246,0.5)":"linear-gradient(135deg,#3b82f6,#8b5cf6)", border:"none", borderRadius:10, color:"white", fontSize:15, fontWeight:600, cursor:loading?"not-allowed":"pointer" }}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <div style={{ marginTop:20, padding:14, background:"rgba(59,130,246,0.05)", border:"1px solid rgba(59,130,246,0.15)", borderRadius:10, fontSize:13, color:"#64748b" }}>
          <strong style={{ color:"#94a3b8" }}>Demo:</strong> admin / admin123 &nbsp;|&nbsp; teacher / teacher123
        </div>
      </div>
    </div>
  );
}

// ─── ICONS ────────────────────────────────────────────────────────────────────
const FpIcon = ({size=20,color="currentColor"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
    <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/>
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"/>
    <path d="M12 6v2m0 8v2M6 12H4m16 0h-2"/>
  </svg>
);

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
const NAV = [
  { id:"dashboard", label:"Dashboard", icon:"⊞" },
  { id:"attendance", label:"Take Attendance", icon:"◉" },
  { id:"students", label:"Students", icon:"◎" },
  { id:"reports", label:"Reports", icon:"▤" },
  { id:"settings", label:"Settings", icon:"⚙" },
];

function Sidebar({ page, onNav, open, onToggle, user }) {
  return (
    <aside style={{ width:open?240:64, background:"rgba(255,255,255,0.02)", borderRight:"1px solid rgba(255,255,255,0.06)", display:"flex", flexDirection:"column", transition:"width 0.25s", overflow:"hidden", flexShrink:0 }}>
      <div style={{ padding:"18px 14px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", gap:10, minHeight:68 }}>
        <div style={{ width:36, height:36, background:"linear-gradient(135deg,#3b82f6,#8b5cf6)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color:"white" }}>
          <FpIcon size={18} color="white" />
        </div>
        {open && <div><div style={{ fontSize:14, fontWeight:700, color:"#f1f5f9" }}>BioAttend</div><div style={{ fontSize:11, color:"#475569" }}>School System</div></div>}
        <button onClick={onToggle} style={{ marginLeft:"auto", background:"none", border:"none", color:"#475569", cursor:"pointer", fontSize:14, padding:4, flexShrink:0 }}>{open?"◄":"►"}</button>
      </div>
      <nav style={{ flex:1, padding:"10px 8px" }}>
        {NAV.map(n => (
          <button key={n.id} onClick={()=>onNav(n.id)} style={{
            width:"100%", display:"flex", alignItems:"center", gap:10, padding:"9px 12px", marginBottom:3,
            background:page===n.id?"linear-gradient(135deg,rgba(59,130,246,0.2),rgba(139,92,246,0.2))":"none",
            border:page===n.id?"1px solid rgba(59,130,246,0.3)":"1px solid transparent",
            borderRadius:10, color:page===n.id?"#93c5fd":"#64748b", cursor:"pointer", fontSize:13, fontWeight:page===n.id?600:400, textAlign:"left", whiteSpace:"nowrap",
          }}>
            <span style={{ fontSize:17, flexShrink:0, width:20, textAlign:"center" }}>{n.icon}</span>
            {open && <span>{n.label}</span>}
          </button>
        ))}
      </nav>
      {user && (
        <div style={{ padding:14, borderTop:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", gap:10 }}>
          <Avatar name={user.name} size={30} />
          {open && <div style={{ overflow:"hidden" }}><div style={{ fontSize:12, fontWeight:600, color:"#e2e8f0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user.name}</div><div style={{ fontSize:11, color:"#475569" }}>{user.role}</div></div>}
        </div>
      )}
    </aside>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ students, records }) {
  const today = new Date().toISOString().split("T")[0];
  const todayR = records.filter(r=>r.date===today);
  const present = todayR.filter(r=>r.status==="present").length;
  const absent = todayR.filter(r=>r.status==="absent").length;
  const late = todayR.filter(r=>r.status==="late").length;
  const rate = students.length>0 ? Math.round(present/students.length*100) : 0;

  const weekly = ["Mon","Tue","Wed","Thu","Fri"].map((day,i) => {
    const d = new Date(); const dow = d.getDay(); d.setDate(d.getDate()-(dow-(i+1)));
    const ds = d.toISOString().split("T")[0];
    const dr = records.filter(r=>r.date===ds);
    return { day, present:dr.filter(r=>r.status==="present").length, absent:dr.filter(r=>r.status==="absent").length, late:dr.filter(r=>r.status==="late").length };
  });

  const recent = records.slice(-6).reverse().map(r => ({ ...r, sname: students.find(s=>s.id===r.studentId)?.name||"Unknown" }));
  const bioReg = students.filter(s=>s.biometricRegistered).length;

  return (
    <div>
      <h1 style={{ margin:"0 0 4px", fontSize:26, fontWeight:700, color:"#f1f5f9", letterSpacing:"-0.5px" }}>Dashboard</h1>
      <p style={{ margin:"0 0 28px", color:"#64748b", fontSize:14 }}>{new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:28 }}>
        {[{t:"Total Students",v:students.length,s:"Enrolled",c:"#3b82f6"},{t:"Present Today",v:present,s:`${rate}% rate`,c:"#10b981"},{t:"Absent Today",v:absent,s:"Not checked in",c:"#ef4444"},{t:"Late Today",v:late,s:"After 8:30 AM",c:"#f59e0b"}].map(x=>(
          <div key={x.t} style={{ ...S.card, borderLeft:`3px solid ${x.c}` }}>
            <div style={{ fontSize:11, color:"#64748b", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.5px" }}>{x.t}</div>
            <div style={{ fontSize:34, fontWeight:700, color:"#f1f5f9", letterSpacing:"-1px" }}>{x.v}</div>
            <div style={{ fontSize:12, color:"#64748b", marginTop:3 }}>{x.s}</div>
          </div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:16, marginBottom:28 }}>
        <div style={S.card}>
          <h3 style={{ margin:"0 0 16px", fontSize:15, color:"#e2e8f0", fontWeight:600 }}>Weekly Attendance</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weekly}>
              <XAxis dataKey="day" stroke="#475569" fontSize={12}/><YAxis stroke="#475569" fontSize={12}/>
              <Tooltip contentStyle={{ background:"#1e293b", border:"1px solid #334155", borderRadius:8, color:"#e2e8f0" }}/>
              <Bar dataKey="present" fill="#3b82f6" radius={[4,4,0,0]} name="Present"/>
              <Bar dataKey="late" fill="#f59e0b" radius={[4,4,0,0]} name="Late"/>
              <Bar dataKey="absent" fill="#ef4444" radius={[4,4,0,0]} name="Absent"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={S.card}>
          <h3 style={{ margin:"0 0 16px", fontSize:15, color:"#e2e8f0", fontWeight:600 }}>Biometric Status</h3>
          {[{l:"Registered",v:bioReg,c:"#10b981"},{l:"Pending",v:students.length-bioReg,c:"#ef4444"}].map(x=>(
            <div key={x.l} style={{ marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}><span style={{ fontSize:12, color:"#94a3b8" }}>{x.l}</span><span style={{ fontSize:12, fontWeight:600, color:"#e2e8f0" }}>{x.v}</span></div>
              <div style={{ height:7, background:"rgba(255,255,255,0.05)", borderRadius:4, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${students.length>0?x.v/students.length*100:0}%`, background:x.c, borderRadius:4 }}/>
              </div>
            </div>
          ))}
          <div style={{ marginTop:20, padding:14, background:"rgba(16,185,129,0.05)", borderRadius:10, border:"1px solid rgba(16,185,129,0.15)" }}>
            <div style={{ fontSize:11, color:"#34d399", fontWeight:600, marginBottom:3 }}>SYSTEM STATUS</div>
            <div style={{ fontSize:13, color:"#22d3ee" }}>● Scanner Online</div>
            <div style={{ fontSize:11, color:"#475569", marginTop:2 }}>WebAuthn / FIDO2 Ready</div>
          </div>
        </div>
      </div>
      <div style={S.card}>
        <h3 style={{ margin:"0 0 16px", fontSize:15, color:"#e2e8f0", fontWeight:600 }}>Recent Activity</h3>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            {["Student","Date","Status","Time","Method"].map(h=><th key={h} style={S.th}>{h}</th>)}
          </tr></thead>
          <tbody>{recent.map(r=>(
            <tr key={r.id}>
              <td style={S.td}><span style={{ fontSize:13, color:"#e2e8f0" }}>{r.sname}</span></td>
              <td style={S.td}><span style={{ fontSize:13, color:"#64748b" }}>{r.date}</span></td>
              <td style={S.td}><span style={S.badge(r.status)}>{r.status.toUpperCase()}</span></td>
              <td style={S.td}><span style={{ fontSize:13, color:"#64748b" }}>{r.time||"—"}</span></td>
              <td style={S.td}><span style={{ fontSize:13, color:"#475569" }}>{r.method}</span></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

// ─── ATTENDANCE ───────────────────────────────────────────────────────────────
function AttendancePage({ students, records, onRecord }) {
  const [selClass, setSelClass] = useState("All");
  const [query, setQuery] = useState("");
  const [scanState, setScanState] = useState("idle");
  const [scanMsg, setScanMsg] = useState("");
  const [activeStudent, setActiveStudent] = useState(null);
  const [todayR, setTodayR] = useState({});
  const today = new Date().toISOString().split("T")[0];
  const classes = ["All", ...new Set(students.map(s=>s.class))];
  const filtered = students.filter(s=>(selClass==="All"||s.class===selClass)&&(s.name.toLowerCase().includes(query.toLowerCase())||s.studentId.includes(query)));

  const scan = (student) => {
    setActiveStudent(student); setScanState("searching"); setScanMsg("Initializing scanner...");
    setTimeout(()=>{ setScanState("scanning"); setScanMsg("Place finger on scanner..."); }, 800);
    setTimeout(()=>{
      if (Math.random()>0.05) {
        setScanState("success"); setScanMsg("Identity verified!");
        const rec = { id:`${student.id}-${today}-${Date.now()}`, studentId:student.id, date:today, status:"present", time:new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}), method:"biometric" };
        onRecord(rec); setTodayR(p=>({...p,[student.id]:rec}));
        setTimeout(()=>{ setScanState("idle"); setActiveStudent(null); }, 2000);
      } else {
        setScanState("error"); setScanMsg("Scan failed. Try again.");
        setTimeout(()=>{ setScanState("idle"); setActiveStudent(null); }, 2000);
      }
    }, 2500);
  };

  const markManual = (student, status) => {
    const rec = { id:`${student.id}-${today}-${Date.now()}`, studentId:student.id, date:today, status, time:status!=="absent"?new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}):null, method:"manual" };
    onRecord(rec); setTodayR(p=>({...p,[student.id]:rec}));
  };

  const getStatus = (sid) => todayR[sid] || records.find(r=>r.studentId===sid&&r.date===today);

  const scanColor = scanState==="success"?"#10b981":scanState==="error"?"#ef4444":scanState==="scanning"?"#3b82f6":"#334155";

  return (
    <div>
      <h1 style={{ margin:"0 0 4px", fontSize:26, fontWeight:700, color:"#f1f5f9", letterSpacing:"-0.5px" }}>Take Attendance</h1>
      <p style={{ margin:"0 0 28px", color:"#64748b", fontSize:14 }}>{today}</p>
      <div style={{ ...S.card, background:"rgba(59,130,246,0.04)", border:"1px solid rgba(59,130,246,0.18)", borderRadius:20, display:"flex", alignItems:"center", gap:32, marginBottom:28 }}>
        <div style={{ width:110, height:110, borderRadius:18, border:`3px solid ${scanColor}`, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.3)", flexShrink:0, transition:"border-color 0.3s", animation:scanState==="scanning"?"pulse 1s infinite":"none" }}>
          <FpIcon size={52} color={scanColor} />
        </div>
        <div style={{ flex:1 }}>
          <h3 style={{ margin:"0 0 6px", fontSize:17, color:"#e2e8f0", fontWeight:600 }}>Biometric Fingerprint Scanner</h3>
          <p style={{ margin:"0 0 12px", color:"#64748b", fontSize:13 }}>{activeStudent?`Scanning: ${activeStudent.name}`:"Select a student below, then click Scan"}</p>
          {scanState!=="idle" && (
            <div style={{ padding:"9px 14px", borderRadius:8, background:scanState==="success"?"rgba(16,185,129,0.1)":scanState==="error"?"rgba(239,68,68,0.1)":"rgba(59,130,246,0.1)", border:"1px solid "+(scanState==="success"?"rgba(16,185,129,0.3)":scanState==="error"?"rgba(239,68,68,0.3)":"rgba(59,130,246,0.3)"), color:scanState==="success"?"#34d399":scanState==="error"?"#f87171":"#93c5fd", fontSize:13, fontWeight:500 }}>
              {scanMsg}
            </div>
          )}
        </div>
        <div style={{ textAlign:"center", flexShrink:0 }}>
          <div style={{ fontSize:36, fontWeight:700, color:"#3b82f6" }}>{Object.keys(todayR).length}</div>
          <div style={{ fontSize:12, color:"#64748b" }}>Recorded Today</div>
        </div>
      </div>
      <div style={{ display:"flex", gap:10, marginBottom:18, flexWrap:"wrap" }}>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search students..." style={{ ...S.input, width:220 }}/>
        {classes.map(c=>(
          <button key={c} onClick={()=>setSelClass(c)} style={{ padding:"9px 14px", background:selClass===c?"rgba(59,130,246,0.2)":"rgba(255,255,255,0.03)", border:selClass===c?"1px solid rgba(59,130,246,0.4)":"1px solid rgba(255,255,255,0.08)", borderRadius:9, color:selClass===c?"#93c5fd":"#64748b", cursor:"pointer", fontSize:12, fontWeight:500 }}>{c}</button>
        ))}
      </div>
      <div style={{ ...S.card, padding:0, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr style={{ borderBottom:"1px solid rgba(255,255,255,0.06)", background:"rgba(255,255,255,0.02)" }}>
            {["Student","ID","Class","Status","Time","Actions"].map(h=><th key={h} style={S.th}>{h}</th>)}
          </tr></thead>
          <tbody>{filtered.map(s=>{
            const rec = getStatus(s.id);
            return (
              <tr key={s.id}>
                <td style={S.td}><div style={{ display:"flex", alignItems:"center", gap:8 }}><Avatar name={s.name} size={30}/><div><div style={{ fontSize:13, color:"#e2e8f0", fontWeight:500 }}>{s.name}</div><div style={{ fontSize:11, color:s.biometricRegistered?"#3b82f6":"#ef4444" }}>{s.biometricRegistered?"● Registered":"● Pending"}</div></div></div></td>
                <td style={S.td}><span style={{ fontSize:12, color:"#64748b" }}>{s.studentId}</span></td>
                <td style={S.td}><span style={{ fontSize:13, color:"#94a3b8" }}>{s.class}</span></td>
                <td style={S.td}>{rec?<span style={S.badge(rec.status)}>{rec.status.toUpperCase()}</span>:<span style={{ fontSize:12, color:"#334155" }}>—</span>}</td>
                <td style={S.td}><span style={{ fontSize:12, color:"#64748b" }}>{rec?.time||"—"}</span></td>
                <td style={S.td}>
                  <div style={{ display:"flex", gap:6 }}>
                    {s.biometricRegistered && <button onClick={()=>scan(s)} disabled={scanState!=="idle"||!!rec} style={{ padding:"5px 10px", background:"rgba(59,130,246,0.15)", border:"1px solid rgba(59,130,246,0.3)", borderRadius:6, color:"#93c5fd", cursor:(scanState!=="idle"||!!rec)?"not-allowed":"pointer", fontSize:12, fontWeight:500, opacity:(scanState!=="idle"||!!rec)?0.5:1 }}>Scan</button>}
                    <button onClick={()=>markManual(s,"present")} disabled={!!rec} style={{ padding:"5px 10px", background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.2)", borderRadius:6, color:"#34d399", cursor:!!rec?"not-allowed":"pointer", fontSize:12, opacity:!!rec?0.5:1 }}>Present</button>
                    <button onClick={()=>markManual(s,"absent")} disabled={!!rec} style={{ padding:"5px 10px", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:6, color:"#f87171", cursor:!!rec?"not-allowed":"pointer", fontSize:12, opacity:!!rec?0.5:1 }}>Absent</button>
                  </div>
                </td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>
    </div>
  );
}

// ─── STUDENTS ─────────────────────────────────────────────────────────────────
function StudentsPage({ students, onAdd, onUpdate, onDelete }) {
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name:"", studentId:"", class:"", email:"", phone:"", biometricRegistered:false, enrolledDate:new Date().toISOString().split("T")[0] });
  const [delConfirm, setDelConfirm] = useState(null);

  const filtered = students.filter(s=>s.name.toLowerCase().includes(query.toLowerCase())||s.studentId.includes(query)||s.class.toLowerCase().includes(query.toLowerCase()));

  const openAdd = () => { setForm({ name:"", studentId:"", class:"", email:"", phone:"", biometricRegistered:false, enrolledDate:new Date().toISOString().split("T")[0] }); setEditId(null); setModal(true); };
  const openEdit = s => { setForm(s); setEditId(s.id); setModal(true); };
  const save = () => { if(!form.name||!form.studentId||!form.class) return; editId?onUpdate(editId,form):onAdd(form); setModal(false); };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28 }}>
        <div><h1 style={{ margin:"0 0 4px", fontSize:26, fontWeight:700, color:"#f1f5f9", letterSpacing:"-0.5px" }}>Students</h1><p style={{ margin:0, color:"#64748b", fontSize:14 }}>{students.length} enrolled</p></div>
        <button onClick={openAdd} style={{ padding:"11px 22px", background:"linear-gradient(135deg,#3b82f6,#8b5cf6)", border:"none", borderRadius:10, color:"white", fontWeight:600, fontSize:14, cursor:"pointer" }}>+ Add Student</button>
      </div>
      <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by name, ID, or class..." style={{ ...S.input, width:280, marginBottom:18 }}/>
      <div style={{ ...S.card, padding:0, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr style={{ borderBottom:"1px solid rgba(255,255,255,0.06)", background:"rgba(255,255,255,0.02)" }}>
            {["Student","ID","Class","Email","Biometric","Enrolled","Actions"].map(h=><th key={h} style={S.th}>{h}</th>)}
          </tr></thead>
          <tbody>{filtered.map(s=>(
            <tr key={s.id}>
              <td style={S.td}><div style={{ display:"flex", alignItems:"center", gap:8 }}><Avatar name={s.name} size={32}/><span style={{ fontSize:13, color:"#e2e8f0", fontWeight:500 }}>{s.name}</span></div></td>
              <td style={S.td}><span style={{ fontSize:12, color:"#64748b" }}>{s.studentId}</span></td>
              <td style={S.td}><span style={{ fontSize:13, color:"#94a3b8" }}>{s.class}</span></td>
              <td style={S.td}><span style={{ fontSize:12, color:"#64748b" }}>{s.email}</span></td>
              <td style={S.td}><span style={{ ...S.badge(s.biometricRegistered?"present":"absent") }}>{s.biometricRegistered?"Registered":"Pending"}</span></td>
              <td style={S.td}><span style={{ fontSize:12, color:"#64748b" }}>{s.enrolledDate}</span></td>
              <td style={S.td}><div style={{ display:"flex", gap:6 }}>
                <button onClick={()=>openEdit(s)} style={{ padding:"5px 10px", background:"rgba(59,130,246,0.1)", border:"1px solid rgba(59,130,246,0.2)", borderRadius:6, color:"#93c5fd", cursor:"pointer", fontSize:12 }}>Edit</button>
                <button onClick={()=>setDelConfirm(s)} style={{ padding:"5px 10px", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:6, color:"#f87171", cursor:"pointer", fontSize:12 }}>Delete</button>
              </div></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      {modal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
          <div style={{ background:"#1e293b", border:"1px solid rgba(255,255,255,0.1)", borderRadius:20, padding:32, width:460, maxWidth:"90vw" }}>
            <h2 style={{ margin:"0 0 22px", fontSize:19, color:"#f1f5f9", fontWeight:700 }}>{editId?"Edit Student":"Add Student"}</h2>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
              {[{l:"Full Name *",f:"name",t:"text"},{l:"Student ID *",f:"studentId",t:"text"},{l:"Class *",f:"class",t:"text",p:"e.g. 10-A"},{l:"Email",f:"email",t:"email"},{l:"Phone",f:"phone",t:"tel"},{l:"Enrolled Date",f:"enrolledDate",t:"date"}].map(x=>(
                <div key={x.f}>
                  <label style={{ display:"block", marginBottom:5, fontSize:11, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.5px" }}>{x.l}</label>
                  <input type={x.t} placeholder={x.p} value={form[x.f]||""} onChange={e=>setForm(p=>({...p,[x.f]:e.target.value}))} style={S.input}/>
                </div>
              ))}
            </div>
            <label style={{ display:"flex", alignItems:"center", gap:10, marginBottom:22, cursor:"pointer" }}>
              <input type="checkbox" checked={form.biometricRegistered} onChange={e=>setForm(p=>({...p,biometricRegistered:e.target.checked}))} style={{ width:15, height:15 }}/>
              <span style={{ fontSize:13, color:"#94a3b8" }}>Biometric Registered</span>
            </label>
            <div style={{ display:"flex", gap:12 }}>
              <button onClick={()=>setModal(false)} style={{ flex:1, padding:11, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, color:"#94a3b8", cursor:"pointer", fontSize:13 }}>Cancel</button>
              <button onClick={save} style={{ flex:1, padding:11, background:"linear-gradient(135deg,#3b82f6,#8b5cf6)", border:"none", borderRadius:10, color:"white", cursor:"pointer", fontSize:13, fontWeight:600 }}>{editId?"Save":"Add Student"}</button>
            </div>
          </div>
        </div>
      )}
      {delConfirm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
          <div style={{ background:"#1e293b", border:"1px solid rgba(255,255,255,0.1)", borderRadius:20, padding:32, maxWidth:360, textAlign:"center" }}>
            <div style={{ fontSize:36, marginBottom:14 }}>⚠️</div>
            <h3 style={{ margin:"0 0 8px", color:"#f1f5f9" }}>Delete Student?</h3>
            <p style={{ color:"#64748b", fontSize:13, margin:"0 0 22px" }}>This will permanently remove {delConfirm.name}.</p>
            <div style={{ display:"flex", gap:12 }}>
              <button onClick={()=>setDelConfirm(null)} style={{ flex:1, padding:10, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, color:"#94a3b8", cursor:"pointer" }}>Cancel</button>
              <button onClick={()=>{ onDelete(delConfirm.id); setDelConfirm(null); }} style={{ flex:1, padding:10, background:"rgba(239,68,68,0.15)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:8, color:"#f87171", cursor:"pointer", fontWeight:600 }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── REPORTS ──────────────────────────────────────────────────────────────────
function ReportsPage({ students, records }) {
  const [selClass, setSelClass] = useState("All");
  const classes = ["All", ...new Set(students.map(s=>s.class))];

  const studentStats = useMemo(()=>{
    return students.map(s=>{
      const r = records.filter(x=>x.studentId===s.id);
      const present=r.filter(x=>x.status==="present").length, absent=r.filter(x=>x.status==="absent").length, late=r.filter(x=>x.status==="late").length, total=r.length;
      return { ...s, present, absent, late, total, rate:total>0?Math.round(present/total*100):0 };
    }).filter(s=>selClass==="All"||s.class===selClass).sort((a,b)=>a.rate-b.rate);
  },[students,records,selClass]);

  const pieData = useMemo(()=>{
    const present=records.filter(r=>r.status==="present").length, absent=records.filter(r=>r.status==="absent").length, late=records.filter(r=>r.status==="late").length;
    return [{name:"Present",value:present,color:"#10b981"},{name:"Absent",value:absent,color:"#ef4444"},{name:"Late",value:late,color:"#f59e0b"}];
  },[records]);

  const classStats = useMemo(()=>{
    return [...new Set(students.map(s=>s.class))].map(cls=>{
      const cs=students.filter(s=>s.class===cls), cr=records.filter(r=>cs.some(s=>s.id===r.studentId));
      const p=cr.filter(r=>r.status==="present").length;
      return { class:cls, rate:cr.length>0?Math.round(p/cr.length*100):0 };
    });
  },[students,records]);

  const low = studentStats.filter(s=>s.rate<75);

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28 }}>
        <div><h1 style={{ margin:"0 0 4px", fontSize:26, fontWeight:700, color:"#f1f5f9", letterSpacing:"-0.5px" }}>Reports</h1><p style={{ margin:0, color:"#64748b", fontSize:14 }}>Attendance analytics</p></div>
        <button style={{ padding:"9px 18px", background:"rgba(16,185,129,0.12)", border:"1px solid rgba(16,185,129,0.3)", borderRadius:9, color:"#34d399", cursor:"pointer", fontSize:13, fontWeight:500 }}>Export CSV</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:24 }}>
        <div style={S.card}>
          <h3 style={{ margin:"0 0 14px", fontSize:15, color:"#e2e8f0", fontWeight:600 }}>Overall Distribution</h3>
          <ResponsiveContainer width="100%" height={190}>
            <PieChart><Pie data={pieData} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={11}>
              {pieData.map((e,i)=><Cell key={i} fill={e.color}/>)}
            </Pie><Tooltip contentStyle={{ background:"#1e293b", border:"1px solid #334155", borderRadius:8, color:"#e2e8f0" }}/></PieChart>
          </ResponsiveContainer>
        </div>
        <div style={S.card}>
          <h3 style={{ margin:"0 0 14px", fontSize:15, color:"#e2e8f0", fontWeight:600 }}>By Class</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:8 }}>
            {classStats.map(c=>(
              <div key={c.class}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}><span style={{ fontSize:12, color:"#94a3b8" }}>{c.class}</span><span style={{ fontSize:12, fontWeight:600, color:"#e2e8f0" }}>{c.rate}%</span></div>
                <div style={{ height:7, background:"rgba(255,255,255,0.05)", borderRadius:4, overflow:"hidden" }}><div style={{ height:"100%", width:`${c.rate}%`, background:"#3b82f6", borderRadius:4 }}/></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {low.length>0 && (
        <div style={{ background:"rgba(239,68,68,0.04)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:14, padding:20, marginBottom:24 }}>
          <h3 style={{ margin:"0 0 14px", fontSize:14, color:"#f87171", fontWeight:600 }}>Low Attendance Alert — {low.length} student(s) below 75%</h3>
          {low.map(s=>(
            <div key={s.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 14px", background:"rgba(239,68,68,0.04)", borderRadius:8, marginBottom:6 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}><Avatar name={s.name} size={26}/><span style={{ fontSize:13, color:"#e2e8f0" }}>{s.name}</span><span style={{ fontSize:12, color:"#64748b" }}>{s.class}</span></div>
              <span style={{ padding:"3px 12px", borderRadius:20, background:"rgba(239,68,68,0.2)", color:"#f87171", fontSize:13, fontWeight:700 }}>{s.rate}%</span>
            </div>
          ))}
        </div>
      )}
      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
        {classes.map(c=><button key={c} onClick={()=>setSelClass(c)} style={{ padding:"7px 14px", background:selClass===c?"rgba(59,130,246,0.2)":"rgba(255,255,255,0.03)", border:selClass===c?"1px solid rgba(59,130,246,0.4)":"1px solid rgba(255,255,255,0.08)", borderRadius:8, color:selClass===c?"#93c5fd":"#64748b", cursor:"pointer", fontSize:12, fontWeight:500 }}>{c}</button>)}
      </div>
      <div style={{ ...S.card, padding:0, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr style={{ borderBottom:"1px solid rgba(255,255,255,0.06)", background:"rgba(255,255,255,0.02)" }}>
            {["Student","Class","Present","Absent","Late","Total","Rate"].map(h=><th key={h} style={S.th}>{h}</th>)}
          </tr></thead>
          <tbody>{studentStats.map(s=>(
            <tr key={s.id}>
              <td style={S.td}><span style={{ fontSize:13, color:"#e2e8f0" }}>{s.name}</span></td>
              <td style={S.td}><span style={{ fontSize:12, color:"#64748b" }}>{s.class}</span></td>
              <td style={S.td}><span style={{ fontSize:13, color:"#34d399" }}>{s.present}</span></td>
              <td style={S.td}><span style={{ fontSize:13, color:"#f87171" }}>{s.absent}</span></td>
              <td style={S.td}><span style={{ fontSize:13, color:"#fbbf24" }}>{s.late}</span></td>
              <td style={S.td}><span style={{ fontSize:13, color:"#94a3b8" }}>{s.total}</span></td>
              <td style={S.td}><div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ flex:1, height:6, background:"rgba(255,255,255,0.05)", borderRadius:3, overflow:"hidden" }}><div style={{ height:"100%", width:`${s.rate}%`, background:s.rate>=75?"#3b82f6":"#ef4444", borderRadius:3 }}/></div>
                <span style={{ fontSize:12, fontWeight:600, color:s.rate>=75?"#93c5fd":"#f87171", minWidth:36 }}>{s.rate}%</span>
              </div></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
function SettingsPage({ currentUser, onLogout }) {
  const [saved, setSaved] = useState(false);
  const [cfg, setCfg] = useState({ schoolName:"Greenfield Academy", academicYear:"2024-2025", attendanceStart:"08:00", lateThreshold:"08:30", biometricMode:"simulate", emailNotif:true, smsAlert:false, dailyReport:true, lowThreshold:75 });
  const inp = { ...S.input };
  const Toggle = ({v,onChange}) => (
    <button onClick={()=>onChange(!v)} style={{ width:42, height:22, borderRadius:11, background:v?"#3b82f6":"rgba(255,255,255,0.1)", border:"none", cursor:"pointer", position:"relative", transition:"background 0.2s", flexShrink:0 }}>
      <div style={{ width:16, height:16, borderRadius:"50%", background:"white", position:"absolute", top:3, left:v?23:3, transition:"left 0.2s" }}/>
    </button>
  );
  return (
    <div>
      <h1 style={{ margin:"0 0 4px", fontSize:26, fontWeight:700, color:"#f1f5f9", letterSpacing:"-0.5px" }}>Settings</h1>
      <p style={{ margin:"0 0 28px", color:"#64748b", fontSize:14 }}>System configuration</p>
      {[
        { title:"School Information", content:(
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            {[{l:"School Name",f:"schoolName",t:"text"},{l:"Academic Year",f:"academicYear",t:"text"}].map(x=>(
              <div key={x.f}><label style={{ display:"block", marginBottom:5, fontSize:11, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.5px" }}>{x.l}</label><input type={x.t} style={inp} value={cfg[x.f]} onChange={e=>setCfg(p=>({...p,[x.f]:e.target.value}))}/></div>
            ))}
          </div>
        )},
        { title:"Attendance Rules", content:(
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
            {[{l:"Start Time",f:"attendanceStart",t:"time"},{l:"Late After",f:"lateThreshold",t:"time"},{l:"Low Attendance %",f:"lowThreshold",t:"number"}].map(x=>(
              <div key={x.f}><label style={{ display:"block", marginBottom:5, fontSize:11, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.5px" }}>{x.l}</label><input type={x.t} style={inp} value={cfg[x.f]} onChange={e=>setCfg(p=>({...p,[x.f]:e.target.value}))}/></div>
            ))}
          </div>
        )},
        { title:"Biometric Mode", content:(
          <div>
            <label style={{ display:"block", marginBottom:5, fontSize:11, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.5px" }}>Scanner Mode</label>
            <select value={cfg.biometricMode} onChange={e=>setCfg(p=>({...p,biometricMode:e.target.value}))} style={{ ...inp, appearance:"none" }}>
              <option value="simulate">Simulate (Demo — no hardware needed)</option>
              <option value="webauthn">WebAuthn / FIDO2 (Real Fingerprint/Face ID)</option>
              <option value="device">Physical USB Fingerprint Scanner</option>
            </select>
            <div style={{ marginTop:12, padding:12, background:"rgba(59,130,246,0.05)", borderRadius:9, border:"1px solid rgba(59,130,246,0.15)", fontSize:13, color:"#94a3b8" }}>
              <strong style={{ color:"#93c5fd" }}>WebAuthn Mode</strong> uses the browser's built-in biometrics (Touch ID, Windows Hello, Face ID). Works on any modern device with biometric hardware.
            </div>
          </div>
        )},
        { title:"Notifications", content:(
          <div>{[{l:"Email Notifications",k:"emailNotif",h:"Send email for absent students"},{l:"SMS Alerts",k:"smsAlert",h:"SMS parents on absence"},{l:"Daily Report",k:"dailyReport",h:"Auto-generate daily summary"}].map(x=>(
            <div key={x.k} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 14px", background:"rgba(255,255,255,0.02)", borderRadius:9, marginBottom:8 }}>
              <div><div style={{ fontSize:13, color:"#e2e8f0", fontWeight:500 }}>{x.l}</div><div style={{ fontSize:11, color:"#475569" }}>{x.h}</div></div>
              <Toggle v={cfg[x.k]} onChange={v=>setCfg(p=>({...p,[x.k]:v}))}/>
            </div>
          ))}</div>
        )},
      ].map(sec=>(
        <div key={sec.title} style={{ ...S.card, marginBottom:18 }}>
          <h3 style={{ margin:"0 0 18px", fontSize:15, color:"#e2e8f0", fontWeight:600 }}>{sec.title}</h3>
          {sec.content}
        </div>
      ))}
      <div style={{ ...S.card, marginBottom:18 }}>
        <h3 style={{ margin:"0 0 16px", fontSize:15, color:"#e2e8f0", fontWeight:600 }}>Account</h3>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 14px", background:"rgba(255,255,255,0.02)", borderRadius:9 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}><Avatar name={currentUser?.name||"U"} size={32}/><div><div style={{ fontSize:13, color:"#e2e8f0" }}>{currentUser?.name}</div><div style={{ fontSize:11, color:"#475569" }}>{currentUser?.role}</div></div></div>
          <button onClick={onLogout} style={{ padding:"7px 14px", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:8, color:"#f87171", cursor:"pointer", fontSize:12, fontWeight:500 }}>Sign Out</button>
        </div>
      </div>
      <div style={{ display:"flex", justifyContent:"flex-end" }}>
        <button onClick={()=>{ setSaved(true); setTimeout(()=>setSaved(false),2000); }} style={{ padding:"11px 28px", background:saved?"rgba(16,185,129,0.2)":"linear-gradient(135deg,#3b82f6,#8b5cf6)", border:saved?"1px solid rgba(16,185,129,0.3)":"none", borderRadius:10, color:saved?"#34d399":"white", fontWeight:600, fontSize:14, cursor:"pointer", transition:"all 0.3s" }}>
          {saved?"✓ Saved!":"Save Settings"}
        </button>
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState(null);
  const [sideOpen, setSideOpen] = useState(true);
  const [students, setStudents] = useState(MOCK_STUDENTS);
  const [records, setRecords] = useState(() => genAttendance(MOCK_STUDENTS));

  if (!authed) return <Login onLogin={u=>{ setUser(u); setAuthed(true); }}/>;

  const addRecord = r => setRecords(p=>[...p,r]);
  const addStudent = s => setStudents(p=>[...p,{...s,id:Date.now().toString()}]);
  const updateStudent = (id,upd) => setStudents(p=>p.map(s=>s.id===id?{...s,...upd}:s));
  const deleteStudent = id => setStudents(p=>p.filter(s=>s.id!==id));

  const pages = {
    dashboard: <Dashboard students={students} records={records}/>,
    attendance: <AttendancePage students={students} records={records} onRecord={addRecord}/>,
    students: <StudentsPage students={students} onAdd={addStudent} onUpdate={updateStudent} onDelete={deleteStudent}/>,
    reports: <ReportsPage students={students} records={records}/>,
    settings: <SettingsPage currentUser={user} onLogout={()=>setAuthed(false)}/>,
  };

  return (
    <div style={{ display:"flex", height:"100vh", background:"#0f1117", color:"#e2e8f0", fontFamily:"system-ui,-apple-system,sans-serif", overflow:"hidden" }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        input:focus,select:focus{border-color:rgba(59,130,246,0.5)!important;box-shadow:0 0 0 3px rgba(59,130,246,0.1);}
        input::placeholder{color:#334155;}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:3px}
      `}</style>
      <Sidebar page={page} onNav={setPage} open={sideOpen} onToggle={()=>setSideOpen(p=>!p)} user={user}/>
      <main style={{ flex:1, overflowY:"auto", padding:"28px 32px" }}>{pages[page]}</main>
    </div>
  );
}
