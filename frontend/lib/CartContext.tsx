"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

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

// Seed with the same mock data your CartPage currently uses
const INITIAL_CART: CartItem[] = [
    {
        id: 1,
        brand: "Vintage 90s",
        name: "Rust Cable-Knit Cropped Cardigan",
        price: "Rs. 3,199",
        size: "S/M",
        condition: "Excellent",
        color: "Burnt Sienna",
        category: "Knitwear",
        image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80",
        status: "THRIFT",
        note: "Pre-loved item with history and character.",
    },
    {
        id: 3,
        brand: "Edwardian Revival",
        name: "Cream Lace Embroidered Blouse",
        price: "Rs. 1,199",
        size: "S",
        condition: "Like New",
        color: "Ivory",
        category: "Tops",
        image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=760&q=90",
        status: "RENT",
        rentalPeriod: "4 days",
        note: "Rental period: 4 days",
    },
    {
        id: 2,
        brand: "Levi's Heritage",
        name: "Tan Corduroy Workwear Jacket",
        price: "Rs. 4,999",
        size: "M",
        condition: "Very Good",
        color: "Warm Tan",
        category: "Outerwear",
        image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=760&q=90",
        status: "THRIFT + RENT",
        note: "Available to thrift or rent.",
    },
];

interface CartContextValue {
    cartItems: CartItem[];
    cartCount: number;
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: number) => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>(INITIAL_CART);

    const cartCount = cartItems.length;

    function addToCart(item: CartItem) {
        setCartItems((prev) =>
            prev.find((i) => i.id === item.id) ? prev : [...prev, item]
        );
    }

    function removeFromCart(id: number) {
        setCartItems((prev) => prev.filter((i) => i.id !== id));
    }

    return (
        <CartContext.Provider value={{ cartItems, cartCount, addToCart, removeFromCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
    return ctx;
}