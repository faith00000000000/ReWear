import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Heart, SlidersHorizontal, Tag } from "lucide-react";
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

export const statusClass: Record<Status, string> = {
  THRIFT: "bg-[#AC1B18] text-[#FAF2E6]",
  RENT: "bg-[#5E6B52] text-white",
  "THRIFT + RENT": "bg-[#211714] text-[#FAF2E6]",
};

export default function BrowseFindsPage() {
  return (
    <div className="min-h-screen bg-[#FAF2E6] text-[#211714]">
      <div className="border-x-[6px] border-t-[6px] border-[#AC1B18]">
        <Navbar />

        <main>
          <section className="px-7 pb-10 pt-14 sm:px-12 lg:px-24">
            <div className="mx-auto max-w-[1380px]">
              <p className="mb-7 text-[12px] font-black uppercase tracking-[0.42em] text-[#9f9286]">
                Hand-picked second-hand
              </p>

              <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                  <h1 className="text-[58px] font-black leading-[0.9] tracking-[-0.045em] text-[#1b1110] sm:text-[78px] lg:text-[92px] [font-family:Georgia,serif]">
                    The Thrift{" "}
                    <span className="font-normal italic text-[#AC1B18] [font-family:cursive]">
                      closet
                    </span>
                  </h1>
                  <p className="mt-8 max-w-[650px] text-[18px] font-medium leading-8 text-[#6f665c]">
                    Eight new arrivals every Friday. Each piece is
                    photographed, measured, steamed, and marked for thrift,
                    rent, or both before it goes live.
                  </p>
                </div>

                <label className="flex w-fit items-center gap-2 rounded-full border border-[#d7cbbb] bg-[#fffaf2] px-5 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-[#5E6B52]">
                  Sort
                  <select className="appearance-none bg-transparent pr-5 text-[#211714] outline-none">
                    <option>Newest</option>
                    <option>Recommended</option>
                    <option>Price low</option>
                    <option>Price high</option>
                  </select>
                  <ChevronDown className="-ml-6 h-4 w-4 text-[#AC1B18]" />
                </label>
              </div>
            </div>
          </section>

          <section className="px-7 pb-20 sm:px-12 lg:px-24">
            <div className="mx-auto grid max-w-[1380px] gap-10 lg:grid-cols-[250px_1fr]">
              <FilterRail />

              <div className="min-w-0">
                <div className="mb-6 flex flex-col gap-3 border-y border-[#d7cbbb] py-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[12px] font-black uppercase tracking-[0.22em] text-[#81776c]">
                    <span className="text-[#AC1B18]">8</span> arrivals found
                  </p>
                  <p className="text-[12px] font-bold text-[#6f665c]">
                    Status labels show whether each piece is available to
                    thrift, rent, or both.
                  </p>
                </div>

                <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                <Pagination />
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
    <aside className="h-fit border border-[#d7cbbb] bg-[#fffaf2] px-5 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-[13px] font-black uppercase tracking-[0.2em] text-[#211714]">
          <SlidersHorizontal size={15} className="text-[#AC1B18]" />
          Filters
        </h2>
        <button className="text-[10px] font-black uppercase tracking-[0.14em] text-[#5E6B52] underline underline-offset-4">
          Clear
        </button>
      </div>

      {filters.map((filter) => (
        <section
          key={filter.title}
          className="border-b border-[#d7cbbb] py-5 first:pt-0 last:border-b-0 last:pb-0"
        >
          <button className="flex w-full items-center justify-between text-left">
            <span className="text-[12px] font-black uppercase tracking-[0.16em] text-[#211714]">
              {filter.title}
            </span>
            <ChevronDown className="h-4 w-4 text-[#AC1B18]" />
          </button>

          {filter.open ? (
            <div className="mt-4 space-y-3">
              {filter.options.map((option) => (
                <label
                  key={option}
                  className="flex cursor-pointer items-center gap-3 text-[13px] font-medium text-[#665d54]"
                >
                  <input className="h-4 w-4 accent-[#AC1B18]" type="checkbox" />
                  {option}
                </label>
              ))}
            </div>
          ) : null}
        </section>
      ))}

      <section className="pt-5">
        <button className="flex w-full items-center justify-between text-left">
          <span className="text-[12px] font-black uppercase tracking-[0.16em] text-[#211714]">
            Price Range
          </span>
          <ChevronDown className="h-4 w-4 text-[#AC1B18]" />
        </button>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <label>
            <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-[#81776c]">
              Min
            </span>
            <input
              defaultValue="$0"
              className="h-10 w-full border border-[#d7cbbb] bg-[#FAF2E6] px-3 text-[12px] font-bold outline-none focus:border-[#5E6B52]"
            />
          </label>
          <label>
            <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-[#81776c]">
              Max
            </span>
            <input
              defaultValue="$200+"
              className="h-10 w-full border border-[#d7cbbb] bg-[#FAF2E6] px-3 text-[12px] font-bold outline-none focus:border-[#5E6B52]"
            />
          </label>
        </div>
      </section>
    </aside>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group relative">
      <Link
        href={`/browse-finds/${product.id}`}
        aria-label={`View ${product.name}`}
        className="block"
      >
        <div className="relative aspect-[0.86/1] overflow-hidden bg-[#f4d7a7]">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
          <span className="absolute left-4 top-4 rounded-full bg-[#FAF2E6]/95 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#5E6B52] shadow-sm">
            One of one
          </span>
          <span
            className={`absolute bottom-4 left-4 rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] shadow-sm ${statusClass[product.status]}`}
          >
            {product.status}
          </span>
        </div>
      </Link>
      <button
        type="button"
        aria-label={`Save ${product.name}`}
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#FAF2E6]/95 text-[#AC1B18] shadow-sm transition hover:bg-white"
      >
        <Heart size={18} />
      </button>

      <div className="pt-4">
        <p className="text-[12px] font-black uppercase tracking-[0.28em] text-[#9f9286]">
          {product.brand}
        </p>
        <h2 className="mt-2 min-h-[46px] text-[17px] font-black leading-6 text-[#241812] [font-family:Georgia,serif]">
          {product.name}
        </h2>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] font-bold text-[#6f665c]">
          <span className="inline-flex items-center gap-1">
            <Tag size={13} className="text-[#5E6B52]" />
            {product.size}
          </span>
          <span>{product.condition}</span>
          <span>{product.status}</span>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="text-[20px] font-black text-[#AC1B18]">
            {product.price}{" "}
            {product.oldPrice ? (
              <span className="ml-1 text-[13px] font-bold text-[#9f9286] line-through">
                {product.oldPrice}
              </span>
            ) : null}
          </p>
          <Link
            href={`/browse-finds/${product.id}`}
            className="text-[11px] font-black uppercase tracking-[0.24em] text-[#5E6B52] transition hover:text-[#AC1B18]"
          >
            View
          </Link>
        </div>
      </div>
    </article>
  );
}

function Pagination() {
  return (
    <nav className="mt-14 flex flex-wrap items-center justify-center gap-3 text-[12px] font-black uppercase tracking-[0.12em]">
      <button className="h-10 rounded-full border border-[#d7cbbb] px-5 text-[#6f665c] transition hover:border-[#5E6B52] hover:text-[#5E6B52]">
        Previous
      </button>
      <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#AC1B18] text-[#FAF2E6]">
        1
      </button>
      <button className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d7cbbb] text-[#211714] transition hover:border-[#AC1B18] hover:text-[#AC1B18]">
        2
      </button>
      <button className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d7cbbb] text-[#211714] transition hover:border-[#AC1B18] hover:text-[#AC1B18]">
        3
      </button>
      <button className="h-10 rounded-full border border-[#AC1B18] px-5 text-[#AC1B18] transition hover:bg-[#AC1B18] hover:text-[#FAF2E6]">
        Next
      </button>
    </nav>
  );
}
