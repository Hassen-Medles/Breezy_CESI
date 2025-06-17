import { useState } from "react";
import { FaHome, FaSearch, FaBell, FaUser } from "react-icons/fa";

export function Footer() {
  const [active, setActive] = useState(null);

  return (
    <footer
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100vw",
        background: "#fff",
        borderTop: "1px solid #eee",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        padding: "0.5rem 0",
        zIndex: 100,
      }}
    >
      {[FaHome, FaSearch, FaBell, FaUser].map((Icon, idx) => (
        <button
          key={idx}
          onClick={() => setActive(idx)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "2rem",
            color: active === idx ? "#00AEEF" : "#111",
            padding: "0.5rem",
            flex: 1,
            transition: "color 0.2s",
            touchAction: "manipulation",
          }}
          aria-label={`icon-${idx}`}
        >
          <Icon />
        </button>
      ))}
    </footer>
  );
}

export function FooterSimple() {
  return (
    <footer style={{
      width: "100vw",
      textAlign: "center",
      padding: "1rem",
      background: "#fff",
      borderTop: "1px solid #eee",
      position: "fixed",
      bottom: 0,
      left: 0,
      zIndex: 100,
    }}>
      © 2025 Breezy CESI
    </footer>
  );
}