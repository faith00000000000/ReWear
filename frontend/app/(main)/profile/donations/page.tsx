'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    Gift,
    ArrowLeft,
    Building2,
    Calendar,
    MapPin,
    Package,
    Scale,
    StickyNote,
    Loader2,
    Inbox,
} from 'lucide-react';

import { useAuth } from '@/lib/AuthContext';
import { isAuthenticated } from '@/lib/auth';
import { Donation, DonationStatus, getMyDonations } from '@/lib/api/donationApi';

// Same palette/typography as the profile dashboard (OwnProfileView) so this
// reads as one continuous section rather than a different app.
const STATUS_META: Record<
DonationStatus,
    { label: string; badge: string; dot: string }
    > = {
        PENDING: {
            label: 'Pending Review',
            badge: 'bg-amber-50 text-amber-800 border-amber-200',
            dot: 'bg-amber-500',
        },
        CONFIRMED: {
            label: 'Pickup Confirmed',
            badge: 'bg-blue-50 text-blue-800 border-blue-200',
            dot: 'bg-blue-500',
        },
        COMPLETED: {
            label: 'Completed',
            badge: 'bg-[#EAF2E8] text-[#3D5C30] border-[#CFE3C8]',
            dot: 'bg-[#3D5C30]',
        },
        REJECTED: {
            label: 'Not Accepted',
            badge: 'bg-red-50 text-[#9E2A1B] border-red-200',
            dot: 'bg-[#9E2A1B]',
        },
    };



function errorMessage(err: unknown, fallback: string) {
    if (axios.isAxiosError(err)) {
        return err.response?.data?.message ?? fallback;
    }
    return fallback;
}

export default function MyDonationsPage() {
    const router = useRouter();
    const { user } = useAuth();

    const [donations, setDonations] = useState<Donation[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<'all' | DonationStatus>('all');

    // Signed-in-only page — same guard used elsewhere under /profile/**
    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/login?redirect=/profile/donations');
        }
    }, [router]);

    useEffect(() => {
        if (!user?.id) return;

        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const data = await getMyDonations();
                if (!cancelled) setDonations(data);
            } catch (err) {
                if (!cancelled)
                    toast.error(errorMessage(err, 'Could not load your donation history.'));
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [user?.id]);

    const filteredDonations = useMemo(() => {
        if (statusFilter === 'all') return donations;
        return donations.filter((d) => d.status === statusFilter);
    }, [donations, statusFilter]);

    const totalWeightKg = useMemo(
        () => donations.reduce((acc, d) => acc + (d.estimatedWeightKg || 0), 0),
        [donations],
    );

    return (
        <div className="min-h-screen bg-[#FAF6F0] text-[#1A130E] antialiased">
            <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                <Link
                    href="/profile"
                    className="mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#8C7E74] transition-colors hover:text-[#9E2A1B]"
                >
                    <ArrowLeft size={15} />
                    Back to profile
                </Link>

                {/* Header banner */}
                <div className="flex flex-col gap-5 rounded-2xl border border-[#EBE3D5] bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between lg:p-8">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#9E2A1B]/10 text-[#9E2A1B]">
                            <Gift size={22} />
                        </div>
                        <div>
                            <h1 className="font-serif text-2xl font-normal text-[#1A130E] sm:text-3xl">
                                My Donations
                            </h1>
                            <p className="mt-0.5 text-xs text-[#8C7E74]">
                                Every clothing donation you've submitted through RE:WEAR, and where it stands.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-6 sm:border-l sm:border-[#EBE3D5] sm:pl-6">
                        <div>
                            <p
                                className="text-2xl font-bold text-[#9E2A1B]"
                                style={{ fontFamily: 'Georgia, serif' }}
                            >
                                {donations.length}
                            </p>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#8C7E74]">
                                Donations
                            </p>
                        </div>
                        <div>
                            <p
                                className="text-2xl font-bold text-[#1A130E]"
                                style={{ fontFamily: 'Georgia, serif' }}
                            >
                                {totalWeightKg} kg
                            </p>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#8C7E74]">
                                Total Weight
                            </p>
                        </div>
                    </div>
                </div>

                {/* Status filter tabs */}
                <div className="mt-6 flex flex-wrap gap-2">
                    {(['all', 'PENDING', 'CONFIRMED', 'COMPLETED', 'REJECTED'] as const).map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`rounded-full border px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                                statusFilter === s
                                    ? 'border-[#9E2A1B] bg-[#9E2A1B] text-white'
                                    : 'border-[#EBE3D5] bg-white text-[#8C7E74] hover:border-[#9E2A1B]/40'
                            }`}
                        >
                            {s === 'all' ? 'All' : STATUS_META[s].label}
                        </button>
                    ))}
                </div>

                {/* Donation list */}
                <div className="mt-6 flex flex-col gap-4">
                    {loading ? (
                        <div className="flex justify-center py-16">
                            <Loader2 size={22} className="animate-spin text-[#9E2A1B]" />
                        </div>
                    ) : filteredDonations.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[#EBE3D5] bg-white py-16 text-center">
                            <Inbox size={28} className="text-[#B5A89E]" />
                            <p className="text-sm font-semibold text-[#1A130E]">
                                {donations.length === 0
                                    ? "You haven't made a donation yet."
                                    : 'No donations match this filter.'}
                            </p>
                            {donations.length === 0 && (
                                <Link
                                    href="/donate/form"
                                    className="mt-1 rounded-full bg-[#9E2A1B] px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-[#832111]"
                                >
                                    Donate Clothes
                                </Link>
                            )}
                        </div>
                    ) : (
                        filteredDonations.map((d) => {
                            const meta = STATUS_META[d.status];
                            return (
                                <div
                                    key={d.id}
                                    className="rounded-2xl border border-[#EBE3D5] bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6"
                                >
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                        {/* Org + submitted date */}
                                        <div className="flex items-start gap-3.5">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F5F0E8] text-[#9E2A1B] ring-1 ring-black/5">
                                                <Building2 size={18} />
                                            </div>
                                            <div>
                                                <p className="font-serif text-base font-semibold text-[#1A130E]">
                                                    {d.organization?.name ?? 'Organization'}
                                                </p>
                                                <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wider text-[#8C7E74]">
                                                    {d.organization?.type}
                                                </p>
                                                <p className="mt-2 flex items-center gap-1.5 text-[11px] text-[#8C7E74]">
                                                    <Calendar size={11} />
                                                    Submitted {new Date(d.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        <span
                                            className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider ${meta.badge}`}
                                        >
                      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                                            {meta.label}
                    </span>
                                    </div>

                                    {/* Details strip */}
                                    <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#EBE3D5]/60 pt-4 sm:grid-cols-4">
                                        <div>
                                            <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#8C7E74]">
                                                <Package size={11} /> Package
                                            </p>
                                            <p className="mt-0.5 text-xs font-semibold text-[#1A130E]">
                                                {d.packageCount}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#8C7E74]">
                                                <Scale size={11} /> Weight
                                            </p>
                                            <p className="mt-0.5 text-xs font-semibold text-[#1A130E]">
                                                ~{d.estimatedWeightKg} kg
                                            </p>
                                        </div>
                                        <div className="col-span-2 sm:col-span-2">
                                            <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#8C7E74]">
                                                <MapPin size={11} /> Pickup Address
                                            </p>
                                            <p className="mt-0.5 truncate text-xs font-semibold text-[#1A130E]">
                                                {d.pickupAddress}
                                            </p>
                                        </div>
                                    </div>

                                    {d.notes && (
                                        <div className="mt-3 flex items-start gap-2 rounded-xl bg-[#FAF6F0] px-3.5 py-2.5">
                                            <StickyNote size={12} className="mt-0.5 shrink-0 text-[#8C7E74]" />
                                            <p className="text-[11px] italic leading-relaxed text-[#8C7E74]">
                                                {d.notes}
                                            </p>
                                        </div>
                                    )}

                                    {d.status === 'REJECTED' && (
                                        <p className="mt-3 text-[11px] text-[#9E2A1B]">
                                            This donation wasn't accepted — usually due to item condition. Feel free to submit a new one.
                                        </p>
                                    )}
                                    {d.status === 'PENDING' && (
                                        <p className="mt-3 text-[11px] text-[#8C7E74]">
                                            An admin hasn't reviewed this yet — check back soon.
                                        </p>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </main>
        </div>
    );
}