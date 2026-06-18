export type Status = "THRIFT" | "RENT" | "THRIFT + RENT";

export type Product = {
  id: number;
  name: string;
  brand: string;
  price: string;
  oldPrice?: string;
  rentalPrice?: string;
  size: string;
  condition: string;
  color: string;
  material: string;
  status: Status;
  image: string;
  gallery: string[];
  story: string;
  measurements: {
    chest: string;
    sleeve: string;
    length: string;
    shoulder: string;
  };
  care: string[];
  rentDuration?: string;
};

export const products: Product[] = [
  {
    id: 1,
    brand: "Vintage 90s",
    name: "Rust Cable-Knit Cropped Cardigan",
    price: "Rs 3,199",
    oldPrice: "Rs 9,999",
    rentalPrice: "Rs 999 / 4 days",
    size: "S/M",
    condition: "Excellent",
    color: "Burnt Sienna",
    material: "100% Lambswool",
    status: "THRIFT",
    image:
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1618333452884-5c8c7d1fb6c4?auto=format&fit=crop&w=900&q=90",
      "https://images.unsplash.com/photo-1618333452884-5c8c7d1fb6c4?auto=format&fit=crop&w=900&q=80&sat=-20",
      "https://images.unsplash.com/photo-1618333452884-5c8c7d1fb6c4?auto=format&fit=crop&w=900&q=80&crop=entropy",
      "https://images.unsplash.com/photo-1618333452884-5c8c7d1fb6c4?auto=format&fit=crop&w=900&q=80&brightness=105",
    ],
    story:
        "Sourced from a careful estate clean-out and restored for everyday wear. The cable knit has a soft hand, tidy ribbing, and an easy cropped shape that layers well.",
    measurements: {
      chest: "42 in",
      sleeve: "23 in",
      length: "19 in",
      shoulder: "16 in",
    },
    care: ["Hand wash cold", "Dry flat", "Steam, do not iron"],
  },
  {
    id: 2,
    brand: "Levi's Heritage",
    name: "Tan Corduroy Workwear Jacket",
    price: "Rs 4,999",
    oldPrice: "Rs 14,999",
    rentalPrice: "Rs 1,499 / 5 days",
    size: "M",
    condition: "Very Good",
    color: "Warm Tan",
    material: "Cotton Corduroy",
    status: "THRIFT + RENT",
    image:
        "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=760&q=90",
    gallery: [
      "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=900&q=90",
      "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=900&q=80&sat=-20",
      "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=900&q=80&crop=entropy",
      "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=900&q=80&brightness=105",
    ],
    story:
        "A sturdy workwear layer with mellow fading at the seams and a relaxed cut. Cleaned, lint-brushed, and ready for colder morning errands.",
    measurements: {
      chest: "44 in",
      sleeve: "25 in",
      length: "26 in",
      shoulder: "18 in",
    },
    care: ["Machine wash cold", "Line dry", "Brush corduroy after drying"],
  },
  {
    id: 3,
    brand: "Edwardian Revival",
    name: "Cream Lace Embroidered Blouse",
    price: "Rs 3,599",
    rentalPrice: "Rs 1,199 / 3 days",
    size: "S",
    condition: "Like New",
    color: "Ivory",
    material: "Cotton Lace",
    status: "RENT",
    rentDuration: "May 12, 2026 to May 20, 2026",
    image:
        "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=760&q=90",
    gallery: [
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=90",
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=80&sat=-20",
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=80&crop=entropy",
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=80&brightness=105",
    ],
    story:
        "Delicate embroidery, scalloped sleeves, and a soft ivory tone make this an easy occasion piece. Best styled with denim or a clean tailored trouser.",
    measurements: {
      chest: "36 in",
      sleeve: "9 in",
      length: "22 in",
      shoulder: "15 in",
    },
    care: ["Hand wash cold", "Lay flat on towel", "Store folded"],
  },
  {
    id: 4,
    brand: "Wrangler",
    name: "High-Waist Wide-Leg Denim",
    price: "Rs 4,499",
    oldPrice: "Rs 11,499",
    rentalPrice: "Rs 1,299 / 5 days",
    size: "27",
    condition: "Excellent",
    color: "Washed Blue",
    material: "Rigid Cotton Denim",
    status: "THRIFT",
    image:
        "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=760&q=90",
    gallery: [
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=90",
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80&sat=-20",
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80&crop=entropy",
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80&brightness=105",
    ],
    story:
        "A clean wide-leg denim find with a strong high rise and minimal wear. The wash is even, with slight character through the back pockets.",
    measurements: {
      chest: "Waist 27 in",
      sleeve: "Rise 12 in",
      length: "Inseam 30 in",
      shoulder: "Hip 38 in",
    },
    care: ["Wash inside out", "Cold cycle", "Hang dry"],
  },
  {
    id: 5,
    brand: "Studio Slip",
    name: "Black Silk Bias-Cut Midi Dress",
    price: "Rs 5,999",
    rentalPrice: "Rs 1,999 / 4 days",
    size: "S",
    condition: "Excellent",
    color: "Black",
    material: "Silk Blend",
    status: "THRIFT + RENT",
    image:
        "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=760&q=90",
    gallery: [
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=90",
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=80&sat=-20",
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=80&crop=entropy",
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=80&brightness=105",
    ],
    story:
        "A fluid evening piece with a bias skim and simple neckline. No visible pulls, freshly steamed, and suitable for repeat wear.",
    measurements: {
      chest: "34 in",
      sleeve: "N/A",
      length: "47 in",
      shoulder: "Strap 10 in",
    },
    care: ["Dry clean preferred", "Steam gently", "Store on padded hanger"],
  },
  {
    id: 6,
    brand: "London Fog",
    name: "Sand Belted Trench Coat",
    price: "Rs 3,999",
    oldPrice: "Rs 12,999",
    rentalPrice: "Rs 1,499 / 5 days",
    size: "M/L",
    condition: "Very Good",
    color: "Sand",
    material: "Cotton Blend",
    status: "RENT",
    rentDuration: "May 10, 2026 to May 18, 2026",
    image:
        "https://images.unsplash.com/photo-1548624313-0396c75e4b1a?auto=format&fit=crop&w=760&q=90",
    gallery: [
      "https://images.unsplash.com/photo-1548624313-0396c75e4b1a?auto=format&fit=crop&w=900&q=90",
      "https://images.unsplash.com/photo-1548624313-0396c75e4b1a?auto=format&fit=crop&w=900&q=80&sat=-20",
      "https://images.unsplash.com/photo-1548624313-0396c75e4b1a?auto=format&fit=crop&w=900&q=80&crop=entropy",
      "https://images.unsplash.com/photo-1548624313-0396c75e4b1a?auto=format&fit=crop&w=900&q=80&brightness=105",
    ],
    story:
        "Classic trench shape with a clean collar, removable belt, and soft drape. Light wear at cuffs gives it the right lived-in character.",
    measurements: {
      chest: "46 in",
      sleeve: "24 in",
      length: "42 in",
      shoulder: "19 in",
    },
    care: ["Spot clean", "Dry clean when needed", "Hang after wear"],
  },
  {
    id: 7,
    brand: "Garden Edit",
    name: "Floral Wrap Day Dress",
    price: "Rs 4,799",
    rentalPrice: "Rs 1,499 / 4 days",
    size: "M",
    condition: "Like New",
    color: "Rose Print",
    material: "Viscose",
    status: "THRIFT",
    image:
        "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=760&q=90",
    gallery: [
      "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=900&q=90",
      "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=900&q=80&sat=-20",
      "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=900&q=80&crop=entropy",
      "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=900&q=80&brightness=105",
    ],
    story:
        "A light wrap dress with a secure tie and easy movement. The floral print is bright without feeling loud.",
    measurements: {
      chest: "38 in",
      sleeve: "8 in",
      length: "40 in",
      shoulder: "15.5 in",
    },
    care: ["Cold gentle wash", "Line dry", "Steam inside out"],
  },
  {
    id: 8,
    brand: "Evening Tailor",
    name: "Cream Oversized Occasion Blazer",
    price: "Rs 5,499",
    oldPrice: "Rs 15,999",
    rentalPrice: "Rs 1,799 / 5 days",
    size: "L",
    condition: "Excellent",
    color: "Cream",
    material: "Wool Blend",
    status: "THRIFT + RENT",
    image:
        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=760&q=90",
    gallery: [
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=90",
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80&sat=-20",
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80&crop=entropy",
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80&brightness=105",
    ],
    story:
        "A sharp oversized blazer with clean lapels and a smooth lining. It dresses up denim and softens occasion wear with almost no effort.",
    measurements: {
      chest: "45 in",
      sleeve: "24 in",
      length: "29 in",
      shoulder: "19 in",
    },
    care: ["Dry clean", "Air between wears", "Use a structured hanger"],
  },
];

export function getProductById(id: string) {
  return products.find((product) => product.id.toString() === id);
}