'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { toast } from 'react-toastify';
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
  Phone,
  Mail,
  User,
  Loader2,
} from 'lucide-react';

import { useAuth } from '@/lib/AuthContext';
import { fetchProfile } from '@/lib/api/profileApi';
import { Profile } from '@/lib/types/profile';
import {
  Organization,
  OrganizationType,
  createDonation,
  getActiveOrganizations,
} from '@/lib/api/donationApi';

const PACKAGE_COUNT_OPTIONS = [
  '1 Box / Bag',
  '2 Boxes / Bags',
  '3 Boxes / Bags',
  '4+ Boxes / Bags',
];

export default function DonationFormPage() {
  const { user } = useAuth();

  // ── Donor info ───────────────────────────────────────────────
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');

  // Per-field "use profile" loading flags so one fetch doesn't block another
  const [fetchingField, setFetchingField] = useState<
      'name' | 'email' | 'phone' | null
  >(null);

  // ── Donation details ─────────────────────────────────────────
  const [packageCount, setPackageCount] = useState(PACKAGE_COUNT_OPTIONS[0]);
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');

  // ── Organization selection (wired to backend) ───────────────
  const [organizationType, setOrganizationType] =
      useState<OrganizationType>('NGO');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [organizationId, setOrganizationId] = useState<number | ''>('');
  const [loadingOrgs, setLoadingOrgs] = useState(false);

  const [agreedToDisclaimer, setAgreedToDisclaimer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Fetch active organizations of the selected type whenever the
  // NGO/INGO toggle changes — dropdown always reflects what's active in DB.
  useEffect(() => {
    let cancelled = false;

    async function loadOrganizations() {
      setLoadingOrgs(true);
      setOrganizationId('');
      try {
        const data = await getActiveOrganizations(organizationType);
        if (!cancelled) setOrganizations(data);
      } catch {
        if (!cancelled) {
          toast.error('Could not load organizations. Please try again.');
          setOrganizations([]);
        }
      } finally {
        if (!cancelled) setLoadingOrgs(false);
      }
    }

    loadOrganizations();
    return () => {
      cancelled = true;
    };
  }, [organizationType]);

  const selectedOrg = organizations.find((o) => o.id === organizationId);

  /* ── "Use profile ___" helpers — same pattern as list-item's
     handleUseProfileNumber, one per field so they can be used
     independently and don't block each other. ── */

  type ProfileStringKey = keyof Pick<Profile, 'name' | 'email' | 'phone'>;

  const useProfileField = async (
      field: 'name' | 'email' | 'phone',
      apply: (value: string) => void,
      profileKey: ProfileStringKey,
      emptyMessage: string,
  ) => {
    if (!user?.id) {
      toast.error('You need to be logged in to do this.');
      return;
    }
    setFetchingField(field);
    try {
      const profile = await fetchProfile(user.id);
      const value = profile?.[profileKey];
      if (!value) {
        toast.info(emptyMessage);
        return;
      }
      apply(value);
    } catch {
      toast.error("Couldn't fetch your profile. Please try again.");
    } finally {
      setFetchingField(null);
    }
  };

  const handleUseProfileName = () =>
      useProfileField(
          'name',
          setFullName,
          'name',
          "You haven't added a name to your profile yet.",
      );

  const handleUseProfileEmail = () =>
      useProfileField(
          'email',
          setEmail,
          'email',
          "You haven't added an email to your profile yet.",
      );

  const handleUseProfilePhone = () =>
      useProfileField(
          'phone',
          setPhone,
          'phone',
          "You haven't added a phone number to your profile yet.",
      );

  /* ── Validation mirrors DonationRequestDto constraints ── */
  const validate = (): string | null => {
    if (!fullName.trim()) return 'Full name is required.';
    if (!email.trim()) return 'Email address is required.';
    if (!phone.trim()) return 'Phone number is required.';
    if (!pickupAddress.trim()) return 'Pickup address is required.';
    const weightNum = Number(weight);
    if (!weight || !(weightNum > 0))
      return 'Estimated weight must be greater than 0.';
    if (!organizationId) return `Please select ${organizationType.toLowerCase()} to donate to.`;
    if (!agreedToDisclaimer)
      return 'Please confirm the donation guidelines before submitting.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      await createDonation({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        pickupAddress: pickupAddress.trim(),
        packageCount,
        estimatedWeightKg: Number(weight),
        notes: notes.trim() || undefined,
        organizationId: organizationId as number,
        agreedToDisclaimer,
      });

      setSubmitted(true);
      toast.success('Thank you! Your donation has been submitted.');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 400) {
          // Org was deactivated after the donor loaded the form (the
          // IllegalStateException case documented in donation.md).
          toast.error(
              err.response?.data?.message ??
              'That organization is no longer accepting donations. Please choose another.',
          );
          // Refresh the dropdown so the stale org disappears.
          setOrganizationId('');
          getActiveOrganizations(organizationType).then(setOrganizations);
        } else {
          toast.error(
              err.response?.data?.message ??
              'Something went wrong while submitting your donation.',
          );
        }
      } else {
        toast.error('Something went wrong while submitting your donation.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
        <main className="min-h-screen bg-[#FAF2E6] text-[#211714] antialiased flex items-center justify-center px-6">
          <div className="max-w-md w-full rounded-2xl border border-[#D8CFC2] bg-[#FFFAF2] p-10 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#5E6B52]/10 text-[#5E6B52]">
              <Check size={26} strokeWidth={3} />
            </div>
            <h1 className="font-serif text-2xl font-black text-[#130D0B]">
              Donation Submitted
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#6F665C]">
              Thanks for giving your clothes a second life. Our team will
              review your submission and reach out to arrange pickup.
            </p>
            <Link
                href="/donate"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[#1B1110] px-6 py-3 text-sm font-bold text-white hover:bg-[#AC1B18] transition-colors"
            >
              <ArrowLeft size={16} />
              Back to donation
            </Link>
          </div>
        </main>
    );
  }

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
              <form onSubmit={handleSubmit} className="space-y-8">
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
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        profileAction={
                          user?.id
                              ? {
                                label: 'Use profile name',
                                icon: <User size={12} />,
                                loading: fetchingField === 'name',
                                onClick: handleUseProfileName,
                              }
                              : undefined
                        }
                    />

                    <Field
                        label="Email Address"
                        placeholder="you@example.com"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        profileAction={
                          user?.id
                              ? {
                                label: 'Use profile email',
                                icon: <Mail size={12} />,
                                loading: fetchingField === 'email',
                                onClick: handleUseProfileEmail,
                              }
                              : undefined
                        }
                    />

                    <Field
                        label="Phone Number"
                        placeholder="+977 98XXXXXXXX"
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        profileAction={
                          user?.id
                              ? {
                                label: 'Use profile number',
                                icon: <Phone size={12} />,
                                loading: fetchingField === 'phone',
                                onClick: handleUseProfilePhone,
                              }
                              : undefined
                        }
                    />

                    <Field
                        label="Pickup Address"
                        placeholder="Street, City"
                        required
                        value={pickupAddress}
                        onChange={(e) => setPickupAddress(e.target.value)}
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
                            value={packageCount}
                            onChange={(e) => setPackageCount(e.target.value)}
                            className="h-12 w-full appearance-none rounded-xl border border-[#D8CFC2] bg-[#FAF2E6] px-4 text-sm font-semibold text-[#211714] focus:border-[#AC1B18] focus:outline-none"
                        >
                          {PACKAGE_COUNT_OPTIONS.map((opt) => (
                              <option key={opt}>{opt}</option>
                          ))}
                        </select>

                        <ChevronDown
                            size={16}
                            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#7E7469]"
                        />
                      </div>
                    </div>

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
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
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
                        onClick={() => setOrganizationType('NGO')}
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
                        onClick={() => setOrganizationType('INGO')}
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

                  {/* ORGANIZATION — live from backend */}
                  <div className="mt-5">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#7E7469]">
                      Select {organizationType}
                      <span className="ml-1 text-[#AC1B18]">*</span>
                    </label>

                    <div className="relative">
                      <select
                          value={organizationId}
                          onChange={(e) =>
                              setOrganizationId(
                                  e.target.value ? Number(e.target.value) : '',
                              )
                          }
                          disabled={loadingOrgs}
                          className="h-14 w-full appearance-none rounded-xl border border-[#D8CFC2] bg-[#FAF2E6] px-4 pr-12 text-sm font-semibold text-[#211714] focus:border-[#AC1B18] focus:outline-none disabled:opacity-60"
                      >
                        <option value="">
                          {loadingOrgs
                              ? 'Loading...'
                              : organizations.length === 0
                                  ? `No ${organizationType}s available right now`
                                  : `Choose a ${organizationType.toLowerCase()}...`}
                        </option>

                        {organizations.map((org) => (
                            <option key={org.id} value={org.id}>
                              {org.name}
                            </option>
                        ))}
                      </select>

                      {loadingOrgs ? (
                          <Loader2
                              size={16}
                              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-[#7E7469]"
                          />
                      ) : (
                          <ChevronDown
                              size={17}
                              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#7E7469]"
                          />
                      )}
                    </div>

                    {selectedOrg?.description && (
                        <div className="mt-3 rounded-xl bg-[#F5ECDF] p-4">
                          <p className="text-xs leading-relaxed text-[#6F665C]">
                            {selectedOrg.description}
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

                  {/* SUBMIT */}
                  <button
                      type="submit"
                      disabled={
                          !agreedToDisclaimer || !organizationId || isSubmitting
                      }
                      className="mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-[#1B1110] px-8 py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-[#AC1B18] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {isSubmitting ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        <Truck size={18} />
                    )}
                    <span>{isSubmitting ? 'Submitting...' : 'Confirm Donation'}</span>
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
                    <SummaryRow label="Package" value={packageCount} />

                    <SummaryRow
                        label="Estimated Weight"
                        value={`${weight || 0} kg`}
                    />

                    <SummaryRow
                        label="Organization"
                        value={
                          selectedOrg ? selectedOrg.name : `Select ${organizationType}`
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
                 profileAction,
               }: {
  label: string;
  placeholder: string;
  type?: string;
  required?: boolean;
  min?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  profileAction?: {
    label: string;
    icon: React.ReactNode;
    loading: boolean;
    onClick: () => void;
  };
}) {
  return (
      <label className="block">
      <span className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#7E7469]">
          {label}
          {required && <span className="ml-1 text-[#AC1B18]">*</span>}
        </span>

        {profileAction && (
            <button
                type="button"
                onClick={profileAction.onClick}
                disabled={profileAction.loading}
                className="flex items-center gap-1 text-[11px] font-semibold text-[#AC1B18] hover:underline disabled:opacity-50 disabled:no-underline normal-case tracking-normal"
            >
              {profileAction.loading ? (
                  <Loader2 size={11} className="animate-spin" />
              ) : (
                  profileAction.icon
              )}
              {profileAction.loading ? 'Fetching...' : profileAction.label}
            </button>
        )}
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