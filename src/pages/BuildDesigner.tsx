import { useMemo, useState } from "react";
import { createDraftBuild, type BuildOptions, type BuildDims } from "../lib/buildsStore";

function num(v: any, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export default function BuildDesigner() {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  const [type, setType] = useState("Table");
  const [lengthIn, setLengthIn] = useState(60);
  const [widthIn, setWidthIn] = useState(30);
  const [heightIn, setHeightIn] = useState(30);
  const [topThicknessIn, setTopThicknessIn] = useState(1.5);

  const [woodSpecies, setWoodSpecies] = useState<BuildOptions["woodSpecies"]>("Pine");
  const [finish, setFinish] = useState<BuildOptions["finish"]>("Natural");
  const [joinery, setJoinery] = useState<BuildOptions["joinery"]>("Pocket Holes");

  const [notes, setNotes] = useState("");

  const dims: BuildDims = useMemo(
    () => ({
      lengthIn: Math.max(12, num(lengthIn, 60)),
      widthIn: Math.max(10, num(widthIn, 30)),
      heightIn: Math.max(10, num(heightIn, 30)),
      topThicknessIn: Math.max(0.5, num(topThicknessIn, 1.5)),
    }),
    [lengthIn, widthIn, heightIn, topThicknessIn]
  );

  const options: BuildOptions = useMemo(
    () => ({ woodSpecies, finish, joinery }),
    [woodSpecies, finish, joinery]
  );

  function onStart() {
    if (!customerName.trim() || !customerPhone.trim() || !customerEmail.trim()) {
      alert("Please enter name, phone, and email.");
      return;
    }

    const draft = createDraftBuild({
      customer: {
        name: customerName.trim(),
        phone: customerPhone.trim(),
        email: customerEmail.trim(),
        address: customerAddress.trim() || "",
      },
      type,
      dims,
      options,
      notes,
    });

    window.location.href = `/builds/${draft.id}`;
  }

  return (
    <div className="stack page" style={{ gap: 16 }}>
      <section className="panel card card-center" style={{ maxWidth: 980, margin: "0 auto", padding: 18 }}>
        <h1 className="h2" style={{ margin: 0, fontWeight: 950 }}>Start a Custom Build</h1>
        <p className="lead" style={{ maxWidth: 820 }}>
          Fill in your project details. On the next screen you’ll see 3D render previews + estimate boxes update as each view completes.
        </p>

        <div className="panel" style={{ padding: 14, borderRadius: 14, width: "100%", maxWidth: 860 }}>
          <div style={{ fontWeight: 950, color: "#0f172a" }}>Contact Info (required)</div>
          <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
            <input className="field" placeholder="Full Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            <input className="field" placeholder="Phone Number" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
            <input className="field" placeholder="Email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
            <input className="field" placeholder="Address (optional)" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} />
          </div>
        </div>

        <div className="panel" style={{ padding: 14, borderRadius: 14, width: "100%", maxWidth: 860 }}>
          <div style={{ fontWeight: 950, color: "#0f172a" }}>Project Basics</div>

          <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span className="label">Project Type</span>
              <select className="field" value={type} onChange={(e) => setType(e.target.value)}>
                <option>Table</option>
                <option>Bench</option>
                <option>Shelf</option>
                <option>Cabinet</option>
                <option>Planter Box</option>
                <option>Workbench</option>
              </select>
            </label>

            <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
              <label style={{ display: "grid", gap: 6, flex: 1, minWidth: 160 }}>
                <span className="label">Length (in)</span>
                <input className="field" inputMode="numeric" value={lengthIn} onChange={(e) => setLengthIn(Number(e.target.value))} />
              </label>
              <label style={{ display: "grid", gap: 6, flex: 1, minWidth: 160 }}>
                <span className="label">Width (in)</span>
                <input className="field" inputMode="numeric" value={widthIn} onChange={(e) => setWidthIn(Number(e.target.value))} />
              </label>
              <label style={{ display: "grid", gap: 6, flex: 1, minWidth: 160 }}>
                <span className="label">Height (in)</span>
                <input className="field" inputMode="numeric" value={heightIn} onChange={(e) => setHeightIn(Number(e.target.value))} />
              </label>
              <label style={{ display: "grid", gap: 6, flex: 1, minWidth: 160 }}>
                <span className="label">Top thickness (in)</span>
                <input className="field" inputMode="decimal" value={topThicknessIn} onChange={(e) => setTopThicknessIn(Number(e.target.value))} />
              </label>
            </div>

            <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
              <label style={{ display: "grid", gap: 6, flex: 1, minWidth: 220 }}>
                <span className="label">Wood Species</span>
                <select className="field" value={woodSpecies} onChange={(e) => setWoodSpecies(e.target.value as any)}>
                  <option value="Pine">Pine</option>
                  <option value="Poplar">Poplar</option>
                  <option value="Plywood">Plywood</option>
                  <option value="Oak">Oak</option>
                  <option value="Maple">Maple</option>
                  <option value="Walnut">Walnut</option>
                </select>
              </label>

              <label style={{ display: "grid", gap: 6, flex: 1, minWidth: 220 }}>
                <span className="label">Finish</span>
                <select className="field" value={finish} onChange={(e) => setFinish(e.target.value as any)}>
                  <option value="Natural">Natural</option>
                  <option value="Stain">Stain</option>
                  <option value="Paint">Paint</option>
                  <option value="Poly">Poly</option>
                </select>
              </label>

              <label style={{ display: "grid", gap: 6, flex: 1, minWidth: 220 }}>
                <span className="label">Joinery Preference</span>
                <select className="field" value={joinery} onChange={(e) => setJoinery(e.target.value as any)}>
                  <option value="Screws">Screws</option>
                  <option value="Pocket Holes">Pocket Holes</option>
                  <option value="Dowels">Dowels</option>
                  <option value="Mortise & Tenon">Mortise & Tenon</option>
                </select>
              </label>
            </div>

            <label style={{ display: "grid", gap: 6 }}>
              <span className="label">Notes / Special Requests</span>
              <textarea className="field" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Example: tapered legs, lower shelf, rounded corners, hidden fasteners, etc." />
            </label>

            <button className="btn btn-primary" onClick={onStart} style={{ fontWeight: 950 }}>
              Generate Render Previews →
            </button>

            <div className="muted" style={{ fontWeight: 850 }}>
              You’ll receive an Access Code after submission to view your build in the Build Portal.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
