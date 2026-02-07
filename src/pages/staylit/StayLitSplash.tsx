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
          gap: 22,
        }}
      >
        {/* HERO / SPLASH */}
        <section
          className="panel card"
          style={{
            width: "100%",
            padding: 28,
            textAlign: "center",
          }}
        >
          <div className="card-center" style={{ gap: 14 }}>

            {/* LOGO */}
            <img
              src={logo}
              alt="Stay Lit Logo"
              style={{
                width: 90,
                height: 90,
                objectFit: "contain",
                marginBottom: 6,
                filter: "drop-shadow(0 0 14px rgba(255,255,255,0.35))",
              }}
            />

            <div className="badge" style={{ width: "fit-content" }}>
              Stay Lit Candle Co.
            </div>

            <h1 className="h2" style={{ margin: 0 }}>
              🔥 Stay Lit Candle Co.
            </h1>

            <div className="muted" style={{ fontWeight: 850, maxWidth: 820 }}>
              Hand-poured candles made for atmosphere, focus, and relaxation.
              Choose a ready-to-ship candle — or create your own by selecting scent, jar, and wick.
            </div>

            <div style={{ fontWeight: 900 }}>
              Clean burn • Premium wax • Long lasting
            </div>
          </div>
        </section>

        {/* TWO PATHS */}
        <section
          style={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 18,
          }}
        >
          {/* Pre-made */}
          <article
            className="panel card"
            style={{
              display: "grid",
              gap: 12,
              textAlign: "center",
              padding: 22,
            }}
          >
            <div style={{ fontSize: 44 }}>🕯️</div>

            <h2 className="h3" style={{ margin: 0 }}>
              Shop Pre-Made Candles
            </h2>

            <div className="muted" style={{ fontWeight: 850 }}>
              Ready now. Pick your scent and we’ll get it shipped or ready for pickup.
            </div>

            <a className="btn btn-primary" href="/staylit/shop">
              Browse Candles
            </a>
          </article>

          {/* Build your own */}
          <article
            className="panel card"
            style={{
              display: "grid",
              gap: 12,
              textAlign: "center",
              padding: 22,
            }}
          >
            <div style={{ fontSize: 44 }}>🧪</div>

            <h2 className="h3" style={{ margin: 0 }}>
              Create Your Own Candle
            </h2>

            <div className="muted" style={{ fontWeight: 850 }}>
              Choose your Scent + Jar Type + Wick Type. See your price instantly.
            </div>

            <a className="btn btn-primary" href="/staylit/create">
              Build Your Candle
            </a>
          </article>
        </section>

        {/* FOOTER NOTE */}
        <section className="card-center">
          <div className="muted" style={{ fontWeight: 850, maxWidth: 900 }}>
            Tip: Custom candles are great for gifts, events, and brand scents.
            Bulk and corporate orders available.
          </div>
        </section>
      </div>
    </div>
  );
}
