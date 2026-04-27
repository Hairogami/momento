import { describe, it, expect, vi, beforeEach } from "vitest";

// Hoisted state — we mutate these across tests to drive the mocks.
const state: {
  isDev: boolean;
  authReturn: null | { user?: { id?: string } };
  requireSessionReturn: { user: { id: string; name: string | null; email: string } };
} = {
  isDev: false,
  authReturn: null,
  requireSessionReturn: { user: { id: "dev-user", name: "Dev", email: "dev@x.com" } },
};

vi.mock("@/lib/devMock", () => ({
  get IS_DEV() {
    return state.isDev;
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(async () => state.authReturn),
}));

vi.mock("@/lib/devAuth", () => ({
  requireSession: vi.fn(async () => state.requireSessionReturn),
}));

import { getUserId } from "@/lib/api-auth";

describe("getUserId", () => {
  beforeEach(() => {
    state.isDev = false;
    state.authReturn = null;
    state.requireSessionReturn = { user: { id: "dev-user", name: "Dev", email: "dev@x.com" } };
  });

  it("returns null when no session in prod", async () => {
    state.isDev = false;
    state.authReturn = null;
    expect(await getUserId()).toBeNull();
  });

  it("returns null when session has no user id in prod", async () => {
    state.isDev = false;
    state.authReturn = { user: {} };
    expect(await getUserId()).toBeNull();
  });

  it("returns userId from auth() in prod", async () => {
    state.isDev = false;
    state.authReturn = { user: { id: "real-prod-user" } };
    expect(await getUserId()).toBe("real-prod-user");
  });

  it("returns userId from requireSession() in dev", async () => {
    state.isDev = true;
    state.requireSessionReturn = { user: { id: "dev-id-42", name: null, email: "dev@x.com" } };
    expect(await getUserId()).toBe("dev-id-42");
  });

  it("does not call auth() when IS_DEV is true", async () => {
    const auth = (await import("@/lib/auth")).auth as unknown as ReturnType<typeof vi.fn>;
    auth.mockClear();
    state.isDev = true;
    await getUserId();
    expect(auth).not.toHaveBeenCalled();
  });

  it("does not call requireSession() when IS_DEV is false", async () => {
    const requireSession = (await import("@/lib/devAuth"))
      .requireSession as unknown as ReturnType<typeof vi.fn>;
    requireSession.mockClear();
    state.isDev = false;
    state.authReturn = { user: { id: "x" } };
    await getUserId();
    expect(requireSession).not.toHaveBeenCalled();
  });
});
