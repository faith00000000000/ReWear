'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  ShoppingBag,
  Clock,
  Search,
  Filter,
  Eye,
  XCircle,
  Tag,
  Calendar,
  DollarSign,
  CheckCircle2,
  Truck,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

type OrderType = 'sale' | 'rental';
type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'active_rental'
  | 'returned'
  | 'completed'
  | 'cancelled';

interface OrderItem {
  id: string;
  type: OrderType;
  itemTitle: string;
  itemImage: string;
  buyerName: string;
  buyerEmail: string;
  sellerName: string;
  totalPrice: number;
  securityDeposit?: number;
  status: OrderStatus;
  orderedAt: string;
  rentalStartDate?: string;
  rentalEndDate?: string;
  returnStatus?: 'on_time' | 'overdue' | 'returned_ok' | 'damaged';
}

// Mock initial order tracking data
const INITIAL_ORDERS: OrderItem[] = [
  {
    id: 'ORD-9901',
    type: 'sale',
    itemTitle: 'Vintage Denim Jacket - Oversized',
    itemImage:
      'https://images.unsplash.com/photo-1544441893-675973e31985?w=300',
    buyerName: 'Siddharth Shrestha',
    buyerEmail: 'siddharth@example.com',
    sellerName: 'RetroWardrobe',
    totalPrice: 45.0,
    status: 'processing',
    orderedAt: '2026-08-10 10:15',
  },
  {
    id: 'ORD-9902',
    type: 'rental',
    itemTitle: 'Silk Evening Gown - Crimson Red',
    itemImage:
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=300',
    buyerName: 'Aayusha Thapa',
    buyerEmail: 'aayusha@example.com',
    sellerName: 'GlamRentals',
    totalPrice: 75.0, // $25/day for 3 days
    securityDeposit: 50.0,
    status: 'active_rental',
    orderedAt: '2026-08-08 14:20',
    rentalStartDate: '2026-08-09',
    rentalEndDate: '2026-08-12',
    returnStatus: 'on_time',
  },
  {
    id: 'ORD-9903',
    type: 'sale',
    itemTitle: 'North Face Puffer Jacket - Black',
    itemImage:
      'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=300',
    buyerName: 'Rohan Adhikari',
    buyerEmail: 'rohan@example.com',
    sellerName: 'HimalayanThrift',
    totalPrice: 110.0,
    status: 'completed',
    orderedAt: '2026-08-05 09:00',
  },
  {
    id: 'ORD-9904',
    type: 'rental',
    itemTitle: 'Traditional Cultural Dress - Lehenga',
    itemImage:
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300',
    buyerName: 'Prashna Basnet',
    buyerEmail: 'prashna@example.com',
    sellerName: 'HeritageWear',
    totalPrice: 120.0,
    securityDeposit: 80.0,
    status: 'returned',
    orderedAt: '2026-08-01 16:45',
    rentalStartDate: '2026-08-03',
    rentalEndDate: '2026-08-07',
    returnStatus: 'returned_ok',
  },
];

export default function OrdersManagementPage() {
  const [orders, setOrders] = useState<OrderItem[]>(INITIAL_ORDERS);
  const [typeFilter, setTypeFilter] = useState<'all' | OrderType>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

  // Filtered dataset
  const filteredOrders = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return orders.filter((item) => {
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      const matchesStatus =
        statusFilter === 'all' || item.status === statusFilter;
      const matchesSearch =
        !query ||
        item.itemTitle.toLowerCase().includes(query) ||
        item.buyerName.toLowerCase().includes(query) ||
        item.sellerName.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query);

      return matchesType && matchesStatus && matchesSearch;
    });
  }, [orders, typeFilter, statusFilter, searchQuery]);

  // Action handlers
  const handleUpdateOrderStatus = (id: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === id ? { ...ord, status: newStatus } : ord)),
    );
    if (selectedOrder?.id === id) {
      setSelectedOrder((prev) =>
        prev ? { ...prev, status: newStatus } : null,
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#1C1C1C]/15 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1C1C1C] uppercase tracking-wide flex items-center gap-2">
            <ShoppingBag size={28} className="text-[#A33214]" />
            Orders & Rental Tracking
          </h1>
          <p className="text-sm font-medium text-[#1C1C1C]/70 mt-1">
            Monitor thrift sales, active rentals, escrow deposits, and return
            schedules.
          </p>
        </div>

        {/* Counter Badges */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-[#1C1C1C] text-[#FDF6EC] font-bold text-xs uppercase tracking-wider rounded-xl">
            Total Orders: {orders.length}
          </div>
          <div className="px-3 py-1 bg-[#A33214] text-[#FDF6EC] font-bold text-xs uppercase tracking-wider rounded-xl">
            Active Rentals:{' '}
            {orders.filter((o) => o.status === 'active_rental').length}
          </div>
        </div>
      </div>

      {/* Filter and Control Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Type Toggle Buttons */}
        <div className="flex items-center bg-[#FDF6EC] border border-[#1C1C1C]/20 p-1 self-start rounded-xl shadow-sm">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-4 py-1.5 font-extrabold text-xs uppercase tracking-wider transition-all rounded-xl ${
              typeFilter === 'all'
                ? 'bg-[#A33214] text-[#FDF6EC]'
                : 'text-[#1C1C1C]/80 hover:text-[#1C1C1C] hover:bg-[#1C1C1C]/5'
            }`}
          >
            All Orders ({orders.length})
          </button>
          <button
            onClick={() => setTypeFilter('sale')}
            className={`px-4 py-1.5 font-extrabold text-xs uppercase tracking-wider transition-all rounded-xl flex items-center gap-1.5 ${
              typeFilter === 'sale'
                ? 'bg-[#A33214] text-[#FDF6EC]'
                : 'text-[#1C1C1C]/80 hover:text-[#A33214] hover:bg-[#A33214]/5'
            }`}
          >
            <Tag size={13} />
            Direct Sales
          </button>
          <button
            onClick={() => setTypeFilter('rental')}
            className={`px-4 py-1.5 font-extrabold text-xs uppercase tracking-wider transition-all rounded-xl flex items-center gap-1.5 ${
              typeFilter === 'rental'
                ? 'bg-[#A33214] text-[#FDF6EC]'
                : 'text-[#1C1C1C]/80 hover:text-[#A33214] hover:bg-[#A33214]/5'
            }`}
          >
            <Clock size={13} />
            Rentals
          </button>
        </div>

        {/* Search & Status Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1C1C1C]/50"
            />
            <input
              type="text"
              placeholder="Search by ID, buyer, seller..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FDF6EC] text-[#1C1C1C] border border-[#1C1C1C]/20 rounded-xl pl-9 pr-3 py-1.5 text-xs font-semibold placeholder-[#1C1C1C]/40 focus:outline-none focus:border-[#A33214]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={16} className="text-[#1C1C1C]/70 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto bg-[#FDF6EC] text-[#1C1C1C] border border-[#1C1C1C]/20 rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-[#A33214]"
            >
              <option value="all">All Statuses</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="active_rental">Active Rental</option>
              <option value="returned">Returned</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Orders Table */}
      <div className="border border-[#1C1C1C]/15 bg-[#FDF6EC] overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#A33214] text-[#FDF6EC] text-xs uppercase font-bold tracking-wider border-b border-[#1C1C1C]">
              <th className="p-3">Order ID</th>
              <th className="p-3">Item Details</th>
              <th className="p-3">Type</th>
              <th className="p-3">Parties</th>
              <th className="p-3">Total / Deposit</th>
              <th className="p-3">Rental Window</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1C1C1C]/10 font-medium text-xs">
            {filteredOrders.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="text-center py-10 text-[#1C1C1C]/60 font-semibold uppercase tracking-wider"
                >
                  No orders found matching your search.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-[#1C1C1C]/5 transition-colors"
                >
                  <td className="p-3 font-mono font-bold text-[#A33214]">
                    {order.id}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={order.itemImage}
                        alt={order.itemTitle}
                        width={40}
                        height={40}
                        className="w-10 h-10 object-cover border border-[#1C1C1C]/20 rounded-xl shrink-0"
                      />
                      <div>
                        <p className="font-bold text-[#1C1C1C] line-clamp-1">
                          {order.itemTitle}
                        </p>
                        <p className="text-[11px] text-[#1C1C1C]/60">
                          {order.orderedAt}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border rounded-xl ${
                        order.type === 'sale'
                          ? 'bg-stone-100 text-[#1C1C1C] border-[#1C1C1C]/30'
                          : 'bg-amber-50 text-amber-900 border-amber-300'
                      }`}
                    >
                      {order.type}
                    </span>
                  </td>
                  <td className="p-3">
                    <p className="font-bold text-[#1C1C1C]">
                      Buyer: {order.buyerName}
                    </p>
                    <p className="text-[11px] text-[#1C1C1C]/60">
                      Seller: {order.sellerName}
                    </p>
                  </td>
                  <td className="p-3 font-bold text-[#1C1C1C]">
                    ${order.totalPrice.toFixed(2)}
                    {order.securityDeposit && (
                      <span className="block text-[10px] text-amber-800 font-semibold">
                        +${order.securityDeposit.toFixed(2)} deposit
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-[11px]">
                    {order.type === 'rental' ? (
                      <div className="space-y-0.5">
                        <span className="block font-semibold text-[#1C1C1C]">
                          {order.rentalStartDate} → {order.rentalEndDate}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[#1C1C1C]/40 italic">
                        N/A (Sale)
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-1.5 bg-[#1C1C1C] text-[#FDF6EC] hover:bg-[#A33214] transition-colors rounded-xl"
                      title="View Order / Rental Details"
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order / Rental Inspection Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1C1C]/50 backdrop-blur-xs">
          <div className="bg-[#FDF6EC] border border-[#1C1C1C]/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-xl rounded-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#1C1C1C]/15 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="text-[#A33214]" size={20} />
                <h2 className="text-lg font-black text-[#1C1C1C] uppercase tracking-wide">
                  Order Details: {selectedOrder.id}
                </h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-[#1C1C1C]/60 hover:text-[#A33214] p-1 transition-colors"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Content Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Image
                src={selectedOrder.itemImage}
                alt={selectedOrder.itemTitle}
                width={200}
                height={200}
                className="w-full h-36 object-cover border border-[#1C1C1C]/20 rounded-xl"
              />
              <div className="sm:col-span-2 space-y-2">
                <span className="text-xs font-mono font-bold text-[#A33214]">
                  {selectedOrder.id}
                </span>
                <h3 className="font-bold text-base text-[#1C1C1C]">
                  {selectedOrder.itemTitle}
                </h3>
                <div className="text-xs space-y-1 text-[#1C1C1C]">
                  <p>
                    <span className="font-bold">Buyer:</span>{' '}
                    {selectedOrder.buyerName} ({selectedOrder.buyerEmail})
                  </p>
                  <p>
                    <span className="font-bold">Seller:</span>{' '}
                    {selectedOrder.sellerName}
                  </p>
                  <p>
                    <span className="font-bold">Order Placed:</span>{' '}
                    {selectedOrder.orderedAt}
                  </p>
                </div>
              </div>
            </div>

            {/* Financials & Rental Schedule */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#1C1C1C]/15 pt-4">
              <div className="bg-[#1C1C1C]/5 p-3 rounded-xl border border-[#1C1C1C]/10 space-y-1">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#1C1C1C]/60">
                  Payment Breakup
                </p>
                <p className="text-xs font-bold text-[#1C1C1C]">
                  Total Item Price: ${selectedOrder.totalPrice.toFixed(2)}
                </p>
                {selectedOrder.securityDeposit && (
                  <p className="text-xs font-bold text-amber-900">
                    Security Deposit (Escrow): $
                    {selectedOrder.securityDeposit.toFixed(2)}
                  </p>
                )}
              </div>

              {selectedOrder.type === 'rental' && (
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 space-y-1">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900">
                    Rental Duration Tracking
                  </p>
                  <p className="text-xs font-bold text-[#1C1C1C]">
                    Start: {selectedOrder.rentalStartDate}
                  </p>
                  <p className="text-xs font-bold text-[#1C1C1C]">
                    Due Return: {selectedOrder.rentalEndDate}
                  </p>
                </div>
              )}
            </div>

            {/* Order Status Controls */}
            <div className="border-t border-[#1C1C1C]/15 pt-4 space-y-3">
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#1C1C1C]/70">
                Update Order Tracking Status
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  onClick={() =>
                    handleUpdateOrderStatus(selectedOrder.id, 'shipped')
                  }
                  className="px-3 py-2 bg-sky-100 text-sky-950 border border-sky-300 font-bold text-xs uppercase tracking-wider hover:bg-sky-200 transition-colors rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Truck size={14} /> Shipped
                </button>
                {selectedOrder.type === 'rental' && (
                  <button
                    onClick={() =>
                      handleUpdateOrderStatus(selectedOrder.id, 'active_rental')
                    }
                    className="px-3 py-2 bg-amber-100 text-amber-950 border border-amber-300 font-bold text-xs uppercase tracking-wider hover:bg-amber-200 transition-colors rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <Clock size={14} /> Active Rental
                  </button>
                )}
                {selectedOrder.type === 'rental' && (
                  <button
                    onClick={() =>
                      handleUpdateOrderStatus(selectedOrder.id, 'returned')
                    }
                    className="px-3 py-2 bg-purple-100 text-purple-950 border border-purple-300 font-bold text-xs uppercase tracking-wider hover:bg-purple-200 transition-colors rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw size={14} /> Item Returned
                  </button>
                )}
                <button
                  onClick={() =>
                    handleUpdateOrderStatus(selectedOrder.id, 'completed')
                  }
                  className="px-3 py-2 bg-emerald-100 text-emerald-950 border border-emerald-300 font-bold text-xs uppercase tracking-wider hover:bg-emerald-200 transition-colors rounded-xl flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 size={14} /> Completed
                </button>
                <button
                  onClick={() =>
                    handleUpdateOrderStatus(selectedOrder.id, 'cancelled')
                  }
                  className="px-3 py-2 bg-stone-200 text-stone-800 border border-stone-300 font-bold text-xs uppercase tracking-wider hover:bg-stone-300 transition-colors rounded-xl flex items-center justify-center gap-1.5"
                >
                  <XCircle size={14} /> Cancelled
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper badge component for order statuses
function OrderStatusBadge({ status }: { status: OrderStatus }) {
  switch (status) {
    case 'processing':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-stone-200 text-stone-800 border border-stone-300 rounded-xl">
          <Clock size={11} /> Processing
        </span>
      );
    case 'shipped':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-sky-100 text-sky-900 border border-sky-300 rounded-xl">
          <Truck size={11} /> Shipped
        </span>
      );
    case 'active_rental':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 rounded-xl">
          <Clock size={11} /> Active Rental
        </span>
      );
    case 'returned':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-purple-100 text-purple-900 border border-purple-300 rounded-xl">
          <RotateCcw size={11} /> Returned
        </span>
      );
    case 'completed':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl">
          <CheckCircle2 size={11} /> Completed
        </span>
      );
    case 'cancelled':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-red-100 text-red-900 border border-red-300 rounded-xl">
          <XCircle size={11} /> Cancelled
        </span>
      );
    default:
      return null;
  }
}
