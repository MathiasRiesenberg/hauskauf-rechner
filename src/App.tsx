import { useMemo, useState } from "react";
import { ImmobilienProvider, useImmobilien } from "./state/ImmobilienContext";
import { berechneAlles } from "./lib/engine";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { TabBar } from "./components/TabBar";
import type { TabKey } from "./types";

import { Uebersicht } from "./components/modules/Uebersicht";
import { KreditRechner } from "./components/modules/KreditRechner";
import { Kaufnebenkosten } from "./components/modules/Kaufnebenkosten";
import { Renovierung } from "./components/modules/Renovierung";
import { LaufendeKosten } from "./components/modules/LaufendeKosten";
import { MietenVsKaufen } from "./components/modules/MietenVsKaufen";
import { VerkaufsRechner } from "./components/modules/VerkaufsRechner";
import { Modernisierungsrisiko } from "./components/modules/Modernisierungsrisiko";
import { Foerderungen } from "./components/modules/Foerderungen";
import { Hausakte } from "./components/modules/Hausakte";

function Shell() {
  const { aktiv, speicherFehler } = useImmobilien();
  const [tab, setTab] = useState<TabKey>("uebersicht");

  const berechnungen = useMemo(() => (aktiv ? berechneAlles(aktiv) : null), [aktiv]);

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="content">
        {speicherFehler && <div className="speicher-fehler">{speicherFehler}</div>}
        {!aktiv || !berechnungen ? (
          <div className="empty-state">
            <h2>Noch kein Objekt ausgewählt</h2>
            <p>Lege links ein neues Objekt an, um mit der Berechnung zu starten.</p>
          </div>
        ) : (
          <>
            <Header immobilie={aktiv} berechnungen={berechnungen} />
            <TabBar tab={tab} setTab={setTab} />
            <div className="tab-panel">
              {tab === "uebersicht" && <Uebersicht immobilie={aktiv} berechnungen={berechnungen} setTab={setTab} />}
              {tab === "kredit" && <KreditRechner immobilie={aktiv} berechnungen={berechnungen} />}
              {tab === "nebenkosten" && <Kaufnebenkosten immobilie={aktiv} berechnungen={berechnungen} />}
              {tab === "renovierung" && <Renovierung immobilie={aktiv} berechnungen={berechnungen} />}
              {tab === "laufende" && <LaufendeKosten immobilie={aktiv} berechnungen={berechnungen} />}
              {tab === "mietenkaufen" && <MietenVsKaufen immobilie={aktiv} berechnungen={berechnungen} />}
              {tab === "verkauf" && <VerkaufsRechner immobilie={aktiv} berechnungen={berechnungen} />}
              {tab === "modernisierung" && <Modernisierungsrisiko immobilie={aktiv} berechnungen={berechnungen} />}
              {tab === "foerderung" && <Foerderungen immobilie={aktiv} />}
              {tab === "hausakte" && <Hausakte immobilie={aktiv} />}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <ImmobilienProvider>
      <Shell />
    </ImmobilienProvider>
  );
}

export default App;
