import { useCallback, useEffect, useMemo, useState } from "react";
import type { CartLine, MenuItem } from "./types";
import { loadJSON, saveJSON } from "./storage";

const CART_KEY = "kcp.cart";

interface CartState {
  lines: CartLine[];
  note: string;
}

function normalizeCart(raw: unknown): CartState {
  if (!isObjectRaw(raw) || !Array.isArray(raw.lines)) return { lines: [], note: "" };
  const lines = raw.lines
    .filter(isObjectRaw)
    .map((r) => ({
      itemId: typeof r.itemId === "string" ? r.itemId : "",
      name: typeof r.name === "string" ? r.name : "",
      price: typeof r.price === "number" ? r.price : 0,
      image: typeof r.image === "string" ? r.image : "",
      quantity: typeof r.quantity === "number" && r.quantity > 0 ? Math.floor(r.quantity) : 1,
      note: typeof r.note === "string" ? r.note : "",
    }))
    .filter((l) => l.itemId && l.name);
  const note = typeof raw.note === "string" ? raw.note : "";
  return { lines, note };
}

function isObjectRaw(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function useCart() {
  const [state, setState] = useState<CartState>(() => normalizeCart(loadJSON(CART_KEY, { lines: [], note: "" })));

  useEffect(() => {
    saveJSON(CART_KEY, state);
  }, [state]);

  const addItem = useCallback((item: MenuItem, quantity = 1, note = "") => {
    setState((prev) => {
      const existing = prev.lines.find((l) => l.itemId === item.id && l.note.trim() === note.trim());
      if (existing) {
        return {
          ...prev,
          lines: prev.lines.map((l) =>
            l === existing ? { ...l, quantity: l.quantity + quantity } : l,
          ),
        };
      }
      const line: CartLine = {
        itemId: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity,
        note,
      };
      return { ...prev, lines: [...prev.lines, line] };
    });
  }, []);

  const setQuantity = useCallback((itemId: string, note: string, quantity: number) => {
    setState((prev) => {
      if (quantity <= 0) {
        return { ...prev, lines: prev.lines.filter((l) => !(l.itemId === itemId && l.note.trim() === note.trim())) };
      }
      return {
        ...prev,
        lines: prev.lines.map((l) =>
          l.itemId === itemId && l.note.trim() === note.trim() ? { ...l, quantity } : l,
        ),
      };
    });
  }, []);

  const setLineNote = useCallback((itemId: string, note: string, newNote: string) => {
    setState((prev) => ({
      ...prev,
      lines: prev.lines.map((l) =>
        l.itemId === itemId && l.note.trim() === note.trim() ? { ...l, note: newNote } : l,
      ),
    }));
  }, []);

  const setOrderNote = useCallback((note: string) => {
    setState((prev) => ({ ...prev, note }));
  }, []);

  const clear = useCallback(() => {
    setState({ lines: [], note: "" });
  }, []);

  const count = useMemo(() => state.lines.reduce((sum, l) => sum + l.quantity, 0), [state.lines]);
  const total = useMemo(() => state.lines.reduce((sum, l) => sum + l.price * l.quantity, 0), [state.lines]);

  return { lines: state.lines, note: state.note, addItem, setQuantity, setLineNote, setOrderNote, clear, count, total };
}
