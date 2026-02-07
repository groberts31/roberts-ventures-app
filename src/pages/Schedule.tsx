import { useMemo, useState } from "react";
import { useCart } from "../data/requestCart";
import { SERVICES } from "../data/services";
import { ADD_ONS } from "../data/addOns";
import { AVAILABILITY } from "../data/availability";
import {
  addDays,
  buildSlotsForDate,
  clampToMidnight,
  formatDateInput,
  formatTimeLabel,
  isOpenDay,
} from "../data/timeSlots";

type PhotoAttachment = {
  name: string;
  type: string;
  dataUrl: string;
};

type ContactInfo = {
  name: string;
  phone: string;
  address: string;
  notes: string;
  photos: PhotoAttachment[];
};

const MAX_PHOTOS = 6;
const MAX_BYTES_PER_PHOTO = 1_200_000;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("Failed to read image"));
    r.readAsDataURL(file);
  });
}

function money(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export default function Schedule() {
  const cart = useCart();

  const ALL_SERVICES = useMemo(() => [...SERVICES, ...ADD_ONS], []);

  const itemsDetailed = useMemo(() => {
    return cart.items.map((i) => {
      const service = ALL_SERVICES.find((s) => s.id === i.serviceId);
      return { ...i, service };
    });
  }, [cart.items, ALL_SERVICES]);

  // ✅ Live estimate (min total + quote count)
  const estimate = useMemo(() => {
    let minTotal = 0;
    let hasStarting = false;
    let quoteCount = 0;
    let missingCount = 0;

    for (const i of itemsDetailed) {
      const s: any = i.service;
      const qty = Number(i.qty ?? 1);

      if (!s) {
        missingCount += 1;
        continue;
      }

      if (s.priceType === "quote") {
        quoteCount += 1;
        continue;
      }

      const price = typeof s.price === "number" ? s.price : 0;

      if (s.priceType === "starting_at") {
        hasStarting = true;
        minTotal += price * qty;
        continue;
      }

      if (s.priceType === "fixed") {
        minTotal += price * qty;
        continue;
      }

      // any unknown priceType
      missingCount += 1;
    }

    return { minTotal, hasStarting, quoteCount, missingCount };
  }, [itemsDetailed]);

  const today = clampToMidnight(new Date());
  const maxDate = addDays(today, AVAILABILITY.maxDaysAhead);

  const defaultDate = useMemo(() => {
    let d = new Date(today);
    for (let i = 0; i <= 14; i++) {
      if (isOpenDay(d)) return d;
      d = addDays(d, 1);
    }
    return today;
  }, [today]);

  const [dateStr, setDateStr] = useState(formatDateInput(defaultDate));
  const chosenDate = useMemo(() => new Date(dateStr + "T00:00:00"), [dateStr]);

  const slots = useMemo(() => buildSlotsForDate(chosenDate), [chosenDate]);
  const [selectedSlotISO, setSelectedSlotISO] = useState<string>("");

  const [contact, setContact] = useState<ContactInfo>({
    name: "",
    phone: "",
    address: "",
    notes: "",
    photos: [],
  });

  async function onAddPhotos(files: FileList | null) {
    if (!files || files.length === 0) return;

    const existing = contact.photos.length;
    const remaining = Math.max(0, MAX_PHOTOS - existing);

    if (remaining === 0) {
      alert(`Photo limit reached (${MAX_PHOTOS}). Remove one to add more.`);
      return;
    }

    const selected = Array.from(files).slice(0, remaining);

    const tooBig = selected.find((f) => f.size > MAX_BYTES_PER_PHOTO);
    if (tooBig) {
      alert(
        `One of your photos is too large (${Math.round(tooBig.size / 1024)} KB). ` +
          `Please choose images under ~${Math.round(MAX_BYTES_PER_PHOTO / 1024)} KB each.`
      );
      return;
    }

    try {
      const attachments: PhotoAttachment[] = [];
      for (const f of selected) {
        const dataUrl = await fileToDataUrl(f);
        attachments.push({ name: f.name, type: f.type, dataUrl });
      }

      setContact((c) => ({
        ...c,
        photos: [...c.photos, ...attachments],
      }));
    } catch (e) {
      console.error(e);
      alert("Could not read one of the images. Please try again.");
    }
  }

  function removePhoto(index: number) {
    setContact((c) => ({
      ...c,
      photos: c.photos.filter((_, i) => i !== index),
    }));
  }

  function onSubmit() {
    if (cart.items.length === 0) {
      alert("Your request cart is empty. Please add services first.");
      return;
    }
    if (!contact.name.trim() || !contact.phone.trim()) {
      alert("Please enter at least your name and phone number.");
      return;
    }
    if (!selectedSlotISO) {
      alert("Please select a time slot.");
      return;
    }

    const request = {
      createdAt: new Date().toISOString(),
      appointmentStart: selectedSlotISO,
      customer: {
        name: contact.name,
        phone: contact.phone,
        address: contact.address,
        notes: contact.notes,
      },
      items: cart.items,
      photos: contact.photos,
      status: "new" as const,
    };

    const existing = JSON.parse(localStorage.getItem("rv_requests") ?? "[]");
    localStorage.setItem("rv_requests", JSON.stringify([request, ...existing]));

    alert("Request submitted! (Saved locally for now.)");

    cart.clear();
    setSelectedSlotISO("");
    setContact({ name: "", phone: "", address: "", notes: "", photos: [] });
  }

  return (
    <div className="stack page">
      <section className="panel card card-center">
        <h1 className="h2">Schedule Your Service</h1>
        <p className="lead" style={{ maxWidth: 720 }}>
          Review your request, pick a date & time, attach photos (optional), and submit.
        </p>

        <div className="row" style={{ flexWrap: "wrap" }}>
          <span className="badge">Cart items: {cart.count}</span>
          <span className="badge">
            Hours: {AVAILABILITY.startHour}:00–{AVAILABILITY.endHour}:00
          </span>
          <span className="badge">Slots: {AVAILABILITY.slotMinutes} min</span>
          <span className="badge">Request photos: {contact.photos.length}/{MAX_PHOTOS}</span>

          {/* ✅ Live estimate badges */}
          <span className="badge" style={{ justifyContent: "center" }}>
            Est. minimum: {money(estimate.minTotal)}
            {estimate.hasStarting ? "+" : ""}
          </span>

          {estimate.quoteCount > 0 && (
            <span className="badge" style={{ justifyContent: "center" }}>
              Quote items: {estimate.quoteCount}
            </span>
          )}

          {estimate.missingCount > 0 && (
            <span className="badge" style={{ justifyContent: "center" }}>
              Unpriced items: {estimate.missingCount}
            </span>
          )}
        </div>

        <div className="muted" style={{ fontWeight: 900, marginTop: 10, maxWidth: 760 }}>
          {estimate.quoteCount > 0
            ? "Note: Quote-required items are not included in the estimate. Add photos to speed up quoting."
            : "Note: “Starting at” prices are minimum estimates and may change based on site conditions."}
        </div>
      </section>

      {cart.items.length === 0 ? (
        <section className="panel card card-center">
          <h3 className="h3">Your request cart is empty</h3>
          <p className="body" style={{ maxWidth: 560 }}>
            Go to Services, add what you need, then come back here to schedule.
          </p>
          <button className="btn btn-primary" onClick={() => (window.location.href = "/services")}>
            Go to Services
          </button>
        </section>
      ) : (
        <section className="stack">
          {itemsDetailed.map((i) => (
            <article
              key={i.serviceId}
              className="panel card"
              style={{
                display: "grid",
                gridTemplateColumns: "96px 1fr",
                gap: 14,
                alignItems: "center",
              }}
            >
              {/* LEFT: image for service or add-on */}
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 14,
                  overflow: "hidden",
                  border: "1px solid rgba(2,6,23,0.16)",
                  background: "rgba(255,255,255,0.85)",
                  boxShadow: "0 10px 22px rgba(29,78,216,0.10)",
                }}
              >
                {i.service?.image ? (
                  <img
                    src={i.service.image}
                    alt={i.service?.name ?? "Service"}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                ) : (
                  <div className="card-center" style={{ width: "100%", height: "100%", padding: 10 }}>
                    <div className="label">No Image</div>
                  </div>
                )}
              </div>

              {/* RIGHT: content */}
              <div className="card-center" style={{ alignItems: "stretch", gap: 10 }}>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <div>
                    <h3 className="h3" style={{ margin: 0 }}>
                      {i.service?.name ?? "Service"}
                    </h3>
                    <div className="muted" style={{ fontWeight: 900 }}>
                      {i.service?.category ?? "—"}
                    </div>
                  </div>

                  <div className="row">
                    <span className="badge">Qty: {i.qty}</span>
                    <button className="btn btn-ghost" onClick={() => cart.remove(i.serviceId)}>
                      Remove
                    </button>
                  </div>
                </div>

                <label style={{ width: "100%", display: "grid", gap: 6 }}>
                  <span className="label">Notes for this item</span>
                  <textarea
                    className="field"
                    rows={3}
                    value={i.note}
                    onChange={(e) => cart.setNote(i.serviceId, e.target.value)}
                    placeholder="Add helpful details"
                  />
                </label>
              </div>
            </article>
          ))}

          <div className="row" style={{ justifyContent: "center" }}>
            <button className="btn btn-ghost" onClick={cart.clear}>
              Clear All
            </button>
          </div>
        </section>
      )}

      {cart.items.length > 0 && (
        <section className="panel card card-center">
          <h2 className="h2">Pick a Date</h2>

          <div style={{ width: "100%", maxWidth: 520, display: "grid", gap: 10 }}>
            <input
              className="field"
              type="date"
              value={dateStr}
              min={formatDateInput(today)}
              max={formatDateInput(maxDate)}
              onChange={(e) => {
                setDateStr(e.target.value);
                setSelectedSlotISO("");
              }}
            />

            {!isOpenDay(chosenDate) && (
              <div className="badge" style={{ justifyContent: "center" }}>
                Closed on this day — please choose another date.
              </div>
            )}
          </div>

          <h2 className="h2" style={{ marginTop: 18 }}>
            Pick a Time
          </h2>

          <div
            style={{
              width: "100%",
              maxWidth: 720,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 10,
              marginTop: 10,
            }}
          >
            {slots.length === 0 ? (
              <div className="badge" style={{ gridColumn: "1 / -1", justifyContent: "center" }}>
                No slots available for this date.
              </div>
            ) : (
              slots.map((t) => {
                const iso = t.toISOString();
                const selected = selectedSlotISO === iso;
                return (
                  <button
                    key={iso}
                    type="button"
                    className={"btn " + (selected ? "btn-primary" : "btn-ghost")}
                    onClick={() => setSelectedSlotISO(iso)}
                    style={{ justifyContent: "center" }}
                  >
                    {formatTimeLabel(t)}
                  </button>
                );
              })
            )}
          </div>
        </section>
      )}

      {cart.items.length > 0 && (
        <section className="panel card card-center">
          <h2 className="h2">Your Info</h2>

          <div style={{ width: "100%", maxWidth: 720, display: "grid", gap: 10 }}>
            <input
              className="field"
              placeholder="Full Name"
              value={contact.name}
              onChange={(e) => setContact({ ...contact, name: e.target.value })}
            />
            <input
              className="field"
              placeholder="Phone Number"
              value={contact.phone}
              onChange={(e) => setContact({ ...contact, phone: e.target.value })}
            />
            <input
              className="field"
              placeholder="Service Address (optional for now)"
              value={contact.address}
              onChange={(e) => setContact({ ...contact, address: e.target.value })}
            />
            <textarea
              className="field"
              rows={4}
              placeholder="General notes (parking, gate code, preferred arrival window, etc.)"
              value={contact.notes}
              onChange={(e) => setContact({ ...contact, notes: e.target.value })}
            />

            <div className="panel card" style={{ width: "100%", padding: 14 }}>
              <div className="label">Request Photos (optional)</div>
              <div className="body" style={{ marginTop: 6 }}>
                Add photos to help with quote-required work. Max {MAX_PHOTOS} photos, ~{Math.round(MAX_BYTES_PER_PHOTO / 1024)}KB each.
              </div>

              <div className="row" style={{ marginTop: 10, justifyContent: "center" }}>
                <input type="file" accept="image/*" multiple onChange={(e) => onAddPhotos(e.target.files)} />
              </div>

              {contact.photos.length > 0 && (
                <div
                  style={{
                    marginTop: 12,
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                    gap: 10,
                  }}
                >
                  {contact.photos.map((p, idx) => (
                    <div key={idx} className="panel" style={{ padding: 10, borderRadius: 12 }}>
                      <img
                        src={p.dataUrl}
                        alt={p.name}
                        style={{
                          width: "100%",
                          height: 110,
                          objectFit: "cover",
                          borderRadius: 10,
                          border: "1px solid rgba(15,23,42,0.15)",
                        }}
                      />
                      <div className="muted" style={{ fontSize: 11, fontWeight: 900, marginTop: 6, wordBreak: "break-word" }}>
                        {p.name}
                      </div>
                      <button className="btn btn-ghost" style={{ width: "100%", marginTop: 8 }} onClick={() => removePhoto(idx)}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Repeat estimate near submit */}
          <div className="row" style={{ marginTop: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <span className="badge" style={{ justifyContent: "center" }}>
              Est. minimum: {money(estimate.minTotal)}
              {estimate.hasStarting ? "+" : ""}
            </span>
            {estimate.quoteCount > 0 && (
              <span className="badge" style={{ justifyContent: "center" }}>
                Quote items: {estimate.quoteCount}
              </span>
            )}
          </div>

          <button className="btn btn-primary" onClick={onSubmit} style={{ marginTop: 12 }}>
            Submit Request
          </button>
        </section>
      )}

      <style>{`
        @media (max-width: 620px) {
          article.panel.card {
            grid-template-columns: 1fr !important;
          }
          article.panel.card > div:first-child {
            width: 100% !important;
            height: 190px !important;
          }
        }
      `}</style>
    </div>
  );
}
