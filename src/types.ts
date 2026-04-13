export interface ProgramData {
  id: string;
  negeri: string;
  namaProgram: string;
  tarikhMula: string;
  tarikhTamat: string;
  lokasi: string;
  bilanganPeserta: number;
  impak: string;
  cadangan: string;
  pautanGambar: string;
  gunaOs21000: number;
  gunaOs24000: number;
  gunaOs29000: number;
  gunaOs42000: number;
  timestamp?: string;
}

export type ProgramUpdate = Omit<ProgramData, 'id' | 'timestamp'>;
