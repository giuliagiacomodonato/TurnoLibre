// Tipos y interfaces centralizados para la app

// Cart
export type CartItem = {
  id: string;
  name: string;
  date: string;
  time: string;
  court: string;
  price: number;
  image?: string;
  facilityId: string;
};

export interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  isHydrated: boolean;
}

// Sports, Facilities, Locations
export type Sport = {
  id: string;
  name: string;
  description?: string | null;
  facilities: Facility[];
};

export type FacilityAvailability = {
  dayOfWeek: number;
  openingTime: string;
  closingTime: string;
  slotDuration: number;
};

export type Facility = {
  id: string;
  name: string;
  description?: string | null;
  price?: number;
  sportId?: string;
  locationId?: string;
  location?: Location;
  reservations?: Reservation[];
  availability?: FacilityAvailability[];
  sport?: Sport;
};

export type Location = {
  id: string;
  name: string;
  address: string;
  phone: string;
  description?: string | null;
  services?: string[];
  schedules?: LocationSchedule[];
  images?: { id: string; link: string }[];
};

export type LocationSchedule = {
  id: string;
  dayOfWeek: number;
  isOpen: boolean;
  openingTime: string;
  closingTime: string;
};

// Reservas
export type Reservation = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  reason?: string;
  user?: {
    name: string;
    email: string;
  };
  facility?: Facility;
  payment?: {
    amount: number;
    status: string;
  } | null;
};

export type Availability = {
  [date: string]: {
    [facilityId: string]: {
      time: string;
      available: boolean;
      reason?: string;
      isReservation?: boolean;
      user?: {
        name: string;
        email: string;
      };
    }[];
  };
};

export type AvailabilitySlot = {
  time: string;
  available: boolean;
  slotDuration: number;
};

// Props para componentes UI
export interface VenueInfoProps {
  name: string;
  description: string;
  address: string;
  phone: string;
  sports: string[];
  images: string[];
  hours: {
    day: string;
    open: string;
    close: string;
  }[];
  services: string[];
}

export interface VenueLocationProps {
  address: string;
  phone: string;
}

export interface VenueServicesProps {
  services: string[];
}

export interface VenueHoursProps {
  hours: {
    day: string;
    open: string;
    close: string;
  }[];
}

export interface ReservationDetailsPopupProps {
  courtName: string;
  time: string;
  duration: number;
  price: number;
  onReserve: () => void;
  onClose: () => void;
  courtDescription?: string;
  venueAddress?: string;
}

export interface CloudinaryUploadProps {
  onUploadSuccess: (imageUrl: string, message?: string) => void;
  onUploadError?: (error: string) => void;
  locationId: string;
}

export interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => void;
  error?: string;
}

export interface CanchaHorariosAdminClientProps {
  sedes?: any[];
  canchas?: any[];
  sports?: any[];
} 