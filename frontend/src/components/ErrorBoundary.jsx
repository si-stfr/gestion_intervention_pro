import { Component } from "react";

// Évite la "page blanche" : si un composant plante, on affiche un message
// avec la cause (utile pour diagnostiquer sur tablette) et un bouton de secours.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Erreur d'affichage :", error, info?.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div
        style={{
          maxWidth: 480,
          margin: "60px auto",
          padding: 24,
          fontFamily: "Arial, sans-serif",
          textAlign: "center",
        }}
      >
        <h2 style={{ color: "#cd2c2e" }}>Une erreur est survenue</h2>
        <p>La page n'a pas pu s'afficher correctement.</p>
        <p style={{ fontSize: 13, color: "#666", wordBreak: "break-word" }}>
          {String(this.state.error?.message || this.state.error)}
        </p>
        <button
          style={{ padding: "10px 18px", margin: 6, cursor: "pointer" }}
          onClick={() => window.location.reload()}
        >
          Recharger la page
        </button>
        <button
          style={{ padding: "10px 18px", margin: 6, cursor: "pointer" }}
          onClick={() => {
            try {
              localStorage.clear();
            } catch (e) {
              /* stockage indisponible */
            }
            window.location.href = "/";
          }}
        >
          Retour à la connexion
        </button>
      </div>
    );
  }
}
