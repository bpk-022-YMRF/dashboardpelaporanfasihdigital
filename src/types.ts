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
  
  // Waran Terima (Allocation)
  os21000: number;
  os24000: number;
  os29000: number;
  os42000: number;
  
  // Waran Guna (Usage)
  gunaOs21000: number;
  gunaOs24000: number;
  gunaOs29000: number;
  gunaOs42000: number;
  
  // Calculated fields (can be calculated on the fly or stored)
  jumlahWaranTerima: number;
  bakiOs21000: number;
  bakiOs24000: number;
  bakiOs29000: number;
  bakiOs42000: number;
  bakiKeseluruhan: number;
  peratusBaki: number;
}

export type ProgramUpdate = Partial<Omit<ProgramData, 'id' | 'jumlahWaranTerima' | 'bakiOs21000' | 'bakiOs24000' | 'bakiOs29000' | 'bakiOs42000' | 'bakiKeseluruhan' | 'peratusBaki'>>;
