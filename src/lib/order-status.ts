import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
export type POStatus = 'draft' | 'ordered' | 'in-transit' | 'received' | 'invoiced';

export interface OrderStatusItem {
  id: string;
  type: 'order' | 'po';
  number: string;
  customer: string;
  items: string[];
  value: number;
  status: OrderStatus | POStatus;
  progress: number;
  createdDate: string;
  expectedDelivery?: string;
  actualDelivery?: string;
  lastUpdated: string;
  trackingNumber?: string;
}

function loadJSON(fileName: string): any[] {
  try {
    const paths = [
      join(process.cwd(), 'data', fileName),
      join(process.cwd(), 'public', 'data', fileName),
    ];

    for (const path of paths) {
      if (existsSync(path)) {
        return JSON.parse(readFileSync(path, 'utf-8'));
      }
    }
    return [];
  } catch (e) {
    console.error(`Error loading ${fileName}:`, e);
    return [];
  }
}

export function generateOrderStatuses(): OrderStatusItem[] {
  const now = new Date();
  const statuses: OrderStatusItem[] = [];

  // Sample orders with statuses
  const orders = [
    {
      number: 'ORD-2025-001',
      customer: 'Smith Kline',
      items: ['Spare parts kit', 'Maintenance supplies'],
      value: 15000,
      created: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      status: 'delivered' as OrderStatus,
      expected: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
      actual: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
    },
    {
      number: 'ORD-2025-002',
      customer: 'Pfizer',
      items: ['New marking system', 'Installation service'],
      value: 45000,
      created: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
      status: 'shipped' as OrderStatus,
      expected: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
    },
    {
      number: 'ORD-2025-003',
      customer: 'Novartis',
      items: ['Software update', 'Training'],
      value: 8500,
      created: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      status: 'confirmed' as OrderStatus,
      expected: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const order of orders) {
    const progress =
      order.status === 'delivered' ? 100 : order.status === 'shipped' ? 75 : order.status === 'confirmed' ? 50 : 25;

    statuses.push({
      id: `order_${order.number}`,
      type: 'order',
      number: order.number,
      customer: order.customer,
      items: order.items,
      value: order.value,
      status: order.status,
      progress,
      createdDate: order.created.toISOString(),
      expectedDelivery: order.expected?.toISOString(),
      actualDelivery: order.actual?.toISOString(),
      lastUpdated: new Date().toISOString(),
      trackingNumber: order.status === 'shipped' ? `TRACK-${Math.random().toString(36).substring(7)}` : undefined,
    });
  }

  // Sample POs
  const pos = [
    {
      number: 'PO-2025-001',
      customer: 'Supplier A',
      items: ['Servo Motor Assembly', 'Hydraulic Pump Seal Kit'],
      value: 8250,
      created: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      status: 'in-transit' as POStatus,
      expected: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    },
    {
      number: 'PO-2025-002',
      customer: 'Software Vendor',
      items: ['OS License', 'Analytics Module'],
      value: 8000,
      created: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      status: 'ordered' as POStatus,
      expected: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const po of pos) {
    const progress =
      po.status === 'invoiced' ? 100 : po.status === 'received' ? 85 : po.status === 'in-transit' ? 65 : 40;

    statuses.push({
      id: `po_${po.number}`,
      type: 'po',
      number: po.number,
      customer: po.customer,
      items: po.items,
      value: po.value,
      status: po.status,
      progress,
      createdDate: po.created.toISOString(),
      expectedDelivery: po.expected?.toISOString(),
      lastUpdated: new Date().toISOString(),
    });
  }

  return statuses;
}

let statusCache: { data: OrderStatusItem[]; timestamp: number } | null = null;
const CACHE_TTL = 1800000; // 30 min

export function getOrderStatuses(): OrderStatusItem[] {
  if (statusCache && Date.now() - statusCache.timestamp < CACHE_TTL) {
    return statusCache.data;
  }

  const statuses = generateOrderStatuses();
  statusCache = { data: statuses, timestamp: Date.now() };
  return statuses;
}

export function getStatusStats() {
  const statuses = getOrderStatuses();
  const orders = statuses.filter((s) => s.type === 'order');
  const pos = statuses.filter((s) => s.type === 'po');

  return {
    totalOrders: orders.length,
    totalPOs: pos.length,
    delivered: orders.filter((o) => (o.status as OrderStatus) === 'delivered').length,
    inTransit: orders.filter((o) => (o.status as OrderStatus) === 'shipped').length + pos.filter((p) => (p.status as POStatus) === 'in-transit').length,
    pending: orders.filter((o) => (o.status as OrderStatus) === 'pending').length + pos.filter((p) => (p.status as POStatus) === 'draft').length,
    totalValue: statuses.reduce((sum, s) => sum + s.value, 0),
  };
}
