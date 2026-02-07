import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import "./styles/staylit-flame.css";
import { CartProvider } from "./data/requestCart";
import { emitToast } from "./components/ToastHost";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <CartProvider>
        <App />
      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>
);


// RV_ALERT_TOAST_OVERRIDE: route all alert() calls through toast UI (non-blocking)
window.alert = (msg?: any) => {
  const message = String(msg ?? "").trim();
  if (!message) return;
  emitToast({ message, variant: "info", durationMs: 3200 });
};
