<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>AUTO ORI!</title>

  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 100%; height: 100%; background: #000; overflow: hidden; }
    #root { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
    button { -webkit-tap-highlight-color: transparent; }
    ::-webkit-scrollbar { width: 0; }
  </style>
</head>
<body>
  <div id="root"></div>

  <script type="text/babel">
const { useState, useEffect, useRef } = React;

const C = {
  bg:"#090A0C",
  surface:"#111318",
  surfaceHi:"#181C25",
  border:"rgba(255,255,255,0.07)",
  borderHi:"rgba(255,255,255,0.12)",
  text:"#F0F2F7",
  primary:"#C6FF3D",
  accent:"#FF7A45",
  danger:"#FF2D55",
};

const a = (hex, op) => {
  const n = parseInt(hex.replace("#",""), 16);
  return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${op})`;
};

const T = {
  muted:a(C.text,0.50),
  faint:a(C.text,0.30),
};

const FONT_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@400;600;700;900&family=Manrope:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap');
*,*::before,*::after{box-sizing:border-box;}
.fd{font-family:'Unbounded',sans-serif;letter-spacing:-0.02em;}
.fb{font-family:'Manrope',sans-serif;}
.fm{font-family:'JetBrains Mono',monospace;font-feature-settings:'tnum';}
.lbl{letter-spacing:0.10em;text-transform:uppercase;}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideUp{from{transform:translateY(16px);opacity:0}to{transform:none;opacity:1}}
@keyframes slideDown{from{transform:translateY(-16px);opacity:0}to{transform:none;opacity:1}}
@keyframes sheetUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
@keyframes cardIn{from{transform:translateX(40px) scale(.97);opacity:0}to{transform:none;opacity:1}}
@keyframes slam{0%{transform:scale(.5) translateY(-12px);opacity:0}60%{transform:scale(1.06)}100%{transform:scale(1);opacity:1}}
@keyframes glow{0%,100%{text-shadow:none}50%{text-shadow:0 0 20px rgba(198,255,61,.55)}}
.af{animation:fadeIn 260ms ease both}
.asu{animation:slideUp 300ms cubic-bezier(.2,.9,.25,1) both}
.asd{animation:slideDown 300ms cubic-bezier(.2,.9,.25,1) both}
.ash{animation:sheetUp 340ms cubic-bezier(.2,.9,.25,1) both}
.aci{animation:cardIn 400ms cubic-bezier(.22,1,.36,1) both}
.aslam{animation:slam 420ms cubic-bezier(.34,1.56,.64,1) both}
.aglow{animation:glow 2.4s ease-in-out infinite}
`;

const MM = {
  BASE:500,
  STRIKE_THRESHOLD:0.50,
  MAX_STRIKES:2,
  CHECKPOINT:5,
  MULT_CAP:128,
};

const TIERS = [
  { max:0.01, id:"ORI_PERFECT", label:"ORI! PERFECT", mult:3.0 },
  { max:0.03, id:"SUPER_PERFECT", label:"SUPER PERFECT", mult:2.0 },
  { max:0.05, id:"PERFECT", label:"PERFECT", mult:1.5 },
  { max:0.10, id:"GREAT", label:"GREAT", mult:1.0 },
  { max:0.15, id:"SOLID", label:"SOLID", mult:0.7 },
  { max:0.30, id:"GOOD", label:"GOOD", mult:0.35 },
  { max:0.50, id:"LOW_HIT", label:"LOW HIT", mult:0.15 },
];

const getTier = (err) => TIERS.find(t => err <= t.max) || null;

const resolveHit = (guess, actual, currentMult, currentStrikes) => {
  const err = Math.abs(guess - actual) / actual;
  const errPct = Math.round(err * 1000) / 10;
  const errSigned = (guess - actual) / actual;

  if (err > MM.STRIKE_THRESHOLD) {
    const newStrikes = currentStrikes + 1;
    return {
      tier:"STRIKE",
      label:"STRIKE",
      bust:newStrikes >= MM.MAX_STRIKES,
      strikeAdded:true,
      accuracyMult:0,
      points:0,
      err,
      errPct,
      errSigned,
      newStrikes,
    };
  }

  const t = getTier(err);
  const points = Math.round(MM.BASE * t.mult * currentMult);

  return {
    tier:t.id,
    label:t.label,
    bust:false,
    strikeAdded:false,
    accuracyMult:t.mult,
    points,
    err,
    errPct,
    errSigned,
    newStrikes:currentStrikes,
  };
};

const mkImg = (lock) => `https://loremflickr.com/800/500/automobile,car/all?lock=${lock}`;

const MAIN_POOL = [
  { brand:"PEUGEOT", model:"208", year:2019, mileage:45000, actual:14200, min:4000, max:30000, imageUrl:mkImg(2081) },
  { brand:"RENAULT", model:"CLIO V", year:2021, mileage:28000, actual:15800, min:6000, max:32000, imageUrl:mkImg(1012) },
  { brand:"CITROËN", model:"C3", year:2018, mileage:72000, actual:9400, min:3000, max:22000, imageUrl:mkImg(1033) },
  { brand:"VOLKSWAGEN", model:"GOLF 7", year:2020, mileage:51000, actual:18900, min:6000, max:38000, imageUrl:mkImg(1074) },
  { brand:"DACIA", model:"SANDERO", year:2022, mileage:12000, actual:11800, min:4000, max:24000, imageUrl:mkImg(1055) },
  { brand:"RENAULT", model:"MEGANE IV", year:2019, mileage:62000, actual:14500, min:5000, max:30000, imageUrl:mkImg(1066) },
  { brand:"PEUGEOT", model:"3008", year:2020, mileage:38000, actual:22400, min:9000, max:42000, imageUrl:mkImg(1077) },
  { brand:"CITROËN", model:"C4", year:2021, mileage:24000, actual:17200, min:6000, max:34000, imageUrl:mkImg(1088) },
  { brand:"FORD", model:"FIESTA", year:2017, mileage:88000, actual:8900, min:3000, max:20000, imageUrl:mkImg(1099) },
  { brand:"OPEL", model:"CORSA F", year:2020, mileage:31000, actual:13500, min:5000, max:26000, imageUrl:mkImg(1110) },
  { brand:"TOYOTA", model:"YARIS", year:2019, mileage:47000, actual:12800, min:4000, max:25000, imageUrl:mkImg(1121) },
  { brand:"BMW", model:"SERIE 1", year:2018, mileage:65000, actual:18500, min:7000, max:38000, imageUrl:mkImg(1132) },
  { brand:"MERCEDES", model:"CLASSE A", year:2019, mileage:42000, actual:22800, min:9000, max:45000, imageUrl:mkImg(1143) },
  { brand:"AUDI", model:"A3", year:2020, mileage:35000, actual:24900, min:10000, max:48000, imageUrl:mkImg(1154) },
  { brand:"FIAT", model:"500", year:2018, mileage:54000, actual:9200, min:3000, max:20000, imageUrl:mkImg(1165) },
  { brand:"SEAT", model:"IBIZA", year:2020, mileage:28000, actual:14100, min:5000, max:28000, imageUrl:mkImg(1176) },
  { brand:"SKODA", model:"FABIA", year:2019, mileage:41000, actual:11900, min:4000, max:24000, imageUrl:mkImg(1187) },
  { brand:"HYUNDAI", model:"i20", year:2021, mileage:18000, actual:15400, min:6000, max:30000, imageUrl:mkImg(1198) },
  { brand:"KIA", model:"PICANTO", year:2020, mileage:22000, actual:10800, min:4000, max:22000, imageUrl:mkImg(1209) },
  { brand:"MINI", model:"COOPER", year:2019, mileage:37000, actual:18900, min:7000, max:36000, imageUrl:mkImg(1220) },
  { brand:"VOLVO", model:"XC40", year:2021, mileage:26000, actual:32400, min:14000, max:58000, imageUrl:mkImg(1231) },
  { brand:"PEUGEOT", model:"2008", year:2020, mileage:32000, actual:18200, min:7000, max:36000, imageUrl:mkImg(1242) },
  { brand:"RENAULT", model:"CAPTUR II", year:2021, mileage:24000, actual:19400, min:8000, max:38000, imageUrl:mkImg(1253) },
  { brand:"DACIA", model:"DUSTER", year:2019, mileage:48000, actual:13800, min:5000, max:28000, imageUrl:mkImg(1264) },
  { brand:"VOLKSWAGEN", model:"POLO", year:2019, mileage:38000, actual:14700, min:5000, max:28000, imageUrl:mkImg(1275) },
  { brand:"VOLKSWAGEN", model:"T-ROC", year:2021, mileage:22000, actual:26800, min:11000, max:50000, imageUrl:mkImg(1286) },
];

const LB_NAMES = [
  "Lea M.","Karim B.","Samira A.","Thomas D.","Amelie F.",
  "Julien R.","Nour K.","Mathis V.","Chloe P.","Erwan L.",
  "Camille D.","Hugo B.","Ines M.","Maxime C.","Sophie T.",
  "Lucas G.","Emma N.","Nathan P.","Alice R.","Antoine S.",
];

const MAIN_LEADERBOARD = (() => {
  const arr = [];
  let s = 24500;
  for (let i = 0; i < 20; i++) {
    arr.push({ r:i+1, n:LB_NAMES[i], s });
    s -= 80 + ((i * 23) % 120);
  }
  return arr;
})();

const RECENT_RUNS = [
  { id:"M-118", date:"19 avr", score:12400, percentile:18 },
  { id:"M-117", date:"18 avr", score:8200, percentile:34 },
  { id:"M-116", date:"17 avr", score:5840, percentile:52 },
  { id:"M-115", date:"16 avr", score:14100, percentile:12 },
  { id:"M-114", date:"15 avr", score:7680, percentile:38 },
];

const fmtEUR = (n) =>
  new Intl.NumberFormat("fr-FR", { style:"currency", currency:"EUR", maximumFractionDigits:0 }).format(n);

const fmtNum = (n) =>
  new Intl.NumberFormat("fr-FR").format(n);

const computeRank = (score) => {
  if (score >= 20000) return Math.max(1, Math.round(100 - (score - 20000) / 200));
  if (score >= 10000) return Math.round(2000 - (score - 10000) * 0.19);
  if (score >= 3000) return Math.round(5000 - (score - 3000) * 0.43);
  return Math.round(9000 - score * 1.3);
};

const computePct = (rank) => Math.max(1, Math.round((rank / 9847) * 100));

const pickNext = (prev) => {
  let idx = Math.floor(Math.random() * MAIN_POOL.length);
  if (idx === prev) idx = (idx + 1) % MAIN_POOL.length;
  return idx;
};

const midGuess = (car) => Math.round(((car.min + car.max) / 2) / 100) * 100;

const xpForBank = (banked, cars) => Math.round(banked / 100) + cars * 10;

function useCountUp(target, duration = 700, trigger = target) {
  const [v, setV] = useState(0);

  useEffect(() => {
    let raf;
    const start = performance.now();

    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [trigger]);

  return v;
}

function StatTile({ label, value, accent }) {
  return (
    <div style={{
      padding:"14px 12px",
      borderRadius:14,
      background:C.surface,
      border:`1px solid ${C.border}`,
    }}>
      <div className="lbl" style={{ fontSize:8, color:T.faint, fontFamily:"Manrope,sans-serif" }}>{label}</div>
      <div className="fm" style={{ fontSize:18, fontWeight:700, color:accent ? C.primary : C.text, marginTop:4 }}>{value}</div>
    </div>
  );
}

function BottomNav({ activeTab, onChange }) {
  const item = (id, label, icon) => (
    <button
      onClick={() => onChange(id)}
      style={{
        flex:1,
        padding:"10px 0 12px",
        border:"none",
        background:"transparent",
        color:activeTab === id ? C.primary : T.muted,
        fontFamily:"Manrope,sans-serif",
        fontSize:10,
        fontWeight:700,
        cursor:"pointer",
      }}
    >
      <div style={{ fontSize:18, marginBottom:2 }}>{icon}</div>
      {label}
    </button>
  );

  return (
    <div style={{
      flexShrink:0,
      height:70,
      borderTop:`1px solid ${C.border}`,
      background:a(C.bg,0.92),
      display:"flex",
      padding:"4px 10px 0",
    }}>
      {item("home", "Accueil", "⌂")}
      {item("profile", "Profil", "◉")}
    </div>
  );
}

function CompactLeaderboard({ userScore }) {
  const rows = MAIN_LEADERBOARD.slice(0, 6);
  return (
    <div style={{
      borderRadius:16,
      overflow:"hidden",
      background:C.surface,
      border:`1px solid ${C.border}`,
      marginTop:14,
    }}>
      <div style={{
        padding:"12px 14px",
        borderBottom:`1px solid ${C.border}`,
        display:"flex",
        justifyContent:"space-between",
      }}>
        <span className="lbl" style={{ fontSize:8, color:T.muted, fontFamily:"Manrope,sans-serif" }}>CLASSEMENT</span>
        <span className="fm" style={{ fontSize:11, color:C.primary }}>TOP {computePct(computeRank(userScore))}%</span>
      </div>

      {rows.map((r, i) => (
        <div
          key={r.r}
          style={{
            display:"flex",
            alignItems:"center",
            justifyContent:"space-between",
            padding:"10px 14px",
            borderBottom:i < rows.length - 1 ? `1px solid ${C.border}` : "none",
          }}
        >
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span className="fm" style={{ width:22, fontSize:12, color:r.r <= 3 ? C.primary : T.muted }}>#{r.r}</span>
            <span className="fb" style={{ fontSize:13, color:C.text }}>{r.n}</span>
          </div>
          <span className="fm" style={{ fontSize:13, color:C.text, fontWeight:700 }}>{fmtNum(r.s)}</span>
        </div>
      ))}
    </div>
  );
}

function IntroState({ onPlay, stats }) {
  return (
    <div className="af" style={{ height:"100%", overflowY:"auto" }}>
      <div style={{ padding:"18px 14px" }}>
        <div style={{ textAlign:"center", paddingTop:14 }}>
          <div className="fd aglow" style={{ fontSize:34, fontWeight:900, color:C.text, lineHeight:1 }}>
            AUTO<br/>ORI!
          </div>
          <p className="fb" style={{ color:T.muted, fontSize:13, marginTop:10, lineHeight:1.45 }}>
            Devine le prix du marché. Encaisse tous les 5 véhicules ou continue pour doubler.
          </p>
        </div>

        <div style={{
          marginTop:22,
          borderRadius:22,
          padding:14,
          background:`linear-gradient(180deg, ${a(C.text,.05)}, ${a(C.text,.015)})`,
          border:`1px solid ${C.borderHi}`,
        }}>
          <div style={{
            height:165,
            borderRadius:18,
            overflow:"hidden",
            background:C.surfaceHi,
            position:"relative",
          }}>
            <img
              src={MAIN_POOL[0].imageUrl}
              style={{ width:"100%", height:"100%", objectFit:"cover", opacity:.72 }}
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
            <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg, transparent, rgba(0,0,0,.75))" }} />
            <div style={{ position:"absolute", left:14, bottom:12 }}>
              <div className="fd" style={{ fontSize:20, color:C.text, fontWeight:800 }}>PEUGEOT 208</div>
              <div className="fb" style={{ fontSize:11, color:T.muted }}>2019 · 45 000 km</div>
            </div>
            <div style={{
              position:"absolute",
              right:12,
              top:12,
              padding:"7px 10px",
              borderRadius:999,
              background:a(C.primary,.13),
              border:`1px solid ${a(C.primary,.25)}`,
              color:C.primary,
              fontFamily:"JetBrains Mono,monospace",
              fontSize:12,
              fontWeight:700,
            }}>
              x1
            </div>
          </div>

          <div style={{
            display:"flex",
            marginTop:12,
            borderRadius:14,
            overflow:"hidden",
            border:`1px solid ${C.border}`,
          }}>
            {[
              { label:"BEST", value:fmtNum(stats.bestBankedRun), color:C.primary },
              { label:"RUNS", value:fmtNum(stats.totalRuns), color:C.text },
              { label:"MAX", value:`x${stats.highestMultiplier}`, color:C.text },
            ].map(({label, value, color}, i) => (
              <div key={i} style={{
                flex:1,
                padding:"10px 6px",
                textAlign:"center",
                borderRight:i < 2 ? `1px solid ${C.border}` : "none",
                background:a(C.text,.01),
              }}>
                <div className="lbl" style={{ fontSize:7, color:T.faint, fontFamily:"Manrope,sans-serif" }}>{label}</div>
                <div className="fm" style={{ fontSize:15, fontWeight:700, color, marginTop:2 }}>{value}</div>
              </div>
            ))}
          </div>

          <button
            onClick={onPlay}
            style={{
              width:"100%",
              padding:"16px 0",
              borderRadius:14,
              background:C.primary,
              color:C.bg,
              border:"none",
              cursor:"pointer",
              fontFamily:"'Unbounded',sans-serif",
              fontWeight:700,
              fontSize:13,
              letterSpacing:"0.1em",
              marginTop:12,
            }}
          >
            LANCER UNE RUN →
          </button>
        </div>

        <CompactLeaderboard userScore={stats.bestBankedRun} />
      </div>
    </div>
  );
}

function ProfileTab({ stats, recentRuns }) {
  return (
    <div className="af" style={{ height:"100%", overflowY:"auto" }}>
      <div style={{ padding:"18px 14px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <div style={{
            width:50,
            height:50,
            borderRadius:"50%",
            flexShrink:0,
            background:a(C.primary,.1),
            border:`1px solid ${a(C.primary,.25)}`,
            display:"flex",
            alignItems:"center",
            justifyContent:"center",
          }}>
            <span className="fd" style={{ fontSize:18, fontWeight:700, color:C.primary }}>R</span>
          </div>
          <div>
            <h2 className="fd" style={{ fontSize:18, fontWeight:700, color:C.text, lineHeight:1.1 }}>Requin Malin</h2>
            <div className="fb" style={{ fontSize:11, color:T.muted, marginTop:2 }}>Membre depuis avr 2026</div>
          </div>
        </div>

        <div className="lbl" style={{ fontSize:9, color:T.muted, marginBottom:10, fontFamily:"Manrope,sans-serif" }}>AUTO ORI!</div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
          <StatTile label="MEILLEUR RUN" value={fmtNum(stats.bestBankedRun)} accent />
          <StatTile label="RUNS JOUÉS" value={fmtNum(stats.totalRuns)} />
          <StatTile label="MULT. MAX" value={`x${stats.highestMultiplier}`} accent />
          <StatTile label="PRÉCISION MOY." value={`${stats.avgPrecision}%`} />
        </div>

        <div className="lbl" style={{ fontSize:9, color:T.muted, marginBottom:10, fontFamily:"Manrope,sans-serif" }}>DERNIERS RUNS</div>

        <div style={{ borderRadius:14, overflow:"hidden", background:C.surface, border:`1px solid ${C.border}` }}>
          {recentRuns.map((r, i) => (
            <div key={r.id} style={{
              display:"flex",
              alignItems:"center",
              justifyContent:"space-between",
              padding:"11px 14px",
              borderBottom:i < recentRuns.length - 1 ? `1px solid ${C.border}` : "none",
            }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span className="fd lbl" style={{ fontSize:7, padding:"2px 6px", borderRadius:4, color:C.primary, background:a(C.primary,.1) }}>RUN</span>
                  <span className="fb" style={{ fontSize:13, color:C.text }}>{r.id}</span>
                </div>
                <div className="fb" style={{ fontSize:10, color:T.muted, marginTop:1 }}>{r.date} · Top {r.percentile}%</div>
              </div>
              <span className="fm" style={{ fontSize:14, fontWeight:700, color:C.text }}>{fmtNum(r.score)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChargeBar({ charge }) {
  return (
    <div style={{ display:"flex", gap:5 }}>
      {Array.from({ length:MM.CHECKPOINT }).map((_, i) => (
        <div key={i} style={{
          flex:1,
          height:6,
          borderRadius:999,
          background:i < charge ? C.primary : a(C.text,.12),
          boxShadow:i < charge ? `0 0 10px ${a(C.primary,.35)}` : "none",
        }} />
      ))}
    </div>
  );
}

function PlayScreen({
  car,
  carsPlayed,
  multiplier,
  charge,
  strikes,
  unbanked,
  revealed,
  guess,
  setGuess,
  lastReward,
  onPrimary,
}) {
  const tierColor = lastReward?.strikeAdded ? C.accent : C.primary;

  return (
    <div className="af" style={{ height:"100%", display:"flex", flexDirection:"column", padding:"14px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
        <div>
          <div className="lbl" style={{ fontSize:8, color:T.faint, fontFamily:"Manrope,sans-serif" }}>RUN</div>
          <div className="fm" style={{ fontSize:14, color:C.text, fontWeight:700 }}>{fmtNum(carsPlayed)} voitures</div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div className="lbl" style={{ fontSize:8, color:T.faint, fontFamily:"Manrope,sans-serif" }}>NON ENCAISSÉ</div>
          <div className="fm" style={{ fontSize:16, color:C.primary, fontWeight:700 }}>{fmtNum(unbanked)}</div>
        </div>
      </div>

      <ChargeBar charge={charge} />

      <div style={{
        marginTop:10,
        display:"flex",
        justifyContent:"space-between",
        alignItems:"center",
        padding:"8px 10px",
        borderRadius:12,
        background:C.surface,
        border:`1px solid ${C.border}`,
      }}>
        <span className="fm" style={{ fontSize:13, color:C.primary, fontWeight:700 }}>x{multiplier}</span>
        <span className="fb" style={{ fontSize:11, color:T.muted }}>Strikes: {strikes}/{MM.MAX_STRIKES}</span>
      </div>

      <div className="aci" style={{
        marginTop:12,
        borderRadius:22,
        overflow:"hidden",
        background:C.surfaceHi,
        border:`1px solid ${C.borderHi}`,
        flexShrink:0,
      }}>
        <div style={{ height:220, position:"relative", background:"#15171c" }}>
          <img
            src={car.imageUrl}
            style={{ width:"100%", height:"100%", objectFit:"cover", opacity:.78 }}
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg, transparent 40%, rgba(0,0,0,.82))" }} />
          <div style={{ position:"absolute", left:14, bottom:14 }}>
            <div className="fd" style={{ fontSize:24, color:C.text, fontWeight:900, lineHeight:1.05 }}>{car.brand}</div>
            <div className="fd" style={{ fontSize:18, color:C.text, fontWeight:700 }}>{car.model}</div>
            <div className="fb" style={{ fontSize:12, color:T.muted, marginTop:4 }}>{car.year} · {fmtNum(car.mileage)} km</div>
          </div>
        </div>

        <div style={{ padding:14 }}>
          {!revealed ? (
            <>
              <div className="lbl" style={{ fontSize:8, color:T.faint, fontFamily:"Manrope,sans-serif", marginBottom:8 }}>TON ESTIMATION</div>
              <div className="fm" style={{ fontSize:34, color:C.text, fontWeight:700, textAlign:"center", marginBottom:8 }}>
                {fmtEUR(guess)}
              </div>
              <input
                type="range"
                min={car.min}
                max={car.max}
                step="100"
                value={guess}
                onChange={(e) => setGuess(Number(e.target.value))}
                style={{ width:"100%" }}
              />
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
                <span className="fm" style={{ fontSize:10, color:T.faint }}>{fmtEUR(car.min)}</span>
                <span className="fm" style={{ fontSize:10, color:T.faint }}>{fmtEUR(car.max)}</span>
              </div>
            </>
          ) : (
            <div className="aslam" style={{ textAlign:"center" }}>
              <div className="fd" style={{ fontSize:22, color:tierColor, fontWeight:900 }}>{lastReward.label}</div>
              <div className="fb" style={{ color:T.muted, fontSize:12, marginTop:6 }}>
                Prix réel: <span className="fm" style={{ color:C.text }}>{fmtEUR(car.actual)}</span>
              </div>
              <div className="fb" style={{ color:T.muted, fontSize:12, marginTop:3 }}>
                Erreur: <span className="fm" style={{ color:C.text }}>{lastReward.errPct}%</span>
              </div>
              <div className="fm" style={{ color:C.primary, fontSize:26, fontWeight:700, marginTop:8 }}>
                +{fmtNum(lastReward.points)}
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ flex:1 }} />

      <button
        onClick={onPrimary}
        style={{
          width:"100%",
          padding:"16px 0",
          borderRadius:16,
          background:revealed ? C.surfaceHi : C.primary,
          color:revealed ? C.text : C.bg,
          border:revealed ? `1px solid ${C.borderHi}` : "none",
          cursor:"pointer",
          fontFamily:"'Unbounded',sans-serif",
          fontWeight:700,
          fontSize:13,
          letterSpacing:"0.1em",
          marginTop:12,
        }}
      >
        {revealed ? "CONTINUER" : "VALIDER"}
      </button>
    </div>
  );
}

function CashoutSheet({ unbanked, multiplier, strikes, carsPlayed, onBank, onContinue }) {
  return (
    <div style={{
      position:"absolute",
      inset:0,
      background:"rgba(0,0,0,.55)",
      display:"flex",
      alignItems:"flex-end",
      zIndex:50,
    }}>
      <div className="ash" style={{
        width:"100%",
        padding:"20px 18px 28px",
        borderRadius:"26px 26px 0 0",
        background:C.surface,
        borderTop:`1px solid ${C.borderHi}`,
        boxShadow:"0 -20px 70px rgba(0,0,0,.55)",
      }}>
        <div className="lbl" style={{ fontSize:9, color:T.muted, fontFamily:"Manrope,sans-serif", textAlign:"center" }}>CHECKPOINT</div>
        <div className="fd" style={{ fontSize:24, fontWeight:900, textAlign:"center", color:C.text, marginTop:6 }}>
          Encaisser ou continuer?
        </div>
        <div className="fm" style={{ fontSize:42, fontWeight:700, textAlign:"center", color:C.primary, marginTop:10 }}>
          {fmtNum(unbanked)}
        </div>

        <div style={{
          display:"grid",
          gridTemplateColumns:"1fr 1fr",
          gap:10,
          marginTop:16,
        }}>
          <StatTile label="MULTIPLICATEUR" value={`x${multiplier}`} accent />
          <StatTile label="STRIKES" value={`${strikes}/${MM.MAX_STRIKES}`} />
        </div>

        <button
          onClick={onBank}
          style={{
            width:"100%",
            padding:"15px 0",
            borderRadius:14,
            background:C.primary,
            color:C.bg,
            border:"none",
            cursor:"pointer",
            fontFamily:"'Unbounded',sans-serif",
            fontWeight:700,
            fontSize:13,
            letterSpacing:"0.1em",
            marginTop:14,
          }}
        >
          ENCAISSER
        </button>

        <button
          onClick={onContinue}
          style={{
            width:"100%",
            padding:"14px 0",
            borderRadius:14,
            background:C.surfaceHi,
            color:C.text,
            border:`1px solid ${C.borderHi}`,
            cursor:"pointer",
            fontFamily:"'Unbounded',sans-serif",
            fontWeight:700,
            fontSize:12,
            letterSpacing:"0.1em",
            marginTop:10,
          }}
        >
          CONTINUER POUR x{Math.min(MM.MULT_CAP, multiplier * 2)}
        </button>
      </div>
    </div>
  );
}

function BankedResult({ banked, prevBest, carsPlayed, highestMult, xpEarned, onRestart, onHome }) {
  const animPts = useCountUp(banked, 900, banked);
  const isRecord = banked > prevBest;
  const rank = computeRank(banked);
  const pct = computePct(rank);

  return (
    <div className="ash" style={{ position:"absolute", inset:0, background:C.bg, display:"flex", flexDirection:"column" }}>
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"0 18px", overflowY:"auto" }}>
        <div className="lbl asd" style={{ fontSize:9, color:T.muted, marginTop:30, fontFamily:"Manrope,sans-serif" }}>RUN ENCAISSÉ</div>

        <div className="aslam" style={{ textAlign:"center", marginTop:10 }}>
          <div className="fm" style={{ fontSize:66, fontWeight:700, lineHeight:1, color:C.text }}>{fmtNum(animPts)}</div>
          <div className="fb" style={{ fontSize:12, color:T.muted, marginTop:4 }}>points sécurisés</div>
        </div>

        {isRecord && (
          <div className="asu fd lbl" style={{ fontSize:9, color:C.primary, marginTop:8 }}>NOUVEAU RECORD PERSONNEL !</div>
        )}

        <div className="asu" style={{
          marginTop:16,
          padding:"14px 22px",
          borderRadius:18,
          background:a(C.primary,.06),
          border:`1px solid ${a(C.primary,.18)}`,
          textAlign:"center",
          width:"100%",
        }}>
          <div className="fd" style={{ fontSize:28, fontWeight:700, color:C.primary }}>TOP {pct}%</div>
          <div className="fm" style={{ fontSize:16, fontWeight:700, color:C.text, marginTop:3 }}>#{fmtNum(rank)}</div>
          <div className="lbl" style={{ fontSize:7, color:T.faint, marginTop:3, fontFamily:"Manrope,sans-serif" }}>AUTO ORI! · AUJOURD'HUI</div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:12, width:"100%" }}>
          <StatTile label="VOITURES" value={fmtNum(carsPlayed)} />
          <StatTile label="COMBO MAX" value={`x${highestMult}`} accent />
        </div>

        {xpEarned > 0 && (
          <div className="asu" style={{
            marginTop:10,
            width:"100%",
            padding:"9px 12px",
            borderRadius:11,
            background:a(C.primary,.05),
            border:`1px solid ${a(C.primary,.16)}`,
            display:"flex",
            justifyContent:"space-between",
            alignItems:"center",
          }}>
            <span className="fb" style={{ fontSize:12, color:T.muted }}>XP gagné</span>
            <span className="fm" style={{ fontSize:13, fontWeight:700, color:C.primary }}>+{fmtNum(xpEarned)} XP</span>
          </div>
        )}
      </div>

      <div style={{ padding:"14px 18px 28px", flexShrink:0, display:"flex", flexDirection:"column", gap:10 }}>
        <button onClick={onRestart} style={{
          width:"100%",
          padding:"15px 0",
          borderRadius:14,
          background:C.primary,
          color:C.bg,
          border:"none",
          cursor:"pointer",
          fontFamily:"'Unbounded',sans-serif",
          fontWeight:700,
          fontSize:13,
          letterSpacing:"0.1em",
        }}>
          RELANCER
        </button>

        <button onClick={onHome} style={{
          width:"100%",
          padding:"13px 0",
          borderRadius:14,
          background:C.surface,
          color:C.text,
          border:`1px solid ${C.borderHi}`,
          cursor:"pointer",
          fontFamily:"'Unbounded',sans-serif",
          fontWeight:700,
          fontSize:12,
          letterSpacing:"0.1em",
        }}>
          CLASSEMENT
        </button>
      </div>
    </div>
  );
}

function BustResult({ lost, carsPlayed, highestMult, lastError, onRestart, onHome }) {
  const animLost = useCountUp(lost, 900, lost);

  return (
    <div className="ash" style={{ position:"absolute", inset:0, background:C.bg, display:"flex", flexDirection:"column" }}>
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"0 18px", overflowY:"auto" }}>
        <div className="lbl asd" style={{ fontSize:9, color:C.accent, marginTop:30, fontFamily:"Manrope,sans-serif" }}>PARTI EN FUMÉE</div>

        <div className="aslam" style={{ textAlign:"center", marginTop:10 }}>
          <div className="fm" style={{ fontSize:60, fontWeight:700, lineHeight:1, color:C.accent }}>-{fmtNum(animLost)}</div>
          <div className="fb" style={{ fontSize:12, color:T.muted, marginTop:4 }}>points non encaissés, perdus</div>
        </div>

        <div className="asu" style={{ marginTop:18, textAlign:"center" }}>
          <p className="fb" style={{ fontSize:13, color:T.muted, lineHeight:1.5 }}>
            Dernière estimation à{" "}
            <span className="fm" style={{ color:C.text, fontWeight:700 }}>{Math.round(lastError * 100)}%</span>
            {" "}du prix réel.
          </p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:20, width:"100%" }}>
          <StatTile label="VOITURES" value={fmtNum(carsPlayed)} />
          <StatTile label="COMBO MAX" value={`x${highestMult}`} />
        </div>
      </div>

      <div style={{ padding:"14px 18px 28px", flexShrink:0, display:"flex", flexDirection:"column", gap:10 }}>
        <button onClick={onRestart} style={{
          width:"100%",
          padding:"15px 0",
          borderRadius:14,
          background:C.primary,
          color:C.bg,
          border:"none",
          cursor:"pointer",
          fontFamily:"'Unbounded',sans-serif",
          fontWeight:700,
          fontSize:13,
          letterSpacing:"0.1em",
        }}>
          RECOMMENCER
        </button>

        <button onClick={onHome} style={{
          width:"100%",
          padding:"13px 0",
          borderRadius:14,
          background:C.surface,
          color:C.text,
          border:`1px solid ${C.borderHi}`,
          cursor:"pointer",
          fontFamily:"'Unbounded',sans-serif",
          fontWeight:700,
          fontSize:12,
          letterSpacing:"0.1em",
        }}>
          RETOUR
        </button>
      </div>
    </div>
  );
}

const DEFAULT_STATS = {
  bestBankedRun:14200,
  totalRuns:23,
  highestMultiplier:4,
  avgPrecision:72,
  streak:3,
};

function App() {
  const [narrow, setNarrow] = useState(window.innerWidth < 480);

  useEffect(() => {
    const fn = () => setNarrow(window.innerWidth < 480);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  const [tab, setTab] = useState("home");
  const [status, setStatus] = useState("intro");

  const [stats, setStats] = useState(DEFAULT_STATS);
  const [recentRuns, setRecentRuns] = useState(RECENT_RUNS);

  const [carIdx, setCarIdx] = useState(0);
  const [carsPlayed, setCarsPlayed] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [charge, setCharge] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [unbanked, setUnbanked] = useState(0);
  const [highestMult, setHighestMult] = useState(1);
  const [guess, setGuess] = useState(15000);
  const [revealed, setRevealed] = useState(false);
  const [lastReward, setLastReward] = useState(null);
  const [showCashout, setShowCashout] = useState(false);

  const [bankedTotal, setBankedTotal] = useState(0);
  const [prevBest, setPrevBest] = useState(0);
  const xpEarned = useRef(0);

  const car = MAIN_POOL[carIdx];

  const startRun = () => {
    const idx = pickNext(-1);
    setCarIdx(idx);
    setGuess(midGuess(MAIN_POOL[idx]));
    setCarsPlayed(0);
    setMultiplier(1);
    setCharge(0);
    setStrikes(0);
    setUnbanked(0);
    setHighestMult(1);
    setRevealed(false);
    setLastReward(null);
    setShowCashout(false);
    setPrevBest(stats.bestBankedRun);
    setStatus("playing");
  };

  const handleValidate = () => {
    if (navigator.vibrate) navigator.vibrate(25);

    const reward = resolveHit(guess, car.actual, multiplier, strikes);
    setLastReward(reward);
    setRevealed(true);

    if (!reward.bust) {
      setUnbanked(u => u + reward.points);
      setStrikes(reward.newStrikes);
    }
  };

  const handleNext = () => {
    if (lastReward && lastReward.bust) {
      xpEarned.current = 0;
      commitStats(0);
      setStatus("busted");
      return;
    }

    const newCarsPlayed = carsPlayed + 1;
    setCarsPlayed(newCarsPlayed);
    setRevealed(false);
    setLastReward(null);

    if (lastReward && lastReward.strikeAdded) {
      setCharge(0);
      setMultiplier(1);
      const idx = pickNext(carIdx);
      setCarIdx(idx);
      setGuess(midGuess(MAIN_POOL[idx]));
      return;
    }

    const newCharge = charge + 1;
    setHighestMult(h => Math.max(h, multiplier));

    if (newCharge >= MM.CHECKPOINT) {
      setCharge(newCharge);
      setShowCashout(true);
      return;
    }

    setCharge(newCharge);
    const idx = pickNext(carIdx);
    setCarIdx(idx);
    setGuess(midGuess(MAIN_POOL[idx]));
  };

  const handleBank = () => {
    xpEarned.current = xpForBank(unbanked, carsPlayed);
    commitStats(unbanked);
    setBankedTotal(unbanked);
    setShowCashout(false);
    setStatus("banked");
  };

  const handleContinue = () => {
    const newMult = Math.min(MM.MULT_CAP, multiplier * 2);
    setMultiplier(newMult);
    setHighestMult(h => Math.max(h, newMult));
    setCharge(0);
    setShowCashout(false);

    const idx = pickNext(carIdx);
    setCarIdx(idx);
    setGuess(midGuess(MAIN_POOL[idx]));
  };

  const commitStats = (banked) => {
    setStats(prev => ({
      ...prev,
      bestBankedRun:Math.max(prev.bestBankedRun, banked),
      totalRuns:prev.totalRuns + 1,
      highestMultiplier:Math.max(prev.highestMultiplier, highestMult),
    }));

    if (banked > 0) {
      setRecentRuns(prev => {
        const id = "M-" + (120 + prev.length);
        const rank = computeRank(banked);
        const pct = computePct(rank);
        return [{ id, date:"20 avr", score:banked, percentile:pct }, ...prev].slice(0, 10);
      });
    }
  };

  const phoneW = narrow ? "100%" : 390;
  const phoneH = narrow ? "100dvh" : 844;

  return (
    <div style={{
      width:"100%",
      minHeight:"100vh",
      display:"flex",
      alignItems:"center",
      justifyContent:"center",
      background:narrow ? C.bg : "#030304",
      fontFamily:"Manrope, sans-serif",
    }}>
      <style>{FONT_STYLES}</style>

      <div style={{
        position:"relative",
        overflow:"hidden",
        width:phoneW,
        height:phoneH,
        background:C.bg,
        borderRadius:narrow ? 0 : 52,
        border:narrow ? "none" : "1px solid rgba(255,255,255,0.08)",
        boxShadow:narrow ? "none" : "0 48px 120px rgba(0,0,0,0.85), 0 0 0 10px #0f0f10",
        color:C.text,
      }}>
        <div style={{
          position:"absolute",
          top:0,
          left:0,
          right:0,
          zIndex:100,
          display:"flex",
          justifyContent:"space-between",
          alignItems:"center",
          padding:"14px 24px 0",
          fontSize:12,
          fontWeight:600,
          color:C.text,
          pointerEvents:"none",
        }}>
          <span>9:41</span>
          <span style={{ fontSize:10, opacity:.35 }}>●●●●● 5G</span>
        </div>

        {status === "intro" && (
          <div style={{ position:"absolute", inset:0, paddingTop:36, display:"flex", flexDirection:"column" }}>
            <div style={{ flex:1, minHeight:0, overflow:"hidden" }}>
              {tab === "home" && <IntroState onPlay={startRun} stats={stats} />}
              {tab === "profile" && <ProfileTab stats={stats} recentRuns={recentRuns} />}
            </div>
            <BottomNav activeTab={tab} onChange={setTab} />
          </div>
        )}

        {status === "playing" && (
          <div style={{ position:"absolute", inset:0, paddingTop:36 }}>
            <PlayScreen
              car={car}
              carsPlayed={carsPlayed}
              multiplier={multiplier}
              charge={charge}
              strikes={strikes}
              unbanked={unbanked}
              revealed={revealed}
              guess={guess}
              setGuess={setGuess}
              lastReward={lastReward}
              onPrimary={revealed ? handleNext : handleValidate}
            />

            {showCashout && (
              <CashoutSheet
                unbanked={unbanked}
                multiplier={multiplier}
                strikes={strikes}
                carsPlayed={carsPlayed}
                onBank={handleBank}
                onContinue={handleContinue}
              />
            )}
          </div>
        )}

        {status === "banked" && (
          <BankedResult
            banked={bankedTotal}
            prevBest={prevBest}
            carsPlayed={carsPlayed}
            highestMult={highestMult}
            xpEarned={xpEarned.current}
            onRestart={startRun}
            onHome={() => { setStatus("intro"); setTab("home"); }}
          />
        )}

        {status === "busted" && (
          <BustResult
            lost={unbanked}
            carsPlayed={carsPlayed}
            highestMult={highestMult}
            lastError={lastReward?.err ?? 0}
            onRestart={startRun}
            onHome={() => { setStatus("intro"); setTab("home"); }}
          />
        )}
      </div>

      {!narrow && (
        <div style={{
          position:"fixed",
          bottom:16,
          left:"50%",
          transform:"translateX(-50%)",
          fontSize:11,
          color:"#333",
          fontFamily:"Manrope, sans-serif",
          pointerEvents:"none",
        }}>
          Joue sur mobile pour la meilleure expérience
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
  </script>
</body>
</html>