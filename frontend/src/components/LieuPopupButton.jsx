import { useState } from "react";

export default function LieuPopupButton({ lieu, label = "Afficher" }) {
  const [open, setOpen] = useState(false);

  if (!lieu) {
    return <span>-</span>;
  }

  return (
    <>
      <button type="button" className="attachment-open-btn" onClick={() => setOpen(true)}>
        {label}
      </button>

      {open && (
        <div className="attachment-modal-backdrop" onClick={() => setOpen(false)}>
          <div className="attachment-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="attachment-modal-close"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
            <p className="text-modal-content">{lieu}</p>
          </div>
        </div>
      )}
    </>
  );
}
