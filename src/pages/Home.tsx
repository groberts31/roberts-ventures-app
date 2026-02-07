export default function Home() {
  return (
    <div className="stack">

      <section className="panel card card-center">
        <h1 className="h1 h1-accent">Roberts Ventures LLC</h1>

        <p className="lead" style={{ maxWidth: 600 }}>
          Professional handyman and multi-service solutions.
          Build a request, schedule service, and get results.
        </p>

        <div className="row" style={{ marginTop: 10 }}>
          <button
            className="btn btn-primary"
            onClick={() => (window.location.href = "/services")}
          >
            Browse Services
          </button>

          <button
            className="btn btn-ghost"
            onClick={() => (window.location.href = "/schedule")}
          >
            My Request
          </button>
        </div>
      </section>

      <section className="panel card card-center">
        <h2 className="h2">Stay Lit Candle Co.</h2>

        <p className="body" style={{ maxWidth: 520 }}>
          Premium handcrafted candles available for shipping and local pickup.
        </p>

        <button
          className="btn"
          onClick={() => (window.location.href = "/staylit")}
        >
          Visit Store
        </button>
      </section>

    </div>
  );
}
