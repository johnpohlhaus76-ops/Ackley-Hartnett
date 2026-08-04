// Plant Operations Data Management
// Integrates machines, orders, quotes, uploads, and POs

export interface Machine {
  serialNumber: string | number;
  model: string;
  customer: string;
  country: string;
  address: string;
  shipped: string;
  status: 'active' | 'maintenance' | 'inactive';
  installDate: string;
  lastService?: string;
}

export interface Order {
  id: string;
  plantId: string;
  plantName: string;
  orderDate: string;
  orderNumber: string;
  items: string[];
  value: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'completed';
}

export interface Quote {
  id: string;
  plantId: string;
  plantName: string;
  quoteDate: string;
  quoteNumber: string;
  description: string;
  value: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  expiryDate: string;
}

export interface UploadRequest {
  id: string;
  plantId: string;
  plantName: string;
  title: string;
  type: 'manual' | 'datasheet' | 'specification' | 'maintenance' | 'other';
  uploadDate: string;
  fileUrl: string;
  fileName: string;
  description: string;
}

export interface PO {
  id: string;
  plantId: string;
  plantName: string;
  poDate: string;
  poNumber: string;
  vendor: string;
  items: POItem[];
  totalValue: number;
  status: 'draft' | 'ordered' | 'received' | 'invoiced';
  category: 'spare-parts' | 'change-parts' | 'machines' | 'software';
}

export interface POItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  deliveryDate?: string;
}

export interface Contact {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  mobile?: string;
  department: 'operations' | 'procurement' | 'quality' | 'logistics' | 'management';
  isPrimary?: boolean;
}

export interface PlantData {
  id: string;
  name: string;
  country: string;
  address: string;
  machines: Machine[];
  orders: Order[];
  quotes: Quote[];
  uploads: UploadRequest[];
  pos: PO[];
  contacts: Contact[];
  metrics: {
    totalMachines: number;
    activeMachines: number;
    totalOrders: number;
    totalOrderValue: number;
    totalQuoteValue: number;
    pendingPOs: number;
    totalContacts: number;
  };
}

// Sample data generators
export function generatePlantData(plantName: string, country: string, machines: Machine[]): PlantData {
  const plantId = plantName.toLowerCase().replace(/\s+/g, '-');

  // Generate sample contacts
  const contacts: Contact[] = [
    {
      id: `contact_${plantId}_001`,
      name: 'John Smith',
      title: 'Plant Manager',
      email: `john.smith@${plantId}.com`,
      phone: '+1-555-0101',
      mobile: '+1-555-0111',
      department: 'management',
      isPrimary: true,
    },
    {
      id: `contact_${plantId}_002`,
      name: 'Sarah Johnson',
      title: 'Operations Director',
      email: `sarah.johnson@${plantId}.com`,
      phone: '+1-555-0102',
      mobile: '+1-555-0112',
      department: 'operations',
    },
    {
      id: `contact_${plantId}_003`,
      name: 'Michael Chen',
      title: 'Procurement Manager',
      email: `michael.chen@${plantId}.com`,
      phone: '+1-555-0103',
      mobile: '+1-555-0113',
      department: 'procurement',
    },
    {
      id: `contact_${plantId}_004`,
      name: 'Lisa Rodriguez',
      title: 'Quality Assurance Lead',
      email: `lisa.rodriguez@${plantId}.com`,
      phone: '+1-555-0104',
      department: 'quality',
    },
  ];

  // Generate sample orders
  const orders: Order[] = [
    {
      id: `order_${plantId}_001`,
      plantId,
      plantName,
      orderDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      orderNumber: `ORD-${plantId.substring(0, 3).toUpperCase()}-2025-001`,
      items: ['Spare parts kit', 'Maintenance supplies'],
      value: 15000,
      status: 'completed',
    },
    {
      id: `order_${plantId}_002`,
      plantId,
      plantName,
      orderDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      orderNumber: `ORD-${plantId.substring(0, 3).toUpperCase()}-2025-002`,
      items: ['New marking system', 'Installation service'],
      value: 45000,
      status: 'shipped',
    },
    {
      id: `order_${plantId}_003`,
      plantId,
      plantName,
      orderDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      orderNumber: `ORD-${plantId.substring(0, 3).toUpperCase()}-2025-003`,
      items: ['Software update', 'Training'],
      value: 8500,
      status: 'pending',
    },
  ];

  // Generate sample quotes
  const quotes: Quote[] = [
    {
      id: `quote_${plantId}_001`,
      plantId,
      plantName,
      quoteDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      quoteNumber: `QT-${plantId.substring(0, 3).toUpperCase()}-2025-001`,
      description: 'Complete system upgrade with new laser module',
      value: 125000,
      status: 'sent',
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: `quote_${plantId}_002`,
      plantId,
      plantName,
      quoteDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      quoteNumber: `QT-${plantId.substring(0, 3).toUpperCase()}-2025-002`,
      description: 'Maintenance package - annual service contract',
      value: 22000,
      status: 'accepted',
      expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  // Generate sample uploads
  const uploads: UploadRequest[] = [
    {
      id: `upload_${plantId}_001`,
      plantId,
      plantName,
      title: 'Maintenance Manual - Updated 2025',
      type: 'manual',
      uploadDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      fileUrl: '/uploads/maintenance-manual-2025.pdf',
      fileName: 'maintenance-manual-2025.pdf',
      description: 'Complete maintenance procedures and troubleshooting guide',
    },
    {
      id: `upload_${plantId}_002`,
      plantId,
      plantName,
      title: 'Operating Specifications',
      type: 'specification',
      uploadDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      fileUrl: '/uploads/operating-specs.pdf',
      fileName: 'operating-specs.pdf',
      description: 'Technical specifications and performance parameters',
    },
  ];

  // Generate sample POs
  const pos: PO[] = [
    {
      id: `po_${plantId}_001`,
      plantId,
      plantName,
      poDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      poNumber: `PO-${plantId.substring(0, 3).toUpperCase()}-2025-001`,
      vendor: 'Industrial Components Inc.',
      items: [
        {
          description: 'Servo Motor Assembly (x2)',
          quantity: 2,
          unitPrice: 3500,
          total: 7000,
          deliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          description: 'Hydraulic Pump Seal Kit',
          quantity: 5,
          unitPrice: 250,
          total: 1250,
        },
      ],
      totalValue: 8250,
      status: 'ordered',
      category: 'spare-parts',
    },
    {
      id: `po_${plantId}_002`,
      plantId,
      plantName,
      poDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      poNumber: `PO-${plantId.substring(0, 3).toUpperCase()}-2025-002`,
      vendor: 'Software Solutions Ltd.',
      items: [
        {
          description: 'Operating System License (1 year)',
          quantity: 1,
          unitPrice: 5000,
          total: 5000,
        },
        {
          description: 'Analytics Module',
          quantity: 1,
          unitPrice: 3000,
          total: 3000,
        },
      ],
      totalValue: 8000,
      status: 'draft',
      category: 'software',
    },
  ];

  return {
    id: plantId,
    name: plantName,
    country,
    address: machines[0]?.address || 'TBD',
    machines,
    orders,
    quotes,
    uploads,
    pos,
    contacts,
    metrics: {
      totalMachines: machines.length,
      activeMachines: machines.filter((m) => m.status === 'active').length,
      totalOrders: orders.length,
      totalOrderValue: orders.reduce((sum, o) => sum + o.value, 0),
      totalQuoteValue: quotes.reduce((sum, q) => sum + q.value, 0),
      pendingPOs: pos.filter((p) => p.status === 'draft' || p.status === 'ordered').length,
      totalContacts: contacts.length,
    },
  };
}

// Aggregate plants from machines data
export function aggregatePlantsFromMachines(machines: Machine[]): Map<string, Machine[]> {
  const plantMap = new Map<string, Machine[]>();

  machines.forEach((machine) => {
    const plantKey = machine.customer;
    if (!plantMap.has(plantKey)) {
      plantMap.set(plantKey, []);
    }
    plantMap.get(plantKey)!.push(machine);
  });

  return plantMap;
}
