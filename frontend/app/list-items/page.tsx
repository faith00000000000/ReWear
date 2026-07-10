"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import axios from "axios";
import { toast } from "react-toastify";
import api from "@/lib/axios";
import { isAuthenticated } from "@/lib/auth";
import {
    Upload,
    Plus,
    Play,
    CheckCircle,
    HelpCircle,
    ChevronDown,
    X,
    Image as ImageIcon,
    Tag,
    Shirt,
    Video,
    MapPin,
    Truck,
    ShoppingBag,
    AlertCircle,
    Info,
    Shield,
    Navigation, Phone,
} from "lucide-react";

// Leaflet touches `window` at import time, so it must be loaded client-only.
const PickupLocationMap = dynamic(() => import("@/components/PickupLocationMap"), {
    ssr: false,
    loading: () => (
        <div className="h-[220px] w-full rounded-xl bg-[#FDFAF6] border border-[#DDD0C4] flex items-center justify-center">
            <p className="text-[12px] text-[#8A7060]">Loading map…</p>
        </div>
    ),
});

type ListingMode = "Thrift" | "Rent" | "Thrift + Rent";
type DeliveryOption = "Shipping" | "Pickup" | "Flex (Both)";
type ShippingFeeType = "Free Shipping" | "Fixed Fee" | "Dynamic Shipping";
type PickupDay = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

const PICKUP_DAYS: PickupDay[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function formatDayRange(days: PickupDay[]): string {
    if (days.length === 0) return "";
    const sorted = [...days].sort(
        (a, b) => PICKUP_DAYS.indexOf(a) - PICKUP_DAYS.indexOf(b)
    );
    const indices = sorted.map((d) => PICKUP_DAYS.indexOf(d));
    const isContiguous = indices.every((v, i) => i === 0 || v === indices[i - 1] + 1);
    if (isContiguous && sorted.length > 1) {
        return `${sorted[0]}-${sorted[sorted.length - 1]}`;
    }
    return sorted.join(", ");
}

function formatTime12h(time: string): string {
    if (!time) return "";
    const [h, m] = time.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
}

interface FormState {
    productTitle: string;
    clothingType: string;
    listingMode: ListingMode;
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
    pricingMode: ListingMode;

    // ── Delivery Options ──
    deliveryOption: DeliveryOption;
    shippingAvailability: string;
    shippingFeeType: ShippingFeeType;
    fixedShippingFee: string;
    rateWithinDistrict: string;
    rateWithinProvince: string;
    rateNationwide: string;
    dispatchTime: string;

    pickupArea: string;
    pickupLat: string;
    pickupLng: string;
    pickupResolvedAddress: string;
    pickupLocationConfirmed: boolean;
    pickupContactNumber: string;
    useDifferentPickupNumber: boolean;
    pickupDays: PickupDay[];
    pickupTimeFrom: string;
    pickupTimeTo: string;
    pickupInstructions: string;
    sameDayPickup: boolean;
}

function SelectField({
                         label,
                         value,
                         onChange,
                         options,
                         required,
                     }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: string[];
    required?: boolean;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#3D2B1F]">
                {label}
                {required && <span className="text-[#A33214] ml-0.5">*</span>}
            </label>
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full appearance-none bg-white border border-[#DDD0C4] rounded-xl px-4 py-2.5 text-[14px] text-[#1A130E] focus:outline-none focus:border-[#A33214] focus:ring-2 focus:ring-[#A33214]/10 pr-9 cursor-pointer transition-colors"
                >
                    {options.map((o) => (
                        <option key={o} value={o}>
                            {o}
                        </option>
                    ))}
                </select>
                <ChevronDown
                    size={15}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A7060] pointer-events-none"
                />
            </div>
        </div>
    );
}

function InputField({
                        label,
                        value,
                        onChange,
                        placeholder,
                        required,
                        maxLength,
                        prefix,
                        type = "text",
                        inputClassName = "",
                    }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    required?: boolean;
    maxLength?: number;
    prefix?: string;
    type?: string;
    inputClassName?: string;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#3D2B1F]">
                {label}
                {required && <span className="text-[#A33214] ml-0.5">*</span>}
            </label>
            <div className="relative">
                {prefix && (
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] text-[#8A7060] font-medium select-none">
            {prefix}
          </span>
                )}
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    className={`w-full bg-white border border-[#DDD0C4] rounded-xl py-2.5 text-[14px] text-[#1A130E] placeholder-[#BBA898] focus:outline-none focus:border-[#A33214] focus:ring-2 focus:ring-[#A33214]/10 transition-colors ${
                        prefix ? "pl-8 pr-4" : "px-4"
                    } ${maxLength ? "pr-16" : ""}${inputClassName}`}
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

// ─── PhotoUploadSlot — now takes previewUrl + onFileChange(File | null) ─────
// (separated from preview string so we can keep the real File for upload)

function PhotoUploadSlot({
                             label,
                             sublabel,
                             icon,
                             previewUrl,
                             onFileChange,
                         }: {
    label: string;
    sublabel: string;
    icon: React.ReactNode;
    previewUrl: string | null;
    onFileChange: (file: File | null) => void;
}) {
    const ref = useRef<HTMLInputElement>(null);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        onFileChange(file);
        // allow re-selecting the same file later (e.g. after removing it)
        e.target.value = "";
    };

    return (
        <div
            onClick={() => ref.current?.click()}
            className="flex flex-col items-center justify-center gap-2.5 rounded-xl cursor-pointer transition-all group relative overflow-hidden border border-[#DDD0C4] bg-white hover:border-[#A33214] hover:bg-[#FDF6EC]"
            style={{ minHeight: 116 }}
        >
            <input
                ref={ref}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFile}
            />
            {previewUrl ? (
                <div className="relative w-full h-full">
                    <img
                        src={previewUrl}
                        alt={label}
                        className="w-full h-[116px] object-cover"
                    />
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onFileChange(null);
                        }}
                        className="absolute top-1.5 right-1.5 bg-white/90 rounded-full p-1 shadow-sm hover:bg-white"
                    >
                        <X size={11} className="text-[#A33214]" />
                    </button>
                </div>
            ) : (
                <>
                    <div className="text-[#B0A090] group-hover:text-[#A33214] transition-colors">
                        {icon}
                    </div>
                    <div className="text-center px-2">
                        <p className="text-[12px] font-semibold text-[#3D2B1F] leading-tight">
                            {label}
                        </p>
                        <p className="text-[11px] text-[#8A7060] mt-0.5">{sublabel}</p>
                    </div>
                </>
            )}
        </div>
    );
}

// ─── VideoUploadSlot — same File/preview separation ─────────────────────────

function VideoUploadSlot({
                             previewUrl,
                             onFileChange,
                         }: {
    previewUrl: string | null;
    onFileChange: (file: File | null) => void;
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
            onClick={() => !previewUrl && ref.current?.click()}
            className={`flex items-center gap-4 border-2 border-dashed rounded-2xl px-6 py-4 transition-all flex-1 group ${
                previewUrl
                    ? "border-[#A33214] bg-[#FDF6EC] cursor-default"
                    : "border-[#DDD0C4] bg-white cursor-pointer hover:border-[#A33214] hover:bg-[#FDF6EC]"
            }`}
        >
            <input
                ref={ref}
                type="file"
                accept="video/mp4,video/*"
                className="hidden"
                onChange={handleFile}
            />

            {previewUrl ? (
                <>
                    <div className="relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-[#1A130E]">
                        <video
                            src={previewUrl}
                            className="w-full h-full object-cover opacity-80"
                            muted
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Play size={18} className="text-white drop-shadow" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <p className="text-[14px] font-semibold text-[#2A1F1A]">
                            Video uploaded
                        </p>
                        <p className="text-[12px] text-[#8A7060]">
                            Tap to preview or remove
                        </p>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onFileChange(null);
                        }}
                        className="flex-shrink-0 w-7 h-7 rounded-full bg-white border border-[#DDD0C4] flex items-center justify-center hover:border-[#A33214] hover:bg-[#FDF6EC] transition-colors shadow-sm"
                    >
                        <X size={12} className="text-[#A33214]" />
                    </button>
                </>
            ) : (
                <>
                    <div className="w-10 h-10 rounded-full border-2 border-[#A33214] flex items-center justify-center flex-shrink-0 group-hover:bg-[#A33214]/5 transition-colors">
                        <Play size={14} className="text-[#A33214] ml-0.5" />
                    </div>
                    <div>
                        <p className="text-[14px] font-semibold text-[#2A1F1A]">
                            Upload Video
                        </p>
                        <p className="text-[12px] text-[#8A7060]">
                            Show movement or fit (max 30 sec, MP4)
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}

// ─── DeliveryOptionCard — big 3-way selector (Shipping / Pickup / Flex) ─────

function DeliveryOptionCard({
                                icon,
                                title,
                                active,
                                onClick,
                            }: {
    icon: React.ReactNode;
    title: string;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl border-2 text-[14px] font-semibold transition-all ${
                active
                    ? "border-[#A33214] bg-[#FDF6EC] text-[#A33214]"
                    : "border-[#DDD0C4] bg-white text-[#3D2B1F] hover:border-[#A33214]/40 hover:bg-[#FDF6EC]/50"
            }`}
        >
            <span className={active ? "text-[#A33214]" : "text-[#8A7060]"}>{icon}</span>
            {title}
        </button>
    );
}

// ─── FeeTypeCard — Free / Fixed / Dynamic shipping fee selector ────────────

function FeeTypeCard({
                         title,
                         desc,
                         active,
                         onClick,
                     }: {
    title: string;
    desc: string;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <div
            onClick={onClick}
            className={`rounded-xl border-2 px-4 py-3 cursor-pointer transition-all ${
                active
                    ? "border-[#A33214] bg-[#FDF6EC]"
                    : "border-[#E0D4C8] bg-white hover:border-[#A33214]/40"
            }`}
        >
            <p className={`text-[13px] font-semibold ${active ? "text-[#A33214]" : "text-[#2A1F1A]"}`}>
                {title}
            </p>
            <p className="text-[11px] text-[#8A7060] mt-0.5">{desc}</p>
        </div>
    );
}

// ─── DayToggle — Mon..Sun pill button for pickup availability ──────────────

function DayToggle({
                       day,
                       active,
                       onClick,
                   }: {
    day: string;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`px-3 py-2 rounded-lg text-[12px] font-semibold border transition-all ${
                active
                    ? "border-[#A33214] bg-[#A33214] text-white"
                    : "border-[#DDD0C4] bg-white text-[#3D2B1F] hover:border-[#A33214]/40"
            }`}
        >
            {day}
        </button>
    );
}

export default function ListItemPage() {
    const router = useRouter();

    const [form, setForm] = useState<FormState>({
        productTitle: "",
        clothingType: "Dresses",
        listingMode: "Thrift",
        brand: "",
        gender: "Women",
        styleOccasion: "Casual",
        tags: "",
        description: "",
        size: "M",
        condition: "Very Good",
        color: "",
        material: "Cotton",
        originalPrice: "",
        availability: "Available",
        defectFlaws: "",
        thriftPrice: "",
        rentPerDay: "",
        securityDeposit: "",
        photos: [null, null, null, null],
        video: null,
        pricingMode: "Thrift",

        deliveryOption: "Shipping",
        shippingAvailability: "Nationwide (All Districts)",
        shippingFeeType: "Free Shipping",
        fixedShippingFee: "",
        rateWithinDistrict: "",
        rateWithinProvince: "",
        rateNationwide: "",
        dispatchTime: "Within 1 Day",

        pickupArea: "",
        pickupLat: "",
        pickupLng: "",
        pickupResolvedAddress: "",
        pickupLocationConfirmed: false,
        pickupContactNumber: "",
        useDifferentPickupNumber: false,
        pickupDays: [],
        pickupTimeFrom: "10:00",
        pickupTimeTo: "18:00",
        pickupInstructions: "",
        sameDayPickup: false,
    });

    // ── Real File objects for upload, kept separate from blob preview URLs ──
    const [photoFiles, setPhotoFiles] = useState<(File | null)[]>([
        null,
        null,
        null,
        null,
    ]);
    const [videoFile, setVideoFile] = useState<File | null>(null);

    // ── Submission state ─────────────────────────────────────────────────
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [selectedMedia, setSelectedMedia] = useState<{
        type: "image" | "video";
        index: number;
    }>({
        type: "image",
        index: 0,
    });

    const update = (key: keyof FormState, value: unknown) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    // ── Shared mode setter: keeps Listing Mode (Section 1) and
    // Pricing Mode (Section 6) always in sync — changing either one
    // updates both at once.
    const setMode = (mode: ListingMode) =>
        setForm((prev) => ({ ...prev, listingMode: mode, pricingMode: mode }));

    const togglePickupDay = (day: PickupDay) => {
        setForm((prev) => ({
            ...prev,
            pickupDays: prev.pickupDays.includes(day)
                ? prev.pickupDays.filter((d) => d !== day)
                : [...prev.pickupDays, day],
        }));
    };

    // Best-effort reverse geocoding via Nominatim (OpenStreetMap) — purely
    // cosmetic, so failures are swallowed rather than surfaced to the user.
    const reverseGeocode = async (lat: number, lng: number) => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
                { headers: { Accept: "application/json" } }
            );
            if (!res.ok) return;
            const data = await res.json();
            if (data?.display_name) {
                update("pickupResolvedAddress", data.display_name as string);
                update("pickupArea", data.display_name as string);
            }
        } catch {
            // Silent — this is a nice-to-have, not a blocker.
        }
    };

    const handlePickupLocationChange = (lat: number, lng: number) => {
        setForm((prev) => ({
            ...prev,
            pickupLat: lat.toFixed(6),
            pickupLng: lng.toFixed(6),
            pickupLocationConfirmed: true,
        }));
        reverseGeocode(lat, lng);
    };

    const handleUseMyLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser.");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                handlePickupLocationChange(pos.coords.latitude, pos.coords.longitude);
                toast.success("Pickup location captured!");
            },
            () => {
                toast.error("Couldn't fetch your location. Please allow location access.");
            }
        );
    };

    // ── Object URL bookkeeping so we revoke blobs we created, avoiding
    // memory leaks from never-released object URLs ─────────────────────
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

    // Redirect guests away from this page — listing creation requires auth
    useEffect(() => {
        if (!isAuthenticated()) {
            router.push("/login");
        }
    }, [router]);

    // Revoke any remaining blob URLs when the page unmounts
    useEffect(() => {
        return () => {
            objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
            objectUrlsRef.current.clear();
        };
    }, []);

    const updatePhoto = (index: number, file: File | null) => {
        setPhotoFiles((prev) => {
            const next = [...prev];
            next[index] = file;
            return next;
        });

        const photos = [...form.photos];
        revokePreviewUrl(photos[index]);
        photos[index] = file ? createPreviewUrl(file) : null;
        update("photos", photos);
    };

    const updateVideo = (file: File | null) => {
        revokePreviewUrl(form.video);
        setVideoFile(file);
        update("video", file ? createPreviewUrl(file) : null);
    };

    const firstPhoto = form.photos.find((p) => p !== null) ?? null;

    const selectedImage = form.photos[selectedMedia.index] || firstPhoto;

    const showVideo = selectedMedia.type === "video" && form.video;
    const previewTitle = form.productTitle.trim() || "Your Item Title";

    const modeColors: Record<ListingMode, string> = {
        Thrift: "bg-[#1A130E] text-white",
        Rent: "bg-[#3D5C30] text-white",
        "Thrift + Rent": "bg-[#A33214] text-white",
    };

    const handleUseProfileNumber = () => {
        // TODO: wire this to your actual logged-in user's phone number
        // e.g. from an auth context, a /api/me call, or localStorage
        const profileNumber = ""; // <-- replace with real source

        if (!profileNumber) {
            toast.error("Couldn't find a phone number on your profile.");
            return;
        }
        update("pickupContactNumber", profileNumber);
    };

    // ── Validation matching backend ListingRequestDTO constraints ───────
    const validate = (): string | null => {
        if (!form.productTitle.trim()) return "Product title is required.";
        if (!form.clothingType) return "Clothing type is required.";
        if (!form.gender) return "Gender is required.";
        if (!form.size) return "Size is required.";
        if (!form.condition) return "Condition is required.";
        if (!form.color.trim()) return "Color is required.";
        if (!form.material) return "Material is required.";

        if (form.deliveryOption === "Shipping" || form.deliveryOption === "Flex (Both)") {
            if (!form.shippingAvailability) return "Shipping availability is required.";
            if (!form.shippingFeeType) return "Shipping fee type is required.";
            if (form.shippingFeeType === "Fixed Fee" && !form.fixedShippingFee.trim())
                return "Please enter a fixed shipping fee.";
            if (
                form.shippingFeeType === "Dynamic Shipping" &&
                (!form.rateWithinDistrict.trim() ||
                    !form.rateWithinProvince.trim() ||
                    !form.rateNationwide.trim())
            )
                return "Please fill in all dynamic shipping rates.";
            if (!form.dispatchTime) return "Dispatch time is required.";
        }

        if (form.deliveryOption === "Pickup" || form.deliveryOption === "Flex (Both)") {
            if (!form.pickupArea.trim()) return "Pickup area is required.";
            if (!form.pickupLocationConfirmed) return "Please pin your exact pickup location.";
            if (!form.pickupContactNumber.trim()) return "Pickup contact number is required.";
            if (form.pickupDays.length === 0) return "Select at least one pickup availability day.";
            if (!form.pickupTimeFrom || !form.pickupTimeTo) return "Pickup time range is required.";
        }

        if (form.listingMode === "Thrift" && !form.thriftPrice.trim()) {
            return "Selling price is required for Thrift listings.";
        }
        if (
            form.listingMode === "Rent" &&
            (!form.rentPerDay.trim() || !form.securityDeposit.trim())
        ) {
            return "Rent price and security deposit are required for Rent listings.";
        }
        if (
            form.listingMode === "Thrift + Rent" &&
            (!form.thriftPrice.trim() ||
                !form.rentPerDay.trim() ||
                !form.securityDeposit.trim())
        ) {
            return "Selling price, rent price, and security deposit are all required for Thrift + Rent listings.";
        }

        return null;
    };

    // Strip commas from price-like inputs (e.g. "1,499" -> "1499") so the
    // backend's BigDecimal parsing doesn't choke on formatted numbers.
    const stripCommas = (v: string) => v.replace(/,/g, "");

    const buildFormData = () => {
        const fd = new FormData();

        fd.append("productTitle", form.productTitle.trim());
        fd.append("listingMode", form.listingMode);
        fd.append("clothingType", form.clothingType);
        fd.append("gender", form.gender);
        if (form.brand.trim()) fd.append("brand", form.brand.trim());
        if (form.styleOccasion) fd.append("styleOccasion", form.styleOccasion);
        if (form.tags.trim()) fd.append("tags", form.tags.trim());

        if (photoFiles[0]) fd.append("photoFront", photoFiles[0]);
        if (photoFiles[1]) fd.append("photoBack", photoFiles[1]);
        if (photoFiles[2]) fd.append("photoLabel", photoFiles[2]);
        if (photoFiles[3]) fd.append("photoDetail", photoFiles[3]);
        if (videoFile) fd.append("video", videoFile);

        if (form.description.trim()) fd.append("description", form.description.trim());

        fd.append("size", form.size);
        fd.append("condition", form.condition);
        fd.append("color", form.color.trim());
        fd.append("material", form.material);
        if (form.originalPrice.trim())
            fd.append("originalPrice", stripCommas(form.originalPrice));
        if (form.availability) fd.append("availability", form.availability);
        if (form.defectFlaws.trim()) fd.append("defectFlaws", form.defectFlaws.trim());

        // ── Delivery Options ──
        fd.append("deliveryOption", form.deliveryOption);

        if (form.deliveryOption === "Shipping" || form.deliveryOption === "Flex (Both)") {
            fd.append("shippingAvailability", form.shippingAvailability);
            fd.append("shippingFeeType", form.shippingFeeType);
            if (form.shippingFeeType === "Fixed Fee")
                fd.append("fixedShippingFee", stripCommas(form.fixedShippingFee));
            if (form.shippingFeeType === "Dynamic Shipping") {
                fd.append("rateWithinDistrict", stripCommas(form.rateWithinDistrict));
                fd.append("rateWithinProvince", stripCommas(form.rateWithinProvince));
                fd.append("rateNationwide", stripCommas(form.rateNationwide));
            }
            fd.append("dispatchTime", form.dispatchTime);
        }

        if (form.deliveryOption === "Pickup" || form.deliveryOption === "Flex (Both)") {
            fd.append("pickupArea", form.pickupArea.trim());
            fd.append("pickupLat", form.pickupLat);
            fd.append("pickupLng", form.pickupLng);
            if (form.pickupResolvedAddress)
                fd.append("pickupResolvedAddress", form.pickupResolvedAddress);
            fd.append("pickupContactNumber", form.pickupContactNumber.trim());
            fd.append("pickupDays", form.pickupDays.join(","));
            fd.append("pickupTimeFrom", form.pickupTimeFrom);
            fd.append("pickupTimeTo", form.pickupTimeTo);
            if (form.pickupInstructions.trim())
                fd.append("pickupInstructions", form.pickupInstructions.trim());
            fd.append("sameDayPickup", String(form.sameDayPickup));
        }

        if (form.thriftPrice.trim())
            fd.append("thriftPrice", stripCommas(form.thriftPrice));
        if (form.rentPerDay.trim())
            fd.append("rentPerDay", stripCommas(form.rentPerDay));
        if (form.securityDeposit.trim())
            fd.append("securityDeposit", stripCommas(form.securityDeposit));

        // Backend still auto-publishes on its side; we always send true now
        // since Save Draft has been removed.
        fd.append("publish", "true");

        return fd;
    };

    const handleSubmit = async () => {
        const validationError = validate();
        if (validationError) {
            toast.error(validationError);
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = buildFormData();

            const { data } = await api.post("/api/listings", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            toast.success("Listing published successfully!");
            console.log("Created listing:", data);
            router.push("/browse-finds");
        } catch (err) {
            if (axios.isAxiosError(err)) {
                toast.error(
                    err.response?.data?.message ??
                    "Something went wrong while saving your listing."
                );
            } else {
                toast.error("Something went wrong while saving your listing.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDF6EC]">

            {/* ── Top Bar ── */}
            <div className="bg-[#FDF6EC]">
                <div className="px-8 sm:px-12 lg:px-16 py-8 lg:py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                        <h1 className="font-serif text-[32px] leading-none tracking-[-0.02em] text-[#2A1F1A]">
                            List Your Item
                        </h1>
                        <p className="mt-2.5 text-[15px] text-[#6F6258]">
                            Create a beautiful listing and help your style live on.
                        </p>
                    </div>
                    <button className="inline-flex items-center gap-3 rounded-2xl border border-[#E0D4C8] bg-white px-5 py-3.5 text-[14px] font-medium text-[#3D322B] transition-colors hover:bg-[#FDF6EC] hover:border-[#CBBDAF] shrink-0 shadow-sm">
                        <HelpCircle size={18} strokeWidth={1.8} className="text-[#6F5E52]" />
                        <span>
              Need help? Check our{" "}
                            <span className="font-semibold text-[#A33214]">Seller Guide</span>
            </span>
                    </button>
                </div>
            </div>

            {/* ── Body (same horizontal padding as top bar) ── */}
            <div className="px-8 sm:px-12 lg:px-16 pb-12 flex gap-7">

                {/* ── Left: Form ── */}
                <div className="flex-1 min-w-0 flex flex-col gap-5">

                    {/* ━━ 1. Basic Information ━━ */}
                    <div className="bg-white rounded-xl border border-[#E8DDD0] overflow-hidden">
                        {/* Section header bar */}
                        <div className="flex items-center gap-3 px-7 py-5 border-b border-[#F0E6DA]">
                          <span className="w-7 h-7 rounded-full bg-[#A33214] text-white text-[13px] font-bold flex items-center justify-center flex-shrink-0">
                            1
                          </span>
                            <div>
                                <h2 className="text-[18px] font-serif font-semibold text-[#2A1F1A] leading-none">
                                    Basic Information
                                </h2>
                                <p className="text-[13px] text-[#8A7060] mt-0.5">
                                    Add key details so buyers can find your item easily.
                                </p>
                            </div>
                        </div>

                        <div className="px-7 py-6 flex flex-col gap-5">


                            {/* Row 1: Title full width */}
                            <InputField
                                label="Product Title"
                                required
                                value={form.productTitle}
                                onChange={(v) => update("productTitle", v)}
                                placeholder="e.g. Floral Print Midi Dress"
                                maxLength={80}
                            />

                            {/* Row 2: Category, Clothing Type, Gender */}
                            <div className="grid grid-cols-3 gap-4">

                                <div>
                                    <label className="text-[13px] font-medium text-[#3D2B1F] block mb-2">
                                        Listing Mode <span className="text-[#A33214]">*</span>
                                    </label>
                                    <div className="flex gap-2">
                                        {(["Thrift", "Rent", "Thrift + Rent"] as ListingMode[]).map((mode) => (
                                            <button
                                                key={mode}
                                                onClick={() => setMode(mode)}
                                                className={`px-4 py-2.5 rounded-xl text-[14px] font-semibold border-2 transition-all ${
                                                    form.listingMode === mode
                                                        ? "border-[#A33214] bg-[#A33214] text-white shadow-sm"
                                                        : "border-[#DDD0C4] bg-white text-[#3D2B1F] hover:border-[#A33214]/50"
                                                }`}
                                            >
                                                {mode}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <SelectField
                                    label="Gender"
                                    required
                                    value={form.gender}
                                    onChange={(v) => update("gender", v)}
                                    options={["Women", "Men", "Kids", "Unisex"]}
                                />
                                <SelectField
                                    label="Clothing Type"
                                    required
                                    value={form.clothingType}
                                    onChange={(v) => update("clothingType", v)}
                                    options={["Dresses", "Tops", "Bottoms", "Outerwear", "Accessories", "Footwear", "Activewear"]}
                                />
                            </div>

                            {/* Row 3: Brand, Style/Occasion, Era */}
                            <div className="grid grid-cols-3 gap-4">
                                <InputField
                                    label="Brand"
                                    value={form.brand}
                                    onChange={(v) => update("brand", v)}
                                    placeholder="e.g. Zara"
                                />
                                <SelectField
                                    label="Style / Occasion"
                                    value={form.styleOccasion}
                                    onChange={(v) => update("styleOccasion", v)}
                                    options={["Casual", "Formal", "Party", "Work", "Ethnic", "Sportswear"]}
                                />
                                <InputField
                                    label="Tags (Optional)"
                                    value={form.tags}
                                    onChange={(v) => update("tags", v)}
                                    placeholder="e.g. Minimal, Party, Work"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ━━ 2. Media ━━ */}
                    <div className="bg-white rounded-xl border border-[#E8DDD0] overflow-hidden">
                        <div className="flex items-center gap-3 px-7 py-5 border-b border-[#F0E6DA]">
                            <span className="w-7 h-7 rounded-full bg-[#A33214] text-white text-[13px] font-bold flex items-center justify-center flex-shrink-0">
                              2
                            </span>
                            <div>
                                <h2 className="text-[18px] font-serif font-semibold text-[#2A1F1A] leading-none">
                                    Media
                                </h2>
                                <p className="text-[13px] text-[#8A7060] mt-0.5">
                                    Add up to 4 photos and 1 video. Clear photos build trust and sell faster.
                                </p>
                            </div>
                        </div>

                        <div className="px-7 py-6 flex flex-col gap-6">
                            {/* Photos */}
                            <div>
                                <p className="text-[13px] font-semibold text-[#3D2B1F] mb-3">
                                    Photos <span className="font-normal text-[#8A7060]">(Max 4)</span>
                                </p>
                                {/* 4 equal-width columns */}
                                <div className="grid grid-cols-4 gap-3">
                                    {[
                                        { label: "Upload Front", sub: "Main view",        icon: <Upload size={20} /> },
                                        { label: "Upload Back",  sub: "Back view",        icon: <Upload size={20} /> },
                                        { label: "Upload Label", sub: "Brand / care tag", icon: <Tag size={20} />    },
                                        { label: "Upload Detail",sub: "Close-up / flaws", icon: <ImageIcon size={20} /> },
                                    ].map((slot, i) => (
                                        <PhotoUploadSlot
                                            key={i}
                                            label={slot.label}
                                            sublabel={slot.sub}
                                            icon={slot.icon}
                                            previewUrl={form.photos[i] ?? null}
                                            onFileChange={(file) => updatePhoto(i, file)}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-[#F0E6DA]" />

                            {/* Video */}
                            <div>
                                <p className="text-[13px] font-semibold text-[#3D2B1F] mb-3">
                                    Video <span className="font-normal text-[#8A7060]">(Optional)</span>
                                </p>
                                <div className="flex gap-4">
                                    <VideoUploadSlot
                                        previewUrl={form.video}
                                        onFileChange={updateVideo}
                                    />
                                    <div className="bg-[#FDFAF6] border border-[#E8DDD0] rounded-2xl px-5 py-4 w-[210px] flex-shrink-0">
                                        <div className="flex items-center gap-1.5 mb-2.5">
                                            <Info size={13} className="text-[#8A7060]" />
                                            <p className="text-[12px] font-semibold text-[#2A1F1A]">Tips for great media</p>
                                        </div>
                                        {[
                                            "Use natural light",
                                            "Show multiple angles",
                                            "Include close-up details",
                                            "Highlight any flaws",
                                        ].map((tip) => (
                                            <div key={tip} className="flex items-center gap-2 mb-1.5 last:mb-0">
                                                <CheckCircle size={12} className="text-[#3D5C30] flex-shrink-0" />
                                                <span className="text-[12px] text-[#6F6258]">{tip}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ━━ 3. Description ━━ */}
                    <div className="bg-white rounded-xl border border-[#E8DDD0] overflow-hidden">
                        <div className="flex items-center gap-3 px-7 py-5 border-b border-[#F0E6DA]">
                              <span className="w-7 h-7 rounded-full bg-[#A33214] text-white text-[13px] font-bold flex items-center justify-center flex-shrink-0">
                                3
                              </span>
                            <div>
                                <h2 className="text-[18px] font-serif font-semibold text-[#2A1F1A] leading-none">
                                    Description
                                </h2>
                                <p className="text-[13px] text-[#8A7060] mt-0.5">
                                    Write an honest, clear description to help buyers understand the item better.
                                </p>
                            </div>
                        </div>
                        <div className="px-7 py-6">
                            <div className="relative">
                            <textarea
                                value={form.description}
                                onChange={(e) => update("description", e.target.value)}
                                placeholder="Describe the item, fabric, fit, condition, wear history, flaws (if any), and styling notes..."
                                maxLength={1500}
                                rows={5}
                                className="w-full bg-white border border-[#DDD0C4] rounded-2xl px-5 py-4 text-[14px] text-[#1A130E] placeholder-[#BBA898] focus:outline-none focus:border-[#A33214] focus:ring-2 focus:ring-[#A33214]/10 resize-none transition-colors"
                            />
                                <span className="absolute bottom-4 right-5 text-[11px] text-[#BBA898] tabular-nums">
                              {form.description.length}/1500
                            </span>
                            </div>
                        </div>
                    </div>

                    {/* ━━ 4. Item Attributes ━━ */}
                    <div className="bg-white rounded-xl border border-[#E8DDD0] overflow-hidden">
                        <div className="flex items-center gap-3 px-7 py-5 border-b border-[#F0E6DA]">
                                      <span className="w-7 h-7 rounded-full bg-[#A33214] text-white text-[13px] font-bold flex items-center justify-center flex-shrink-0">
                                        4
                                      </span>
                            <div>
                                <h2 className="text-[18px] font-serif font-semibold text-[#2A1F1A] leading-none">
                                    Item Attributes
                                </h2>
                                <p className="text-[13px] text-[#8A7060] mt-0.5">
                                    Provide accurate details to improve discoverability and buyer confidence.
                                </p>
                            </div>
                        </div>

                        <div className="px-7 py-6 flex flex-col gap-5">
                            {/* Row 1: Size, Condition, Color */}
                            <div className="grid grid-cols-3 gap-4">
                                <SelectField
                                    label="Size on Label"
                                    required
                                    value={form.size}
                                    onChange={(v) => update("size", v)}
                                    options={["XS", "S", "M", "L", "XL", "XXL", "Free Size"]}
                                />
                                <SelectField
                                    label="Condition"
                                    required
                                    value={form.condition}
                                    onChange={(v) => update("condition", v)}
                                    options={["Like New", "Very Good", "Good", "Fair", "Heavily Used"]}
                                />
                                <InputField
                                    label="Color"
                                    required
                                    value={form.color}
                                    onChange={(v) => update("color", v)}
                                    placeholder="e.g. Beige, Navy, Floral"
                                />
                            </div>

                            {/* Row 2: Material, Original Price, Availability */}
                            <div className="grid grid-cols-3 gap-4">
                                <SelectField
                                    label="Material"
                                    required
                                    value={form.material}
                                    onChange={(v) => update("material", v)}
                                    options={["Cotton", "Polyester", "Silk", "Linen", "Wool", "Denim", "Rayon", "Mixed", "Other"]}
                                />
                                <InputField
                                    label="Original Price (Optional)"
                                    value={form.originalPrice}
                                    onChange={(v) => update("originalPrice", v)}
                                    placeholder="2,499"
                                    prefix="Rs"
                                    inputClassName="pl-10"
                                />
                                <SelectField
                                    label="Availability"
                                    value={form.availability}
                                    onChange={(v) => update("availability", v)}
                                    options={["Available", "Reserved", "Sold Out"]}
                                />
                            </div>

                            {/* Defect / Flaws */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] font-medium text-[#3D2B1F] flex items-center gap-1.5">
                                    <AlertCircle size={13} className="text-[#A33214]" />
                                    Visible Flaws / Notes
                                </label>
                                <textarea
                                    value={form.defectFlaws}
                                    onChange={(e) => update("defectFlaws", e.target.value)}
                                    placeholder="e.g. minor pilling on sleeve, small stain on hem (invisible when worn)"
                                    rows={2}
                                    className="w-full bg-white border border-[#DDD0C4] rounded-xl px-4 py-3 text-[14px] text-[#1A130E] placeholder-[#BBA898] focus:outline-none focus:border-[#A33214] focus:ring-2 focus:ring-[#A33214]/10 resize-none transition-colors"
                                />
                                <p className="text-[11px] text-[#8A7060]">
                                    Honest disclosures build trust and reduce returns.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ━━ 5. Delivery Options ━━ */}
                    <div className="bg-white rounded-xl border border-[#E8DDD0] overflow-hidden">
                        <div className="flex items-center gap-3 px-7 py-5 border-b border-[#F0E6DA]">
                          <span className="w-7 h-7 rounded-full bg-[#A33214] text-white text-[13px] font-bold flex items-center justify-center flex-shrink-0">
                            5
                          </span>
                            <div>
                                <h2 className="text-[18px] font-serif font-semibold text-[#2A1F1A] leading-none">
                                    Delivery Options
                                </h2>
                                <p className="text-[13px] text-[#8A7060] mt-0.5">
                                    Choose how buyers can receive this item. You can offer one or both options.
                                </p>
                            </div>
                        </div>

                        <div className="px-7 py-6 flex flex-col gap-6">
                            {/* Option selector */}
                            <div className="grid grid-cols-3 gap-3">
                                <DeliveryOptionCard
                                    icon={<Truck size={16} />}
                                    title="Shipping"
                                    active={form.deliveryOption === "Shipping"}
                                    onClick={() => update("deliveryOption", "Shipping")}
                                />
                                <DeliveryOptionCard
                                    icon={<MapPin size={16} />}
                                    title="Pickup"
                                    active={form.deliveryOption === "Pickup"}
                                    onClick={() => update("deliveryOption", "Pickup")}
                                />
                                <DeliveryOptionCard
                                    icon={<ShoppingBag size={16} />}
                                    title="Flex (Both)"
                                    active={form.deliveryOption === "Flex (Both)"}
                                    onClick={() => update("deliveryOption", "Flex (Both)")}
                                />
                            </div>

                            {form.deliveryOption === "Flex (Both)" && (
                                <div className="flex items-center gap-2 bg-[#F2FAF0] border border-[#D8E8D0] rounded-xl px-4 py-2.5 text-[12px] text-[#3D5C30]">
                                    <CheckCircle size={14} className="flex-shrink-0" />
                                    Great choice! Buyers can choose the option that works best for them.
                                </div>
                            )}

                            {/* Shipping Details */}
                            {(form.deliveryOption === "Shipping" || form.deliveryOption === "Flex (Both)") && (
                                <div className="border-t border-[#F0E6DA] pt-5 flex flex-col gap-5">
                                    <div className="flex items-center gap-2">
                                        <Truck size={15} className="text-[#A33214]" />
                                        <h3 className="text-[13px] font-bold text-[#A33214] uppercase tracking-wide">
                                            Shipping Details
                                        </h3>
                                    </div>

                                    <SelectField
                                        label="Shipping Availability"
                                        required
                                        value={form.shippingAvailability}
                                        onChange={(v) => update("shippingAvailability", v)}
                                        options={["Nationwide (All Districts)", "Kathmandu Valley Only", "Within Districts"]}
                                    />
                                    <p className="text-[11px] text-[#8A7060] -mt-3">
                                        You ship to all districts across Nepal.
                                    </p>

                                    <div>
                                        <label className="text-[13px] font-medium text-[#3D2B1F] block mb-2.5">
                                            Shipping Fee Type <span className="text-[#A33214]">*</span>
                                        </label>
                                        <div className="grid grid-cols-3 gap-3">
                                            <FeeTypeCard
                                                title="Free Shipping"
                                                desc="You'll cover the shipping cost"
                                                active={form.shippingFeeType === "Free Shipping"}
                                                onClick={() => update("shippingFeeType", "Free Shipping")}
                                            />
                                            <FeeTypeCard
                                                title="Fixed Fee"
                                                desc="Set a fixed shipping fee for all buyers"
                                                active={form.shippingFeeType === "Fixed Fee"}
                                                onClick={() => update("shippingFeeType", "Fixed Fee")}
                                            />
                                            <FeeTypeCard
                                                title="Dynamic Shipping"
                                                desc="Fee is calculated from your location to buyer's"
                                                active={form.shippingFeeType === "Dynamic Shipping"}
                                                onClick={() => update("shippingFeeType", "Dynamic Shipping")}
                                            />
                                        </div>
                                    </div>

                                    {form.shippingFeeType === "Fixed Fee" && (
                                        <InputField
                                            label="Shipping Fee"
                                            required
                                            value={form.fixedShippingFee}
                                            onChange={(v) => update("fixedShippingFee", v)}
                                            placeholder="150"
                                            prefix="Rs"
                                            inputClassName="pl-10"
                                        />
                                    )}

                                    {form.shippingFeeType === "Dynamic Shipping" && (
                                        <div>
                                            <div className="flex items-center gap-1.5 bg-[#FDF6EC] border border-[#EBE0D4] rounded-xl px-3.5 py-2.5 mb-3">
                                                <Info size={12} className="text-[#8A7060] flex-shrink-0" />
                                                <p className="text-[11px] text-[#6F6258]">
                                                    Dynamic shipping fee is calculated from the distance between your delivery location and the buyer's.
                                                </p>
                                            </div>
                                            <p className="text-[12px] font-medium text-[#3D2B1F] mb-2">
                                                Shipping Rate Structure
                                            </p>
                                            <div className="grid grid-cols-3 gap-4">
                                                <InputField
                                                    label="Within District"
                                                    required
                                                    value={form.rateWithinDistrict}
                                                    onChange={(v) => update("rateWithinDistrict", v)}
                                                    placeholder="100"
                                                    prefix="Rs"
                                                    inputClassName="pl-10"
                                                />
                                                <InputField
                                                    label="Within Province"
                                                    required
                                                    value={form.rateWithinProvince}
                                                    onChange={(v) => update("rateWithinProvince", v)}
                                                    placeholder="150"
                                                    prefix="Rs"
                                                    inputClassName="pl-10"
                                                />
                                                <InputField
                                                    label="Nationwide"
                                                    required
                                                    value={form.rateNationwide}
                                                    onChange={(v) => update("rateNationwide", v)}
                                                    placeholder="250"
                                                    prefix="Rs"
                                                    inputClassName="pl-10"
                                                />
                                            </div>
                                            <p className="text-[11px] text-[#8A7060] mt-2">
                                                These rates will be shown to buyers based on their delivery location.
                                            </p>
                                        </div>
                                    )}

                                    <SelectField
                                        label="Ready to Dispatch In"
                                        required
                                        value={form.dispatchTime}
                                        onChange={(v) => update("dispatchTime", v)}
                                        options={["Same Day", "Within 1 Day", "Within 2-3 Days", "Within 1 Week"]}
                                    />
                                    <p className="text-[11px] text-[#8A7060] -mt-3">
                                        This is the time you need to prepare the item before it's picked up by the courier.
                                    </p>
                                </div>
                            )}

                            {/* Pickup Details */}
                            {(form.deliveryOption === "Pickup" || form.deliveryOption === "Flex (Both)") && (
                                <div className="border-t border-[#F0E6DA] pt-5 flex flex-col gap-5">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={15} className="text-[#A33214]" />
                                        <h3 className="text-[13px] font-bold text-[#A33214] uppercase tracking-wide">
                                            Pickup Details
                                        </h3>
                                    </div>

                                    <InputField
                                        label="Pickup Area"
                                        required
                                        value={form.pickupArea}
                                        onChange={(v) => update("pickupArea", v)}
                                        placeholder="e.g. New Baneshwor, Kathmandu"
                                    />
                                    <p className="text-[11px] text-[#8A7060] -mt-3">
                                        This area will be visible to buyers before they place an order.
                                    </p>

                                    <div>
                                        <label className="text-[13px] font-medium text-[#3D2B1F] block mb-1">
                                            Exact Pickup Location <span className="text-[#A33214]">*</span>
                                        </label>
                                        <p className="text-[12px] text-[#8A7060] mb-2.5">
                                            Pin your exact pickup location on the map — click or drag the pin to fine-tune.
                                        </p>

                                        <div className="relative rounded-xl overflow-hidden border border-[#DDD0C4]">
                                            <PickupLocationMap
                                                lat={form.pickupLat ? parseFloat(form.pickupLat) : null}
                                                lng={form.pickupLng ? parseFloat(form.pickupLng) : null}
                                                onLocationSelect={handlePickupLocationChange}
                                            />
                                            <button
                                                type="button"
                                                onClick={handleUseMyLocation}
                                                className="absolute top-3 right-3 z-[1000] px-3 py-2 rounded-lg bg-white/95 border border-[#DDD0C4] text-[#A33214] text-[12px] font-semibold shadow-sm hover:bg-white transition-colors flex items-center gap-1.5"
                                            >
                                                <Navigation size={13} />
                                                {form.pickupLocationConfirmed ? "Update Pin" : "Select My Location"}
                                            </button>
                                        </div>

                                        {form.pickupResolvedAddress && (
                                            <div className="mt-2 flex items-start gap-1.5 bg-[#FDFAF6] border border-[#EBE0D4] rounded-xl px-3 py-2">
                                                <MapPin size={12} className="text-[#8A7060] mt-0.5 flex-shrink-0" />
                                                <p className="text-[11px] text-[#6F6258] leading-relaxed">
                                                    {form.pickupResolvedAddress}
                                                </p>
                                            </div>
                                        )}

                                        {form.pickupLocationConfirmed ? (
                                            <div className="mt-2 flex items-center justify-between gap-2 bg-[#F2FAF0] border border-[#D8E8D0] rounded-xl px-3.5 py-2.5">
                                                <div className="flex items-center gap-1.5 text-[12px] text-[#3D5C30] font-medium">
                                                    <CheckCircle size={13} />
                                                    Location entered successfully
                                                </div>
                                                <span className="text-[10px] text-[#6F9060] tabular-nums">
                        {form.pickupLat}, {form.pickupLng}
                    </span>
                                            </div>
                                        ) : (
                                            <p className="text-[11px] text-[#8A7060] mt-2">
                                                No pin set yet — click on the map or use &quot;Select My Location&quot;.
                                            </p>
                                        )}
                                    </div>

                                    {/* Pickup Contact Number + Pickup Instructions — side by side */}
                                    <div className="grid grid-cols-2 gap-4 items-stretch">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[13px] font-medium text-[#3D2B1F]">
                                                    Pickup Contact Number <span className="text-[#A33214]">*</span>
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={handleUseProfileNumber}
                                                    className="flex items-center gap-1.5 text-[12px] text-[#A33214] font-medium hover:underline"
                                                >
                                                    <Phone size={13} />
                                                    Use profile number
                                                </button>
                                            </div>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] text-[#8A7060] font-medium">
                                                    +977
                                                </span>
                                                <input
                                                    type="tel"
                                                    value={form.pickupContactNumber}
                                                    onChange={(e) => update("pickupContactNumber", e.target.value)}
                                                    placeholder="98XXXXXXXX"
                                                    className="w-full bg-white border border-[#DDD0C4] rounded-xl pl-14 pr-4 py-2.5 text-[14px] text-[#1A130E] placeholder-[#BBA898] focus:outline-none focus:border-[#A33214] focus:ring-2 focus:ring-[#A33214]/10 transition-colors"
                                                />
                                            </div>
                                            <p className="text-[11px] text-[#8A7060]">
                                                Buyers will use this number to contact you for pickup.
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[13px] font-medium text-[#3D2B1F]">
                                                Pickup Instructions (Optional)
                                            </label>
                                            <textarea
                                                value={form.pickupInstructions}
                                                onChange={(e) => update("pickupInstructions", e.target.value)}
                                                placeholder="e.g. Call before coming, ring the doorbell, gate code 1234"
                                                className="w-full h-[45px] bg-white border border-[#DDD0C4] rounded-xl px-4 py-2 text-[14px] text-[#1A130E] placeholder-[#BBA898] focus:outline-none focus:border-[#A33214] focus:ring-2 focus:ring-[#A33214]/10 resize-none transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[13px] font-medium text-[#3D2B1F] block mb-2">
                                            Pickup Availability (Hours) <span className="text-[#A33214]">*</span>
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {PICKUP_DAYS.map((day) => (
                                                <DayToggle
                                                    key={day}
                                                    day={day}
                                                    active={form.pickupDays.includes(day)}
                                                    onClick={() => togglePickupDay(day)}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[13px] font-medium text-[#3D2B1F]">From</label>
                                            <input
                                                type="time"
                                                value={form.pickupTimeFrom}
                                                onChange={(e) => update("pickupTimeFrom", e.target.value)}
                                                className="w-full bg-white border border-[#DDD0C4] rounded-xl px-4 py-2.5 text-[14px] text-[#1A130E] focus:outline-none focus:border-[#A33214] focus:ring-2 focus:ring-[#A33214]/10 transition-colors"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[13px] font-medium text-[#3D2B1F]">To</label>
                                            <input
                                                type="time"
                                                value={form.pickupTimeTo}
                                                onChange={(e) => update("pickupTimeTo", e.target.value)}
                                                className="w-full bg-white border border-[#DDD0C4] rounded-xl px-4 py-2.5 text-[14px] text-[#1A130E] focus:outline-none focus:border-[#A33214] focus:ring-2 focus:ring-[#A33214]/10 transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-[#8A7060] -mt-3">All times are in Nepal time (NPT).</p>

                                    <label className="flex items-center gap-2 text-[13px] font-medium text-[#3D2B1F] cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.sameDayPickup}
                                            onChange={(e) => update("sameDayPickup", e.target.checked)}
                                            className="accent-[#A33214]"
                                        />
                                        Yes, same-day pickup is available
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ━━ 6. Pricing ━━ */}
                    <div className="bg-white rounded-xl border border-[#E8DDD0] overflow-hidden">
                        <div className="flex items-center gap-3 px-7 py-5 border-b border-[#F0E6DA]">
                          <span className="w-7 h-7 rounded-full bg-[#A33214] text-white text-[13px] font-bold flex items-center justify-center flex-shrink-0">
                            6
                          </span>
                            <div>
                                <h2 className="text-[18px] font-serif font-semibold text-[#2A1F1A] leading-none">
                                    Pricing
                                </h2>
                                <p className="text-[13px] text-[#8A7060] mt-0.5">
                                    Set your price based on item quality, brand, and market value.
                                </p>
                            </div>
                        </div>

                        <div className="px-7 py-6">
                            <div className="grid grid-cols-3 gap-4">

                                {/* Thrift card */}
                                <div
                                    onClick={() => setMode("Thrift")}
                                    className={`rounded-xl border-2 p-5 cursor-pointer transition-all ${
                                        form.pricingMode === "Thrift"
                                            ? "border-[#A33214] bg-[#FDF6EC]"
                                            : "border-[#E0D4C8] bg-white hover:border-[#A33214]/40"
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                            form.pricingMode === "Thrift" ? "border-[#A33214] bg-[#A33214]" : "border-[#C8B8A8]"
                                        }`}>
                                            {form.pricingMode === "Thrift" && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                            )}
                                        </div>
                                        <span className={`text-[14px] font-semibold ${
                                            form.pricingMode === "Thrift" ? "text-[#A33214]" : "text-[#2A1F1A]"
                                        }`}>
                                          Thrift (For Sale)
                                        </span>
                                    </div>
                                    <label className="text-[12px] text-[#8A7060] font-medium block mb-1.5">
                                        Selling Price <span className="text-[#A33214]">*</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-[#8A7060] font-medium">Rs</span>
                                        <input
                                            type="text"
                                            value={form.thriftPrice}
                                            onChange={(e) => update("thriftPrice", e.target.value)}
                                            onClick={(e) => { e.stopPropagation(); setMode("Thrift"); }}
                                            placeholder="1,499"
                                            className="w-full border border-[#DDD0C4] rounded-xl px-4 py-2.5 pl-8 text-[14px] text-[#1A130E] bg-white focus:outline-none focus:border-[#A33214] focus:ring-2 focus:ring-[#A33214]/10 transition-colors"
                                        />
                                    </div>
                                    <p className="text-[11px] text-[#8A7060] mt-2">
                                        Buyers pay this as the final price.
                                    </p>
                                </div>

                                {/* Rent card */}
                                <div
                                    onClick={() => setMode("Rent")}
                                    className={`rounded-2xl border-2 p-5 cursor-pointer transition-all ${
                                        form.pricingMode === "Rent"
                                            ? "border-[#A33214] bg-[#FDF6EC]"
                                            : "border-[#E0D4C8] bg-white hover:border-[#A33214]/40"
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                            form.pricingMode === "Rent" ? "border-[#A33214] bg-[#A33214]" : "border-[#C8B8A8]"
                                        }`}>
                                            {form.pricingMode === "Rent" && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                            )}
                                        </div>
                                        <span className={`text-[14px] font-semibold ${
                                            form.pricingMode === "Rent" ? "text-[#A33214]" : "text-[#2A1F1A]"
                                        }`}>
                                          Rent (For Rent)
                                        </span>
                                    </div>
                                    <label className="text-[12px] text-[#8A7060] font-medium block mb-1.5">
                                        Price per day <span className="text-[#A33214]">*</span>
                                    </label>
                                    <div className="relative mb-3">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-[#8A7060] font-medium">Rs</span>
                                        <input
                                            type="text"
                                            value={form.rentPerDay}
                                            onChange={(e) => update("rentPerDay", e.target.value)}
                                            onClick={(e) => { e.stopPropagation(); setMode("Rent"); }}
                                            placeholder="899"
                                            className="w-full border border-[#DDD0C4] rounded-xl px-4 py-2.5 pl-8 text-[14px] text-[#1A130E] bg-white focus:outline-none focus:border-[#A33214] focus:ring-2 focus:ring-[#A33214]/10 transition-colors"
                                        />
                                    </div>
                                    <label className="text-[12px] text-[#8A7060] font-medium block mb-1.5">
                                        Security Deposit <span className="text-[#A33214]">*</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-[#8A7060] font-medium">Rs</span>
                                        <input
                                            type="text"
                                            value={form.securityDeposit}
                                            onChange={(e) => update("securityDeposit", e.target.value)}
                                            onClick={(e) => { e.stopPropagation(); setMode("Rent"); }}
                                            placeholder="1,500"
                                            className="w-full border border-[#DDD0C4] rounded-xl px-4 py-2.5 pl-8 text-[14px] text-[#1A130E] bg-white focus:outline-none focus:border-[#A33214] focus:ring-2 focus:ring-[#A33214]/10 transition-colors"
                                        />
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-2">
                                        <p className="text-[11px] text-[#8A7060]">+ Rs.199 per extra day</p>
                                        <Info size={11} className="text-[#B0A090]" />
                                    </div>
                                </div>

                                {/* Thrift + Rent card */}
                                <div
                                    onClick={() => setMode("Thrift + Rent")}
                                    className={`rounded-2xl border-2 p-5 cursor-pointer transition-all ${
                                        form.pricingMode === "Thrift + Rent"
                                            ? "border-[#A33214] bg-[#FDF6EC]"
                                            : "border-[#E0D4C8] bg-white hover:border-[#A33214]/40"
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                            form.pricingMode === "Thrift + Rent" ? "border-[#A33214] bg-[#A33214]" : "border-[#C8B8A8]"
                                        }`}>
                                            {form.pricingMode === "Thrift + Rent" && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                            )}
                                        </div>
                                        <span className={`text-[14px] font-semibold ${
                                            form.pricingMode === "Thrift + Rent" ? "text-[#A33214]" : "text-[#2A1F1A]"
                                        }`}>
                                          Thrift + Rent
                                        </span>
                                    </div>
                                    <p className="text-[13px] text-[#6F6258] leading-relaxed">
                                        List for both sale and rent
                                    </p>
                                    <p className="text-[12px] text-[#8A7060] mt-1">
                                        Set both prices to attract more buyers.
                                    </p>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* ━━ Action Buttons ━━ */}
                    <div className="bg-white rounded-xl border border-[#E8DDD0] px-7 py-5 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[12px] text-[#8A7060]">
                            <Shield size={15} className="text-[#8A7060]" />
                            <span>Your listing goes live immediately after publishing.</span>
                        </div>
                        <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => handleSubmit()}
                            className="px-5 py-2.5 rounded-xl bg-[#A33214] text-white text-[14px] font-bold hover:bg-[#8B2910] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Publishing..." : "Publish Listing"}
                        </button>
                    </div>
                </div>

                {/* ── Right: Preview ── */}
                <div className="w-[400px] flex-shrink-0">
                    <div className="sticky top-6">
                        <div className="bg-white rounded-xl border border-[#E8DDD0] overflow-hidden">

                            {/* Header */}
                            <div className="px-5 pt-5 pb-3 border-b border-[#F0E6DA]">
                                <p className="text-[15px] font-serif font-bold text-[#2A1F1A]">Listing Preview</p>
                                <p className="text-[11px] text-[#8A7060] mt-0.5">This is how your listing will appear to buyers.</p>
                            </div>

                            {/* Main photo */}
                            {/* Main Media */}
                            <div className="relative bg-[#F8F4EF] aspect-[4/5] overflow-hidden">
                                {showVideo ? (
                                    <video
                                        src={form.video!}
                                        controls
                                        className="w-full h-full object-cover"
                                    />
                                ) : selectedImage ? (
                                    <img
                                        src={selectedImage}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-[#C8BAA8]">
                                        <ImageIcon size={32} strokeWidth={1.5} />
                                        <p className="text-[11px] mt-2">
                                            Upload photos to preview
                                        </p>
                                    </div>
                                )}

                                {/* Listing Mode Badge */}
                                {form.listingMode && (
                                    <span
                                        className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full ${modeColors[form.listingMode]}`}
                                    >
                                        {form.listingMode.toUpperCase()}
                                    </span>
                                )}

                            </div>

                            {/* Gallery Thumbnails */}
                            <div className="flex gap-2 px-3 py-3 border-b border-[#F0E6DA] overflow-x-auto">

                                {form.photos.map((photo, index) => {
                                    if (!photo) return null;

                                    const isActive =
                                        selectedMedia.type === "image" &&
                                        selectedMedia.index === index;

                                    return (
                                        <button
                                            key={index}
                                            onClick={() =>
                                                setSelectedMedia({
                                                    type: "image",
                                                    index,
                                                })
                                            }
                                            className={`w-14 h-14 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                                                isActive
                                                    ? "border-[#A33214]"
                                                    : "border-[#E8DDD0]"
                                            }`}
                                        >
                                            <img
                                                src={photo}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    );
                                })}

                                {form.video && (
                                    <button
                                        onClick={() =>
                                            setSelectedMedia({
                                                type: "video",
                                                index: -1,
                                            })
                                        }
                                        className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                                            selectedMedia.type === "video"
                                                ? "border-[#A33214]"
                                                : "border-[#E8DDD0]"
                                        }`}
                                    >
                                        <video
                                            src={form.video}
                                            className="w-full h-full object-cover"
                                            muted
                                        />

                                        <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                                            <Play
                                                size={14}
                                                className="text-white fill-white"
                                            />
                                        </div>

                                        <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[8px] px-1 rounded">
                                            Video
                                        </div>
                                    </button>
                                )}
                            </div>

                            {/* Info */}
                            <div className="px-4 py-4 flex flex-col gap-3">

                                {/* Title + brand */}
                                <div>
                                    <h3 className="font-serif font-semibold text-[#A33214] text-[18px] leading-snug">
                                        {previewTitle}
                                    </h3>
                                    {form.brand && (
                                        <p className="text-[11px] text-[#8A7060] mt-0.5">{form.brand}</p>
                                    )}
                                </div>

                                {/* Price row */}
                                {(form.thriftPrice || form.rentPerDay) && (
                                    <div className="flex items-baseline gap-2 flex-wrap">
                                        {form.thriftPrice && form.pricingMode !== "Rent" && (
                                            <span className="text-[20px] font-bold text-[#A33214]">Rs {form.thriftPrice}</span>
                                        )}
                                        {form.rentPerDay && form.pricingMode !== "Thrift" && (
                                            <span className="text-[20px] font-bold text-[#A33214]">
                                                     Rs {form.rentPerDay}
                                                <span className="text-[12px] font-normal text-[#8A7060] ml-1">/ day</span>
                                                 </span>
                                        )}
                                        {form.originalPrice && (
                                            <span className="text-[12px] text-[#BBA898] line-through font-normal">Rs {form.originalPrice}</span>
                                        )}
                                    </div>
                                )}

                                {/* Attributes pills */}
                                {[form.size, form.condition, form.color, form.material].some(Boolean) && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {form.size && (
                                            <span className="text-[11px] bg-[#F5EFE6] border border-[#E8DDD0] text-[#3D2B1F] px-2.5 py-1 rounded-full font-medium">
                                                Size {form.size}
                                              </span>
                                        )}
                                        {form.condition && (
                                            <span className="text-[11px] bg-[#F5EFE6] border border-[#E8DDD0] text-[#3D2B1F] px-2.5 py-1 rounded-full font-medium">
                                            {form.condition}
                                          </span>
                                        )}
                                        {form.color && (
                                            <span className="text-[11px] bg-[#F5EFE6] border border-[#E8DDD0] text-[#3D2B1F] px-2.5 py-1 rounded-full font-medium">
                                            {form.color}
                                          </span>
                                        )}
                                        {form.material && (
                                            <span className="text-[11px] bg-[#F5EFE6] border border-[#E8DDD0] text-[#3D2B1F] px-2.5 py-1 rounded-full font-medium">
                                            {form.material}
                                          </span>
                                        )}
                                    </div>
                                )}

                                {/* Meta row: category · clothing type · gender */}
                                {[ form.clothingType, form.gender].some(Boolean) && (
                                    <p className="text-[11px] text-[#8A7060]">
                                        {[ form.clothingType, form.gender].filter(Boolean).join(" · ")}
                                    </p>
                                )}

                                {/* Style   / Tags */}
                                {(form.styleOccasion || form.tags) && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {form.styleOccasion && (
                                            <span className="text-[10px] bg-[#FDF6EC] border border-[#EBE0D4] text-[#8A7060] px-2 py-0.5 rounded-full">
                                            {form.styleOccasion}
                                          </span>
                                        )}
                                        {form.tags && form.tags.split(",").filter(Boolean).map((tag) => (
                                            <span key={tag.trim()} className="text-[10px] bg-[#FDF6EC] border border-[#EBE0D4] text-[#8A7060] px-2 py-0.5 rounded-full">
                                            {tag.trim()}
                                          </span>
                                        ))}
                                    </div>
                                )}

                                {/* Description */}
                                {form.description && (
                                    <div className="bg-[#FDFAF6] border border-[#EBE0D4] rounded-xl px-3 py-2.5">
                                        <p className="text-[10px] font-semibold text-[#3D2B1F] mb-1">Description</p>
                                        <p className="text-[11px] text-[#6F6258] leading-relaxed line-clamp-4">
                                            {form.description}
                                        </p>
                                    </div>
                                )}

                                {/* Availability */}
                                {form.availability && (
                                    <div className="flex justify-end">
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                            form.availability === "Available"
                                                ? "bg-[#EAF2E8] text-[#3D5C30]"
                                                : form.availability === "Reserved"
                                                    ? "bg-[#FFF4E0] text-[#8A6020]"
                                                    : "bg-[#F5E8E8] text-[#A33214]"
                                        }`}>
                                            {form.availability}
                                        </span>
                                    </div>
                                )}

                                {/* Delivery Options */}
                                <div className="flex flex-col gap-2">
                                    <p className="text-[11px] font-bold text-[#2A1F1A]">Delivery Options</p>

                                    {(form.deliveryOption === "Shipping" || form.deliveryOption === "Flex (Both)") && (
                                        <div className="flex items-start gap-2 bg-[#F5EFE6] border border-[#E8DDD0] rounded-xl px-3 py-2.5">
                                            <Truck size={13} className="text-[#A33214] mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-[11px] font-semibold text-[#2A1F1A]">Shipping Available</p>
                                                <p className="text-[10px] text-[#6F6258] mt-0.5">
                                                    {form.shippingAvailability}
                                                    {form.shippingFeeType === "Free Shipping" && " · Free shipping"}
                                                    {form.shippingFeeType === "Fixed Fee" && form.fixedShippingFee &&
                                                        ` · Rs ${form.fixedShippingFee}`}
                                                    {form.shippingFeeType === "Dynamic Shipping" && form.rateWithinDistrict &&
                                                        ` · From Rs ${form.rateWithinDistrict}`}
                                                </p>
                                                {form.dispatchTime && (
                                                    <p className="text-[10px] text-[#8A7060] mt-0.5">
                                                        Ready to dispatch {form.dispatchTime.toLowerCase()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {(form.deliveryOption === "Pickup" || form.deliveryOption === "Flex (Both)") && (
                                        <div className="flex items-start gap-2 bg-[#F5EFE6] border border-[#E8DDD0] rounded-xl px-3 py-2.5">
                                            <MapPin size={13} className="text-[#A33214] mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-[11px] font-semibold text-[#2A1F1A]">Pickup Available</p>
                                                {form.pickupArea && (
                                                    <p className="text-[10px] text-[#6F6258] mt-0.5">{form.pickupArea}</p>
                                                )}
                                                {form.pickupDays.length > 0 && form.pickupTimeFrom && form.pickupTimeTo && (
                                                    <p className="text-[10px] text-[#8A7060] mt-0.5">
                                                        {formatTime12h(form.pickupTimeFrom)} - {formatTime12h(form.pickupTimeTo)}
                                                        {" "}({formatDayRange(form.pickupDays)})
                                                    </p>
                                                )}
                                                {form.sameDayPickup && (
                                                    <p className="text-[10px] text-[#3D5C30] font-medium mt-0.5">
                                                        Same-day pickup available
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {(form.deliveryOption === "Pickup" || form.deliveryOption === "Flex (Both)") && (
                                        <div className="flex items-start gap-1.5 text-[10px] text-[#8A7060] px-1">
                                            <Info size={11} className="mt-0.5 flex-shrink-0" />
                                            <span>
                                                Exact location, contact number, and instructions will be shared after your order is confirmed.
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Defect / Flaws */}
                                {form.defectFlaws && (
                                    <div className="flex items-start gap-1.5 bg-[#FFF8F6] border border-[#F0D8D0] rounded-xl px-3 py-2.5">
                                        <AlertCircle size={11} className="text-[#A33214] mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-[10px] font-semibold text-[#A33214] mb-0.5">Noted Flaws</p>
                                            <p className="text-[11px] text-[#6F6258] leading-relaxed">{form.defectFlaws}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Security deposit if rent */}
                                {form.securityDeposit && form.pricingMode !== "Thrift" && (
                                    <div className="flex items-center justify-between text-[11px] text-[#8A7060] bg-[#F5EFE6] rounded-xl px-3 py-2">
                                        <span>Security Deposit</span>
                                        <span className="font-semibold text-[#2A1F1A]">₹{form.securityDeposit}</span>
                                    </div>
                                )}

                                {/* Divider */}
                                <div className="border-t border-[#F0E6DA]" />

                                {/* What buyers will see */}
                                <div className="bg-[#FDF6EC] rounded-xl p-3">
                                    <p className="text-[11px] font-bold text-[#2A1F1A] mb-2">What buyers will see</p>
                                    {[
                                        { label: "Clear photos and video", met: form.photos.some(Boolean) || !!form.video },
                                        { label: "Accurate details & measurements", met: !!(form.size && form.material) },
                                        { label: "Honest condition & notes", met: !!form.condition },
                                        { label: "Fair pricing", met: !!(form.thriftPrice || form.rentPerDay) },
                                        {
                                            label: "Delivery details",
                                            met:
                                                form.deliveryOption === "Shipping"
                                                    ? !!form.shippingAvailability
                                                    : form.deliveryOption === "Pickup"
                                                        ? !!(form.pickupArea && form.pickupLocationConfirmed)
                                                        : !!(
                                                            form.shippingAvailability &&
                                                            form.pickupArea &&
                                                            form.pickupLocationConfirmed
                                                        ),
                                        },
                                    ].map((item) => (
                                        <div key={item.label} className="flex items-start gap-1.5 mb-1 last:mb-0">
                                            <CheckCircle
                                                size={10}
                                                className={`mt-0.5 flex-shrink-0 ${item.met ? "text-[#3D5C30]" : "text-[#C8BAA8]"}`}
                                            />
                                            <span className={`text-[10px] ${item.met ? "text-[#6F6258]" : "text-[#C8BAA8]"}`}>
                {item.label}
              </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Seller Tips */}
                                <div>
                                    <p className="text-[11px] font-bold text-[#2A1F1A] mb-2">Seller Tips</p>
                                    {[
                                        { icon: <CheckCircle size={12} className="text-[#A33214]" />, title: "Be honest about condition", tip: "Reduces returns and builds trust." },
                                        { icon: <Shirt size={12} className="text-[#A33214]" />, title: "Use measurements", tip: "Improves fit confidence." },
                                        { icon: <ImageIcon size={12} className="text-[#A33214]" />, title: "Good photos = more views", tip: "Natural photos sell faster." },
                                        { icon: <AlertCircle size={12} className="text-[#A33214]" />, title: "Answer messages quickly", tip: "Prompt replies = happy buyers." },
                                    ].map((t) => (
                                        <div key={t.title} className="flex gap-2 mb-2 last:mb-0">
                                            <div className="mt-0.5 flex-shrink-0">{t.icon}</div>
                                            <div>
                                                <p className="text-[11px] font-semibold text-[#2A1F1A]">{t.title}</p>
                                                <p className="text-[10px] text-[#8A7060]">{t.tip}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}