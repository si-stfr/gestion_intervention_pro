// Compatibilité anciens navigateurs (tablettes iPad/Safari anciens, Android WebView anciens).
// Chargé avant tout le reste de l'application (voir main.jsx).

// MediaQueryList.addEventListener / removeEventListener : absents avant Safari 14
// (seulement addListener / removeListener). Utilisés par la bibliothèque de graphiques.
if (
  typeof window !== "undefined" &&
  typeof window.MediaQueryList === "function" &&
  typeof window.MediaQueryList.prototype.addEventListener !== "function"
) {
  window.MediaQueryList.prototype.addEventListener = function (type, listener) {
    if (type === "change" && typeof this.addListener === "function") {
      this.addListener(listener);
    }
  };

  window.MediaQueryList.prototype.removeEventListener = function (type, listener) {
    if (type === "change" && typeof this.removeListener === "function") {
      this.removeListener(listener);
    }
  };
}

// Object.hasOwn : absent avant Safari 15.4 / Chrome 93.
if (typeof Object.hasOwn !== "function") {
  Object.hasOwn = function (obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  };
}
