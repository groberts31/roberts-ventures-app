import { useMemo, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../data/firebase";
import { useCart } from "../data/requestCart";
import { SERVICES } from "../data/services";
import { AVAILABILITY } from "../data/availability";
import {
  addDays,
  buildSlotsForDate,
  clampToMidnight,
  formatDateInput,
  formatTimeLabel,
  isOpenDay,
} from "../data/timeSlots";

type ContactInfo = {
  name: string;
  phone: string;
  address: string;
  notes: string;
};

export default function Schedule() {
  const cart = useCart();

  const itemsDetailed = useMemo(() => {
    return cart.items.map((i) => {
      const service = SERVICES.find((s) => s.id === i.serviceId);
      return { ...i, service };
    });
  }, [cart.items]);

  // date limits
  const today = clampToMidnight(new Date());
  const maxDate = addDays(today, AVAILABILITY.maxDaysAhead);

  // pick next valid open day as default
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
  });

  async function onSubmit() {
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

    
    
try {
    await addDoc(collection(db, "requests"), {
      createdAt: serverTimestamp(),
      appointmentStart: selectedSlotISO,
      customer: contact,
      items: cart.items,
      status: "new",
      source: "web-app",
    });

    alert("Request submitted! We’ll contact you shortly.");

    cart.clear();
    setSelectedSlotISO("");
    setContact({ name: "", phone: "", address: "", notes: "" });
} catch (err) {
    console.error(err);
    alert("Submission failed. Please try again.");
}

  }

  return (
    <div className="stack page">
      <section className="panel card card-center">
        <h1 className="h2">Schedule Your Service</h1>
        <p className="lead" style={{ maxWidth: 720 }}>
          Review your request cart, pick a date & time, and submit your info. We’ll follow up to confirm details.
        </p>

        <div className="row">
          <span className="badge">Cart items: {cart.count}</span>
          <span className="badge">
            Hours: {AVAILABILITY.startHour}:00–{AVAILABILITY.endHour}:00
          </span>
          <span className="badge">Slots: {AVAILABILITY.slotMinutes} min</span>
        </div>
      </section>

      {/* Cart editor */}
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
            <article key={i.serviceId} className="panel card card-center">
              <h3 className="h3">{i.service?.name ?? "Service"}</h3>
              <div className="muted">{i.service?.category ?? "—"}</div>

              <div className="row">
                <span className="badge">Qty: {i.qty}</span>
                <button className="btn btn-ghost" onClick={() => cart.remove(i.serviceId)}>
                  Remove
                </button>
              </div>

              <label style={{ width: "100%", maxWidth: 620, display: "grid", gap: 6 }}>
                <span className="label">Notes for this service</span>
                <textarea
                  className="field"
                  rows={3}
                  value={i.note}
                  onChange={(e) => cart.setNote(i.serviceId, e.target.value)}
                  placeholder="Add helpful details (sizes, location, photos later, etc.)"
                />
              </label>
            </article>
          ))}

          <div className="row" style={{ justifyContent: "center" }}>
            <button className="btn btn-ghost" onClick={cart.clear}>
              Clear All
            </button>
          </div>
        </section>
      )}

      {/* Date & time */}
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

          <h2 className="h2" style={{ marginTop: 18 }}>Pick a Time</h2>

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

      {/* Contact + submit */}
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
          </div>

          <button className="btn btn-primary" onClick={onSubmit} style={{ marginTop: 12 }}>
            Submit Request
          </button>

          <div className="muted" style={{ fontSize: 12, fontWeight: 700, maxWidth: 760 }}>
            Next upgrade: we’ll save requests to Firebase and notify you automatically.
          </div>
        </section>
      )}
    </div>
  );
}
