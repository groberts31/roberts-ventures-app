import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import rvLogo from "../assets/roberts-ventures-logo.png";
import { useHomeVisibility } from "../config/homeVisibility";

export default function Home() {
  const ADMIN_DASH_UI_KEY = "rv_admin_dashboard_ui_v1";
  const vis: any = useHomeVisibility();
  const [showHomeAdminLink, setShowHomeAdminLink] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem(ADMIN_DASH_UI_KEY);
      if (!raw) return false;
      const v: any = JSON.parse(raw);
      return v?.showHomeAdminLink === true;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const sync = () => {
      try {
        const raw = localStorage.getItem(ADMIN_DASH_UI_KEY);
        if (!raw) return setShowHomeAdminLink(false);
        const v: any = JSON.parse(raw);
        setShowHomeAdminLink(v?.showHomeAdminLink === true);
      } catch {
        setShowHomeAdminLink(false);
      }
    };

    window.addEventListener("storage", sync);
    window.addEventListener("rv_admin_dashboard_ui_changed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("rv_admin_dashboard_ui_changed", sync);
    };
  }, []);
  // Safe fallbacks (if the config doesn’t have these yet, default to visible)
  const splash = vis?.splash ?? true;
  const ctas = vis?.ctas ?? true;
  const quickCards = vis?.quickCards ?? true;
  const twoPanelSplash = vis?.twoPanelSplash ?? true;

  const heroCtas = vis?.heroCtas ?? {};
  const heroCards = vis?.heroCards ?? {};
  const twoPanelLeftButtons = vis?.twoPanelLeftButtons ?? {};
  const twoPanelRightButtons = vis?.twoPanelRightButtons ?? {};

  const showBrowseServices = heroCtas?.browseServices ?? true;
  const showScheduleRequest = heroCtas?.scheduleRequest ?? true;
  const showHeroCustomBuilds = heroCtas?.customBuilds ?? true;
  const showHeroStayLit = heroCtas?.stayLit ?? true;

  const showCardClearPricing = heroCards?.clearPricing ?? true;
  const showCardFastScheduling = heroCards?.fastScheduling ?? true;
  const showCardQualityWork = heroCards?.qualityWork ?? true;
  const showCardStayLitInside = heroCards?.stayLitInside ?? true;

  const showLeftViewCatalog = twoPanelLeftButtons?.viewCatalog ?? true;
  const showLeftCustomBuilds = twoPanelLeftButtons?.customBuilds ?? true;
  const showLeftGoToSchedule = twoPanelLeftButtons?.goToSchedule ?? true;
  const showLeftContact = twoPanelLeftButtons?.contact ?? true;

  const showRightEnterStayLit = twoPanelRightButtons?.enterStayLit ?? true;
  const showRightBackToServices = twoPanelRightButtons?.backToServices ?? true;

  return (
    <div className="stack page page-enter" style={{ gap: 18 }}>
      {/* HERO / SPLASH */}
      {splash && (
        <section
          className="panel card glow-panel"
          style={{
            padding: 22,
            borderRadius: 18,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Subtle futuristic accent */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: -80,
              background:
                "radial-gradient(circle at 20% 10%, rgba(29,78,216,0.18), transparent 40%), radial-gradient(circle at 90% 30%, rgba(34,197,94,0.14), transparent 45%), radial-gradient(circle at 50% 110%, rgba(245,158,11,0.12), transparent 55%)",
              filter: "blur(2px)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "relative",
              display: "grid",
              gap: 14,
              justifyItems: "center",
              textAlign: "center",
            }}
          >
            {/* Logo */}
            <img
              src={rvLogo}
              alt="Roberts Ventures LLC"
              style={{
                width: 92,
                height: 92,
                objectFit: "contain",
                filter: "drop-shadow(0 0 18px rgba(56,189,248,.22))",
                marginTop: 2,
              }}
            />

            <div className="badge" style={{ width: "fit-content" }}>
              Roberts Ventures LLC
            </div>

            {showHomeAdminLink && (
              <Link
                to="/admin/login"
                className="btn btn-ghost"
                style={{
                  padding: "8px 14px",
                  fontWeight: 950,
                  textDecoration: "none",
                  border: "1px solid rgba(148,163,184,0.22)",
                  background: "rgba(255,255,255,0.06)",
                }}
                title="Admin login"
              >
                Admin
              </Link>
            )}

            <h1
              className="h1"
              style={{
                margin: 0,
                fontWeight: 950,
                letterSpacing: -0.6,
                lineHeight: 1.05,
                color: "var(--head-accent)",
              }}
            >
              Modern home services,
              <br />
              woodworking & projects — done right.
            </h1>

            <p
              className="lead"
              style={{
                margin: 0,
                maxWidth: 860,
                fontWeight: 800,
                color: "var(--head-accent)",
                opacity: 0.82,
                lineHeight: 1.35,
              }}
            >
              Pick a service, customize with add-ons, and send a request in minutes. From TV mounting and ceiling fans to
              custom shelving, deck repair, and haul-away.
            </p>

            {/* CTA buttons */}
            {ctas && (
              <div
                className="row"
              style={{
                gap: 10,
                flexWrap: "wrap",
                marginTop: 4,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {showBrowseServices && (
                <Link
                  to="/services"
                  className="btn btn-primary"
                  style={{
                    padding: "10px 16px",
                    fontWeight: 950,
                    boxShadow: "0 10px 26px rgba(29,78,216,0.22)",
                  }}
                >
                  Browse Services →
                </Link>
              )}

              {showScheduleRequest && (
                <Link
                  to="/schedule"
                  className="btn btn-ghost"
                  style={{
                    padding: "10px 16px",
                    fontWeight: 950,
                  }}
                >
                  Schedule / Request
                </Link>
              )}

              {showHeroCustomBuilds && (
                <Link
                  to="/builds"
                  className="btn btn-ghost"
                  style={{
                    padding: "10px 16px",
                    fontWeight: 950,
                  }}
                >
                  Custom Builds
                </Link>
              )}

              {showHeroStayLit && (
                <Link
                  to="/staylit"
                  className="btn btn-ghost"
                  style={{
                    padding: "10px 16px",
                    fontWeight: 950,
                  }}
                >
                  Stay Lit Candle Co. ✨
                </Link>
              )}
                          </div>
            )}

            {/* Quick trust/feature cards */}
            {quickCards && (
              <div
                style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                gap: 10,
                marginTop: 10,
                width: "100%",
              }}
            >
              {showCardClearPricing && (
                <div className="panel" style={{ padding: 12, borderRadius: 14 }}>
                  <div style={{ fontWeight: 950, color: "var(--head-accent)" }}>Clear pricing</div>
                  <div className="sub-accent" style={{ fontWeight: 850, marginTop: 6 }}>
                    Prices shown when fixed/starting — quotes when needed.
                  </div>
                </div>
              )}

              {showCardFastScheduling && (
                <div className="panel" style={{ padding: 12, borderRadius: 14 }}>
                  <div style={{ fontWeight: 950, color: "var(--head-accent)" }}>Fast scheduling</div>
                  <div className="sub-accent" style={{ fontWeight: 850, marginTop: 6 }}>
                    Select services + add-ons and send your request quickly.
                  </div>
                </div>
              )}

              {showCardQualityWork && (
                <div className="panel" style={{ padding: 12, borderRadius: 14 }}>
                  <div style={{ fontWeight: 950, color: "var(--head-accent)" }}>Quality work</div>
                  <div className="sub-accent" style={{ fontWeight: 850, marginTop: 6 }}>
                    Clean finish, professional approach, and communication.
                  </div>
                </div>
              )}

              {showCardStayLitInside && (
                <div className="panel" style={{ padding: 12, borderRadius: 14 }}>
                  <div style={{ fontWeight: 950, color: "var(--head-accent)" }}>Stay Lit inside</div>
                  <div className="sub-accent" style={{ fontWeight: 850, marginTop: 6 }}>
                    Candle business lives inside the Roberts Ventures site.
                  </div>
                </div>
              )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* TWO-PANEL SPLASH: Services vs Stay Lit */}
      {twoPanelSplash && (
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 14,
          }}
        >
          {/* Left: Roberts Ventures */}
          <div
            className="panel card card-center glow-panel"
            style={{
              padding: 18,
              borderRadius: 18,
              textAlign: "center",
            }}
          >
            <div className="badge" style={{ width: "fit-content" }}>
              Home Services • Outdoor • Woodworking
            </div>

            <h2 className="h2" style={{ marginTop: 10, marginBottom: 8, fontWeight: 950 }}>
              Book your next project
            </h2>

            <p className="body" style={{ margin: 0, fontWeight: 800, opacity: 0.82, maxWidth: 700 }}>
              <span className="sub-accent">Browse the catalog, pick add-ons (like cable concealment or haul-away),</span>{" "}
              and send details so we can confirm and schedule.
            </p>

            <div className="row" style={{ gap: 10, flexWrap: "wrap", marginTop: 14, justifyContent: "center" }}>
              {showLeftViewCatalog && (
                <Link to="/services" className="btn btn-primary" style={{ fontWeight: 950 }}>
                  View Catalog
                </Link>
              )}
              {showLeftCustomBuilds && (
                <Link to="/builds" className="btn btn-ghost" style={{ fontWeight: 950 }}>
                  Custom Builds
                </Link>
              )}
              {showLeftGoToSchedule && (
                <Link to="/schedule" className="btn btn-ghost" style={{ fontWeight: 950 }}>
                  Go to Schedule
                </Link>
              )}
              {showLeftContact && (
                <Link to="/contact" className="btn btn-ghost" style={{ fontWeight: 950 }}>
                  Contact
                </Link>
              )}
            </div>
          </div>

          {/* Right: Stay Lit */}
          <div
            className="panel card card-center glow-panel"
            style={{
              padding: 18,
              borderRadius: 18,
              textAlign: "center",
            }}
          >
            <div className="badge" style={{ width: "fit-content" }}>
              Stay Lit Candle Co.
            </div>

            <h2 className="h2" style={{ marginTop: 10, marginBottom: 8, fontWeight: 950 }}>
              Candles with a vibe
            </h2>

            <p className="body" style={{ margin: 0, fontWeight: 800, opacity: 0.82, maxWidth: 700 }}>
              A dedicated area inside the Roberts Ventures app — perfect for future product listings, bundles, and
              ordering.
            </p>

            <div className="row" style={{ gap: 10, flexWrap: "wrap", marginTop: 14, justifyContent: "center" }}>
              {showRightEnterStayLit && (
                <Link to="/staylit" className="btn btn-primary" style={{ fontWeight: 950 }}>
                  Enter Stay Lit
                </Link>
              )}
              {showRightBackToServices && (
                <Link to="/services" className="btn btn-ghost" style={{ fontWeight: 950 }}>
                  Back to Services
                </Link>
              )}
            </div>

            <div className="panel" style={{ marginTop: 14, padding: 12, borderRadius: 14 }}>
              <div style={{ fontWeight: 950, color: "var(--head-accent)" }}>Coming soon</div>
              <div className="sub-accent" style={{ fontWeight: 850, marginTop: 6 }}>
                Product grid, scent filters, bundles, gift notes, and checkout.
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
