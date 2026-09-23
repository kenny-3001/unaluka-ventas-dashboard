import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { getDb } from "@/lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      const db = getDb();
      const existing = db
        .prepare("SELECT id FROM users WHERE email = ?")
        .get(user.email) as { id: number } | undefined;

      if (existing) {
        db.prepare(
          "UPDATE users SET name = ?, image = ?, last_login_at = datetime('now') WHERE email = ?"
        ).run(user.name ?? null, user.image ?? null, user.email);
      } else {
        const adminEmails = (process.env.ADMIN_EMAILS ?? "")
          .split(",")
          .map((e) => e.trim().toLowerCase())
          .filter(Boolean);
        const role = adminEmails.includes(user.email.toLowerCase())
          ? "admin"
          : "lectura";

        db.prepare(
          "INSERT INTO users (email, name, image, role, last_login_at) VALUES (?, ?, ?, ?, datetime('now'))"
        ).run(user.email, user.name ?? null, user.image ?? null, role);
      }

      return true;
    },
    async jwt({ token }) {
      if (token.email) {
        const db = getDb();
        const row = db
          .prepare("SELECT role FROM users WHERE email = ?")
          .get(token.email) as { role: string } | undefined;
        token.role = row?.role ?? "lectura";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = (token.role as "admin" | "lectura") ?? "lectura";
      }
      return session;
    },
  },
});
