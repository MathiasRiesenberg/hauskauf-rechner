import type { Immobilie, TabKey } from "../../types";
import type { Berechnungen } from "../../lib/engine";
import { useImmobilien } from "../../state/ImmobilienContext";
import { Card, StatGrid, StatCard, Badge, Hinweis } from "../ui/Card";
import { NumberField, FieldGrid } from "../ui/Field";
import { formatEUR, formatPct, formatZahl, formatJahreMonate } from "../../lib/format";

const FARBE_LABEL: Record<string, string> = {
  gruen: "Sehr guter Kauf",
  gelb: "Fairer Kauf",
  rot: "Teurer Kauf",
};

function scoreColor(score: number): string {
  if (score >= 70) return "var(--green)";
  if (score >= 40) return "var(--yellow)";
  return "var(--red)";
}

interface ModuleProps {
  immobilie: Immobilie;
  berechnungen: Berechnungen;
  setTab: (tab: TabKey) => void;
}

export function Uebersicht({ immobilie, berechnungen, setTab }: ModuleProps) {
  const { aktualisiere } = useImmobilien();
  const { ampel, kredit, nebenkosten, benoetigtesEigenkapital, eigenkapitalquote, verkaufBreakEvenJahr, mietenKaufen } = berechnungen;

  return (
    <>
      <Card>
        <div className="killer-box">
          <span className="killer-eyebrow">Ampel-Bewertung: {FARBE_LABEL[ampel.farbe]}</span>
          <div className="killer-number">{formatEUR(ampel.killerZahl.gesamt)}</div>
          <p className="killer-text">
            Dieses Haus kostet dich in den nächsten {ampel.killerZahl.jahre} Jahren voraussichtlich{" "}
            <strong>{formatEUR(ampel.killerZahl.gesamt)}</strong> inklusive Zinsen, Nebenkosten und Sanierungen
            (ohne Tilgung, da diese Vermögen in Form von Eigenkapital aufbaut).
          </p>
          <div className="killer-breakdown">
            <div className="killer-breakdown-item">
              <span className="killer-breakdown-label">Zinsen</span>
              <span className="killer-breakdown-value">{formatEUR(ampel.killerZahl.zinsen)}</span>
            </div>
            <div className="killer-breakdown-item">
              <span className="killer-breakdown-label">Kaufnebenkosten</span>
              <span className="killer-breakdown-value">{formatEUR(ampel.killerZahl.kaufnebenkosten)}</span>
            </div>
            <div className="killer-breakdown-item">
              <span className="killer-breakdown-label">Sanierung</span>
              <span className="killer-breakdown-value">{formatEUR(ampel.killerZahl.sanierung)}</span>
            </div>
            <div className="killer-breakdown-item">
              <span className="killer-breakdown-label">Laufende Kosten</span>
              <span className="killer-breakdown-value">{formatEUR(ampel.killerZahl.laufendeKosten)}</span>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Kennzahlen auf einen Blick">
        <StatGrid>
          <StatCard label="Kaufpreis" value={formatEUR(immobilie.kaufpreis)} sub={`${formatEUR(Math.round(immobilie.kaufpreis / Math.max(1, immobilie.wohnflaeche)))}/m²`} />
          <StatCard label="Kreditsumme" value={formatEUR(kredit.kreditsumme)} />
          <StatCard label="Monatliche Rate" value={formatEUR(Math.round(kredit.monatlicheRate))} />
          <StatCard
            label="Eigenkapitalquote"
            value={formatPct(eigenkapitalquote * 100, 0)}
            tone={eigenkapitalquote >= 0.2 ? "good" : eigenkapitalquote >= 0.1 ? "warn" : "bad"}
            sub={`benötigt: ${formatEUR(benoetigtesEigenkapital)}`}
          />
          <StatCard
            label="Mieten vs. Kaufen"
            value={mietenKaufen.breakEvenJahr ? `ab Jahr ${formatZahl(mietenKaufen.breakEvenJahr)}` : "> 30 Jahre"}
            sub="Kaufen lohnt sich ab"
          />
          <StatCard
            label="Verkauf lohnt sich ab"
            value={verkaufBreakEvenJahr ? formatJahreMonate(verkaufBreakEvenJahr * 12) : "> 30 Jahre"}
            sub="Besitzdauer für Gewinn"
          />
        </StatGrid>
      </Card>

      <Card
        title="Ampel-Bewertung im Detail"
        subtitle="Basierend auf Quadratmeterpreis/Region, Sanierungsbedarf, Finanzierung und Eigenkapitalquote."
      >
        <div className="row" style={{ marginBottom: 4 }}>
          <div className="ampel-light">
            <span className={`ampel-dot ${ampel.farbe === "rot" ? "active-rot" : ""}`} />
            <span className={`ampel-dot ${ampel.farbe === "gelb" ? "active-gelb" : ""}`} />
            <span className={`ampel-dot ${ampel.farbe === "gruen" ? "active-gruen" : ""}`} />
          </div>
          <Badge tone={ampel.farbe as "gruen" | "gelb" | "rot"}>Gesamtscore: {formatZahl(ampel.score)}/100</Badge>
        </div>
        {ampel.teilbewertungen.map((t) => (
          <div className="score-row" key={t.label}>
            <div className="score-row-top">
              <span className="score-row-label">{t.label}</span>
              <span className="score-row-value">{formatZahl(t.score)}/100</span>
            </div>
            <div className="score-bar-track">
              <div className="score-bar-fill" style={{ width: `${t.score}%`, background: scoreColor(t.score) }} />
            </div>
            <span className="score-row-kommentar">{t.kommentar}</span>
          </div>
        ))}
      </Card>

      <Card title="Regionaler Vergleichswert" subtitle="Für eine genauere Quadratmeterpreis-Bewertung in der Ampel.">
        <FieldGrid>
          <NumberField
            label="Durchschnittlicher m²-Preis in der Region"
            value={immobilie.regionalerQmPreis ?? 0}
            onChange={(v) => aktualisiere((i) => ({ ...i, regionalerQmPreis: v || null }))}
            suffix="€/m²"
            step={50}
            hint="Z. B. aus regionalen Marktberichten oder Immobilienportalen."
          />
        </FieldGrid>
        <Hinweis>
          Kaufnebenkosten gesamt: {formatEUR(nebenkosten.gesamt)} ({formatPct(nebenkosten.gesamtPct, 2)} des Kaufpreises).
        </Hinweis>
      </Card>

      <Card title="Weiter zu den Details">
        <div className="link-list">
          <button className="btn btn-secondary btn-sm" onClick={() => setTab("kredit")}>Kreditrechner →</button>
          <button className="btn btn-secondary btn-sm" onClick={() => setTab("mietenkaufen")}>Mieten vs. Kaufen →</button>
          <button className="btn btn-secondary btn-sm" onClick={() => setTab("verkauf")}>Verkaufsrechner →</button>
          <button className="btn btn-secondary btn-sm" onClick={() => setTab("modernisierung")}>Modernisierungsrisiko →</button>
        </div>
      </Card>
    </>
  );
}
