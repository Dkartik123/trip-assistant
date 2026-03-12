"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function authenticate(
  _prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirectTo: "/admin",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Неверный email или пароль";
        default:
          return "Ошибка авторизации";
      }
    }
    // Re-throw non-auth errors (NEXT_REDIRECT, etc.)
    throw error;
  }
}
