// src/contexts/CartContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "cart-items";

function normalizeQty(qty, stock) {
  const maxStock = Number.isFinite(stock) ? stock : 9999;
  const safeQty = Number.isFinite(qty) ? qty : 1;
  return Math.max(1, Math.min(safeQty, maxStock));
}

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  const addToCart = (payload) => {
    if (!payload) return;

    const {
      productId,
      name,
      price,
      image,
      variant,
      qty = 1,
      stock,
      category,
      basePrice,
      variantOptions,
      variantIndex,
      key: incomingKey,
    } = payload;

    const key =
      incomingKey ||
      `${productId || ""}-${variant?.name || ""}-${variant?.value || "default"}`;

    setItems((prev) => {
      const existing = prev.find((it) => it.key === key);
      const maxStock = Number.isFinite(stock)
        ? stock
        : Number.isFinite(existing?.stock)
        ? existing.stock
        : 9999;

      // item mới
      if (!existing) {
        const computedBasePrice = Number.isFinite(basePrice)
          ? basePrice
          : Number(price ?? 0);

        return [
          ...prev,
          {
            key,
            productId,
            name,
            price,
            image,
            variant,
            category,
            stock: maxStock,
            qty: normalizeQty(qty, maxStock),
            basePrice: computedBasePrice,
            variantOptions: Array.isArray(variantOptions)
              ? variantOptions
              : undefined,
            variantIndex: Number.isFinite(variantIndex)
              ? variantIndex
              : undefined,
          },
        ];
      }

      // đã tồn tại → cộng qty
      return prev.map((it) => {
        if (it.key !== key) return it;
        const newQty = normalizeQty((it.qty || 1) + qty, maxStock);

        const nextBasePrice = Number.isFinite(basePrice)
          ? basePrice
          : Number(it.basePrice ?? it.price ?? price ?? 0);

        return {
          ...it,
          name: name ?? it.name,
          price: price ?? it.price,
          image: image ?? it.image,
          variant: variant ?? it.variant,
          category: category ?? it.category,
          stock: maxStock,
          qty: newQty,
          basePrice: nextBasePrice,
          variantOptions: Array.isArray(variantOptions)
            ? variantOptions
            : it.variantOptions,
          variantIndex: Number.isFinite(variantIndex)
            ? variantIndex
            : it.variantIndex,
        };
      });
    });
  };

  const removeFromCart = (key) => {
    setItems((prev) => prev.filter((it) => it.key !== key));
  };

  const clearCart = () => setItems([]);

  const changeQty = (key, delta) => {
    setItems((prev) =>
      prev.flatMap((it) => {
        if (it.key !== key) return [it];
        const stock = Number.isFinite(it.stock) ? it.stock : 9999;
        const next = (it.qty || 1) + delta;
        if (next <= 0) return [];
        return [{ ...it, qty: normalizeQty(next, stock) }];
      })
    );
  };

  const increaseQty = (key) => changeQty(key, +1);
  const decreaseQty = (key) => changeQty(key, -1);

  // đổi option trong giỏ
  const updateItemVariant = (key, payload = {}) => {
    setItems((prev) => {
      const current = prev.find((it) => it.key === key);
      if (!current) return prev;

      const {
        variant: incomingVariant,
        price,
        basePrice,
        variantOptions,
        variantIndex,
      } = payload;

      const nextVariant = incomingVariant || current.variant;
      const newKey = `${current.productId || ""}-${
        nextVariant?.name || ""
      }-${nextVariant?.value || "default"}`;

      const nextBasePrice = Number.isFinite(basePrice)
        ? basePrice
        : Number(current.basePrice ?? current.price ?? 0);

      // key không đổi → chỉ update data
      if (newKey === key) {
        return prev.map((it) =>
          it.key === key
            ? {
                ...it,
                variant: nextVariant,
                price: price ?? it.price,
                basePrice: nextBasePrice,
                variantOptions: variantOptions ?? it.variantOptions,
                variantIndex: Number.isFinite(variantIndex)
                  ? variantIndex
                  : it.variantIndex,
              }
            : it
        );
      }

      // nếu có item khác cùng option mới → gộp
      const target = prev.find((it) => it.key === newKey);
      const updatedItem = {
        ...current,
        variant: nextVariant,
        price: price ?? current.price,
        basePrice: nextBasePrice,
        variantOptions: variantOptions ?? current.variantOptions,
        variantIndex: Number.isFinite(variantIndex)
          ? variantIndex
          : current.variantIndex,
        key: newKey,
      };

      if (!target) {
        return prev.map((it) => (it.key === key ? updatedItem : it));
      }

      const maxStock = Number.isFinite(updatedItem.stock)
        ? updatedItem.stock
        : Number.isFinite(target.stock)
        ? target.stock
        : 9999;

      const merged = {
        ...target,
        ...updatedItem,
        qty: normalizeQty((target.qty || 1) + (current.qty || 1), maxStock),
        stock: maxStock,
      };

      return prev
        .filter((it) => it.key !== key && it.key !== target.key)
        .concat(merged);
    });
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        clearCart,
        increaseQty,
        decreaseQty,
        updateItemVariant,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
