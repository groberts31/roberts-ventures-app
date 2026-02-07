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
      <div
        className="stack"
        style={{
          width: "100%",
          maxWidth: 1100,
          gap: 26,
        }}
      >
        {/* HERO */}
        <section
          className="panel card"
          style={{
            width: "100%",
            padding: 32,
            textAlign: "center",
            background: "rgba(10,10,15,0.75)",
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(148,163,184,0.15)",
            boxShadow: "0 0 30px rgba(59,130,246,0.25)",
          }}
        >
          <div className="card-center" style={{ gap: 16 }}>

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
              }}
            >
              🔥 STAY LIT
            </h1>

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
              Hand-poured candles built for atmosphere, focus, and relaxation.
              Choose a ready-to-ship candle — or design your own with custom scent,
              jar, and wick.
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
