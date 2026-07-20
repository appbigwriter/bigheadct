"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { authCookieOptions } from "@/lib/supabase/cookie-options";
import { BigHeadApiError, getValidatedAccessToken } from "@/lib/server-api-client";

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 63);
}

async function createOrganization(baseUrl: string, token: string, payload: Record<string, unknown>) {
  return fetch(`${baseUrl}/v1/onboarding`, {
    method: "POST",
    cache: "no-store",
    headers: {
      accept: "application/json",
      authorization: `Bearer ${token}`,
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}

export async function submitOnboarding(formData: FormData) {
  const displayName = text(formData, "displayName");
  const organizationName = text(formData, "organizationName");
  const organizationSlug = text(formData, "organizationSlug") || slugify(organizationName || displayName || "bighead");
  const timezone = text(formData, "timezone") || "America/Sao_Paulo";
  const locale = text(formData, "locale") || "pt-BR";
  const goals = text(formData, "goals");
  const approvalPolicy = text(formData, "approvalPolicy");

  if (!displayName || !organizationName || !organizationSlug) redirect("/acesso/onboarding?error=missing_fields");

  let token: string;
  try {
    token = await getValidatedAccessToken();
  } catch (error) {
    if (error instanceof BigHeadApiError && error.status === 401) {
      redirect("/acesso/onboarding?error=invalid_session");
    }
    redirect("/acesso/onboarding?error=submit_failed");
  }
  let parsedPolicy: Record<string, unknown> = {};
  if (approvalPolicy) {
    try {
      parsedPolicy = JSON.parse(approvalPolicy) as Record<string, unknown>;
    } catch {
      redirect("/acesso/onboarding?error=submit_failed");
    }
  }

  const apiUrl = (process.env.API_URL?.trim() || process.env.NEXT_PUBLIC_API_URL?.trim())?.replace(/\/$/, "");
  if (!apiUrl) redirect("/acesso/onboarding?error=submit_failed");

  const basePayload = {
      profile: { display_name: displayName, timezone, locale },
      organization: { name: organizationName, slug: organizationSlug, timezone, locale },
      goals: goals ? goals.split(",").map((item) => item.trim()).filter(Boolean) : [],
      approval_policy: parsedPolicy
  };

  let response = await createOrganization(apiUrl, token, basePayload);
  if (!response.ok && response.status === 409) {
    const detail = await response.json().catch(() => null) as { detail?: unknown } | null;
    const message = typeof detail?.detail === "string" ? detail.detail : "";
    if (/slug/i.test(message)) {
      for (let suffix = 2; suffix <= 10; suffix += 1) {
        response = await createOrganization(apiUrl, token, {
          ...basePayload,
          organization: { ...basePayload.organization, slug: `${organizationSlug}-${suffix}` }
        });
        if (response.ok) break;
      }
    }
  }

  if (!response.ok) {
    redirect("/acesso/onboarding?error=submit_failed");
  }

  const payload = await response.json() as {
    organizationId?: string;
    organization_id?: string;
    nextRoute?: string;
    next_route?: string;
  };
  const organizationId = payload.organizationId ?? payload.organization_id;
  if (organizationId) {
    const store = await cookies();
    store.set("bighead-organization-id", organizationId, {
      httpOnly: true,
      sameSite: "lax",
      secure: authCookieOptions().secure,
      path: "/",
      maxAge: 60 * 60 * 24 * 30
    });
  }

  const requestedRoute = payload.nextRoute ?? payload.next_route;
  const nextRoute = typeof requestedRoute === "string" && requestedRoute.startsWith("/") ? requestedRoute : "/operacao/home";
  redirect(nextRoute);
}
