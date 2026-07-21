import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@bigheadct/ui";
import { Building2, Plus, ArrowRight } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getValidatedAccessToken, authenticatedApi } from "@/lib/server-api-client";
import { switchTenant } from "@/app/actions/critical-mutations";

export default async function OrganizacoesPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");

  let organizations: any[] = [];
  let errorMsg = "";
  try {
    const res = await authenticatedApi<{ items: any[] }>("/v1/organizations");
    // O endpoint /v1/organizations retorna { items: [...] } com as organizacoes do usuario
    organizations = res.items || [];
  } catch (err: any) {
    errorMsg = "Nao foi possivel carregar suas organizacoes da API real.";
    console.error(err);
  }

  // Action local para alternar a organização diretamente na página
  const handleSelectOrg = async (formData: FormData) => {
    "use server";
    const res = await switchTenant(formData);
    if (res.ok) {
      redirect("/operacao/home");
    }
  };

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(circle at top, rgba(4,217,255,0.08), transparent 30%), #05070b", padding: "1.5rem" }}>
      <section style={{ width: "100%", maxWidth: "520px", padding: "2.5rem", borderRadius: "1.5rem", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(10,15,24,0.7)", backdropFilter: "blur(12px)", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
        <header style={{ marginBottom: "2rem", textAlign: "center" }}>
          <span style={{ textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--cyan)", fontSize: "0.8rem", fontWeight: "bold" }}>Acesso ao Workspace</span>
          <h1 style={{ fontSize: "2rem", fontWeight: "700", marginTop: "0.5rem", color: "#fff" }}>Minhas Organizações</h1>
          <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginTop: "0.5rem" }}>Escolha qual organização deseja gerenciar ou crie uma nova.</p>
        </header>

        {errorMsg ? (
          <p role="status" style={{ color: "var(--red)", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", padding: "0.75rem", borderRadius: "0.5rem", textAlign: "center", marginBottom: "1.5rem" }}>
            {errorMsg}
          </p>
        ) : null}

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
          {organizations.map((org) => (
            <form key={org.id} action={handleSelectOrg}>
              <input type="hidden" name="organizationId" value={org.id} />
              <button
                type="submit"
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "1.25rem",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "1rem",
                  color: "#fff",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "linear-gradient(135deg, rgba(4,217,255,0.2), rgba(0,0,0,0.5))", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(4,217,255,0.3)" }}>
                    <Building2 size={18} style={{ color: "var(--cyan)" }} />
                  </div>
                  <div>
                    <strong style={{ display: "block", fontSize: "1.05rem" }}>{org.name}</strong>
                    <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>slug: {org.slug}</span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", color: "var(--muted)" }}>
                  <ArrowRight size={18} />
                </div>
              </button>
            </form>
          ))}

          {organizations.length === 0 && !errorMsg ? (
            <div style={{ textAlign: "center", padding: "2rem 0", color: "var(--muted)" }}>
              <p>Nenhuma organização encontrada para este usuário.</p>
            </div>
          ) : null}
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1.5rem", display: "flex", justifyContent: "center" }}>
          <Link href="/acesso/onboarding" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--cyan)", textDecoration: "none", fontWeight: "600", fontSize: "0.95rem" }}>
            <Plus size={18} />
            <span>Criar Nova Organização</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
