import type { ReactNode } from "react";

interface CardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function Card({ title, subtitle, children, actions }: CardProps) {
  return (
    <section className="card">
      {(title || actions) && (
        <header className="card-header">
          <div>
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="card-actions">{actions}</div>}
        </header>
      )}
      <div className="card-body">{children}</div>
    </section>
  );
}

export function StatGrid({ children }: { children: ReactNode }) {
  return <div className="stat-grid">{children}</div>;
}

type Tone = "default" | "good" | "bad" | "warn";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  tone?: Tone;
}

export function StatCard({ label, value, sub, tone = "default" }: StatCardProps) {
  return (
    <div className={`stat-card stat-${tone}`}>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
      {sub && <span className="stat-sub">{sub}</span>}
    </div>
  );
}

type BadgeTone = "gruen" | "gelb" | "rot" | "neutral";

export function Badge({ children, tone }: { children: ReactNode; tone: BadgeTone }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function Hinweis({ children }: { children: ReactNode }) {
  return <p className="hinweis">{children}</p>;
}
