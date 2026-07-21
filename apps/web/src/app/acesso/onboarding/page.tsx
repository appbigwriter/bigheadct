import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingWizard } from "./wizard";

const messages: Record<string, string> = {
  missing_fields: "Preencha nome, organizacao e slug antes de continuar.",
  submit_failed: "Nao foi possivel concluir o onboarding. Tente novamente.",
  invalid_session: "Sua sessao expirou. Faca login novamente.",
  slug_taken: "Este slug ja esta em uso. Escolha outro identificador.",
};

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; step?: string }>;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");

  const query = await searchParams;
  const feedback = messages[query.error ?? ""] ?? null;

  return <OnboardingWizard feedback={feedback} />;
}
