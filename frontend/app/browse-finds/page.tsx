import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Heart, SlidersHorizontal } from "lucide-react";
import Navbar from "@/layout/Navbar";
import Footer from "@/layout/Footer";
import { Product, Status, products } from "./products";

const filters = [
  {
    title: "Category",
    options: ["Ready-to-Wear", "Handbags", "Shoes", "Accessories"],
    open: true,
  },
  {
    title: "Availability",
    options: ["Thrift", "Rent", "Thrift + Rent"],
    open: true,
  },
  {
    title: "Brand",
    options: ["Vintage", "Levi's", "Wrangler", "Studio Slip"],
    open: false,
  },
  {
    title: "Size",
    options: ["XS", "S", "M", "L", "XL", "One Size"],
    open: false,
  },
  {
    title: "Condition",
    options: ["Like New", "Excellent", "Very Good", "Vintage"],
    open: false,
  },
];

const statusClass: Record<Status, string> = {
  THRIFT: "bg-[#A62612] text-[#FBF7EE]",
  RENT: "bg-[#707070] text-white",
  "THRIFT + RENT": "bg-[#1A1A1A] text-[#FBF7EE]",
};

export default function BrowseFindsPage() {
  return (
    <div className="min-h-screen bg-[#FBF7EE] text-[#1A1A1A]">
      {/* Thick red accent borders matching the uploaded design */}
      <div className="border-x-[6px] border-t-[6px] border-[#A62612]">
        <Navbar />

        <main>
          <section className="relative overflow-hidden px-7 pb-16 pt-12 sm:px-12 lg:px-24">
            <div className="mx-auto max-w-[1380px]">
              <div className="grid items-center gap-16 lg:grid-cols-[1fr_520px]">
                {/* LEFT CONTENT */}
                <div className="relative z-10 max-w-[620px]">
                  <p className="mb-8 text-[13px] font-semibold uppercase tracking-[0.35em] text-[#A62612]">
                    Hand-picked second-hand
                  </p>

                  <h1 className="font-serif leading-[0.88] tracking-[-0.05em] text-[#111111]">
                    <span className="block text-[68px] sm:text-[90px] lg:text-[108px] font-medium">
                      The Thrift
                    </span>

                    <span className="block text-[64px] sm:text-[82px] lg:text-[96px] font-normal italic text-[#A62612]">
                      closet
                    </span>
                  </h1>

                  <p className="mt-10 max-w-[520px] text-[18px] leading-[1.9] text-[#4D4D4D]">
                    Eight new arrivals every Friday. Each piece is photographed,
                    measured, steamed, and marked for thrift, rent, or both
                    before it goes live.
                  </p>
                </div>

                {/* RIGHT VISUAL */}
                <div className="relative hidden lg:block">
                  {/* Main Image */}
                  <div className="relative ml-auto h-[520px] w-full overflow-hidden ">
                    <Image
                      src="/images/thrift.png"
                      alt="Thrift collection"
                      fill
                      priority
                      className="object-cover"
                    />
                  </div>

                  {/* Sort Button */}
                  <div className="absolute -bottom-10 right-0">
                    <label className="flex items-center gap-2 rounded-full border border-[#D7D1CA] bg-[#FBF7EE]/95 px-5 py-2.5 backdrop-blur-sm shadow-sm">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#555]">
                        Sort
                      </span>

                      <select className="appearance-none bg-transparent pr-4 text-[14px] w-full font-medium text-[#1A1A1A] outline-none">
                        <option>Newest</option>
                        <option>Recommended</option>
                        <option>Price low</option>
                        <option>Price high</option>
                      </select>

                      <ChevronDown className="h-4 w-4 text-[#707070]" />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="px-7 pb-20 sm:px-12 lg:px-24">
            <div className="mx-auto max-w-[1380px] overflow-hidden rounded-[16px] border border-[#E4DDD3] bg-[#FDFBF7]">
              <div className="grid lg:grid-cols-[230px_1fr]">
                <FilterRail />

                <div className="min-w-0">
                  <div className="flex items-center justify-between border-b border-[#E4DDD3] px-6 py-5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#1A1A1A]">
                      8 Arrivals Found
                    </p>

                    <p className="text-[11px] text-[#707070]">
                      Status labels show whether each piece is available to
                      thrift, rent, or both.
                    </p>
                  </div>

                  <div className="grid gap-x-5 gap-y-8 p-6 sm:grid-cols-2 xl:grid-cols-4">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  <Pagination />
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
}

function FilterRail() {
  return (
    <aside className="border-r border-[#E4DDD3] bg-[#FDFBF7] px-5 py-5">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#1A1A1A]">
          FF Filters
        </h2>

        <button className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#A62612] hover:opacity-80">
          Clear
        </button>
      </div>

      {filters.map((filter) => (
        <section key={filter.title} className="border-b border-[#E4DDD3] py-5">
          <button className="flex w-full items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#1A1A1A]">
              {filter.title}
            </span>

            <ChevronDown className="h-4 w-4 text-[#707070]" />
          </button>

          {filter.open && (
            <div className="mt-4 space-y-3">
              {filter.options.map((option) => (
                <label
                  key={option}
                  className="flex cursor-pointer items-center gap-3 text-[13px] text-[#4D4D4D]"
                >
                  <input type="checkbox" className="h-4 w-4 accent-[#A62612]" />
                  {option}
                </label>
              ))}
            </div>
          )}
        </section>
      ))}

      <section className="pt-5">
        <button className="flex w-full items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#1A1A1A]">
            Price Range
          </span>

          <ChevronDown className="h-4 w-4 text-[#707070]" />
        </button>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <label>
            <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.12em] text-[#707070]">
              Min
            </span>

            <input
              defaultValue="$0"
              className="h-9 w-full rounded border border-[#E4DDD3] bg-white px-2 text-[12px] font-medium outline-none focus:border-[#A62612]"
            />
          </label>

          <label>
            <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.12em] text-[#707070]">
              Max
            </span>

            <input
              defaultValue="$200+"
              className="h-9 w-full rounded border border-[#E4DDD3] bg-white px-2 text-[12px] font-medium outline-none focus:border-[#A62612]"
            />
          </label>
        </div>
      </section>
    </aside>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const badgeStyle =
    statusClass[product.status] || "bg-[#A62612] text-[#FBF7EE]";

  return (
    <article className="group">
      <div className="relative aspect-[0.8/1] overflow-hidden rounded-[8px] bg-[#F5F0E8]">
        <Link
          href={`/browse-finds/${product.id}`}
          className="block h-full w-full"
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width:1280px) 25vw, (min-width:640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        </Link>

        <span
          className={`absolute left-2 top-2 rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${badgeStyle}`}
        >
          {product.status}
        </span>

        <button
          type="button"
          aria-label={`Save ${product.name}`}
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm"
        >
          <Heart
            size={14}
            strokeWidth={2}
            className="text-[#707070] transition hover:text-[#A62612]"
          />
        </button>
      </div>

      <Link href={`/browse-finds/${product.id}`} className="mt-3 block">
        <h2 className="line-clamp-2 text-[14px] font-medium leading-5 text-[#1A1A1A]">
          {product.name}
        </h2>

        <p className="mt-1 text-[15px] font-semibold text-[#1A1A1A]">
          {product.price}
        </p>
      </Link>
    </article>
  );
}

function Pagination() {
  return (
    <nav className="flex items-center justify-center gap-2 border-t border-[#E4DDD3] py-5">
      <button className="rounded border border-[#E4DDD3] px-3 py-1.5 text-[11px] text-[#707070] transition hover:border-[#A62612] hover:text-[#A62612]">
        Previous
      </button>

      <button className="flex h-7 w-7 items-center justify-center rounded bg-[#A62612] text-[11px] font-semibold text-white">
        1
      </button>

      <button className="flex h-7 w-7 items-center justify-center rounded border border-[#E4DDD3] text-[11px] text-[#1A1A1A]">
        2
      </button>

      <button className="flex h-7 w-7 items-center justify-center rounded border border-[#E4DDD3] text-[11px] text-[#1A1A1A]">
        3
      </button>

      <button className="rounded border border-[#E4DDD3] px-3 py-1.5 text-[11px] text-[#707070] transition hover:border-[#A62612] hover:text-[#A62612]">
        Next
      </button>
    </nav>
  );
}
