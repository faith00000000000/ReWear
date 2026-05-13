"use client";

import { ArrowRight } from "lucide-react";

export default function StorySection() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-2 gap-12 items-center">
      <div className="grid grid-cols-2 gap-4">
        <div className="h-64 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-2xl overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1595777712802-6b2ecef04908?w=300&h=300&fit=crop"
            alt="story"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="space-y-4">
          <div className="h-28 bg-gray-300 rounded-lg overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1595777935289-ecf526891b48?w=200&h=140&fit=crop"
              alt="story2"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="h-28 bg-yellow-300 rounded-lg overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1595777713710-e51464a609da?w=200&h=140&fit=crop"
              alt="story3"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-4xl font-bold text-black mb-6">
          Every thrifted piece carries a story
        </h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          We believe in giving fashion a second life. Every piece in our
          collection has been carefully curated, letting its own unique story
          while contributing to a more sustainable future. Join the movement
          towards conscious consumption without compromising on style.
        </p>
        <a
          href="#"
          className="text-green-600 font-semibold flex items-center gap-2 hover:text-green-700 transition"
        >
          Learn more <ArrowRight size={16} />
        </a>
      </div>
    </section>
  );
}
