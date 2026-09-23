import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      role: "admin" | "lectura";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "admin" | "lectura";
  }
}
