import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MENU_BY_ID, RESTAURANT } from "./restaurant";
import { normalizeFrPhone } from "./validation";

export type Role = "customer" | "owner";

export type User = {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: Role;
  provider: "google" | "email";
  createdAt: string;
  deletedAt?: string | null;
};

export type CartLine = { key: string; itemId: string; quantity: number };

export type OrderStatus =
  | "received"
  | "preparing"
  | "ready"
  | "collected"
  | "delivered"
  | "cancelled";

export type Order = {
  id: string;
  code: string;
  userId: string;
  guestName: string;
  phone: string;
  fulfillment: "pickup" | "delivery";
  status: OrderStatus;
  paid: boolean;
  paymentRef?: string;
  items: {
    itemId: string;
    nameFr: string;
    nameEn: string;
    quantity: number;
    lineCents: number;
  }[];
  totalCents: number;
  deliveryFeeCents: number;
  address?: string;
  notes?: string;
  createdAt: string;
  slotAt: string;
};

export type Reservation = {
  id: string;
  code: string;
  userId?: string;
  guestName: string;
  phone: string;
  date: string;
  time: string;
  partySize: number;
  status: "confirmed" | "seated" | "completed" | "cancelled";
  notes?: string;
  createdAt: string;
};

export type Toast = { id: string; message: string; tone?: "ok" | "err" };

type AppState = {
  user: User | null;
  cart: CartLine[];
  orders: Order[];
  reservations: Reservation[];
  unavailableIds: string[];
  kitchenPaused: boolean;
  toasts: Toast[];
  signInEmail: (
    email: string,
    password: string,
    name?: string,
    asOwner?: boolean,
  ) => { ok: boolean; error?: string };
  signInGoogle: (asOwner?: boolean) => void;
  signOut: () => void;
  updateProfile: (patch: { name?: string; phone?: string }) => void;
  deleteAccount: () => void;
  restoreAccount: () => void;
  addToCart: (itemId: string) => void;
  setQty: (key: string, qty: number) => void;
  clearCart: () => void;
  toggleItemAvailable: (itemId: string) => void;
  setKitchenPaused: (paused: boolean) => void;
  placeOrder: (input: {
    fulfillment: "pickup" | "delivery";
    phone: string;
    address?: string;
    slotAt: string;
    payOnline: boolean;
    notes?: string;
  }) => { order?: Order; error?: string };
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  cancelOrder: (id: string) => void;
  bookTable: (input: {
    date: string;
    time: string;
    partySize: number;
    guestName: string;
    phone: string;
    notes?: string;
  }) => { reservation?: Reservation; error?: string };
  updateReservationStatus: (id: string, status: Reservation["status"]) => void;
  pushToast: (message: string, tone?: "ok" | "err") => void;
  dismissToast: (id: string) => void;
};

function uid() {
  return crypto.randomUUID();
}

function code() {
  return `NG-${Math.floor(1000 + Math.random() * 9000)}`;
}

const OWNER_EMAIL = "owner@namaste-gien.fr";

function userIdFromEmail(email: string) {
  let h = 0;
  for (let i = 0; i < email.length; i++) h = (h * 31 + email.charCodeAt(i)) >>> 0;
  return `u_${h.toString(16)}`;
}

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      cart: [],
      orders: [],
      reservations: [],
      unavailableIds: [],
      kitchenPaused: false,
      toasts: [],

      pushToast: (message, tone = "ok") => {
        const id = uid();
        set({ toasts: [...get().toasts, { id, message, tone }] });
        setTimeout(() => get().dismissToast(id), 3200);
      },
      dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),

      signInEmail: (email, password, name, asOwner) => {
        if (!email.includes("@") || password.length < 4) {
          return { ok: false, error: "invalid" };
        }
        const em = email.trim().toLowerCase();
        const role: Role = asOwner || em === OWNER_EMAIL ? "owner" : "customer";
        const existing = get().user;
        set({
          user: {
            id: existing?.email === em ? existing.id : userIdFromEmail(em),
            email: em,
            name: name?.trim() || existing?.name || em.split("@")[0],
            phone: existing?.email === em ? existing.phone : undefined,
            role,
            provider: "email",
            createdAt: existing?.email === em ? existing.createdAt : new Date().toISOString(),
            deletedAt: null,
          },
        });
        return { ok: true };
      },

      signInGoogle: (asOwner) => {
        const role: Role = asOwner ? "owner" : "customer";
        const email = asOwner ? OWNER_EMAIL : `client.google@gmail.com`;
        set({
          user: {
            id: userIdFromEmail(email),
            email,
            name: asOwner ? "Propriétaire Namasté" : "Client Google",
            role,
            provider: "google",
            createdAt: new Date().toISOString(),
            deletedAt: null,
          },
        });
        get().pushToast(asOwner ? "Pro · OK" : "Google · OK");
      },

      signOut: () => set({ user: null }),

      updateProfile: (patch) => {
        const u = get().user;
        if (!u || u.deletedAt) return;
        const phone = patch.phone ? normalizeFrPhone(patch.phone) ?? patch.phone : u.phone;
        set({ user: { ...u, name: patch.name?.trim() || u.name, phone } });
        get().pushToast("✓");
      },

      deleteAccount: () => {
        const u = get().user;
        if (!u) return;
        set({ user: { ...u, deletedAt: new Date().toISOString() } });
        get().pushToast("Compte désactivé / Account off", "err");
      },

      restoreAccount: () => {
        const u = get().user;
        if (!u?.deletedAt) return;
        set({ user: { ...u, deletedAt: null } });
        get().pushToast("Compte restauré / Restored");
      },

      addToCart: (itemId) => {
        if (get().unavailableIds.includes(itemId)) {
          get().pushToast("Épuisé / Sold out", "err");
          return;
        }
        const cart = get().cart;
        const existing = cart.find((l) => l.itemId === itemId);
        if (existing) {
          set({
            cart: cart.map((l) =>
              l.key === existing.key ? { ...l, quantity: l.quantity + 1 } : l,
            ),
          });
        } else {
          set({ cart: [...cart, { key: itemId, itemId, quantity: 1 }] });
        }
        get().pushToast("+ panier / basket");
      },

      setQty: (key, qty) => {
        if (qty <= 0) {
          set({ cart: get().cart.filter((l) => l.key !== key) });
          return;
        }
        set({
          cart: get().cart.map((l) => (l.key === key ? { ...l, quantity: qty } : l)),
        });
      },

      clearCart: () => set({ cart: [] }),

      toggleItemAvailable: (itemId) => {
        const ids = get().unavailableIds;
        set({
          unavailableIds: ids.includes(itemId)
            ? ids.filter((i) => i !== itemId)
            : [...ids, itemId],
        });
      },

      setKitchenPaused: (paused) => {
        set({ kitchenPaused: paused });
        get().pushToast(
          paused ? "Cuisine en pause / Kitchen paused" : "Cuisine ouverte / Kitchen open",
          paused ? "err" : "ok",
        );
      },

      placeOrder: (input) => {
        const { cart, user, unavailableIds, kitchenPaused } = get();
        if (!cart.length) return { error: "empty" };
        if (!user || user.deletedAt) return { error: "auth" };
        if (kitchenPaused) return { error: "paused" };
        const phone = normalizeFrPhone(input.phone);
        if (!phone) return { error: "phone" };
        if (cart.some((l) => unavailableIds.includes(l.itemId))) {
          return { error: "unavailable" };
        }
        const items = cart.map((l) => {
          const m = MENU_BY_ID[l.itemId];
          return {
            itemId: l.itemId,
            nameFr: m?.nameFr ?? l.itemId,
            nameEn: m?.nameEn ?? l.itemId,
            quantity: l.quantity,
            lineCents: (m?.priceCents ?? 0) * l.quantity,
          };
        });
        const subtotal = items.reduce((s, i) => s + i.lineCents, 0);
        const deliveryFeeCents =
          input.fulfillment === "delivery" ? RESTAURANT.deliveryFeeCents : 0;
        if (
          input.fulfillment === "delivery" &&
          subtotal < RESTAURANT.deliveryMinCents
        ) {
          return { error: "min" };
        }
        const order: Order = {
          id: uid(),
          code: code(),
          userId: user.id,
          guestName: user.name,
          phone,
          fulfillment: input.fulfillment,
          status: "received",
          paid: input.payOnline,
          paymentRef: input.payOnline ? `pay_${uid().slice(0, 8)}` : undefined,
          items,
          totalCents: subtotal + deliveryFeeCents,
          deliveryFeeCents,
          address: input.address,
          notes: input.notes,
          createdAt: new Date().toISOString(),
          slotAt: input.slotAt,
        };
        set({ orders: [order, ...get().orders], cart: [] });
        get().pushToast(order.paid ? "Payé / Paid" : "Commande / Order OK");
        return { order };
      },

      updateOrderStatus: (id, status) => {
        set({
          orders: get().orders.map((o) => (o.id === id ? { ...o, status } : o)),
        });
      },

      cancelOrder: (id) => {
        const o = get().orders.find((x) => x.id === id);
        if (!o || ["collected", "delivered", "cancelled"].includes(o.status)) return;
        set({
          orders: get().orders.map((x) =>
            x.id === id ? { ...x, status: "cancelled" as const } : x,
          ),
        });
        get().pushToast("Annulée / Cancelled", "err");
      },

      bookTable: (input) => {
        const phone = normalizeFrPhone(input.phone);
        if (!phone) return { error: "phone" };
        if (!input.guestName.trim()) return { error: "name" };
        const res: Reservation = {
          id: uid(),
          code: code(),
          userId: get().user?.id,
          guestName: input.guestName.trim(),
          phone,
          date: input.date,
          time: input.time,
          partySize: input.partySize,
          status: "confirmed",
          notes: input.notes,
          createdAt: new Date().toISOString(),
        };
        set({ reservations: [res, ...get().reservations] });
        get().pushToast("Table · OK");
        return { reservation: res };
      },

      updateReservationStatus: (id, status) => {
        set({
          reservations: get().reservations.map((r) =>
            r.id === id ? { ...r, status } : r,
          ),
        });
      },
    }),
    {
      name: "namaste-gien-app-v2",
      partialize: (s) => ({
        user: s.user,
        cart: s.cart,
        orders: s.orders,
        reservations: s.reservations,
        unavailableIds: s.unavailableIds,
        kitchenPaused: s.kitchenPaused,
      }),
    },
  ),
);

export function cartCount(cart: CartLine[]) {
  return cart.reduce((n, l) => n + l.quantity, 0);
}

export function cartSubtotal(cart: CartLine[]) {
  return cart.reduce((s, l) => {
    const m = MENU_BY_ID[l.itemId];
    return s + (m?.priceCents ?? 0) * l.quantity;
  }, 0);
}

export const ORDER_FLOW: OrderStatus[] = [
  "received",
  "preparing",
  "ready",
  "collected",
];

export function orderStepIndex(status: OrderStatus): number {
  if (status === "delivered") return 3;
  if (status === "cancelled") return -1;
  return ORDER_FLOW.indexOf(status === "collected" ? "collected" : status);
}
