"use client";

export default function CommunitySection() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16 bg-white rounded-2xl shadow-lg p-12 grid grid-cols-2 gap-12 items-center">
      <div>
        <h2 className="text-3xl font-bold text-black mb-6">
          Join Our Community And Offline Store Sale
        </h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Experience the thrill of discovering unique pieces at our pop-up
          events. Connect with fellow fashion enthusiasts, learn styling tips,
          and find your next favorite vintage treasure.
        </p>
        <button className="bg-red-800 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-700 transition">
          Find an Event Near You
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="h-48 bg-gray-300 rounded-lg overflow-hidden hover:shadow-lg transition">
          <img
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200&fit=crop"
            alt="community"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="h-48 bg-gray-400 rounded-lg overflow-hidden hover:shadow-lg transition">
          <img
            src="https://images.unsplash.com/photo-1595959375944-d28b9bbf0ed1?w=300&h=200&fit=crop"
            alt="store"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
