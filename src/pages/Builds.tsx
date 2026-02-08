import { Link } from "react-router-dom";
import { readBuilds } from "../lib/buildsStore";

export default function Builds() {
  const count = readBuilds().length;

  return (
    <div className="stack page" style={{ gap: 16 }}>
      <section className="panel card card-center" style={{ maxWidth: 980, margin: "0 auto", padding: 18 }}>
        <h1 className="h2" style={{ margin: 0, fontWeight: 950 }}>Custom Builds</h1>
        <p className="lead" style={{ maxWidth: 820 }}>
          Design a custom woodworking build and submit it for review. You’ll see only 3D render previews + an estimate as we generate each view.
        </p>

        <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
          <Link className="btn btn-primary" to="/builds/new" style={{ fontWeight: 950 }}>Start a Build</Link>
          <Link className="btn btn-ghost" to="/builds/portal" style={{ fontWeight: 900 }}>Build Portal</Link>
          <span className="badge" style={{ justifyContent: "center" }}>Saved builds on this device: {count}</span>
        </div>

        <div className="muted" style={{ fontWeight: 850, marginTop: 10, maxWidth: 900, textAlign: "center" }}>
          Tip: Your Build Access Code appears after you submit. Use it in the Build Portal to view the build on this device/browser.
        </div>
      </section>

      <section className="panel card card-center" style={{ maxWidth: 980, margin: "0 auto", padding: 18 }}>
        <h3 className="h3" style={{ margin: 0 }}>What you’ll submit</h3>
        <div className="body" style={{ maxWidth: 860, marginTop: 10 }}>
          <div style={{ display: "grid", gap: 8, fontWeight: 900 }}>
            <div>• Your dimensions + style choices</div>
            <div>• Optional inspiration photos</div>
            <div>• 3D render previews (multiple angles)</div>
            <div>• A live-updating estimate per render</div>
          </div>
        </div>
      </section>
    </div>
  );
}
