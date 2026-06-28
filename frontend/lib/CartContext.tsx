"use client";

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";

export type CartItem = {
    id: number;
    brand: string;
    name: string;
    price: string;
    size: string;
    condition: string;
    color: string;
    category: string;
    image: string;
    status: "THRIFT" | "RENT" | "THRIFT + RENT";
    rentalPeriod?: string;
    note?: string;
};

interface CartContextValue {
    cartItems: CartItem[];
    cartCount: number;
    subtotal: number;
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: number) => void;
    clearCart: () => void;
}
const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "rewear_cart";

export function CartProvider({ children }: { children: ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [hydrated, setHydrated] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setCartItems(JSON.parse(stored));
            }
        } catch {
            // ignore parse errors
        }
        setHydrated(true);
    }, []);

    // Persist to localStorage on every change (after hydration)
    useEffect(() => {
        if (!hydrated) return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    }, [cartItems, hydrated]);

    const cartCount = cartItems.length;
    const subtotal = cartItems.reduce((acc, item) => {
        const n = parseFloat(item.price.replace(/[^0-9]/g, "")) || 0;
        return acc + n;
    }, 0);

    function addToCart(item: CartItem) {
        setCartItems((prev) =>
            prev.find((i) => i.id === item.id) ? prev : [...prev, item]
        );
    }

    function removeFromCart(id: number) {
        setCartItems((prev) => prev.filter((i) => i.id !== id));
    }

    function clearCart() {
        setCartItems([]);
    }

    return (
        <CartContext.Provider
            value={{ cartItems, cartCount, subtotal, addToCart, removeFromCart, clearCart }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
    return ctx;
}