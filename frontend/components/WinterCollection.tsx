"use client";

import { ArrowRight } from "lucide-react";

export default function WinterCollection() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <div className="flex justify-between items-start mb-8">
        <h2 className="text-4xl font-bold text-black">winter collection</h2>
        <a
          href="#"
          className="text-green-600 font-semibold flex items-center gap-2 hover:text-green-700 transition"
        >
          SEE MORE <ArrowRight size={16} />
        </a>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="h-64 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-lg overflow-hidden hover:shadow-lg transition">
          <img
            src="https://images.unsplash.com/photo-1595777712802-6b2ecef04908?w=300&h=300&fit=crop"
            alt="winter"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="h-64 bg-red-300 rounded-lg overflow-hidden hover:shadow-lg transition">
          <img
            src="https://images.unsplash.com/photo-1595777935289-ecf526891b48?w=300&h=300&fit=crop"
            alt="winter2"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="h-64 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg overflow-hidden hover:shadow-lg transition">
          <img
            src="https://images.unsplash.com/photo-1595777713710-e51464a609da?w=300&h=300&fit=crop"
            alt="winter3"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="h-64 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-lg overflow-hidden hover:shadow-lg transition">
          <img
            src="https://images.unsplash.com/photo-1595777935289-ecf526891b48?w=300&h=300&fit=crop"
            alt="winter4"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
