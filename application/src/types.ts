export interface Meet {
  id: number
  projectId: number
  price: number | null
  duration: string | null
  startedAt: string
  deletedAt: string | null
}

export interface User {
  id: number | null
  passportId: number | null
  title: string | null
  description: string | null
  age: number | null
  image: string | null
  createdAt: string | null
  deletedAt: string | null
}

export interface Passport {
  id: number | null
  provider: string | null
  providerId: string | null
  title: string | null
  description: string | null
  email: string | null
  avatar: string | null
  createdAt: string | null
  updatedAt: string | null
}

export interface Project {
  id: number
  userId: number | null
  passportId: number | null
  placeId: number | null
  latitude: number | null
  longitude: number | null
  title: string | null
  description: string | null
  image: string | null
  deletedAt: string | null
}

export interface Place {
  id: number;
  title?: string;
  description?: string;
  address?: string;
  latitude: number;
  longitude: number;
  image?: string;
}