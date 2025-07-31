export interface RequestHistory {
  url: string;
  timestamp: string; // ISO 8601 format
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
}
