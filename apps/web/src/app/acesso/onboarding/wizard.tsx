"use client";

import { useState, useEffect, useRef } from "react";
import { submitOnboarding } from "./actions";

// ─── Types ───────────────────────────────────────────────────────────────────

type StepId = "profile" | "organization" | "segment" | "locale" | "goals" | "policy" | "invite";

interface WizardData {
  displayName: string;
  organizationName: string;
  organizationSlug: string;
  segment: string;
  timezone: string;
  locale: string;
  goals: string[];
  approvalPolicy: string;
  teamEmails: string;
}

const STORAGE_KEY = "bighead_onboarding_v1";

const STEPS: { id: StepId; title: string; subtitle: string; icon: string }[] = [
  { id: "profile",      title: "Seu perfil",         subtitle: "Como devemos te chamar?",               icon: "👤" },
  { id: "organization", title: "Organização",        subtitle: "Configure seu workspace",               icon: "🏢" },
  { id: "segment",      title: "Segmento",           subtitle: "Qual o foco do seu negócio?",           icon: "🎯" },
  { id: "locale",       title: "Localização",        subtitle: "Fuso horário e idioma do workspace",    icon: "🌐" },
  { id: "goals",        title: "Objetivos",          subtitle: "O que você quer alcançar com o BigHead?", icon: "🚀" },
  { id: "policy",       title: "Política inicial",   subtitle: "Como você quer tratar aprovações?",     icon: "⚙️" },
  { id: "invite",       title: "Convidar equipe",    subtitle: "Adicione os primeiros colaboradores",   icon: "👥" },
];

const SEGMENTS = [
  { value: "saas",         label: "SaaS / Produto digital",   desc: "Ciclos de produto, releases e KPIs de ativação" },
  { value: "consulting",   label: "Consultoria / Serviços",   desc: "Projetos por entrega, SLA e alocação de equipe" },
  { value: "ecommerce",    label: "E-commerce / Varejo",      desc: "Campanhas, leads e automação de funil" },
  { value: "fintech",      label: "Fintech / Regulado",       desc: "Auditoria rigorosa, aprovações e conformidade" },
  { value: "health",       label: "Saúde / Healthcare",       desc: "Protocolos clínicos e jornada do paciente" },
  { value: "custom",       label: "Outro segmento",           desc: "Configuro manualmente conforme minha necessidade" },
];

const TIMEZONES = [
  "America/Sao_Paulo", "America/Manaus", "America/Belem", "America/Fortaleza",
  "America/Recife", "America/Maceio", "America/Bahia", "America/Noronha",
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "Europe/London", "Europe/Lisbon", "Europe/Paris", "America/Argentina/Buenos_Aires",
  "America/Santiago", "America/Lima", "America/Bogota", "America/Mexico_City",
  "UTC",
];

const GOALS_OPTIONS = [
  { value: "quality",      label: "Elevar qualidade das entregas",    icon: "✨" },
  { value: "velocity",     label: "Aumentar velocidade de execução",  icon: "⚡" },
  { value: "compliance",   label: "Garantir conformidade e auditoria", icon: "🔒" },
  { value: "automation",   label: "Automatizar processos repetitivos", icon: "🤖" },
  { value: "visibility",   label: "Ganhar visibilidade operacional",   icon: "📊" },
  { value: "collaboration",label: "Melhorar colaboração entre times",  icon: "🤝" },
  { value: "cost",         label: "Reduzir custos operacionais",       icon: "💰" },
  { value: "cx",           label: "Melhorar experiência do cliente",   icon: "❤️" },
];

const POLICY_OPTIONS = [
  {
    value: '{"highRisk":"manual","lowRisk":"auto"}',
    label: "Conservador",
    desc: "Alto risco sempre manual. Baixo risco pode ser automático.",
    icon: "🛡️",
    recommended: false,
  },
  {
    value: '{"highRisk":"manual","lowRisk":"manual"}',
    label: "Totalmente manual",
    desc: "Toda aprovação passa por um humano. Máximo controle e rastreabilidade.",
    icon: "✋",
    recommended: false,
  },
  {
    value: '{"highRisk":"auto","lowRisk":"auto"}',
    label: "Automático",
    desc: "IA decide baseada em regras. Indicado para times com processos maduros.",
    icon: "⚡",
    recommended: false,
  },
  {
    value: '{"highRisk":"manual","lowRisk":"auto","reviewAfter":5}',
    label: "Balanceado",
    desc: "Auto para baixo risco, revisão a cada 5 decisões automáticas. Recomendado para começar.",
    icon: "⚖️",
    recommended: true,
  },
];

// ─── Slug generator ───────────────────────────────────────────────────────────

function toSlug(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 63);
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round(((current + 1) / total) * 100);
  return (
    <div style={{ marginBottom: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
        <span style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Etapa {current + 1} de {total}
        </span>
        <span style={{ fontSize: "0.75rem", color: "var(--cyan)", fontWeight: "700" }}>{pct}%</span>
      </div>
      <div style={{ height: "3px", background: "rgba(255,255,255,0.08)", borderRadius: "2px", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: "linear-gradient(90deg, var(--cyan), #818cf8)",
            borderRadius: "2px",
            transition: "width 0.4s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </div>
      <div style={{ display: "flex", gap: "0.35rem", marginTop: "0.75rem" }}>
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            title={s.title}
            style={{
              flex: 1,
              height: "4px",
              borderRadius: "2px",
              background:
                i < current
                  ? "var(--cyan)"
                  : i === current
                  ? "rgba(4,217,255,0.4)"
                  : "rgba(255,255,255,0.08)",
              transition: "background 0.3s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Step components ──────────────────────────────────────────────────────────

function StepProfile({ data, onChange }: { data: WizardData; onChange: (k: keyof WizardData, v: string) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div className="bh-field-group">
        <label htmlFor="displayName" className="bh-field-label">
          Seu nome completo <span style={{ color: "var(--cyan)" }}>*</span>
        </label>
        <input
          id="displayName"
          name="displayName"
          autoComplete="name"
          autoFocus
          placeholder="Ex: Camila Moura"
          value={data.displayName}
          onChange={(e) => onChange("displayName", e.target.value)}
          required
          className="bh-field-input"
        />
        <p className="bh-field-hint">Será exibido no workspace e nos registros de auditoria.</p>
      </div>
    </div>
  );
}

function StepOrganization({ data, onChange }: { data: WizardData; onChange: (k: keyof WizardData, v: string) => void }) {
  const slugEdited = useRef(false);

  const handleNameChange = (v: string) => {
    onChange("organizationName", v);
    if (!slugEdited.current) {
      onChange("organizationSlug", toSlug(v));
    }
  };

  const handleSlugChange = (v: string) => {
    slugEdited.current = true;
    onChange("organizationSlug", toSlug(v));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div className="bh-field-group">
        <label htmlFor="organizationName" className="bh-field-label">
          Nome da organização <span style={{ color: "var(--cyan)" }}>*</span>
        </label>
        <input
          id="organizationName"
          name="organizationName"
          autoFocus
          placeholder="Ex: Atlas Tecnologia"
          value={data.organizationName}
          onChange={(e) => handleNameChange(e.target.value)}
          required
          className="bh-field-input"
        />
        <p className="bh-field-hint">Nome que aparece para todos os membros do workspace.</p>
      </div>
      <div className="bh-field-group">
        <label htmlFor="organizationSlug" className="bh-field-label">
          Identificador único (slug) <span style={{ color: "var(--cyan)" }}>*</span>
        </label>
        <div style={{ position: "relative" }}>
          <span
            style={{
              position: "absolute",
              left: "0.875rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--muted)",
              fontSize: "0.85rem",
              pointerEvents: "none",
              fontFamily: "monospace",
            }}
          >
            bighead.app/
          </span>
          <input
            id="organizationSlug"
            name="organizationSlug"
            placeholder="atlas-tecnologia"
            value={data.organizationSlug}
            onChange={(e) => handleSlugChange(e.target.value)}
            pattern="[a-z0-9][a-z0-9\-]{1,62}"
            title="Apenas letras minúsculas, números e hifens (mín. 2 caracteres)"
            required
            className="bh-field-input"
            style={{ paddingLeft: "7.5rem", fontFamily: "monospace" }}
          />
        </div>
        <p className="bh-field-hint">
          Letras minúsculas, números e hifens. Não pode ser alterado depois.
        </p>
      </div>
    </div>
  );
}

function StepSegment({ data, onChange }: { data: WizardData; onChange: (k: keyof WizardData, v: string) => void }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
      {SEGMENTS.map((seg) => (
        <button
          key={seg.value}
          type="button"
          onClick={() => onChange("segment", seg.value)}
          style={{
            padding: "1rem",
            borderRadius: "0.75rem",
            border: `1px solid ${data.segment === seg.value ? "rgba(4,217,255,0.6)" : "rgba(255,255,255,0.07)"}`,
            background: data.segment === seg.value ? "rgba(4,217,255,0.08)" : "rgba(255,255,255,0.02)",
            color: "#fff",
            cursor: "pointer",
            textAlign: "left",
            transition: "all 0.2s ease",
          }}
        >
          <strong style={{ display: "block", fontSize: "0.9rem", marginBottom: "0.25rem", color: data.segment === seg.value ? "var(--cyan)" : "#fff" }}>
            {seg.label}
          </strong>
          <span style={{ fontSize: "0.75rem", color: "var(--muted)", lineHeight: "1.4" }}>{seg.desc}</span>
        </button>
      ))}
    </div>
  );
}

function StepLocale({ data, onChange }: { data: WizardData; onChange: (k: keyof WizardData, v: string) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div className="bh-field-group">
        <label htmlFor="timezone" className="bh-field-label">
          Fuso horário <span style={{ color: "var(--cyan)" }}>*</span>
        </label>
        <select
          id="timezone"
          name="timezone"
          value={data.timezone}
          onChange={(e) => onChange("timezone", e.target.value)}
          className="bh-field-input"
          style={{ cursor: "pointer" }}
        >
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>{tz.replace("_", " ")}</option>
          ))}
        </select>
        <p className="bh-field-hint">Afeta relatórios, SLAs, notificações e agendamentos.</p>
      </div>
      <div className="bh-field-group">
        <label className="bh-field-label">Idioma do workspace <span style={{ color: "var(--cyan)" }}>*</span></label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          {[
            { value: "pt-BR", label: "🇧🇷 Português (BR)", desc: "Padrão para equipes no Brasil" },
            { value: "en-US", label: "🇺🇸 English (US)", desc: "For international teams" },
            { value: "es-ES", label: "🇪🇸 Español", desc: "Para equipos hispanohablantes" },
            { value: "pt-PT", label: "🇵🇹 Português (PT)", desc: "Para equipas em Portugal" },
          ].map((loc) => (
            <button
              key={loc.value}
              type="button"
              onClick={() => onChange("locale", loc.value)}
              style={{
                padding: "0.875rem",
                borderRadius: "0.75rem",
                border: `1px solid ${data.locale === loc.value ? "rgba(4,217,255,0.6)" : "rgba(255,255,255,0.07)"}`,
                background: data.locale === loc.value ? "rgba(4,217,255,0.08)" : "rgba(255,255,255,0.02)",
                color: "#fff",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.2s ease",
              }}
            >
              <strong style={{ display: "block", fontSize: "0.875rem", color: data.locale === loc.value ? "var(--cyan)" : "#fff" }}>{loc.label}</strong>
              <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>{loc.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepGoals({ data, onChange }: { data: WizardData; onChange: (k: keyof WizardData, v: string) => void }) {
  const selected = data.goals;

  const toggle = (value: string) => {
    const arr = selected.includes(value)
      ? selected.filter((g) => g !== value)
      : [...selected, value];
    onChange("goals", arr as unknown as string);
  };

  return (
    <div>
      <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: "1rem" }}>
        Selecione de 1 a 3 objetivos principais. Isso configura os KPIs padrão do seu dashboard.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem" }}>
        {GOALS_OPTIONS.map((g) => {
          const active = selected.includes(g.value);
          const disabled = !active && selected.length >= 3;
          return (
            <button
              key={g.value}
              type="button"
              disabled={disabled}
              onClick={() => toggle(g.value)}
              style={{
                padding: "0.875rem 1rem",
                borderRadius: "0.75rem",
                border: `1px solid ${active ? "rgba(4,217,255,0.6)" : "rgba(255,255,255,0.07)"}`,
                background: active ? "rgba(4,217,255,0.08)" : "rgba(255,255,255,0.02)",
                color: disabled ? "var(--muted)" : "#fff",
                cursor: disabled ? "not-allowed" : "pointer",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                opacity: disabled ? 0.5 : 1,
                transition: "all 0.2s ease",
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>{g.icon}</span>
              <span style={{ fontSize: "0.82rem", fontWeight: active ? "600" : "400", color: active ? "var(--cyan)" : "inherit" }}>{g.label}</span>
            </button>
          );
        })}
      </div>
      {selected.length > 0 && (
        <p style={{ fontSize: "0.75rem", color: "var(--cyan)", marginTop: "0.75rem", textAlign: "center" }}>
          {selected.length} de 3 objetivo(s) selecionado(s)
        </p>
      )}
    </div>
  );
}

function StepPolicy({ data, onChange }: { data: WizardData; onChange: (k: keyof WizardData, v: string) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: "0.25rem" }}>
        Define como o BigHead trata aprovações de alto e baixo risco. Pode ser alterado em Administração &gt; Políticas.
      </p>
      {POLICY_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange("approvalPolicy", opt.value)}
          style={{
            padding: "1rem 1.25rem",
            borderRadius: "0.75rem",
            border: `1px solid ${data.approvalPolicy === opt.value ? "rgba(4,217,255,0.6)" : "rgba(255,255,255,0.07)"}`,
            background: data.approvalPolicy === opt.value ? "rgba(4,217,255,0.08)" : "rgba(255,255,255,0.02)",
            color: "#fff",
            cursor: "pointer",
            textAlign: "left",
            display: "flex",
            alignItems: "flex-start",
            gap: "1rem",
            transition: "all 0.2s ease",
            position: "relative",
          }}
        >
          <span style={{ fontSize: "1.5rem", flexShrink: 0, marginTop: "0.1rem" }}>{opt.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
              <strong style={{ color: data.approvalPolicy === opt.value ? "var(--cyan)" : "#fff" }}>{opt.label}</strong>
              {opt.recommended && (
                <span style={{ fontSize: "0.65rem", padding: "0.1rem 0.4rem", borderRadius: "0.25rem", background: "rgba(4,217,255,0.15)", color: "var(--cyan)", fontWeight: "700", textTransform: "uppercase" }}>
                  Recomendado
                </span>
              )}
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--muted)", margin: 0, lineHeight: "1.5" }}>{opt.desc}</p>
          </div>
          {data.approvalPolicy === opt.value && (
            <div style={{ position: "absolute", top: "0.75rem", right: "0.75rem", width: "18px", height: "18px", borderRadius: "50%", background: "var(--cyan)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

function StepInvite({ data, onChange }: { data: WizardData; onChange: (k: keyof WizardData, v: string) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div
        style={{
          padding: "1rem 1.25rem",
          borderRadius: "0.75rem",
          border: "1px solid rgba(4,217,255,0.15)",
          background: "rgba(4,217,255,0.04)",
        }}
      >
        <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0, lineHeight: "1.6" }}>
          <strong style={{ color: "var(--cyan)" }}>Etapa opcional.</strong> Você pode pular e convidar sua equipe depois em{" "}
          <em>Administração &gt; Membros</em>. Os convites são enviados por email e expiram em 7 dias.
        </p>
      </div>
      <div className="bh-field-group">
        <label htmlFor="teamEmails" className="bh-field-label">
          Emails da equipe
        </label>
        <textarea
          id="teamEmails"
          name="teamEmails"
          placeholder={"camila@empresa.com\nrafael@empresa.com\nlucas@empresa.com"}
          value={data.teamEmails}
          onChange={(e) => onChange("teamEmails", e.target.value)}
          rows={4}
          style={{
            width: "100%",
            padding: "0.75rem 0.875rem",
            background: "var(--field-bg, rgba(255,255,255,0.04))",
            border: "1px solid var(--border, rgba(255,255,255,0.1))",
            borderRadius: "0.5rem",
            color: "var(--foreground, #fff)",
            fontSize: "0.875rem",
            fontFamily: "monospace",
            resize: "vertical",
            lineHeight: "1.6",
          }}
        />
        <p className="bh-field-hint">Um email por linha. Todos receberão o papel de Membro e poderão ser promovidos depois.</p>
      </div>
    </div>
  );
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────

const DEFAULT_DATA: WizardData = {
  displayName: "",
  organizationName: "",
  organizationSlug: "",
  segment: "",
  timezone: "America/Sao_Paulo",
  locale: "pt-BR",
  goals: [],
  approvalPolicy: '{"highRisk":"manual","lowRisk":"auto","reviewAfter":5}',
  teamEmails: "",
};

export function OnboardingWizard({ feedback }: { feedback: string | null }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>(DEFAULT_DATA);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(feedback);
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  // Restore progress from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<WizardData>;
        setData((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // ignore
    }
  }, []);

  // Save progress on every change
  const handleChange = (key: keyof WizardData, value: string | string[]) => {
    setData((prev) => {
      const next = { ...prev, [key]: value };
      try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };

  // step é sempre controlado dentro dos limites de STEPS (0 a STEPS.length - 1)
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const currentStep = STEPS[step]!;
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;

  const canAdvance = () => {
    if (step === 0) return data.displayName.trim().length >= 2;
    if (step === 1) return data.organizationName.trim().length >= 2 && data.organizationSlug.length >= 2;
    if (step === 2) return data.segment !== "";
    if (step === 4) return data.goals.length >= 1;
    return true;
  };

  const goNext = () => {
    if (!canAdvance()) {
      setError("Preencha os campos obrigatórios antes de continuar.");
      return;
    }
    setError(null);
    setDirection("forward");
    setStep((s) => s + 1);
  };

  const goBack = () => {
    setError(null);
    setDirection("back");
    setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    const form = new FormData();
    form.append("displayName", data.displayName);
    form.append("organizationName", data.organizationName);
    form.append("organizationSlug", data.organizationSlug);
    form.append("timezone", data.timezone);
    form.append("locale", data.locale);
    form.append("goals", data.goals.join(","));
    const policy = (() => {
      try { return JSON.parse(data.approvalPolicy); } catch { return { highRisk: "manual", lowRisk: "auto" }; }
    })();
    form.append("approvalPolicy", JSON.stringify({ ...policy, segment: data.segment }));
    form.append("teamEmails", data.teamEmails);

    try {
      sessionStorage.removeItem(STORAGE_KEY);
      await submitOnboarding(form);
    } catch (err: unknown) {
      // submitOnboarding uses redirect internally which throws NEXT_REDIRECT
      const e = err as { digest?: string };
      if (e?.digest?.startsWith("NEXT_REDIRECT")) throw err;
      setError("Não foi possível concluir o onboarding. Tente novamente.");
      setSubmitting(false);
    }
  };

  const stepProps = { data, onChange: handleChange };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(ellipse at top left, rgba(4,217,255,0.07), transparent 40%), radial-gradient(ellipse at bottom right, rgba(129,140,248,0.07), transparent 40%), #05070b",
        padding: "1.5rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "560px",
          display: "flex",
          flexDirection: "column",
          gap: "0",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "0.75rem",
            }}
          >
            <span
              style={{
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: "var(--cyan)",
                fontWeight: "700",
              }}
            >
              BigHead — Configuração inicial
            </span>
          </div>
        </div>

        {/* Card */}
        <div
          style={{
            background: "rgba(8,12,22,0.85)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "1.5rem",
            padding: "2rem 2.5rem",
            backdropFilter: "blur(20px)",
            boxShadow: "0 24px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset",
          }}
        >
          <ProgressBar current={step} total={STEPS.length} />

          {/* Step header */}
          <div style={{ marginBottom: "1.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.375rem" }}>
              <span
                style={{
                  fontSize: "1.75rem",
                  lineHeight: 1,
                  filter: "drop-shadow(0 0 8px rgba(4,217,255,0.3))",
                }}
              >
                {currentStep.icon}
              </span>
              <h1
                style={{
                  fontSize: "1.45rem",
                  fontWeight: "700",
                  margin: 0,
                  background: "linear-gradient(90deg, #fff 60%, var(--cyan))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {currentStep.title}
              </h1>
            </div>
            <p style={{ color: "var(--muted)", fontSize: "0.875rem", margin: 0 }}>
              {currentStep.subtitle}
            </p>
          </div>

          {/* Step content */}
          <div
            key={step}
            style={{
              animation: `${direction === "forward" ? "slideInRight" : "slideInLeft"} 0.25s ease`,
              minHeight: "220px",
            }}
          >
            {step === 0 && <StepProfile {...stepProps} />}
            {step === 1 && <StepOrganization {...stepProps} />}
            {step === 2 && <StepSegment {...stepProps} />}
            {step === 3 && <StepLocale {...stepProps} />}
            {step === 4 && <StepGoals {...stepProps} />}
            {step === 5 && <StepPolicy {...stepProps} />}
            {step === 6 && <StepInvite {...stepProps} />}
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              style={{
                marginTop: "1.25rem",
                padding: "0.75rem 1rem",
                borderRadius: "0.5rem",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.25)",
                color: "#fca5a5",
                fontSize: "0.85rem",
              }}
            >
              {error}
            </div>
          )}

          {/* Navigation */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "2rem",
              gap: "0.75rem",
            }}
          >
            {isFirst ? (
              <div />
            ) : (
              <button
                type="button"
                onClick={goBack}
                style={{
                  padding: "0.625rem 1.25rem",
                  borderRadius: "0.5rem",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.04)",
                  color: "var(--muted)",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  transition: "all 0.2s ease",
                }}
              >
                ← Voltar
              </button>
            )}

            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              {/* Skip button for optional steps */}
              {(step === 2 || step === 6) && (
                <button
                  type="button"
                  onClick={isLast ? handleSubmit : goNext}
                  style={{
                    padding: "0.625rem 1.25rem",
                    borderRadius: "0.5rem",
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "transparent",
                    color: "var(--muted)",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                  }}
                >
                  Pular
                </button>
              )}

              {isLast ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{
                    padding: "0.75rem 2rem",
                    borderRadius: "0.5rem",
                    border: "none",
                    background: submitting
                      ? "rgba(4,217,255,0.3)"
                      : "linear-gradient(135deg, var(--cyan) 0%, #818cf8 100%)",
                    color: submitting ? "rgba(255,255,255,0.5)" : "#000",
                    fontWeight: "700",
                    cursor: submitting ? "not-allowed" : "pointer",
                    fontSize: "0.9rem",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  {submitting ? (
                    <>
                      <span style={{ display: "inline-block", animation: "spin 0.8s linear infinite" }}>⟳</span>
                      Criando workspace...
                    </>
                  ) : (
                    "🚀 Criar workspace"
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={goNext}
                  style={{
                    padding: "0.75rem 1.75rem",
                    borderRadius: "0.5rem",
                    border: "none",
                    background: canAdvance()
                      ? "linear-gradient(135deg, var(--cyan) 0%, #818cf8 100%)"
                      : "rgba(255,255,255,0.08)",
                    color: canAdvance() ? "#000" : "var(--muted)",
                    fontWeight: "700",
                    cursor: canAdvance() ? "pointer" : "not-allowed",
                    fontSize: "0.875rem",
                    transition: "all 0.2s ease",
                  }}
                >
                  Continuar →
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Step indicators at bottom */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "0.5rem",
            marginTop: "1.5rem",
          }}
        >
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              title={s.title}
              onClick={() => {
                if (i < step) { setDirection("back"); setStep(i); }
              }}
              style={{
                width: i === step ? "24px" : "8px",
                height: "8px",
                borderRadius: "4px",
                border: "none",
                background:
                  i === step
                    ? "var(--cyan)"
                    : i < step
                    ? "rgba(4,217,255,0.35)"
                    : "rgba(255,255,255,0.12)",
                cursor: i < step ? "pointer" : "default",
                padding: 0,
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>

        <p
          style={{
            textAlign: "center",
            color: "var(--muted)",
            fontSize: "0.75rem",
            marginTop: "1.25rem",
          }}
        >
          Progresso salvo automaticamente · Você pode voltar a qualquer etapa anterior
        </p>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0);    }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to   { opacity: 1; transform: translateX(0);     }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .bh-field-group { display: flex; flex-direction: column; gap: 0.375rem; }
        .bh-field-label { font-size: 0.875rem; font-weight: 600; color: rgba(255,255,255,0.85); }
        .bh-field-input {
          width: 100%;
          padding: 0.75rem 0.875rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 0.5rem;
          color: #fff;
          font-size: 0.9rem;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          outline: none;
          box-sizing: border-box;
        }
        .bh-field-input:focus {
          border-color: rgba(4,217,255,0.5);
          box-shadow: 0 0 0 3px rgba(4,217,255,0.08);
        }
        .bh-field-input option { background: #0d1117; color: #fff; }
        .bh-field-hint { font-size: 0.75rem; color: var(--muted); margin: 0; line-height: 1.5; }
      `}</style>
    </main>
  );
}
