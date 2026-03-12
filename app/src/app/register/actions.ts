"use server";

import { createHash, randomUUID } from "crypto";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { managers, agencies } from "@/lib/db/schema";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export interface RegisterState {
  error?: string;
}

export async function register(
  _prevState: RegisterState | undefined,
  formData: FormData,
): Promise<RegisterState | undefined> {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const company = (formData.get("company") as string)?.trim() || "";
  const phone = (formData.get("phone") as string)?.trim() || "";

  // ── Validation ────────────────────────────
  if (!name || !email || !password) {
    return { error: "Заполните все обязательные поля" };
  }

  if (password.length < 6) {
    return { error: "Пароль должен быть не менее 6 символов" };
  }

  if (password !== confirmPassword) {
    return { error: "Пароли не совпадают" };
  }

  // ── Check duplicate email ─────────────────
  const existing = await db.query.managers.findFirst({
    where: eq(managers.email, email),
  });
  if (existing) {
    return { error: "Пользователь с таким email уже существует" };
  }

  // ── Create agency (use company name or personal) ──
  const agencyName = company || `${name} (personal)`;
  const [agency] = await db
    .insert(agencies)
    .values({
      name: agencyName,
      apiKey: `ak_${randomUUID().replace(/-/g, "")}`,
    })
    .returning();

  // ── Create manager ────────────────────────
  const passwordHash = createHash("sha256").update(password).digest("hex");
  await db.insert(managers).values({
    agencyId: agency.id,
    name,
    email,
    phone: phone || null,
    passwordHash,
  });

  // ── Auto-login after registration ─────────
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/admin",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Аккаунт создан, но не удалось войти. Попробуйте вручную." };
    }
    throw error;
  }
}
