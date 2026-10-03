/** OfficeFlow authentication boundary: local development accounts are browser-scoped; production authentication must replace this adapter with a server-side provider. */
export type AuthUser = { id: string; name: string; email: string; createdAt: string; mode: "local-development" };
type StoredAccount = AuthUser & { salt: string; passwordHash: string };
type StoredSession = { userId: string; createdAt: string };
const accountsKey = "officeflow.local-accounts.v1";
const sessionKey = "officeflow.local-session.v1";
const encoder = new TextEncoder();
const encode = (bytes: ArrayBuffer) => btoa(String.fromCharCode(...Array.from(new Uint8Array(bytes))));
const decode = (value: string) => Uint8Array.from(atob(value), character => character.charCodeAt(0));
async function passwordHash(password: string, salt: string) { const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]); return encode(await crypto.subtle.deriveBits({ name: "PBKDF2", salt: decode(salt), iterations: 120000, hash: "SHA-256" }, key, 256)); }
const readAccounts = (): StoredAccount[] => { try { return JSON.parse(localStorage.getItem(accountsKey) || "[]") as StoredAccount[]; } catch { return []; } };
const writeAccounts = (accounts: StoredAccount[]) => localStorage.setItem(accountsKey, JSON.stringify(accounts));
const persistSession = (session: StoredSession | null, remember = true) => { sessionStorage.removeItem(sessionKey); localStorage.removeItem(sessionKey); if (session) (remember ? localStorage : sessionStorage).setItem(sessionKey, JSON.stringify(session)); };
const publicUser = (account: StoredAccount): AuthUser => ({ id: account.id, name: account.name, email: account.email, createdAt: account.createdAt, mode: "local-development" });

export const authProvider = {
  mode: "local-development" as const,
  productionConfigured: false,
  description: "This OfficeFlow build stores development accounts and sessions only in this browser. Connect a server-side authentication provider before production use.",
  async currentUser(): Promise<AuthUser | null> { const raw = localStorage.getItem(sessionKey) || sessionStorage.getItem(sessionKey); if (!raw) return null; try { const session = JSON.parse(raw) as StoredSession; const account = readAccounts().find(item => item.id === session.userId); return account ? publicUser(account) : null; } catch { persistSession(null); return null; } },
  async register(name: string, email: string, password: string): Promise<AuthUser> { const normalized = email.trim().toLowerCase(); const accounts = readAccounts(); if (accounts.some(account => account.email === normalized)) throw new Error("An account with this email already exists."); const salt = encode(crypto.getRandomValues(new Uint8Array(16)).buffer); const account: StoredAccount = { id: crypto.randomUUID(), name: name.trim(), email: normalized, salt, passwordHash: await passwordHash(password, salt), createdAt: new Date().toISOString(), mode: "local-development" }; writeAccounts([...accounts, account]); persistSession({ userId: account.id, createdAt: new Date().toISOString() }); return publicUser(account); },
  async signIn(email: string, password: string, remember = true): Promise<AuthUser> { const normalized = email.trim().toLowerCase(); const account = readAccounts().find(item => item.email === normalized); if (!account || account.passwordHash !== await passwordHash(password, account.salt)) throw new Error("Incorrect email or password."); persistSession({ userId: account.id, createdAt: new Date().toISOString() }, remember); return publicUser(account); },
  async signOut() { persistSession(null); },
  async requestPasswordReset(email: string) { const exists = readAccounts().some(item => item.email === email.trim().toLowerCase()); if (!exists) throw new Error("No local account was found for that email address."); return "Password reset delivery requires a production authentication provider."; },
};
