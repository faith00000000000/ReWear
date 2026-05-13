"use client";

import { ArrowRight } from "lucide-react";

export default function RentSection() {
  const rentItems = [
    { name: "Designer Dress", price: "$25/day" },
    { name: "Evening Gown", price: "$35/day" },
    { name: "Casual Outfit", price: "$15/day" },
    { name: "Luxury Handbag", price: "$20/day" },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-3xl font-bold text-black">Rent</h3>
        <a
          href="#"
          className="text-sm text-green-600 font-semibold flex items-center gap-2 hover:text-green-700 transition"
        >
          SEE MORE <ArrowRight size={16} />
        </a>
      </div>
      <div className="grid grid-cols-4 gap-6">
        {rentItems.map((item, i) => (
          <div
            key={i}
            className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition group cursor-pointer"
          >
            <div
              className={`w-full h-48 bg-gradient-to-br from-purple-300 to-indigo-400 overflow-hidden group-hover:scale-105 transition duration-300`}
            >
              <img
                src={`https://images.unsplash.com/photo-${[1595777712802, 1595777935289, 1594938373556, 1595777935289][i]}-6b2ecef04908?w=200&h=200&fit=crop`}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <p className="font-semibold text-black">{item.name}</p>
              <p className="text-green-600 text-sm font-medium">{item.price}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
