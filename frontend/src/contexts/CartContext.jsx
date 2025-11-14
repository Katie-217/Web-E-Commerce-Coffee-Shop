import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";

const LS_KEY = "cart.v1";

const CartContext = createContext(null);

function keyFrom(item) {
  // gom nhóm theo product + biến thể (ví dụ size)
  const v = item?.variant ? `${item.variant.name}:${item.variant.value}` : "";
  return `${item.productId}::${v}`;
}

function load() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || { items: [] }; }
  catch { return { items: [] }; }
}
function save(state) {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

function reducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const incoming = action.payload;           // {productId, name, price, image, variant, qty}
      const k = keyFrom(incoming);
      const items = [...state.items];
      const i = items.findIndex(it => keyFrom(it) === k);
      if (i >= 0) {
        items[i] = { ...items[i], qty: Math.min(999, (items[i].qty || 1) + (incoming.qty || 1)) };
      } else {
        items.push({ ...incoming, qty: Math.max(1, incoming.qty || 1) });
      }
      return { ...state, items };
    }
    case "UPDATE_QTY": {
      const { key, qty } = action.payload;
      const items = state.items.map(it => keyFrom(it) === key ? { ...it, qty: Math.max(1, qty) } : it);
      return { ...state, items };
    }
    case "REMOVE": {
      const { key } = action.payload;
      return { ...state, items: state.items.filter(it => keyFrom(it) !== key) };
    }
    case "CLEAR": return { items: [] };
    default: return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);

  useEffect(() => { save(state); }, [state]);

  const addItem = (item) => dispatch({ type: "ADD", payload: item });
  const updateQty = (key, qty) => dispatch({ type: "UPDATE_QTY", payload: { key, qty } });
  const removeItem = (key) => dispatch({ type: "REMOVE", payload: { key } });
  const clearCart = () => dispatch({ type: "CLEAR" });

  const count = useMemo(() => state.items.reduce((s, it) => s + (it.qty || 0), 0), [state.items]);
  const subtotal = useMemo(() => state.items.reduce((s, it) => s + it.price * it.qty, 0), [state.items]);

  const value = { items: state.items, addItem, updateQty, removeItem, clearCart, count, subtotal, keyFrom };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
