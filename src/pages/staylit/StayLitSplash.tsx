import logo from "../../assets/staylit-logo.gif";

export default function StayLitSplash() {
  return (
    <div
      style={{
        minHeight: "calc(100vh - 80px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        textAlign: "center",
      }}
    >
      {/* Flicker CSS (inline + guaranteed to load) */}
      <style>{`
        @keyframes slFlameFlicker {
          0%   { transform: translateY(0px)   rotate(-10deg) scale(1.00) translateZ(0); filter: drop-shadow(0 0 10px rgba(251,191,36,0.85)); opacity: .92; }
          12%  { transform: translateY(-4px)  rotate( 12deg) scale(1.18) translateZ(0); filter: drop-shadow(0 0 18px rgba(245,158,11,0.95)); opacity: 1; }
          28%  { transform: translateY(-7px)  rotate( -8deg) scale(1.26) translateZ(0); filter: drop-shadow(0 0 24px rgba(251,146,60,0.95)); opacity: .98; }
          45%  { transform: translateY(-3px)  rotate( 10deg) scale(1.16) translateZ(0); filter: drop-shadow(0 0 16px rgba(253,186,116,0.90)); opacity: 1; }
          63%  { transform: translateY(-9px)  rotate(-12deg) scale(1.30) translateZ(0); filter: drop-shadow(0 0 26px rgba(251,113,133,0.45)); opacity: .92; }
          78%  { transform: translateY(-5px)  rotate(  8deg) scale(1.22) translateZ(0); filter: drop-shadow(0 0 20px rgba(251,191,36,0.95)); opacity: 1; }
          92%  { transform: translateY(-2px)  rotate( -6deg) scale(1.10) translateZ(0); filter: drop-shadow(0 0 14px rgba(253,186,116,0.85)); opacity: .96; }
          100% { transform: translateY(0px)   rotate(-10deg) scale(1.00) translateZ(0); filter: drop-shadow(0 0 10px rgba(251,191,36,0.85)); opacity: .92; }
        }
        .slFlame {
          display: inline-block;
          transform-origin: 50% 85%;
          animation: slFlameFlicker 0.75s infinite;
          will-change: transform, filter, opacity;
        }
        /* A subtle second aura that pulses behind the title */
        @keyframes slAuraPulse {
          0% { opacity: .25; transform: scale(1); }
          50% { opacity: .45; transform: scale(1.06); }
          100% { opacity: .25; transform: scale(1); }
        }
        .slAura {
          position: absolute;
          inset: -10px -18px;
          background: radial-gradient(circle at 50% 40%, rgba(59,130,246,.30), rgba(0,0,0,0) 65%);
          filter: blur(10px);
          animation: slAuraPulse 2.2s ease-in-out infinite;
          pointer-events: none;
        }
      `}</style>

      <div
        className="stack"
        style={{
          width: "100%",
          maxWidth: 1100,
          margin: "0 auto",
          gap: 26,
          justifyItems: "center",
        }}
      >
        {/* HERO */}
        <section
          className="panel card"
          style={{
            width: "100%",
            padding: 32,
            textAlign: "center",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            display: "flex",
            background: "rgba(10,10,15,0.75)",
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(148,163,184,0.15)",
            boxShadow: "0 0 30px rgba(59,130,246,0.25)",
          }}
        >
          <div className="card-center" style={{ gap: 16, width: "100%", justifyContent: "center", alignItems: "center" }}>
            {/* LOGO */}
            <img
              src={logo}
              alt="Stay Lit Logo"
              style={{
                width: 92,
                height: 92,
                objectFit: "contain",
                marginBottom: 6,
                filter: "drop-shadow(0 0 16px rgba(59,130,246,0.6))",
              }}
            />

            {/* BRAND TAG */}
            <div
              style={{
                fontWeight: 900,
                letterSpacing: "0.22em",
                fontSize: 12,
                color: "#60a5fa",
                textTransform: "uppercase",
              }}
            >
              Stay Lit Candle Co.
            </div>

            {/* MAIN TITLE */}
            <div style={{ position: "relative", display: "inline-block" }}>
              <div className="slAura" />
              <h1
                style={{
                  margin: 0,
                  fontSize: "clamp(2.2rem, 5vw, 3.2rem)",
                  fontWeight: 950,
                  letterSpacing: "0.04em",
                  background: "linear-gradient(90deg,#ffffff,#93c5fd,#ffffff)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: "0 0 20px rgba(147,197,253,0.4)",
                  position: "relative",
                }}
              >
                <span className="slFlame" style={{ fontSize: "1.15em", marginRight: 10, color: "#fbbf24", WebkitTextFillColor: "#fbbf24" }}>🔥</span> STAY LIT
              </h1>
            </div>

            {/* SUBTITLE */}
            <div
              style={{
                fontWeight: 900,
                fontSize: 18,
                letterSpacing: "0.08em",
                color: "#e5e7eb",
              }}
            >
              Urban • Luxury • Hand-Poured
            </div>

            {/* DESCRIPTION */}
            <div
              style={{
                fontWeight: 800,
                maxWidth: 820,
                color: "#cbd5f5",
                lineHeight: 1.6,
                fontSize: 15,
              }}
            >
              Hand-poured candles built for atmosphere, focus, and relaxation. Choose a ready-to-ship candle — or
              design your own with custom scent, jar, and wick.
            </div>

            {/* FEATURES */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 14,
                fontWeight: 850,
                color: "#93c5fd",
                letterSpacing: "0.05em",
                marginTop: 4,
              }}
            >
              <span>Clean Burn</span>
              <span>•</span>
              <span>Premium Wax</span>
              <span>•</span>
              <span>Long Lasting</span>
            </div>
          </div>
        </section>

        {/* OPTIONS */}
        <section
          style={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
            justifyItems: "center",
          }}
        >
          {/* PREMADE */}
          <article
            className="panel card"
            style={{
              display: "grid",
              gap: 14,
              textAlign: "center",
              padding: 24,
              width: "100%",
              maxWidth: 520,
              background: "rgba(15,23,42,0.7)",
              border: "1px solid rgba(148,163,184,0.15)",
              boxShadow: "0 0 18px rgba(59,130,246,0.2)",
            }}
          >
            <div style={{ fontSize: 46 }}>🕯️</div>

            <h2
              style={{
                margin: 0,
                fontWeight: 900,
                letterSpacing: "0.06em",
                color: "#f8fafc",
              }}
            >
              PRE-MADE CANDLES
            </h2>

            <div
              style={{
                fontWeight: 800,
                color: "#c7d2fe",
                lineHeight: 1.5,
              }}
            >
              Ready now. Pick your scent and we’ll handle the rest.
            </div>

            <a className="btn btn-primary" href="/staylit/shop">
              Browse Collection
            </a>
          </article>

          {/* CUSTOM */}
          <article
            className="panel card"
            style={{
              display: "grid",
              gap: 14,
              textAlign: "center",
              padding: 24,
              width: "100%",
              maxWidth: 520,
              background: "rgba(15,23,42,0.7)",
              border: "1px solid rgba(148,163,184,0.15)",
              boxShadow: "0 0 18px rgba(59,130,246,0.2)",
            }}
          >
            <div style={{ fontSize: 46 }}>🧪</div>

            <h2
              style={{
                margin: 0,
                fontWeight: 900,
                letterSpacing: "0.06em",
                color: "#f8fafc",
              }}
            >
              CUSTOM BUILD
            </h2>

            <div
              style={{
                fontWeight: 800,
                color: "#c7d2fe",
                lineHeight: 1.5,
              }}
            >
              Design your own candle. Scent. Jar. Wick. Your style.
            </div>

            <a className="btn btn-primary" href="/staylit/create">
              Build Yours
            </a>
          </article>
        </section>

        {/* FOOTER */}
        <section className="card-center">
          <div
            style={{
              fontWeight: 850,
              maxWidth: 900,
              color: "#94a3b8",
              letterSpacing: "0.04em",
            }}
          >
            Perfect for gifts, events, and branded scents. Bulk orders available.
          </div>
        </section>
      </div>
    </div>
  );
}
