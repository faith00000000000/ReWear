"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import axios from "axios";
import { toast } from "react-toastify";
import { isAuthenticated } from "@/lib/auth";
import { useAuth } from "@/lib/AuthContext";
import { fetchProfile } from "@/lib/api/profileApi";
import { fetchListingById, updateListing } from "@/lib/api/listings";
import { ListingResponseDTO } from "@/lib/types/listing";
import { reverseGeocodeToDistrictProvince } from "@/lib/geo";
import {
    Upload,
    Play,
    CheckCircle,
    HelpCircle,
    ChevronDown,
    X,
    Image as ImageIcon,
    Tag,
    MapPin,
    Truck,
    ShoppingBag,
    AlertCircle,
    Shield,
    Navigation,
    Phone,
    Info,
} from "lucide-react";

const PickupLocationMap = dynamic(() => import("@/components/PickupLocationMap"), {
    ssr: false,
    loading: () => (
        <div className="h-[220px] w-full rounded-xl bg-[#FDFAF6] border border-[#DDD0C4] flex items-center justify-center">
            <p className="text-[12px] text-[#8A7060]">Loading map...</p>
        </div>
    ),
});

type ListingModeUI = "Thrift" | "Rent" | "Thrift + Rent";
type DeliveryOptionUI = "Shipping" | "Pickup" | "Flex (Both)";
type ShippingFeeTypeUI = "Free Shipping" | "Fixed Fee" | "Dynamic Shipping";
type PickupDay = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

const PICKUP_DAYS: PickupDay[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function numToStr(n: number | null | undefined): string {
    return n === null || n === undefined ? "" : String(n);
}

function listingModeFromDto(v: ListingResponseDTO["listingMode"]): ListingModeUI {
    if (v === "THRIFT") return "Thrift";
    if (v === "RENT") return "Rent";
    if (v === "THRIFT_AND_RENT") return "Thrift + Rent";
    // Defensive fallback in case the backend ever adds a mode we don't know
    // about yet — better to show the combined UI than crash on an unhandled
    // value.
    return "Thrift + Rent";
}
function deliveryOptionFromDto(v: ListingResponseDTO["deliveryOption"]): DeliveryOptionUI {
    if (v === "SHIPPING") return "Shipping";
    if (v === "PICKUP") return "Pickup";
    return "Flex (Both)";
}
function shippingFeeTypeFromDto(v: ListingResponseDTO["shippingFeeType"]): ShippingFeeTypeUI {
    if (v === "FIXED_FEE") return "Fixed Fee";
    if (v === "DYNAMIC_SHIPPING") return "Dynamic Shipping";
    return "Free Shipping";
}
function availabilityFromDto(v: ListingResponseDTO["availability"]): string {
    if (v === "RESERVED") return "Reserved";
    if (v === "SOLD_OUT") return "Sold Out";
    return "Available";
}

interface FormState {
    productTitle: string;
    clothingType: string;
    listingMode: ListingModeUI;
    brand: string;
    gender: string;
    styleOccasion: string;
    tags: string;
    description: string;
    size: string;
    condition: string;
    color: string;
    material: string;
    originalPrice: string;
    availability: string;
    defectFlaws: string;
    thriftPrice: string;
    rentPerDay: string;
    securityDeposit: string;
    photos: (string | null)[];
    video: string | null;
    pricingMode: ListingModeUI;
    deliveryOption: DeliveryOptionUI;
    shippingAvailability: string;
    shippingFeeType: ShippingFeeTypeUI;
    fixedShippingFee: string;
    rateWithinDistrict: string;
    rateWithinProvince: string;
    rateNationwide: string;
    dispatchTime: string;
    sellerLat: string;
    sellerLng: string;
    sellerLocationConfirmed: boolean;
    sellerResolvedAddress: string;
    sellerDistrict: string;
    sellerProvince: string;
    pickupArea: string;
    pickupLat: string;
    pickupLng: string;
    pickupResolvedAddress: string;
    pickupLocationConfirmed: boolean;
    pickupContactNumber: string;
    pickupDays: PickupDay[];
    pickupTimeFrom: string;
    pickupTimeTo: string;
    pickupInstructions: string;
    sameDayPickup: boolean;
}

/* ─── Reusable field components ─── */

function SelectField({ label, value, onChange, options, required }: {
    label: string; value: string; onChange: (v: string) => void; options: string[]; required?: boolean;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#3D2B1F]">
                {label}{required && <span className="text-[#A33214] ml-0.5">*</span>}
            </label>
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full appearance-none bg-white border border-[#DDD0C4] rounded-xl px-4 py-2.5 text-[14px] text-[#1A130E] focus:outline-none focus:border-[#A33214] focus:ring-2 focus:ring-[#A33214]/10 pr-9 cursor-pointer transition-colors"
                >
                    {options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A7060] pointer-events-none" />
            </div>
        </div>
    );
}

function InputField({ label, value, onChange, placeholder, required, maxLength, prefix, type = "text", inputClassName = "" }: {
    label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean;
    maxLength?: number; prefix?: string; type?: string; inputClassName?: string;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#3D2B1F]">
                {label}{required && <span className="text-[#A33214] ml-0.5">*</span>}
            </label>
            <div className="relative">
                {prefix && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] text-[#8A7060] font-medium select-none">{prefix}</span>}
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    className={`w-full bg-white border border-[#DDD0C4] rounded-xl py-2.5 text-[14px] text-[#1A130E] placeholder-[#BBA898] focus:outline-none focus:border-[#A33214] focus:ring-2 focus:ring-[#A33214]/10 transition-colors ${prefix ? "pl-8 pr-4" : "px-4"} ${maxLength ? "pr-16" : ""} ${inputClassName}`}
                />
                {maxLength && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] text-[#BBA898] tabular-nums">
                        {value.length}/{maxLength}
                    </span>
                )}
            </div>
        </div>
    );
}

function PhotoUploadSlot({ label, sublabel, icon, previewUrl, onFileChange }: {
    label: string; sublabel: string; icon: React.ReactNode; previewUrl: string | null; onFileChange: (file: File | null) => void;
}) {
    const ref = useRef<HTMLInputElement>(null);
    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        onFileChange(file);
        e.target.value = "";
    };
    return (
        <div
            onClick={() => ref.current?.click()}
            className="flex flex-col items-center justify-center gap-2 rounded-xl cursor-pointer transition-all group relative overflow-hidden border border-[#DDD0C4] bg-white hover:border-[#A33214] hover:bg-[#FDF6EC]"
            style={{ minHeight: 100 }}
        >
            <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            {previewUrl ? (
                <div className="relative w-full h-full">
                    <img src={previewUrl} alt={label} className="w-full h-[100px] object-cover" />
                    <button
                        onClick={(e) => { e.stopPropagation(); onFileChange(null); }}
                        className="absolute top-1.5 right-1.5 bg-white/90 rounded-full p-1 shadow-sm hover:bg-white"
                    >
                        <X size={11} className="text-[#A33214]" />
                    </button>
                </div>
            ) : (
                <>
                    <div className="text-[#B0A090] group-hover:text-[#A33214] transition-colors">{icon}</div>
                    <div className="text-center px-1">
                        <p className="text-[11px] font-semibold text-[#3D2B1F] leading-tight">{label}</p>
                        <p className="text-[10px] text-[#8A7060] mt-0.5 hidden sm:block">{sublabel}</p>
                    </div>
                </>
            )}
        </div>
    );
}

function VideoUploadSlot({ previewUrl, onFileChange }: { previewUrl: string | null; onFileChange: (file: File | null) => void; }) {
    const ref = useRef<HTMLInputElement>(null);
    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        onFileChange(file);
        e.target.value = "";
    };
    return (
        <div
            onClick={() => !previewUrl && ref.current?.click()}
            className={`flex items-center gap-3 sm:gap-4 border-2 border-dashed rounded-2xl px-4 sm:px-6 py-4 transition-all flex-1 group ${previewUrl ? "border-[#A33214] bg-[#FDF6EC] cursor-default" : "border-[#DDD0C4] bg-white cursor-pointer hover:border-[#A33214] hover:bg-[#FDF6EC]"}`}
        >
            <input ref={ref} type="file" accept="video/mp4,video/*" className="hidden" onChange={handleFile} />
            {previewUrl ? (
                <>
                    <div className="relative flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-[#1A130E]">
                        <video src={previewUrl} className="w-full h-full object-cover opacity-80" muted />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Play size={16} className="text-white drop-shadow" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold text-[#2A1F1A]">Video attached</p>
                        <p className="text-[12px] text-[#8A7060]">Tap to preview or remove</p>
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); onFileChange(null); }}
                        className="flex-shrink-0 w-7 h-7 rounded-full bg-white border border-[#DDD0C4] flex items-center justify-center hover:border-[#A33214] hover:bg-[#FDF6EC] transition-colors shadow-sm"
                    >
                        <X size={12} className="text-[#A33214]" />
                    </button>
                </>
            ) : (
                <>
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-[#A33214] flex items-center justify-center flex-shrink-0 group-hover:bg-[#A33214]/5 transition-colors">
                        <Play size={13} className="text-[#A33214] ml-0.5" />
                    </div>
                    <div>
                        <p className="text-[13px] sm:text-[14px] font-semibold text-[#2A1F1A]">Upload Video</p>
                        <p className="text-[11px] sm:text-[12px] text-[#8A7060]">Show movement or fit (max 30 sec, MP4)</p>
                    </div>
                </>
            )}
        </div>
    );
}

function DeliveryOptionCard({ icon, title, active, onClick }: { icon: React.ReactNode; title: string; active: boolean; onClick: () => void; }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl border-2 text-[13px] sm:text-[14px] font-semibold transition-all ${active ? "border-[#A33214] bg-[#FDF6EC] text-[#A33214]" : "border-[#DDD0C4] bg-white text-[#3D2B1F] hover:border-[#A33214]/40 hover:bg-[#FDF6EC]/50"}`}
        >
            <span className={active ? "text-[#A33214]" : "text-[#8A7060]"}>{icon}</span>
            {title}
        </button>
    );
}

function FeeTypeCard({ title, desc, active, onClick }: { title: string; desc: string; active: boolean; onClick: () => void; }) {
    return (
        <div
            onClick={onClick}
            className={`rounded-xl border-2 px-4 py-3 cursor-pointer transition-all ${active ? "border-[#A33214] bg-[#FDF6EC]" : "border-[#E0D4C8] bg-white hover:border-[#A33214]/40"}`}
        >
            <p className={`text-[13px] font-semibold ${active ? "text-[#A33214]" : "text-[#2A1F1A]"}`}>{title}</p>
            <p className="text-[11px] text-[#8A7060] mt-0.5">{desc}</p>
        </div>
    );
}

function DayToggle({ day, active, onClick }: { day: string; active: boolean; onClick: () => void; }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`px-3 py-2 rounded-lg text-[12px] font-semibold border transition-all ${active ? "border-[#A33214] bg-[#A33214] text-white" : "border-[#DDD0C4] bg-white text-[#3D2B1F] hover:border-[#A33214]/40"}`}
        >
            {day}
        </button>
    );
}

/* ─── Section card wrapper ─── */
function SectionCard({ step, title, subtitle, children }: {
    step: number; title: string; subtitle: string; children: React.ReactNode;
}) {
    return (
        <div className="bg-white rounded-xl border border-[#E8DDD0] overflow-hidden">
            <div className="flex items-center gap-3 px-4 sm:px-7 py-4 sm:py-5 border-b border-[#F0E6DA]">
                <span className="w-7 h-7 rounded-full bg-[#A33214] text-white text-[13px] font-bold flex items-center justify-center flex-shrink-0">
                    {step}
                </span>
                <div>
                    <h2 className="text-[16px] sm:text-[18px] font-serif font-semibold text-[#2A1F1A] leading-none">{title}</h2>
                    <p className="text-[12px] sm:text-[13px] text-[#8A7060] mt-0.5">{subtitle}</p>
                </div>
            </div>
            <div className="px-4 sm:px-7 py-5 sm:py-6">{children}</div>
        </div>
    );
}

/* ─── Main Page ─── */
export default function EditListingPage() {
    const router = useRouter();
    const params = useParams();
    const listingId = params.id as string;
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [form, setForm] = useState<FormState | null>(null);
    const [photoFiles, setPhotoFiles] = useState<(File | null)[]>([null, null, null, null]);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fetchingProfileNumber, setFetchingProfileNumber] = useState(false);
    const [selectedMedia] = useState<{ type: "image" | "video"; index: number }>({ type: "image", index: 0 });

    const reverseGeocodeSeller = async (lat: number, lng: number) => {
        const result = await reverseGeocodeToDistrictProvince(lat, lng);
        if (!result) return; // Silent — confirmation chip / fallback message in UI tells the seller.
        setForm((prev) => prev ? {
            ...prev,
            sellerDistrict: result.district || prev.sellerDistrict,
            sellerProvince: result.province || prev.sellerProvince,
            sellerResolvedAddress: result.displayName,
        } : prev);
    };

    const handleSellerLocationChange = (lat: number, lng: number) => {
        setForm((prev) => prev ? {
            ...prev,
            sellerLat: lat.toFixed(6),
            sellerLng: lng.toFixed(6),
            sellerLocationConfirmed: true,
        } : prev);
        reverseGeocodeSeller(lat, lng);
    };

    const handleUseMySellerLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser.');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                handleSellerLocationChange(pos.coords.latitude, pos.coords.longitude);
                toast.success('Origin location captured!');
            },
            () => toast.error("Couldn't fetch your location. Please allow location access."),
        );
    };

    const objectUrlsRef = useRef<Set<string>>(new Set());

    const createPreviewUrl = (file: File) => {
        const url = URL.createObjectURL(file);
        objectUrlsRef.current.add(url);
        return url;
    };
    const revokePreviewUrl = (url: string | null) => {
        if (url && objectUrlsRef.current.has(url)) {
            URL.revokeObjectURL(url);
            objectUrlsRef.current.delete(url);
        }
    };

    const update = (key: keyof FormState, value: unknown) =>
        setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

    const setMode = (mode: ListingModeUI) =>
        setForm((prev) => (prev ? { ...prev, listingMode: mode, pricingMode: mode } : prev));

    const togglePickupDay = (day: PickupDay) =>
        setForm((prev) =>
            prev ? {
                ...prev,
                pickupDays: prev.pickupDays.includes(day)
                    ? prev.pickupDays.filter((d) => d !== day)
                    : [...prev.pickupDays, day],
            } : prev
        );

    useEffect(() => {
        if (!isAuthenticated()) router.push("/login");
    }, [router]);

    useEffect(() => {
        if (!listingId) return;
        let cancelled = false;
        async function load() {
            try {
                const dto = await fetchListingById(listingId);
                if (user?.id && String(dto.seller?.id) !== String(user.id)) {
                    toast.error("You can only edit your own listings.");
                    router.push("/profile/listings");
                    return;
                }
                if (cancelled) return;
                setForm({
                    productTitle: dto.productTitle ?? "",
                    clothingType: dto.clothingType ?? "Dresses",
                    listingMode: listingModeFromDto(dto.listingMode),
                    brand: dto.brand ?? "",
                    gender: dto.gender ?? "Women",
                    styleOccasion: dto.styleOccasion ?? "Casual",
                    tags: dto.tags ?? "",
                    description: dto.description ?? "",
                    size: dto.size ?? "M",
                    condition: dto.condition ?? "Very Good",
                    color: dto.color ?? "",
                    material: dto.material ?? "Cotton",
                    originalPrice: numToStr(dto.originalPrice),
                    availability: availabilityFromDto(dto.availability),
                    defectFlaws: dto.defectFlaws ?? "",
                    thriftPrice: numToStr(dto.thriftPrice),
                    rentPerDay: numToStr(dto.rentPerDay),
                    securityDeposit: numToStr(dto.securityDeposit),
                    photos: [dto.photoFrontUrl ?? null, dto.photoBackUrl ?? null, dto.photoLabelUrl ?? null, dto.photoDetailUrl ?? null],
                    video: dto.videoUrl ?? null,
                    pricingMode: listingModeFromDto(dto.listingMode),
                    deliveryOption: deliveryOptionFromDto(dto.deliveryOption),
                    shippingAvailability: dto.shippingAvailability ?? "Nationwide (All Districts)",
                    shippingFeeType: shippingFeeTypeFromDto(dto.shippingFeeType),
                    fixedShippingFee: numToStr(dto.fixedShippingFee),
                    rateWithinDistrict: numToStr(dto.rateWithinDistrict),
                    rateWithinProvince: numToStr(dto.rateWithinProvince),
                    rateNationwide: numToStr(dto.rateNationwide),
                    dispatchTime: dto.dispatchTime ?? "Within 1 Day",
                    sellerLat: "",
                    sellerLng: "",
                    sellerLocationConfirmed: dto.sellerDistrict != null && dto.sellerProvince != null,
                    sellerResolvedAddress: "",
                    sellerDistrict: dto.sellerDistrict ?? "",
                    sellerProvince: dto.sellerProvince ?? "",
                    pickupArea: dto.pickupArea ?? "",
                    pickupLat: dto.pickupLat != null ? String(dto.pickupLat) : "",
                    pickupLng: dto.pickupLng != null ? String(dto.pickupLng) : "",
                    pickupResolvedAddress: dto.pickupResolvedAddress ?? "",
                    pickupLocationConfirmed: dto.pickupLat != null && dto.pickupLng != null,
                    pickupContactNumber: dto.pickupContactNumber ?? "",
                    pickupDays: (dto.pickupDays ? dto.pickupDays.split(",").filter(Boolean) : []) as PickupDay[],
                    pickupTimeFrom: dto.pickupTimeFrom ?? "10:00",
                    pickupTimeTo: dto.pickupTimeTo ?? "18:00",
                    pickupInstructions: dto.pickupInstructions ?? "",
                    sameDayPickup: dto.sameDayPickup ?? false,
                });
            } catch {
                if (!cancelled) setNotFound(true);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => { cancelled = true; };
    }, [listingId, user?.id, router]);

    useEffect(() => {
        return () => {
            objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
            objectUrlsRef.current.clear();
        };
    }, []);

    const updatePhoto = (index: number, file: File | null) => {
        setPhotoFiles((prev) => { const next = [...prev]; next[index] = file; return next; });
        setForm((prev) => {
            if (!prev) return prev;
            const photos = [...prev.photos];
            if (photos[index] && objectUrlsRef.current.has(photos[index]!)) revokePreviewUrl(photos[index]);
            photos[index] = file ? createPreviewUrl(file) : null;
            return { ...prev, photos };
        });
    };

    const updateVideo = (file: File | null) => {
        setForm((prev) => {
            if (!prev) return prev;
            if (prev.video && objectUrlsRef.current.has(prev.video)) revokePreviewUrl(prev.video);
            return { ...prev, video: file ? createPreviewUrl(file) : null };
        });
        setVideoFile(file);
    };

    const handlePickupLocationChange = async (lat: number, lng: number) => {
        setForm((prev) => prev ? { ...prev, pickupLat: lat.toFixed(6), pickupLng: lng.toFixed(6), pickupLocationConfirmed: true } : prev);
        const result = await reverseGeocodeToDistrictProvince(lat, lng);
        if (result?.displayName) {
            update("pickupResolvedAddress", result.displayName);
            update("pickupArea", result.displayName);
        }
    };

    const handleUseMyLocation = () => {
        if (!navigator.geolocation) { toast.error("Geolocation not supported."); return; }
        navigator.geolocation.getCurrentPosition(
            (pos) => { handlePickupLocationChange(pos.coords.latitude, pos.coords.longitude); toast.success("Pickup location captured!"); },
            () => toast.error("Couldn't fetch location. Please allow access.")
        );
    };

    const handleUseProfileNumber = async () => {
        if (!user?.id) { toast.error("You need to be logged in."); return; }
        setFetchingProfileNumber(true);
        try {
            const profile = await fetchProfile(user.id);
            if (!profile?.phone) { toast.info("No phone number on your profile."); return; }
            update("pickupContactNumber", profile.phone);
        } catch { toast.error("Couldn't fetch profile number."); }
        finally { setFetchingProfileNumber(false); }
    };

    const validate = (f: FormState): string | null => {
        if (!f.productTitle.trim()) return "Product title is required.";
        if (!f.clothingType) return "Clothing type is required.";
        if (!f.gender) return "Gender is required.";
        if (!f.size) return "Size is required.";
        if (!f.condition) return "Condition is required.";
        if (!f.color.trim()) return "Color is required.";
        if (!f.material) return "Material is required.";

        if (f.deliveryOption === "Shipping" || f.deliveryOption === "Flex (Both)") {
            if (!f.shippingAvailability) return "Shipping availability is required.";
            if (!f.shippingFeeType) return "Shipping fee type is required.";
            if (f.shippingFeeType === "Fixed Fee" && !f.fixedShippingFee.trim()) return "Please enter a fixed shipping fee.";
            // Dynamic Shipping calculates fees using distance from the seller's
            // origin point. Without a confirmed pin (and the district/province
            // it resolves to), the buyer-side checkout has no way to price
            // delivery and gets stuck on "Delivery unavailable for this item".
            if (f.shippingFeeType === "Dynamic Shipping" && !f.sellerLocationConfirmed)
                return "Please pin your origin location on the map for Dynamic Shipping.";
            if (f.shippingFeeType === "Dynamic Shipping" && (!f.sellerDistrict.trim() || !f.sellerProvince.trim()))
                return "We couldn't detect your district/province from the pin — try moving the pin slightly.";
        }
        if (f.deliveryOption === "Pickup" || f.deliveryOption === "Flex (Both)") {
            if (!f.pickupArea.trim()) return "Pickup area is required.";
            if (!f.pickupLocationConfirmed) return "Please pin your exact pickup location.";
            if (!f.pickupContactNumber.trim()) return "Pickup contact number is required.";
            if (f.pickupDays.length === 0) return "Select at least one pickup day.";
            if (!f.pickupTimeFrom || !f.pickupTimeTo) return "Pickup time range is required.";
        }
        if (f.listingMode === "Thrift" && !f.thriftPrice.trim()) return "Selling price is required.";
        if (f.listingMode === "Rent" && (!f.rentPerDay.trim() || !f.securityDeposit.trim())) return "Rent price and deposit are required.";
        if (f.listingMode === "Thrift + Rent" && (!f.thriftPrice.trim() || !f.rentPerDay.trim() || !f.securityDeposit.trim())) return "All prices required for Thrift + Rent.";
        return null;
    };

    const stripCommas = (v: string) => v.replace(/,/g, "");

    const buildFormData = (f: FormState) => {
        const fd = new FormData();
        fd.append("productTitle", f.productTitle.trim());
        fd.append("listingMode", f.listingMode);
        fd.append("clothingType", f.clothingType);
        fd.append("gender", f.gender);
        if (f.brand.trim()) fd.append("brand", f.brand.trim());
        if (f.styleOccasion) fd.append("styleOccasion", f.styleOccasion);
        if (f.tags.trim()) fd.append("tags", f.tags.trim());
        if (photoFiles[0]) fd.append("photoFront", photoFiles[0]);
        if (photoFiles[1]) fd.append("photoBack", photoFiles[1]);
        if (photoFiles[2]) fd.append("photoLabel", photoFiles[2]);
        if (photoFiles[3]) fd.append("photoDetail", photoFiles[3]);
        if (videoFile) fd.append("video", videoFile);
        if (f.description.trim()) fd.append("description", f.description.trim());
        fd.append("size", f.size);
        fd.append("condition", f.condition);
        fd.append("color", f.color.trim());
        fd.append("material", f.material);
        if (f.originalPrice.trim()) fd.append("originalPrice", stripCommas(f.originalPrice));
        if (f.availability) fd.append("availability", f.availability);
        if (f.defectFlaws.trim()) fd.append("defectFlaws", f.defectFlaws.trim());
        fd.append("deliveryOption", f.deliveryOption);
        if (f.deliveryOption === "Shipping" || f.deliveryOption === "Flex (Both)") {
            fd.append("shippingAvailability", f.shippingAvailability);
            fd.append("shippingFeeType", f.shippingFeeType);
            if (f.shippingFeeType === "Fixed Fee") fd.append("fixedShippingFee", stripCommas(f.fixedShippingFee));
            if (f.shippingFeeType === "Dynamic Shipping") {
                fd.append("sellerDistrict", f.sellerDistrict.trim());
                fd.append("sellerProvince", f.sellerProvince);
                fd.append("rateWithinDistrict", stripCommas(f.rateWithinDistrict));
                fd.append("rateWithinProvince", stripCommas(f.rateWithinProvince));
                fd.append("rateNationwide", stripCommas(f.rateNationwide));
            }
            fd.append("dispatchTime", f.dispatchTime);
        }
        if (f.deliveryOption === "Pickup" || f.deliveryOption === "Flex (Both)") {
            fd.append("pickupArea", f.pickupArea.trim());
            fd.append("pickupLat", f.pickupLat);
            fd.append("pickupLng", f.pickupLng);
            if (f.pickupResolvedAddress) fd.append("pickupResolvedAddress", f.pickupResolvedAddress);
            fd.append("pickupContactNumber", f.pickupContactNumber.trim());
            fd.append("pickupDays", f.pickupDays.join(","));
            fd.append("pickupTimeFrom", f.pickupTimeFrom);
            fd.append("pickupTimeTo", f.pickupTimeTo);
            if (f.pickupInstructions.trim()) fd.append("pickupInstructions", f.pickupInstructions.trim());
            fd.append("sameDayPickup", String(f.sameDayPickup));
        }
        if (f.thriftPrice.trim()) fd.append("thriftPrice", stripCommas(f.thriftPrice));
        if (f.rentPerDay.trim()) fd.append("rentPerDay", stripCommas(f.rentPerDay));
        if (f.securityDeposit.trim()) fd.append("securityDeposit", stripCommas(f.securityDeposit));
        fd.append("publish", "true");
        return fd;
    };

    const handleSubmit = async () => {
        if (!form) return;
        const err = validate(form);
        if (err) { toast.error(err); return; }
        setIsSubmitting(true);
        try {
            await updateListing(listingId, buildFormData(form));
            toast.success("Listing updated!");
            router.push("/profile/listings");
        } catch (err) {
            if (axios.isAxiosError(err)) toast.error(err.response?.data?.message ?? "Something went wrong.");
            else toast.error("Something went wrong.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="flex min-h-screen items-center justify-center bg-[#FDF6EC] text-[#6F6258]">Loading listing...</div>;
    }
    if (notFound || !form) {
        return <div className="flex min-h-screen items-center justify-center bg-[#FDF6EC] text-[#6F6258]">Listing not found.</div>;
    }

    const firstPhoto = form.photos.find((p) => p !== null) ?? null;
    const selectedImage = form.photos[selectedMedia.index] || firstPhoto;
    const showVideo = selectedMedia.type === "video" && form.video;
    const previewTitle = form.productTitle.trim() || "Your Item Title";
    const modeColors: Record<ListingModeUI, string> = {
        Thrift: "bg-[#1A130E] text-white",
        Rent: "bg-[#3D5C30] text-white",
        "Thrift + Rent": "bg-[#A33214] text-white",
    };

    return (
        <div className="min-h-screen bg-[#FDF6EC]">

            {/* ── Header ── */}
            <div className="px-4 sm:px-8 lg:px-16 py-6 sm:py-8 lg:py-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="font-serif text-[26px] sm:text-[32px] leading-none tracking-[-0.02em] text-[#2A1F1A]">
                        Edit Listing
                    </h1>
                    <p className="mt-2 text-[14px] sm:text-[15px] text-[#6F6258]">Update your item's details below.</p>
                </div>
                <button className="self-start sm:self-auto inline-flex items-center gap-2.5 rounded-2xl border border-[#E0D4C8] bg-white px-4 py-3 text-[13px] sm:text-[14px] font-medium text-[#3D322B] hover:bg-[#FDF6EC] hover:border-[#CBBDAF] shrink-0 shadow-sm transition-colors">
                    <HelpCircle size={16} strokeWidth={1.8} className="text-[#6F5E52]" />
                    <span>Need help? <span className="font-semibold text-[#A33214]">Seller Guide</span></span>
                </button>
            </div>

            {/* ── Two-column on desktop, stacked on mobile ── */}
            <div className="px-4 sm:px-8 lg:px-16 pb-12 flex flex-col lg:flex-row gap-5 lg:gap-7 items-start">

                {/* ── Form column ── */}
                <div className="w-full lg:flex-1 lg:min-w-0 flex flex-col gap-5">

                    {/* 1. Basic Information */}
                    <SectionCard step={1} title="Basic Information" subtitle="Add key details so buyers can find your item easily.">
                        <div className="flex flex-col gap-5">
                            <InputField
                                label="Product Title" required
                                value={form.productTitle} onChange={(v) => update("productTitle", v)}
                                placeholder="e.g. Floral Print Midi Dress" maxLength={80}
                            />

                            <div>
                                <label className="text-[13px] font-medium text-[#3D2B1F] block mb-2">
                                    Listing Mode <span className="text-[#A33214]">*</span>
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {(["Thrift", "Rent", "Thrift + Rent"] as ListingModeUI[]).map((mode) => (
                                        <button
                                            key={mode}
                                            onClick={() => setMode(mode)}
                                            className={`px-3 sm:px-4 py-2.5 rounded-xl text-[13px] sm:text-[14px] font-semibold border-2 transition-all ${form.listingMode === mode ? "border-[#A33214] bg-[#A33214] text-white shadow-sm" : "border-[#DDD0C4] bg-white text-[#3D2B1F] hover:border-[#A33214]/50"}`}
                                        >
                                            {mode}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <SelectField label="Gender" required value={form.gender} onChange={(v) => update("gender", v)} options={["Women", "Men", "Kids", "Unisex"]} />
                                <SelectField label="Clothing Type" required value={form.clothingType} onChange={(v) => update("clothingType", v)} options={["Dresses", "Tops", "Bottoms", "Outerwear", "Accessories", "Footwear", "Activewear"]} />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <InputField label="Brand" value={form.brand} onChange={(v) => update("brand", v)} placeholder="e.g. Zara" />
                                <SelectField label="Style / Occasion" value={form.styleOccasion} onChange={(v) => update("styleOccasion", v)} options={["Casual", "Formal", "Party", "Work", "Ethnic", "Sportswear"]} />
                                <InputField label="Tags (Optional)" value={form.tags} onChange={(v) => update("tags", v)} placeholder="e.g. Minimal, Party, Work" />
                            </div>
                        </div>
                    </SectionCard>

                    {/* 2. Media */}
                    <SectionCard step={2} title="Media" subtitle="Replace any photo or video, or leave as-is to keep current ones.">
                        <div className="flex flex-col gap-5">
                            <div>
                                <p className="text-[13px] font-semibold text-[#3D2B1F] mb-3">
                                    Photos <span className="font-normal text-[#8A7060]">(Max 4)</span>
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {[
                                        { label: "Front", sub: "Main view", icon: <Upload size={18} /> },
                                        { label: "Back", sub: "Back view", icon: <Upload size={18} /> },
                                        { label: "Label", sub: "Brand / care tag", icon: <Tag size={18} /> },
                                        { label: "Detail", sub: "Close-up / flaws", icon: <ImageIcon size={18} /> },
                                    ].map((slot, i) => (
                                        <PhotoUploadSlot
                                            key={i} label={slot.label} sublabel={slot.sub} icon={slot.icon}
                                            previewUrl={form.photos[i] ?? null}
                                            onFileChange={(file) => updatePhoto(i, file)}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="border-t border-[#F0E6DA]" />
                            <div>
                                <p className="text-[13px] font-semibold text-[#3D2B1F] mb-3">
                                    Video <span className="font-normal text-[#8A7060]">(Optional)</span>
                                </p>
                                <VideoUploadSlot previewUrl={form.video} onFileChange={updateVideo} />
                            </div>
                        </div>
                    </SectionCard>

                    {/* 3. Description */}
                    <SectionCard step={3} title="Description" subtitle="Write an honest, clear description to help buyers understand the item.">
                        <div className="relative">
                            <textarea
                                value={form.description}
                                onChange={(e) => update("description", e.target.value)}
                                maxLength={1500} rows={5}
                                className="w-full bg-white border border-[#DDD0C4] rounded-2xl px-4 sm:px-5 py-4 text-[14px] text-[#1A130E] placeholder-[#BBA898] focus:outline-none focus:border-[#A33214] focus:ring-2 focus:ring-[#A33214]/10 resize-none transition-colors pb-8"
                            />
                            <span className="absolute bottom-4 right-4 sm:right-5 text-[11px] text-[#BBA898] tabular-nums">
                                {form.description.length}/1500
                            </span>
                        </div>
                    </SectionCard>

                    {/* 4. Item Attributes */}
                    <SectionCard step={4} title="Item Attributes" subtitle="Provide accurate details to improve discoverability and buyer confidence.">
                        <div className="flex flex-col gap-5">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <SelectField label="Size on Label" required value={form.size} onChange={(v) => update("size", v)} options={["XS", "S", "M", "L", "XL", "XXL", "Free Size"]} />
                                <SelectField label="Condition" required value={form.condition} onChange={(v) => update("condition", v)} options={["Like New", "Very Good", "Good", "Fair", "Heavily Used"]} />
                                <InputField label="Color" required value={form.color} onChange={(v) => update("color", v)} placeholder="e.g. Beige, Navy, Floral" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <SelectField label="Material" required value={form.material} onChange={(v) => update("material", v)} options={["Cotton", "Polyester", "Silk", "Linen", "Wool", "Denim", "Rayon", "Mixed", "Other"]} />
                                <InputField label="Original Price (Optional)" value={form.originalPrice} onChange={(v) => update("originalPrice", v)} placeholder="2,499" prefix="Rs" inputClassName="pl-10" />
                                <SelectField label="Availability" value={form.availability} onChange={(v) => update("availability", v)} options={["Available", "Reserved", "Sold Out"]} />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] font-medium text-[#3D2B1F] flex items-center gap-1.5">
                                    <AlertCircle size={13} className="text-[#A33214]" />
                                    Visible Flaws / Notes
                                </label>
                                <textarea
                                    value={form.defectFlaws} onChange={(e) => update("defectFlaws", e.target.value)} rows={2}
                                    className="w-full bg-white border border-[#DDD0C4] rounded-xl px-4 py-3 text-[14px] text-[#1A130E] placeholder-[#BBA898] focus:outline-none focus:border-[#A33214] focus:ring-2 focus:ring-[#A33214]/10 resize-none transition-colors"
                                />
                            </div>
                        </div>
                    </SectionCard>

                    {/* 5. Delivery Options */}
                    <SectionCard step={5} title="Delivery Options" subtitle="Choose how buyers can receive this item.">
                        <div className="flex flex-col gap-5">
                            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                <DeliveryOptionCard icon={<Truck size={15} />} title="Shipping" active={form.deliveryOption === "Shipping"} onClick={() => update("deliveryOption", "Shipping")} />
                                <DeliveryOptionCard icon={<MapPin size={15} />} title="Pickup" active={form.deliveryOption === "Pickup"} onClick={() => update("deliveryOption", "Pickup")} />
                                <DeliveryOptionCard icon={<ShoppingBag size={15} />} title="Flex (Both)" active={form.deliveryOption === "Flex (Both)"} onClick={() => update("deliveryOption", "Flex (Both)")} />
                            </div>

                            {/* Shipping sub-section */}
                            {(form.deliveryOption === "Shipping" || form.deliveryOption === "Flex (Both)") && (
                                <div className="border-t border-[#F0E6DA] pt-5 flex flex-col gap-5">
                                    <SelectField label="Shipping Availability" required value={form.shippingAvailability} onChange={(v) => update("shippingAvailability", v)} options={["Nationwide (All Districts)", "Kathmandu Valley Only", "Within Districts"]} />
                                    <div>
                                        <label className="text-[13px] font-medium text-[#3D2B1F] block mb-2.5">
                                            Shipping Fee Type <span className="text-[#A33214]">*</span>
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <FeeTypeCard title="Free Shipping" desc="You'll cover the shipping cost" active={form.shippingFeeType === "Free Shipping"} onClick={() => update("shippingFeeType", "Free Shipping")} />
                                            <FeeTypeCard title="Fixed Fee" desc="Set a fixed fee for all buyers" active={form.shippingFeeType === "Fixed Fee"} onClick={() => update("shippingFeeType", "Fixed Fee")} />
                                            <FeeTypeCard title="Dynamic Shipping" desc="Fee calculated by distance" active={form.shippingFeeType === "Dynamic Shipping"} onClick={() => update("shippingFeeType", "Dynamic Shipping")} />
                                        </div>
                                    </div>
                                    {form.shippingFeeType === "Fixed Fee" && (
                                        <InputField label="Shipping Fee" required value={form.fixedShippingFee} onChange={(v) => update("fixedShippingFee", v)} placeholder="150" prefix="Rs" inputClassName="pl-10" />
                                    )}
                                    {form.shippingFeeType === "Dynamic Shipping" && (
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <InputField label="Within District" required value={form.rateWithinDistrict} onChange={(v) => update("rateWithinDistrict", v)} placeholder="100" prefix="Rs" inputClassName="pl-10" />
                                            <InputField label="Within Province" required value={form.rateWithinProvince} onChange={(v) => update("rateWithinProvince", v)} placeholder="150" prefix="Rs" inputClassName="pl-10" />
                                            <InputField label="Nationwide" required value={form.rateNationwide} onChange={(v) => update("rateNationwide", v)} placeholder="250" prefix="Rs" inputClassName="pl-10" />
                                        </div>
                                    )}

                                    {form.shippingFeeType === "Dynamic Shipping" && (
                                        <div>
                                            <div className="flex items-center gap-1.5 bg-[#FDF6EC] border border-[#EBE0D4] rounded-xl px-3.5 py-2.5 mb-3">
                                                <Info size={12} className="text-[#8A7060] flex-shrink-0" />
                                                <p className="text-[11px] text-[#6F6258]">
                                                    Pin your shipping origin below — buyers pin their delivery location
                                                    at checkout, and we match district/province to apply the rate below automatically.
                                                </p>
                                            </div>

                                            <label className="text-[13px] font-medium text-[#3D2B1F] block mb-1.5">
                                                Your Location <span className="text-[#A33214]">*</span>
                                            </label>

                                            <div className="relative rounded-xl overflow-hidden border border-[#DDD0C4] mb-3">
                                                <PickupLocationMap
                                                    key="edit-seller-origin-map"
                                                    lat={form.sellerLat ? parseFloat(form.sellerLat) : null}
                                                    lng={form.sellerLng ? parseFloat(form.sellerLng) : null}
                                                    onLocationSelect={handleSellerLocationChange}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleUseMySellerLocation}
                                                    className="absolute top-3 right-3 z-[1000] px-2.5 py-1.5 rounded-lg bg-white/95 border border-[#DDD0C4] text-[#A33214] text-[11px] sm:text-[12px] font-semibold shadow-sm hover:bg-white transition-colors flex items-center gap-1.5"
                                                >
                                                    <Navigation size={12} />
                                                    {form.sellerLocationConfirmed ? 'Update Pin' : 'Select My Location'}
                                                </button>
                                            </div>

                                            {form.sellerResolvedAddress && (
                                                <div className="mb-3 flex items-start gap-1.5 bg-[#FDFAF6] border border-[#EBE0D4] rounded-xl px-3 py-2">
                                                    <MapPin size={12} className="text-[#8A7060] mt-0.5 flex-shrink-0" />
                                                    <p className="text-[11px] text-[#6F6258] leading-relaxed">{form.sellerResolvedAddress}</p>
                                                </div>
                                            )}

                                            {form.sellerLocationConfirmed ? (
                                                form.sellerDistrict && form.sellerProvince ? (
                                                    <div className="mb-4 flex items-center gap-1.5 bg-[#F2FAF0] border border-[#D8E8D0] rounded-xl px-3.5 py-2.5 text-[12px] text-[#3D5C30] font-medium">
                                                        <CheckCircle size={13} className="flex-shrink-0" />
                                                        Origin set — {form.sellerDistrict}, {form.sellerProvince}
                                                    </div>
                                                ) : (
                                                    <div className="mb-4 flex items-center gap-1.5 bg-[#FFF8F6] border border-[#F0D8D0] rounded-xl px-3.5 py-2.5 text-[12px] text-[#A33214]">
                                                        <AlertCircle size={13} className="flex-shrink-0" />
                                                        Couldn't detect your district/province automatically — try re-pinning, or moving the pin slightly.
                                                    </div>
                                                )
                                            ) : (
                                                <p className="text-[11px] text-[#8A7060] mb-4">
                                                    No pin set yet — click on the map or use &quot;Select My Location&quot;.
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <SelectField label="Ready to Dispatch In" required value={form.dispatchTime} onChange={(v) => update("dispatchTime", v)} options={["Same Day", "Within 1 Day", "Within 2-3 Days", "Within 1 Week"]} />
                                </div>
                            )}

                            {/* Pickup sub-section */}
                            {(form.deliveryOption === "Pickup" || form.deliveryOption === "Flex (Both)") && (
                                <div className="border-t border-[#F0E6DA] pt-5 flex flex-col gap-5">
                                    <InputField label="Pickup Area" required value={form.pickupArea} onChange={(v) => update("pickupArea", v)} placeholder="e.g. New Baneshwor, Kathmandu" />

                                    <div>
                                        <label className="text-[13px] font-medium text-[#3D2B1F] block mb-1.5">
                                            Exact Pickup Location <span className="text-[#A33214]">*</span>
                                        </label>
                                        <div className="relative rounded-xl overflow-hidden border border-[#DDD0C4]">
                                            <PickupLocationMap
                                                key="edit-pickup-location-map"
                                                lat={form.pickupLat ? parseFloat(form.pickupLat) : null}
                                                lng={form.pickupLng ? parseFloat(form.pickupLng) : null}
                                                onLocationSelect={handlePickupLocationChange}
                                            />
                                            <button
                                                type="button" onClick={handleUseMyLocation}
                                                className="absolute top-3 right-3 z-[1000] px-2.5 py-1.5 rounded-lg bg-white/95 border border-[#DDD0C4] text-[#A33214] text-[11px] sm:text-[12px] font-semibold shadow-sm hover:bg-white transition-colors flex items-center gap-1.5"
                                            >
                                                <Navigation size={12} />
                                                {form.pickupLocationConfirmed ? "Update Pin" : "My Location"}
                                            </button>
                                        </div>
                                        {form.pickupLocationConfirmed && (
                                            <div className="mt-2 flex items-center justify-between gap-2 bg-[#F2FAF0] border border-[#D8E8D0] rounded-xl px-3.5 py-2.5">
                                                <div className="flex items-center gap-1.5 text-[12px] text-[#3D5C30] font-medium">
                                                    <CheckCircle size={13} /> Location set
                                                </div>
                                                <span className="text-[10px] text-[#6F9060] tabular-nums">{form.pickupLat}, {form.pickupLng}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center justify-between flex-wrap gap-1">
                                                <label className="text-[13px] font-medium text-[#3D2B1F]">
                                                    Contact Number <span className="text-[#A33214]">*</span>
                                                </label>
                                                <button
                                                    type="button" onClick={handleUseProfileNumber} disabled={fetchingProfileNumber}
                                                    className="flex items-center gap-1 text-[12px] text-[#A33214] font-medium hover:underline disabled:opacity-50"
                                                >
                                                    <Phone size={12} />
                                                    {fetchingProfileNumber ? "Fetching..." : "Use profile number"}
                                                </button>
                                            </div>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] text-[#8A7060] font-medium">+977</span>
                                                <input
                                                    type="tel" value={form.pickupContactNumber}
                                                    onChange={(e) => update("pickupContactNumber", e.target.value)}
                                                    className="w-full bg-white border border-[#DDD0C4] rounded-xl pl-14 pr-4 py-2.5 text-[14px] text-[#1A130E] focus:outline-none focus:border-[#A33214] focus:ring-2 focus:ring-[#A33214]/10 transition-colors"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[13px] font-medium text-[#3D2B1F]">
                                                Pickup Instructions <span className="text-[#8A7060] font-normal">(Optional)</span>
                                            </label>
                                            <textarea
                                                value={form.pickupInstructions}
                                                onChange={(e) => update("pickupInstructions", e.target.value)}
                                                rows={2}
                                                className="w-full bg-white border border-[#DDD0C4] rounded-xl px-4 py-2 text-[14px] text-[#1A130E] resize-none transition-colors focus:outline-none focus:border-[#A33214] focus:ring-2 focus:ring-[#A33214]/10"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[13px] font-medium text-[#3D2B1F] block mb-2">
                                            Pickup Days <span className="text-[#A33214]">*</span>
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {PICKUP_DAYS.map((day) => (
                                                <DayToggle key={day} day={day} active={form.pickupDays.includes(day)} onClick={() => togglePickupDay(day)} />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[13px] font-medium text-[#3D2B1F]">From</label>
                                            <input type="time" value={form.pickupTimeFrom} onChange={(e) => update("pickupTimeFrom", e.target.value)} className="w-full bg-white border border-[#DDD0C4] rounded-xl px-4 py-2.5 text-[14px] text-[#1A130E] focus:outline-none focus:border-[#A33214]" />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[13px] font-medium text-[#3D2B1F]">To</label>
                                            <input type="time" value={form.pickupTimeTo} onChange={(e) => update("pickupTimeTo", e.target.value)} className="w-full bg-white border border-[#DDD0C4] rounded-xl px-4 py-2.5 text-[14px] text-[#1A130E] focus:outline-none focus:border-[#A33214]" />
                                        </div>
                                    </div>

                                    <label className="flex items-center gap-2.5 text-[13px] font-medium text-[#3D2B1F] cursor-pointer">
                                        <input type="checkbox" checked={form.sameDayPickup} onChange={(e) => update("sameDayPickup", e.target.checked)} className="accent-[#A33214] w-4 h-4" />
                                        Yes, same-day pickup is available
                                    </label>
                                </div>
                            )}
                        </div>
                    </SectionCard>

                    {/* 6. Pricing */}
                    <SectionCard step={6} title="Pricing" subtitle="Update pricing based on item quality, brand, and market value.">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {/* Thrift */}
                            <div
                                onClick={() => setMode("Thrift")}
                                className={`rounded-xl border-2 p-4 sm:p-5 cursor-pointer transition-all ${form.pricingMode === "Thrift" ? "border-[#A33214] bg-[#FDF6EC]" : "border-[#E0D4C8] bg-white hover:border-[#A33214]/40"}`}
                            >
                                <p className="text-[14px] font-semibold text-[#2A1F1A] mb-3 sm:mb-4">Thrift (For Sale)</p>
                                <label className="text-[12px] text-[#8A7060] font-medium block mb-1.5">
                                    Selling Price <span className="text-[#A33214]">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-[#8A7060] font-medium">Rs</span>
                                    <input
                                        type="text" value={form.thriftPrice}
                                        onChange={(e) => update("thriftPrice", e.target.value)}
                                        onClick={(e) => { e.stopPropagation(); setMode("Thrift"); }}
                                        className="w-full border border-[#DDD0C4] rounded-xl px-4 py-2.5 pl-8 text-[14px] text-[#1A130E] bg-white focus:outline-none focus:border-[#A33214]"
                                    />
                                </div>
                            </div>

                            {/* Rent */}
                            <div
                                onClick={() => setMode("Rent")}
                                className={`rounded-xl border-2 p-4 sm:p-5 cursor-pointer transition-all ${form.pricingMode === "Rent" ? "border-[#A33214] bg-[#FDF6EC]" : "border-[#E0D4C8] bg-white hover:border-[#A33214]/40"}`}
                            >
                                <p className="text-[14px] font-semibold text-[#2A1F1A] mb-3 sm:mb-4">Rent (For Rent)</p>
                                <label className="text-[12px] text-[#8A7060] font-medium block mb-1.5">
                                    Price per day <span className="text-[#A33214]">*</span>
                                </label>
                                <div className="relative mb-3">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-[#8A7060] font-medium">Rs</span>
                                    <input
                                        type="text" value={form.rentPerDay}
                                        onChange={(e) => update("rentPerDay", e.target.value)}
                                        onClick={(e) => { e.stopPropagation(); setMode("Rent"); }}
                                        className="w-full border border-[#DDD0C4] rounded-xl px-4 py-2.5 pl-8 text-[14px] text-[#1A130E] bg-white focus:outline-none focus:border-[#A33214]"
                                    />
                                </div>
                                <label className="text-[12px] text-[#8A7060] font-medium block mb-1.5">
                                    Security Deposit <span className="text-[#A33214]">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-[#8A7060] font-medium">Rs</span>
                                    <input
                                        type="text" value={form.securityDeposit}
                                        onChange={(e) => update("securityDeposit", e.target.value)}
                                        onClick={(e) => { e.stopPropagation(); setMode("Rent"); }}
                                        className="w-full border border-[#DDD0C4] rounded-xl px-4 py-2.5 pl-8 text-[14px] text-[#1A130E] bg-white focus:outline-none focus:border-[#A33214]"
                                    />
                                </div>
                            </div>

                            {/* Thrift + Rent */}
                            <div
                                onClick={() => setMode("Thrift + Rent")}
                                className={`rounded-xl border-2 p-4 sm:p-5 cursor-pointer transition-all ${form.pricingMode === "Thrift + Rent" ? "border-[#A33214] bg-[#FDF6EC]" : "border-[#E0D4C8] bg-white hover:border-[#A33214]/40"}`}
                            >
                                <p className="text-[14px] font-semibold text-[#2A1F1A] mb-3 sm:mb-4">Thrift + Rent</p>
                                <p className="text-[13px] text-[#6F6258] leading-relaxed">List for both sale and rent simultaneously.</p>
                            </div>
                        </div>
                    </SectionCard>

                    {/* Action Bar */}
                    <div className="bg-white rounded-xl border border-[#E8DDD0] px-4 sm:px-7 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2 text-[12px] text-[#8A7060]">
                            <Shield size={14} className="text-[#8A7060] flex-shrink-0" />
                            <span>Changes go live immediately after saving.</span>
                        </div>
                        <button
                            type="button" disabled={isSubmitting} onClick={handleSubmit}
                            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#A33214] text-white text-[14px] font-bold hover:bg-[#8B2910] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-center"
                        >
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>

                {/* ── Preview column ── */}
                <div className="w-full lg:w-[360px] xl:w-[400px] lg:flex-shrink-0">
                    <div className="lg:sticky lg:top-6">
                        <div className="bg-white rounded-xl border border-[#E8DDD0] overflow-hidden">
                            <div className="px-5 pt-4 pb-3 border-b border-[#F0E6DA]">
                                <p className="text-[14px] sm:text-[15px] font-serif font-bold text-[#2A1F1A]">Listing Preview</p>
                            </div>

                            <div className="relative bg-[#F8F4EF] aspect-[4/5] overflow-hidden">
                                {showVideo ? (
                                    <video src={form.video!} controls className="w-full h-full object-cover" />
                                ) : selectedImage ? (
                                    <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-[#C8BAA8]">
                                        <ImageIcon size={32} strokeWidth={1.5} />
                                        <p className="text-[11px] mt-2">No photos yet</p>
                                    </div>
                                )}
                                {form.listingMode && (
                                    <span className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full ${modeColors[form.listingMode]}`}>
                                        {form.listingMode.toUpperCase()}
                                    </span>
                                )}
                            </div>

                            {(form.photos.some(Boolean) || form.video) && (
                                <div className="flex gap-2 px-4 py-3 border-b border-[#F0E6DA] overflow-x-auto">
                                    {form.photos.map((p, i) =>
                                        p ? (
                                            <div key={i} className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden border-2 border-[#DDD0C4]">
                                                <img src={p} alt="" className="w-full h-full object-cover" />
                                            </div>
                                        ) : null
                                    )}
                                    {form.video && (
                                        <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden border-2 border-[#DDD0C4] relative bg-[#1A130E]">
                                            <video src={form.video} className="w-full h-full object-cover opacity-70" muted />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Play size={12} className="text-white" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="px-4 py-4 flex flex-col gap-3">
                                <div>
                                    <h3 className="font-serif font-semibold text-[#A33214] text-[16px] sm:text-[18px] leading-snug">{previewTitle}</h3>
                                    {form.brand && <p className="text-[11px] text-[#8A7060] mt-0.5">{form.brand}</p>}
                                </div>
                                {(form.thriftPrice || form.rentPerDay) && (
                                    <div className="flex items-baseline gap-2 flex-wrap">
                                        {form.thriftPrice && form.pricingMode !== "Rent" && (
                                            <span className="text-[18px] sm:text-[20px] font-bold text-[#A33214]">Rs {form.thriftPrice}</span>
                                        )}
                                        {form.rentPerDay && form.pricingMode !== "Thrift" && (
                                            <span className="text-[18px] sm:text-[20px] font-bold text-[#A33214]">
                                                Rs {form.rentPerDay}
                                                <span className="text-[12px] font-normal text-[#8A7060] ml-1">/ day</span>
                                            </span>
                                        )}
                                    </div>
                                )}
                                {form.description && (
                                    <div className="bg-[#FDFAF6] border border-[#EBE0D4] rounded-xl px-3 py-2.5">
                                        <p className="text-[10px] font-semibold text-[#3D2B1F] mb-1">Description</p>
                                        <p className="text-[11px] text-[#6F6258] leading-relaxed line-clamp-4">{form.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}