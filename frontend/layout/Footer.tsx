"use client";

const footerGroups = [
  {
    title: "Shop",
    links: ["Thrift", "Rent", "New Arrivals", "Winter Edit"],
  },
  {
    title: "Company",
    links: ["Our Story", "Sustainability", "Careers", "Press"],
  },
  {
    title: "Help",
    links: ["Contact", "Shipping", "Returns", "FAQ"],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#AC1B18] text-[#FAF2E6]">
      <div className="mx-auto grid max-w-[1380px] gap-10 px-8 py-14 sm:px-14 md:grid-cols-[1.35fr_1fr_1fr_1fr] lg:px-24">
        <div>
          <h2 className="text-[22px] font-black leading-none tracking-[-0.03em] [font-family:Georgia,serif]">
            REWEAR
          </h2>
          <p className="mt-2 text-[11px] font-bold tracking-[0.04em]">
            Fashion That Lasts.
          </p>
        </div>

        {footerGroups.map((group) => (
          <div key={group.title}>
            <h3 className="mb-4 text-[10px] font-black uppercase tracking-[0.28em] text-[#f0d5ca]">
              {group.title}
            </h3>
            <ul className="space-y-2">
              {group.links.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-[12px] font-bold text-[#FAF2E6] transition hover:text-white"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-[#FAF2E6]/25">
        <div className="mx-auto flex max-w-[1380px] flex-col gap-3 px-8 py-5 text-[10px] font-black uppercase tracking-[0.26em] text-[#f0d5ca] sm:px-14 md:flex-row md:items-center md:justify-between lg:px-24">
          <p>© 2026 RE:WEAR Studio</p>
          <p>Vintage. Rented. Loved again.</p>
        </div>
      </div>
    </footer>
  );
}
