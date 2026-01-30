export type PropertyType = 'sale' | 'rent';
export type PropertyStatus = 'active' | 'inactive';

export interface PropertyFeatures {
  bedrooms: number;
  bathrooms: number;
  parking: number;
  area: number; // m²
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  type: PropertyType;
  address_full: string;
  latitude: number;
  longitude: number;
  images: string[];
  features: PropertyFeatures;
  status: PropertyStatus;
  created_at: string;
}

export type LeadStatus = 'new' | 'in_progress' | 'closed';

export interface LeadInteraction {
  date: string;
  note: string;
  type: 'call' | 'email' | 'meeting' | 'whatsapp';
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: LeadStatus;
  interactions: LeadInteraction[];
  property_id?: string;
  created_at: string;
}
