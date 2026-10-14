export type Gender = 'male' | 'female';

export type Subject =
  | 'Nazra'
  | 'Tajweed'
  | 'Hifz'
  | 'Islamic Studies'
  | 'Arabic Language'
  | 'Noorani Qaida'
  | 'Tafseer';

export type Language = 'English' | 'Urdu' | 'Arabic' | 'Pashto' | 'French' | 'Bengali';

export type StudentLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface QariProfile {
  id: string;
  name: string;
  title: string;
  gender: Gender;
  avatarUrl: string;
  qualification: string;
  experienceYears: number;
  hasSanad: boolean;
  sanadDetails?: string;
  rating: number;
  totalReviews: number;
  hourlyRateUSD: number;
  hourlyRatePKR: number;
  monthlyFeeUSD: number;
  languages: Language[];
  subjects: Subject[];
  badges: string[];
  city: string;
  country: string;
  bio: string;
  availabilitySchedule: {
    days: string[];
    timeSlots: string[];
  };
  featured?: boolean;
}

export interface BookingDetails {
  id?: string;
  qariId: string;
  qariName: string;
  hourlyRate: number;
  currency: 'USD' | 'PKR';
  level: StudentLevel;
  subject: Subject;
  selectedDate: string;
  selectedTimeSlot: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  studentName: string;
  studentAge?: string;
  notes?: string;
  status?: 'confirmed' | 'pending' | 'completed';
  createdAt?: string;
}

export interface FilterState {
  searchQuery: string;
  gender: 'all' | 'male' | 'female';
  subject: 'all' | Subject;
  language: 'all' | Language;
  minPrice: number;
  maxPrice: number;
  currency: 'USD' | 'PKR';
  sanadOnly: boolean;
  sortBy: 'recommended' | 'rating' | 'experience' | 'price_low' | 'price_high';
}
