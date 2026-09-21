import { useState } from "react";

const isImageSourceValid = (value) => {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  return (
    /^data:image\/(png|jpeg|jpg);base64,/.test(trimmed) ||
    /^https?:\/\//i.test(trimmed)
  );
};

export default function ImagePreviewButton({ src, label = "Ouvrir" }) {
  const [open, setOpen] = useState(false);

  if (!isImageSourceValid(src)) {
    return null;
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
            <img
              src={src}
              alt="Pièce jointe d'intervention"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                setOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
