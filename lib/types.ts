// lib/types.ts
// Tipos compartilhados que espelham os modelos do Prisma
// Útil para uso em componentes client-side sem depender do @prisma/client gerado

export interface Service {
  id: number;
  title: string;
  description: string;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  price?: string | null;
  duration?: string | null;
  featured: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Portfolio {
  id: number;
  title: string;
  description?: string | null;
  beforeUrl: string;
  beforePublicId?: string | null;
  afterUrl: string;
  afterPublicId?: string | null;
  category?: string | null;
  featured: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Testimonial {
  id: number;
  name: string;
  location?: string | null;
  rating: number;
  comment: string;
  avatarUrl?: string | null;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lead {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  service?: string | null;
  message: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}
