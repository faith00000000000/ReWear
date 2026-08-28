import Image from "next/image";
import Link from "next/link";

const footerGroups = [
  {
    title: "Our Services",
    links: [
      { label: "Thrift", href: "/browse-finds" },
      { label: "Rent", href: "/rent" },
      { label: "Donate", href: "/donate" },
    ],
  },
  {
    title: "Shop",
    links: [
      { label: "Ready to wear", href: "/#ready-to-wear" },
      { label: "Rent the look", href: "/#rent-the-look" },
      { label: "Donate the Pieces", href: "/#donate-the-pieces" },
      { label: "FAQs", href: "/#faqs" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#AC1B18] text-[#FAF2E6]">
      <div className="mx-auto grid max-w-[1380px] grid-cols-3 items-start gap-3 px-4 py-12 sm:gap-10 sm:px-14 sm:py-14 lg:px-24">
        <div className="flex min-w-0 flex-col items-start">
          <h2 className="text-[16px] font-black leading-none sm:text-[22px] tracking-[-0.03em] [font-family:Georgia,serif]">
            REWEAR
          </h2>
          <Image src="/images/Rewear_white.png" alt="Rewear logo" width={96} height={96} className="mt-4 h-auto w-20 max-w-full object-contain sm:w-24" />
          <p className="mt-2 text-[11px] font-bold tracking-[0.04em]">
            Fashion That Lasts.
          </p>
        </div>

        {footerGroups.map((group) => (
          <div key={group.title} className="min-w-0">
            <h3 className="mb-4 text-[10px] font-black uppercase tracking-[0.08em] text-[#f0d5ca] sm:tracking-[0.28em]">
              {group.title}
            </h3>
            <ul className="flex flex-col items-start gap-2">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[12px] font-bold text-[#FAF2E6] transition hover:text-white"
                  >
                    {link.label}
                  </Link>
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
