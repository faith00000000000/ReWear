// "use client";

// import { useState } from "react";
// import Navbar from "@/layout/Navbar";
// import Footer from "@/layout/Footer";
// import { Search, ChevronDown, X } from "lucide-react";

// interface Product {
//   id: number;
//   name: string;
//   brand: string;
//   price: string;
//   size: string;
//   condition: string;
//   badge: "SALE" | "RENT" | "SALE+RENT" | null;
//   image: string;
// }

// const PRODUCTS: Product[] = [
//   {
//     id: 1,
//     name: "Silk Co-ord Set",
//     brand: "Reformation",
//     price: "$48",
//     size: "Size S",
//     condition: "Like New",
//     badge: "SALE",
//     image:
//       "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=500&h=600&fit=crop&auto=format",
//   },
//   {
//     id: 2,
//     name: "Vintage Wool Blazer",
//     brand: "Ralph Lauren",
//     price: "$62",
//     size: "Size M",
//     condition: "Good",
//     badge: "SALE+RENT",
//     image:
//       "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=600&fit=crop&auto=format",
//   },
//   {
//     id: 3,
//     name: "Y2K Denim Look",
//     brand: "Levi's",
//     price: "$35",
//     size: "Size M",
//     condition: "Good",
//     badge: "RENT",
//     image:
//       "https://images.unsplash.com/photo-1565084888279-aca607bb6c29?w=500&h=600&fit=crop&auto=format",
//   },
//   {
//     id: 4,
//     name: "Thrifted Suede Jacket",
//     brand: "Vintage",
//     price: "$55",
//     size: "Size L",
//     condition: "Vintage",
//     badge: "SALE+RENT",
//     image:
//       "https://images.unsplash.com/photo-1595777712802-6b2ecef04908?w=500&h=600&fit=crop&auto=format",
//   },
//   {
//     id: 5,
//     name: "Gucci Bag",
//     brand: "Gucci",
//     price: "$89",
//     size: "One Size",
//     condition: "Good",
//     badge: "SALE",
//     image:
//       "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=500&h=600&fit=crop&auto=format",
//   },
//   {
//     id: 6,
//     name: "Pink Crossbody Bag",
//     brand: "Coach",
//     price: "$42",
//     size: "One Size",
//     condition: "Like New",
//     badge: null,
//     image:
//       "https://images.unsplash.com/photo-1583496661160-fb5218b5f99e?w=500&h=600&fit=crop&auto=format",
//   },
//   {
//     id: 7,
//     name: "Red Structured Bag",
//     brand: "Coach",
//     price: "$65",
//     size: "One Size",
//     condition: "Good",
//     badge: "RENT",
//     image:
//       "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=500&h=600&fit=crop&auto=format",
//   },
//   {
//     id: 8,
//     name: "Orange Textured Bag",
//     brand: "Bottega",
//     price: "$78",
//     size: "One Size",
//     condition: "Like New",
//     badge: "SALE+RENT",
//     image:
//       "https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=500&h=600&fit=crop&auto=format",
//   },
//   {
//     id: 9,
//     name: "Linen Midi Dress",
//     brand: "Zara",
//     price: "$54",
//     size: "Size M",
//     condition: "Good",
//     badge: null,
//     image:
//       "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&h=600&fit=crop&auto=format",
//   },
//   {
//     id: 10,
//     name: "Chunky Knit Sweater",
//     brand: "Everlane",
//     price: "$45",
//     size: "Size L",
//     condition: "Like New",
//     badge: null,
//     image:
//       "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=500&h=600&fit=crop&auto=format",
//   },
//   {
//     id: 11,
//     name: "Leather Mules",
//     brand: "Madewell",
//     price: "$38",
//     size: "Size 8",
//     condition: "Good",
//     badge: null,
//     image:
//       "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=500&h=600&fit=crop&auto=format",
//   },
//   {
//     id: 12,
//     name: "Statement Earrings",
//     brand: "Mejuri",
//     price: "$25",
//     size: "One Size",
//     condition: "Like New",
//     badge: null,
//     image:
//       "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=600&fit=crop&auto=format",
//   },
// ];

// // Badge color styling
// const BADGE_COLORS: Record<string, string> = {
//   SALE: "bg-green-500 text-white",
//   RENT: "bg-blue-500 text-white",
//   "SALE+RENT": "bg-red-500 text-white",
// };

// // ─── Product Card ─────────────────────────────────────────────────────────────
// function ProductCard({ p }: { p: Product }) {
//   return (
//     <div className="group cursor-pointer">
//       <div className="relative overflow-hidden rounded-lg bg-gray-200 mb-3">
//         {/* Product Image */}
//         <img
//           src={p.image}
//           alt={p.name}
//           className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110"
//         />

//         {/* Badge */}
//         {p.badge && (
//           <div
//             className={`absolute top-3 left-3 px-2.5 py-1 rounded text-xs font-bold tracking-wide ${BADGE_COLORS[p.badge]}`}
//           >
//             {p.badge}
//           </div>
//         )}
//       </div>

//       {/* Product Info */}
//       <div>
//         <h3 className="text-sm font-semibold text-gray-900 leading-snug">
//           {p.name}
//         </h3>
//         <p className="text-xs text-gray-500 mt-1">{p.brand}</p>
//         <div className="flex items-center justify-between mt-2">
//           <span className="text-sm font-bold text-gray-900">{p.price}</span>
//         </div>
//         <p className="text-xs text-gray-400 mt-1">{p.size}</p>
//       </div>
//     </div>
//   );
// }

// // ─── Filter Sidebar ───────────────────────────────────────────────────────────
// function FilterSidebar({
//   onClose,
//   mobile,
// }: {
//   onClose?: () => void;
//   mobile?: boolean;
// }) {
//   const [expandedCategory, setExpandedCategory] = useState<string | null>(
//     "Category",
//   );
//   const [minPrice, setMinPrice] = useState(0);
//   const [maxPrice, setMaxPrice] = useState(500);

//   const categories = ["Ready-to-Wear", "Handbags", "Shoes", "Accessories"];
//   const brands = ["Designer", "High Street", "Vintage", "Eco-Friendly"];
//   const sizes = ["XS", "S", "M", "L", "XL", "One Size"];
//   const conditions = ["Like New", "Good", "Fair", "Vintage"];

//   const toggleCategory = (name: string) => {
//     setExpandedCategory(expandedCategory === name ? null : name);
//   };

//   const FilterSection = ({
//     title,
//     items,
//     type = "checkbox",
//   }: {
//     title: string;
//     items: string[];
//     type?: "checkbox" | "range";
//   }) => (
//     <div className="border-b border-gray-200 pb-4 last:border-b-0">
//       <button
//         onClick={() => toggleCategory(title)}
//         className="flex items-center justify-between w-full py-3"
//       >
//         <span className="font-semibold text-sm text-gray-900">{title}</span>
//         <ChevronDown
//           size={16}
//           className={`transition-transform ${
//             expandedCategory === title ? "rotate-180" : ""
//           }`}
//         />
//       </button>

//       {expandedCategory === title && (
//         <div className="space-y-2 pl-2">
//           {items.map((item) => (
//             <label
//               key={item}
//               className="flex items-center gap-3 cursor-pointer"
//             >
//               <input
//                 type={type}
//                 className="w-4 h-4 rounded border-gray-300 text-gray-900"
//               />
//               <span className="text-sm text-gray-600">{item}</span>
//             </label>
//           ))}
//         </div>
//       )}
//     </div>
//   );

//   return (
//     <aside
//       className={
//         mobile
//           ? "fixed inset-0 z-50 bg-white flex flex-col overflow-hidden"
//           : "w-56 flex-shrink-0"
//       }
//     >
//       {mobile && (
//         <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
//           <h2 className="text-base font-bold text-gray-900">Filters</h2>
//           <button
//             onClick={onClose}
//             className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
//           >
//             <X size={16} />
//           </button>
//         </div>
//       )}

//       <div className={`${mobile ? "flex-1 overflow-y-auto" : "space-y-2"}`}>
//         <div className="p-4 space-y-4">
//           <FilterSection title="Category" items={categories} />
//           <FilterSection title="Brand" items={brands} />
//           <FilterSection title="Size" items={sizes} />
//           <FilterSection title="Condition" items={conditions} />

//           {/* Price Range */}
//           <div className="border-b border-gray-200 pb-4">
//             <button
//               onClick={() => toggleCategory("Price Range")}
//               className="flex items-center justify-between w-full py-3"
//             >
//               <span className="font-semibold text-sm text-gray-900">
//                 Price Range
//               </span>
//               <ChevronDown
//                 size={16}
//                 className={`transition-transform ${
//                   expandedCategory === "Price Range" ? "rotate-180" : ""
//                 }`}
//               />
//             </button>

//             {expandedCategory === "Price Range" && (
//               <div className="space-y-4 pl-2 mt-3">
//                 <div>
//                   <label className="text-xs text-gray-500">Min</label>
//                   <input
//                     type="number"
//                     value={minPrice}
//                     onChange={(e) => setMinPrice(+e.target.value)}
//                     placeholder="$0"
//                     className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
//                   />
//                 </div>
//                 <div>
//                   <label className="text-xs text-gray-500">Max</label>
//                   <input
//                     type="number"
//                     value={maxPrice}
//                     onChange={(e) => setMaxPrice(+e.target.value)}
//                     placeholder="$500+"
//                     className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
//                   />
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </aside>
//   );
// }

// // ─── Page ─────────────────────────────────────────────────────────────────────
// export default function BrowseFindsPage() {
//   const [mobileFilter, setMobileFilter] = useState(false);
//   const [search, setSearch] = useState("");
//   const [sortBy, setSortBy] = useState("Recommended");

//   const sortOptions = [
//     "Recommended",
//     "Newest Arrivals",
//     "Price: Low to High",
//     "Price: High to Low",
//   ];

//   const filtered = PRODUCTS.filter(
//     (p) =>
//       p.name.toLowerCase().includes(search.toLowerCase()) ||
//       p.brand.toLowerCase().includes(search.toLowerCase()),
//   );

//   return (
//     <div className="min-h-screen bg-white">
//       <Navbar />

//       {/* Hero Section */}
//       <section className="bg-white border-b border-gray-200">
//         <div className="max-w-7xl mx-auto px-6 py-16">
//           <h1 className="text-4xl font-bold text-gray-900 mb-2">
//             Browse Finds
//           </h1>
//           <p className="text-gray-500">
//             Discover unique vintage and pre-loved pieces
//           </p>

//           {/* Search */}
//           <div className="mt-8 flex gap-3">
//             <div className="relative flex-1 max-w-md">
//               <Search
//                 size={18}
//                 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//               />
//               <input
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 placeholder="Search by name, brand..."
//                 className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
//               />
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-6 py-12">
//         <div className="flex gap-8">
//           {/* Sidebar - Desktop */}
//           <div className="hidden lg:block w-56">
//             <FilterSidebar />
//           </div>

//           {/* Main Area */}
//           <div className="flex-1 min-w-0">
//             {/* Top Bar */}
//             <div className="flex items-center justify-between mb-8">
//               <p className="text-sm text-gray-600">
//                 <span className="font-semibold text-gray-900">
//                   {filtered.length}
//                 </span>{" "}
//                 items found
//               </p>

//               <div className="flex gap-2 items-center">
//                 <span className="text-sm text-gray-600">Sort by:</span>
//                 <div className="relative">
//                   <select
//                     value={sortBy}
//                     onChange={(e) => setSortBy(e.target.value)}
//                     className="appearance-none px-4 py-2 pr-8 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 cursor-pointer"
//                   >
//                     {sortOptions.map((opt) => (
//                       <option key={opt} value={opt}>
//                         {opt}
//                       </option>
//                     ))}
//                   </select>
//                   <ChevronDown
//                     size={16}
//                     className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Products Grid */}
//             {filtered.length > 0 ? (
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//                 {filtered.map((product) => (
//                   <ProductCard key={product.id} p={product} />
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-24 text-gray-400">
//                 <p className="text-4xl mb-3">🌿</p>
//                 <p className="font-semibold text-gray-600">
//                   No pieces match your search
//                 </p>
//                 <p className="text-sm mt-1">Try adjusting your search term</p>
//               </div>
//             )}

//             {/* Pagination */}
//             {filtered.length > 0 && (
//               <div className="flex justify-center items-center gap-2 mt-12">
//                 <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition">
//                   Previous
//                 </button>
//                 <button className="w-10 h-10 rounded-lg bg-gray-900 text-white text-sm font-semibold">
//                   1
//                 </button>
//                 <button className="w-10 h-10 rounded-lg bg-gray-100 text-gray-900 text-sm font-semibold hover:bg-gray-200">
//                   2
//                 </button>
//                 <button className="w-10 h-10 rounded-lg bg-gray-100 text-gray-900 text-sm font-semibold hover:bg-gray-200">
//                   3
//                 </button>
//                 <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition">
//                   Next
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Mobile Filter Button */}
//         {mobileFilter && (
//           <FilterSidebar mobile onClose={() => setMobileFilter(false)} />
//         )}
//       </div>

//       {/* Footer */}
//       <Footer />
//     </div>
//   );

//         </span>
//         <div className="hidden md:flex items-center gap-8 text-[14px] text-gray-600">
//           <a href="#" className="hover:text-gray-900 transition">
//             Browse
//           </a>
//           <a href="#" className="hover:text-gray-900 transition">
//             Sell
//           </a>
//           <a href="#" className="hover:text-gray-900 transition">
//             Rent
//           </a>
//           <a href="#" className="hover:text-gray-900 transition">
//             About
//           </a>
//         </div>
//         <div className="flex items-center gap-4">
//           <button className="text-[14px] text-gray-700 hover:text-gray-900 transition">
//             Log in
//           </button>
//           <button className="px-4 py-2 bg-gray-900 text-white text-[14px] rounded-lg hover:bg-gray-700 transition">
//             Sign up
//           </button>
//         </div>
//       </div>
//     </nav>
//   );
// }

// // ─── Footer ───────────────────────────────────────────────────────────────────
// function Footer() {
//   return (
//     <footer className="bg-[#1a1a1a] text-white pt-16 pb-8">
//       <div className="max-w-7xl mx-auto px-6">
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-gray-700">
//           {/* Brand */}
//           <div>
//             <p className="text-[22px] font-bold tracking-tight mb-2">RE:WEAR</p>
//             <p className="text-[14px] text-gray-400">Fashion That Lasts!</p>
//           </div>

//           {/* Follow Us */}
//           <div>
//             <p className="text-[15px] font-semibold mb-4">Follow Us</p>
//             <ul className="space-y-2.5">
//               {[
//                 "Newsletter",
//                 "Instagram",
//                 "Facebook",
//                 "X",
//                 "Pinterest",
//                 "YouTube",
//               ].map((l) => (
//                 <li key={l}>
//                   <a
//                     href="#"
//                     className="text-[14px] text-gray-400 hover:text-white transition"
//                   >
//                     {l}
//                   </a>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           {/* Company */}
//           <div>
//             <p className="text-[15px] font-semibold mb-4">Company</p>
//             <ul className="space-y-2.5">
//               {["About Us", "Join Us", "Offices", "Stores", "Work With Us"].map(
//                 (l) => (
//                   <li key={l}>
//                     <a
//                       href="#"
//                       className="text-[14px] text-gray-400 hover:text-white transition"
//                     >
//                       {l}
//                     </a>
//                   </li>
//                 ),
//               )}
//             </ul>
//           </div>

//           {/* Policies */}
//           <div>
//             <p className="text-[15px] font-semibold mb-4">Policies</p>
//             <ul className="space-y-2.5">
//               {[
//                 "Privacy Policy",
//                 "Purchase Conditions",
//                 "Gift Card Conditions",
//                 "Cookie Settings",
//               ].map((l) => (
//                 <li key={l}>
//                   <a
//                     href="#"
//                     className="text-[14px] text-gray-400 hover:text-white transition"
//                   >
//                     {l}
//                   </a>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </div>

//         <p className="text-[13px] text-gray-500 mt-8">
//           © 2026 RE:WEAR. All rights reserved.
//         </p>
//       </div>
//     </footer>
//   );
// }

// // ─── Page ─────────────────────────────────────────────────────────────────────
// export default function BrowseFindsPage() {
//   const [page, setPage] = useState(1);
//   const totalPages = Math.ceil(PRODUCTS.length / ITEMS_PER_PAGE);
//   const paginated = PRODUCTS.slice(
//     (page - 1) * ITEMS_PER_PAGE,
//     page * ITEMS_PER_PAGE,
//   );

//   return (
//     <div
//       className="min-h-screen bg-[#F5F0EB]"
//       style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}
//     >
//       <Navbar />

//       <div className="max-w-7xl mx-auto px-6">
//         {/* Page Header */}
//         <div className="pt-10 pb-6 border-b border-gray-200">
//           <div className="flex items-start justify-between">
//             <div>
//               <h1 className="text-[42px] font-bold text-gray-900 leading-tight">
//                 Browse Finds
//               </h1>
//               <p className="text-[15px] text-gray-500 mt-1">
//                 Discover unique vintage and pre-loved pieces
//               </p>
//             </div>
//             {/* Sort — top right */}
//             <div className="mt-3">
//               <SortDropdown />
//             </div>
//           </div>
//         </div>

//         {/* Content */}
//         <div className="flex gap-10 pt-8">
//           {/* Sidebar */}
//           <FilterSidebar onClearAll={() => {}} />

//           {/* Main */}
//           <div className="flex-1 min-w-0">
//             {/* Count */}
//             <p className="text-[14px] text-gray-500 mb-6">
//               <span className="font-semibold text-gray-900">
//                 {PRODUCTS.length}
//               </span>{" "}
//               items found
//             </p>

//             {/* Grid */}
//             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
//               {paginated.map((p) => (
//                 <ProductCard key={p.id} p={p} />
//               ))}
//             </div>

//             {/* Pagination */}
//             <Pagination current={page} total={totalPages} onChange={setPage} />
//           </div>
//         </div>
//       </div>

//       <Footer />
//     </div>
//   );
// }
