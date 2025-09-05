/**
 * 티켓 관련 타입 정의
 */

export type TicketStatus = 'available' | 'reserved' | 'sold' | 'cancelled';

export interface Ticket {
  id: number;
  game: string;
  time: string;
  seat: string;
  price: number;
  description?: string;
  seller_id: number;
  created_at: string;
  updated_at: string;
  status?: TicketStatus;
}

export interface SeatInfo {
  section: string;
  row: string;
  seat: string;
  description?: string;
}

export interface CreateTicketRequest {
  game_id: string;
  team_id: string;
  section: string;
  row: string;
  seat_label: string;
  price: string;
  note: string;
}

export interface TicketFormData {
  game_id: string;
  team_id: string;
  section: string;
  row: string;
  seat_label: string;
  price: string;
  note: string;
}
