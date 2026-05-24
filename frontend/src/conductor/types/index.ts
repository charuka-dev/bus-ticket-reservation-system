export interface Conductor {
  id: string;
  username: string;
  password: string;
  name: string;
  employeeId: string;
  phone: string;
  email: string;
  route: string;
  photoUrl?: string;
}

export interface Booking {
  id: string;
  seatNumber: string;
  passengerName: string;
  passengerId?: string;
  route: string;
  date: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'boarded';
  busId?: string;
  qrCode?: string;
}

export type PageKey = 'home' | 'profile' | 'booking' | 'scanqr' | 'tasks';

export interface Task {
  id: string;
  title: string;
  description?: string;
  route?: string;
  busId?: string;
  date?: string;
  ownerId?: string;
  ownerName?: string;
  conductorId?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
}
