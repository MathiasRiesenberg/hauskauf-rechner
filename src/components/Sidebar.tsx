import { useImmobilien } from "../state/ImmobilienContext";
import { formatEUR } from "../lib/format";

export function Sidebar() {
  const { immobilien, aktiveId, waehleAktiv, neuesObjekt, loescheObjekt } = useImmobilien();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-brand-title">🏠 Hauskauf-Rechner</span>
        <span className="sidebar-brand-sub">Finanzierung & Wirtschaftlichkeit</span>
      </div>

      <div className="sidebar-list">
        <span className="sidebar-section-label">Deine Objekte ({immobilien.length})</span>
        {immobilien.map((i) => (
          <div
            key={i.id}
            className={`sidebar-item ${i.id === aktiveId ? "active" : ""}`}
            onClick={() => waehleAktiv(i.id)}
          >
            <div className="sidebar-item-main">
              <span className="sidebar-item-name">{i.name || "Unbenanntes Objekt"}</span>
              <span className="sidebar-item-sub">
                {i.adresse ? `${i.adresse} · ` : ""}
                {formatEUR(i.kaufpreis)}
              </span>
            </div>
            <button
              className="sidebar-item-delete"
              title="Objekt löschen"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`„${i.name}“ wirklich löschen? Das kann nicht rückgängig gemacht werden.`)) {
                  loescheObjekt(i.id);
                }
              }}
            >
              ✕
            </button>
          </div>
        ))}
        {immobilien.length === 0 && <span className="sidebar-item-sub">Noch keine Objekte angelegt.</span>}
      </div>

      <div className="sidebar-footer">
        <button className="btn btn-primary btn-block" onClick={neuesObjekt}>
          + Neues Objekt
        </button>
      </div>
    </aside>
  );
}
