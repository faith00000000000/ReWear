'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  Package,
  UserRound,
  ChevronDown,
  Truck,
  ShieldCheck,
  Heart,
  Info,
  Building2,
  AlertTriangle,
} from 'lucide-react';

const ngos = [
  {
    id: 'sajha-foundation',
    name: 'Sajha Foundation Nepal',
    type: 'NGO',
    description: 'Supporting families and communities in need.',
  },
  {
    id: 'women-support',
    name: 'Women & Children Support Network',
    type: 'NGO',
    description: 'Supporting women and children through essential resources.',
  },
];

const ingos = [
  {
    id: 'red-cross',
    name: 'International Relief & Aid Network',
    type: 'INGO',
    description: 'Providing humanitarian support to vulnerable communities.',
  },
  {
    id: 'global-clothing',
    name: 'Global Clothing Relief',
    type: 'INGO',
    description: 'Connecting usable clothing with communities in need.',
  },
];

export default function DonationFormPage() {
  const [organizationType, setOrganizationType] = useState<'NGO' | 'INGO'>(
    'NGO',
  );
  const [organization, setOrganization] = useState('');
  const [boxCount, setBoxCount] = useState('1 Box / Bag');
  const [weight, setWeight] = useState('');
  const [agreedToDisclaimer, setAgreedToDisclaimer] = useState(false);

  const organizations = organizationType === 'NGO' ? ngos : ingos;

  return (
    <main className="min-h-screen bg-[#FAF2E6] text-[#211714] antialiased">
      {/* HEADER */}
      <header className="border-b border-[#E3D7C7] bg-[#F5ECDF] py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 sm:px-8 lg:px-12">
          <Link
            href="/donate"
            className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#5E6B52] transition-colors hover:text-[#AC1B18]"
          >
            <ArrowLeft
              size={16}
              strokeWidth={2.5}
              className="transition-transform group-hover:-translate-x-1"
            />
            <span>Back to donation</span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7E7469]">
            <ShieldCheck size={16} className="text-[#5E6B52]" />
            <span>Secure Donation</span>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-12 lg:py-14">
        {/* PAGE INTRO */}
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#AC1B18]/10 text-[#AC1B18]">
            <Heart size={22} />
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#AC1B18]">
            Give Clothes A Second Life
          </p>

          <h1 className="mt-3 font-serif text-4xl font-black text-[#130D0B] sm:text-5xl">
            Make Your Donation Count
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#6F665C]">
            Donate usable clothing to a verified NGO or INGO through ReWear.
            Your contribution helps keep clothing in use while supporting
            communities that need it.
          </p>
        </div>

        {/* PROGRESS STEPPER */}
        <div className="mx-auto mb-10 max-w-4xl">
          <div className="flex items-center justify-between">
            <Step number="1" label="Your Details" active />
            <StepLine />
            <Step number="2" label="Donation" active />
            <StepLine />
            <Step number="3" label="Organization" active />
          </div>
        </div>

        <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
          {/* MAIN FORM */}
          <div className="lg:col-span-7">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
              {/* SECTION 1 */}
              <section className="rounded-2xl border border-[#D8CFC2] bg-[#FFFAF2] p-6 shadow-sm sm:p-8">
                <SectionHeader
                  icon={<UserRound size={18} />}
                  title="1. Your Information"
                  description="Tell us where your donation should be collected from."
                />

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Full Name"
                    placeholder="Your full name"
                    required
                  />

                  <Field
                    label="Email Address"
                    placeholder="you@example.com"
                    type="email"
                    required
                  />

                  <Field
                    label="Phone Number"
                    placeholder="+977 98XXXXXXXX"
                    type="tel"
                    required
                  />

                  <Field
                    label="Pickup Address"
                    placeholder="Street, City"
                    required
                  />
                </div>
              </section>

              {/* SECTION 2 */}
              <section className="rounded-2xl border border-[#D8CFC2] bg-[#FFFAF2] p-6 shadow-sm sm:p-8">
                <SectionHeader
                  icon={<Package size={18} />}
                  title="2. Donation Details"
                  description="Tell us what you are donating so we can prepare for your contribution."
                />

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  {/* PACKAGE COUNT */}
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#7E7469]">
                      Package Count
                    </label>

                    <div className="relative">
                      <select
                        value={boxCount}
                        onChange={(e) => setBoxCount(e.target.value)}
                        className="h-12 w-full appearance-none rounded-xl border border-[#D8CFC2] bg-[#FAF2E6] px-4 text-sm font-semibold text-[#211714] focus:border-[#AC1B18] focus:outline-none"
                      >
                        <option>1 Box / Bag</option>
                        <option>2 Boxes / Bags</option>
                        <option>3 Boxes / Bags</option>
                        <option>4+ Boxes / Bags</option>
                      </select>

                      <ChevronDown
                        size={16}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#7E7469]"
                      />
                    </div>
                  </div>

                  {/* WEIGHT — informational only, no longer tied to any reward calculation */}
                  <Field
                    label="Estimated Donation Weight (kg)"
                    placeholder="e.g. 12"
                    type="number"
                    min="0"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    required
                  />
                </div>

                {/* NOTES */}
                <div className="mt-6">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#7E7469]">
                    Additional Notes
                    <span className="ml-1 font-normal normal-case tracking-normal text-[#A89E94]">
                      (Optional)
                    </span>
                  </label>

                  <textarea
                    rows={3}
                    placeholder="Tell us anything we should know about your donation..."
                    className="w-full rounded-xl border border-[#D8CFC2] bg-[#FAF2E6] p-4 text-sm font-medium text-[#211714] placeholder:text-[#A89E94] focus:border-[#AC1B18] focus:outline-none"
                  />
                </div>
              </section>

              {/* SECTION 3 */}
              <section className="rounded-2xl border border-[#D8CFC2] bg-[#FFFAF2] p-6 shadow-sm sm:p-8">
                <SectionHeader
                  icon={<Building2 size={18} />}
                  title="3. Choose Where to Donate"
                  description="Select the type of organization and your preferred beneficiary."
                />

                {/* NGO / INGO TOGGLE */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setOrganizationType('NGO');
                      setOrganization('');
                    }}
                    className={`rounded-xl border px-4 py-4 text-left transition-all ${
                      organizationType === 'NGO'
                        ? 'border-[#AC1B18] bg-[#AC1B18]/5 ring-1 ring-[#AC1B18]'
                        : 'border-[#D8CFC2] bg-[#FAF2E6] hover:border-[#A89E94]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[#211714]">
                        NGO
                      </span>

                      {organizationType === 'NGO' && (
                        <Check size={16} className="text-[#AC1B18]" />
                      )}
                    </div>

                    <p className="mt-1 text-xs text-[#6F665C]">
                      Local / national organizations
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOrganizationType('INGO');
                      setOrganization('');
                    }}
                    className={`rounded-xl border px-4 py-4 text-left transition-all ${
                      organizationType === 'INGO'
                        ? 'border-[#AC1B18] bg-[#AC1B18]/5 ring-1 ring-[#AC1B18]'
                        : 'border-[#D8CFC2] bg-[#FAF2E6] hover:border-[#A89E94]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[#211714]">
                        INGO
                      </span>

                      {organizationType === 'INGO' && (
                        <Check size={16} className="text-[#AC1B18]" />
                      )}
                    </div>

                    <p className="mt-1 text-xs text-[#6F665C]">
                      International organizations
                    </p>
                  </button>
                </div>

                {/* ORGANIZATION */}
                <div className="mt-5">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#7E7469]">
                    Select {organizationType}
                    <span className="ml-1 text-[#AC1B18]">*</span>
                  </label>

                  <div className="relative">
                    <select
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      className="h-14 w-full appearance-none rounded-xl border border-[#D8CFC2] bg-[#FAF2E6] px-4 pr-12 text-sm font-semibold text-[#211714] focus:border-[#AC1B18] focus:outline-none"
                    >
                      <option value="">
                        Choose a {organizationType.toLowerCase()}...
                      </option>

                      {organizations.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name}
                        </option>
                      ))}
                    </select>

                    <ChevronDown
                      size={17}
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#7E7469]"
                    />
                  </div>

                  {organization && (
                    <div className="mt-3 rounded-xl bg-[#F5ECDF] p-4">
                      <p className="text-xs leading-relaxed text-[#6F665C]">
                        {
                          organizations.find((org) => org.id === organization)
                            ?.description
                        }
                      </p>
                    </div>
                  )}
                </div>

                {/* DISCLAIMER */}
                <div className="mt-7 rounded-2xl border border-[#E2CDBD] bg-[#FBF4EB] p-5">
                  <div className="flex gap-3">
                    <AlertTriangle
                      size={19}
                      className="mt-0.5 shrink-0 text-[#AC1B18]"
                    />

                    <div className="font-[Poppins]">
                      <h3 className="text-sm font-semibold text-[#211714]">
                        Donation Guidelines
                      </h3>

                      <ul className="mt-3 space-y-2 text-xs leading-6 text-[#6F665C]">
                        <li>
                          • Please donate only clothes that are clean, wearable,
                          and suitable for use by another person.
                        </li>
                        <li>
                          • Do not donate heavily damaged, wet, moldy, or
                          contaminated clothing.
                        </li>
                        <li>
                          • Items with severe stains, strong odors, or
                          structural damage may be rejected during inspection.
                        </li>
                        <li>
                          • ReWear and the selected organization reserve the
                          right to refuse items that are unsuitable for
                          redistribution.
                        </li>
                        <li>
                          • Donated items may be sorted, redistributed,
                          repurposed, or recycled depending on their condition
                          and the organizations needs.
                        </li>
                      </ul>

                      <label className="mt-4 flex cursor-pointer items-start gap-3 border-t border-[#E2D7CA] pt-4">
                        <input
                          type="checkbox"
                          checked={agreedToDisclaimer}
                          onChange={(e) =>
                            setAgreedToDisclaimer(e.target.checked)
                          }
                          className="mt-1 h-4 w-4 accent-[#AC1B18]"
                        />

                        <span className="text-xs font-medium leading-5 text-[#52483E]">
                          I confirm that the clothes I am donating are
                          reasonably clean, usable, and suitable for another
                          person.
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* SUBMIT — no longer gated on category selection since categories were removed */}
                <button
                  type="submit"
                  disabled={!agreedToDisclaimer || !organization}
                  className="mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-[#1B1110] px-8 py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-[#AC1B18] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Truck size={18} />
                  <span>Confirm Donation</span>
                </button>
              </section>
            </form>
          </div>

          {/* SIDEBAR */}
          <aside className="lg:sticky lg:top-8 lg:col-span-5">
            <div className="overflow-hidden rounded-2xl border border-[#D8CFC2] bg-[#F5ECDF] shadow-sm">
              <div className="border-t border-[#E3D7C7] p-6 sm:p-8">
                <div className="flex items-center gap-2">
                  <Info size={17} className="text-[#AC1B18]" />

                  <span className="text-xs font-bold uppercase tracking-wider text-[#7E7469]">
                    Donation Summary
                  </span>
                </div>

                <div className="mt-5 space-y-4 text-sm">
                  <SummaryRow label="Package" value={boxCount} />

                  <SummaryRow
                    label="Estimated Weight"
                    value={`${weight || 0} kg`}
                  />

                  <SummaryRow
                    label="Organization"
                    value={
                      organization
                        ? organizations.find((org) => org.id === organization)
                            ?.name || organizationType
                        : `Select ${organizationType}`
                    }
                  />
                </div>

                {/* TRUST POINTS */}
                <ul className="mt-6 space-y-3 text-xs font-semibold text-[#52483E]">
                  <li className="flex items-center gap-2.5">
                    <Check
                      size={14}
                      className="text-[#5E6B52]"
                      strokeWidth={3}
                    />
                    <span>Choose between NGO and INGO partners</span>
                  </li>

                  <li className="flex items-center gap-2.5">
                    <Check
                      size={14}
                      className="text-[#5E6B52]"
                      strokeWidth={3}
                    />
                    <span>
                      Clothes go directly to communities that need them
                    </span>
                  </li>

                  <li className="flex items-center gap-2.5">
                    <Check
                      size={14}
                      className="text-[#5E6B52]"
                      strokeWidth={3}
                    />
                    <span>Secure, verified organization partners only</span>
                  </li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

/* ============================================================
   SMALL UI COMPONENTS
============================================================ */

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-[#EADFD1] pb-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#AC1B18]/10 text-[#AC1B18]">
        {icon}
      </div>

      <div>
        <h2 className="font-serif text-xl font-bold text-[#130D0B]">{title}</h2>

        <p className="mt-0.5 text-xs text-[#6F665C]">{description}</p>
      </div>
    </div>
  );
}

function Step({
  number,
  label,
  active,
}: {
  number: string;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${
        active ? 'text-[#AC1B18]' : 'text-[#7E7469]'
      }`}
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] ${
          active
            ? 'bg-[#AC1B18] text-white'
            : 'border border-[#D8CFC2] bg-[#F5ECDF]'
        }`}
      >
        {number}
      </span>

      <span className="hidden sm:inline">{label}</span>
    </div>
  );
}

function StepLine() {
  return <span className="mx-3 h-px flex-1 bg-[#D8CFC2]" />;
}

function Field({
  label,
  placeholder,
  type = 'text',
  required = false,
  min,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  type?: string;
  required?: boolean;
  min?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#7E7469]">
        {label}
        {required && <span className="ml-1 text-[#AC1B18]">*</span>}
      </span>

      <input
        type={type}
        required={required}
        min={min}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="h-12 w-full rounded-xl border border-[#D8CFC2] bg-[#FAF2E6] px-4 text-sm font-medium text-[#211714] placeholder:text-[#A89E94] focus:border-[#AC1B18] focus:outline-none focus:ring-1 focus:ring-[#AC1B18]/20"
      />
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#E3D7C7] pb-3">
      <span className="text-[#6F665C]">{label}</span>

      <span className="max-w-[55%] text-right font-bold text-[#211714]">
        {value}
      </span>
    </div>
  );
}
