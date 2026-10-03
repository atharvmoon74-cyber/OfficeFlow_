/** Regression coverage for OfficeFlow’s browser-local development authentication boundary. */
import { beforeEach, describe, expect, it } from "vitest";
import { authProvider } from "./auth";

class MemoryStorage { private values = new Map<string, string>(); getItem(key: string) { return this.values.get(key) ?? null; } setItem(key: string, value: string) { this.values.set(key, String(value)); } removeItem(key: string) { this.values.delete(key); } clear() { this.values.clear(); } }
const local = new MemoryStorage(); const session = new MemoryStorage();
Object.defineProperty(globalThis, "localStorage", { value: local }); Object.defineProperty(globalThis, "sessionStorage", { value: session });

describe("OfficeFlow local development authentication", () => {
  beforeEach(() => { local.clear(); session.clear(); });
  it("creates a persistent local account and restores its session", async () => { const account = await authProvider.register("Atharv", "atharv@example.com", "SecurePass1!"); expect(account.email).toBe("atharv@example.com"); expect((await authProvider.currentUser())?.id).toBe(account.id); });
  it("rejects duplicate emails and invalid passwords, then clears the session on logout", async () => { await authProvider.register("Atharv", "atharv@example.com", "SecurePass1!"); await expect(authProvider.register("Another", "ATHARV@example.com", "SecurePass1!")).rejects.toThrow("already exists"); await authProvider.signOut(); await expect(authProvider.signIn("atharv@example.com", "incorrect", true)).rejects.toThrow("Incorrect email or password"); await authProvider.signIn("atharv@example.com", "SecurePass1!", false); await authProvider.signOut(); expect(await authProvider.currentUser()).toBeNull(); });
});
