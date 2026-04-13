import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ProgramData {
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
  os21000: number;
  os24000: number;
  os29000: number;
  os42000: number;
  gunaOs21000: number;
  gunaOs24000: number;
  gunaOs29000: number;
  gunaOs42000: number;
}

// Initial data from the user's CSV
let programs: ProgramData[] = [
  {
    id: "1",
    negeri: "JOHOR",
    namaProgram: "Program Rintis Johore Digital Talent (JDT): Future Classroom Negeri Johor Tahun 2026",
    tarikhMula: "",
    tarikhTamat: "",
    lokasi: "",
    bilanganPeserta: 0,
    impak: "",
    cadangan: "",
    pautanGambar: "",
    os21000: 4500,
    os24000: 1000,
    os29000: 1300,
    os42000: 6000,
    gunaOs21000: 4000,
    gunaOs24000: 600,
    gunaOs29000: 1000,
    gunaOs42000: 5000,
  },
  {
    id: "2",
    negeri: "JOHOR",
    namaProgram: "Bengkel Kerja Eksplorasi Pedagogi Digital dan Integrasi Kepintaran Buatan (AI) dalam Mata Pelajaran Teknologi Dan Digital (TnD)",
    tarikhMula: "",
    tarikhTamat: "",
    lokasi: "",
    bilanganPeserta: 0,
    impak: "",
    cadangan: "",
    pautanGambar: "",
    os21000: 5000,
    os24000: 0,
    os29000: 19000,
    os42000: 0,
    gunaOs21000: 0,
    gunaOs24000: 0,
    gunaOs29000: 0,
    gunaOs42000: 0,
  },
  {
    id: "3",
    negeri: "SABAH",
    namaProgram: "Program Pemerkasaan Murid Fasih Digital Modul TMK Sekolah Rendah & Murid Sains Komputer (Zon Sabah) Tahun 2026",
    tarikhMula: "",
    tarikhTamat: "",
    lokasi: "",
    bilanganPeserta: 0,
    impak: "",
    cadangan: "",
    pautanGambar: "",
    os21000: 10000,
    os24000: 0,
    os29000: 0,
    os42000: 48000,
    gunaOs21000: 0,
    gunaOs24000: 0,
    gunaOs29000: 0,
    gunaOs42000: 0,
  },
  {
    id: "4",
    negeri: "SABAH",
    namaProgram: "Bengkel Pembangunan Modul Kecerdasan Buatan (AI) dalam PdP Subjek Asas Sains Komputer (ASK) & Sains Komputer (SK)",
    tarikhMula: "",
    tarikhTamat: "",
    lokasi: "",
    bilanganPeserta: 0,
    impak: "",
    cadangan: "",
    pautanGambar: "",
    os21000: 8000,
    os24000: 0,
    os29000: 22000,
    os42000: 0,
    gunaOs21000: 0,
    gunaOs24000: 0,
    gunaOs29000: 0,
    gunaOs42000: 0,
  },
  {
    id: "5",
    negeri: "SARAWAK",
    namaProgram: "Program Pemerkasaan Murid Fasih Digital Modul TMK Sekolah Rendah & Murid Sains Komputer Tahun 2026",
    tarikhMula: "",
    tarikhTamat: "",
    lokasi: "",
    bilanganPeserta: 0,
    impak: "",
    cadangan: "",
    pautanGambar: "",
    os21000: 10000,
    os24000: 0,
    os29000: 0,
    os42000: 48000,
    gunaOs21000: 0,
    gunaOs24000: 0,
    gunaOs29000: 0,
    gunaOs42000: 0,
  },
  {
    id: "6",
    negeri: "SARAWAK",
    namaProgram: "Bengkel Kerja Digital Classroom Impact: Guru Kompeten, Murid Berketerampilan Digital",
    tarikhMula: "",
    tarikhTamat: "",
    lokasi: "",
    bilanganPeserta: 0,
    impak: "",
    cadangan: "",
    pautanGambar: "",
    os21000: 15000,
    os24000: 6000,
    os29000: 18000,
    os42000: 0,
    gunaOs21000: 0,
    gunaOs24000: 0,
    gunaOs29000: 0,
    gunaOs42000: 0,
  },
  {
    id: "7",
    negeri: "SARAWAK",
    namaProgram: "Digital Educators: Intensif Pemerkasaan Pedagogi Sains Komputer Di Zon Utara Negeri Sarawak",
    tarikhMula: "",
    tarikhTamat: "",
    lokasi: "",
    bilanganPeserta: 0,
    impak: "",
    cadangan: "",
    pautanGambar: "",
    os21000: 13050,
    os24000: 0,
    os29000: 13000,
    os42000: 0,
    gunaOs21000: 0,
    gunaOs24000: 0,
    gunaOs29000: 0,
    gunaOs42000: 0,
  },
  {
    id: "8",
    negeri: "KELANTAN",
    namaProgram: "Bengkel Peningkatan Kemahiran Dan Kompetensi Digital Guru-Guru Jabatan Pendidikan Negeri Kelantan",
    tarikhMula: "",
    tarikhTamat: "",
    lokasi: "",
    bilanganPeserta: 0,
    impak: "",
    cadangan: "",
    pautanGambar: "",
    os21000: 0,
    os24000: 0,
    os29000: 40000,
    os42000: 0,
    gunaOs21000: 0,
    gunaOs24000: 0,
    gunaOs29000: 0,
    gunaOs42000: 0,
  },
  {
    id: "9",
    negeri: "KELANTAN",
    namaProgram: "Program Pemerkasaan Murid Fasih Digital Modul TMK Sekolah Rendah & Murid Sains Komputer Tahun 2026",
    tarikhMula: "",
    tarikhTamat: "",
    lokasi: "",
    bilanganPeserta: 0,
    impak: "",
    cadangan: "",
    pautanGambar: "",
    os21000: 5000,
    os24000: 0,
    os29000: 0,
    os42000: 48000,
    gunaOs21000: 0,
    gunaOs24000: 0,
    gunaOs29000: 0,
    gunaOs42000: 0,
  },
  {
    id: "10",
    negeri: "TERENGGANU",
    namaProgram: "Bengkel Pemerkasaan Kompetensi Digital Guru Sains Komputer Berteraskan DSKP dan Inisiatif Fasih Digital 2026",
    tarikhMula: "",
    tarikhTamat: "",
    lokasi: "",
    bilanganPeserta: 0,
    impak: "",
    cadangan: "",
    pautanGambar: "",
    os21000: 5000,
    os24000: 0,
    os29000: 19950,
    os42000: 0,
    gunaOs21000: 0,
    gunaOs24000: 0,
    gunaOs29000: 0,
    gunaOs42000: 0,
  },
  {
    id: "11",
    negeri: "TERENGGANU",
    namaProgram: "Pemantauan Program Kompetensi Fasih Digital Murid PPD Dungun Bersama-sama Bahagian Pembangunan Kurikulum Dan Unit TMK Sektor Pembelajaran, Jabatan Pendidikan Negeri",
    tarikhMula: "",
    tarikhTamat: "",
    lokasi: "",
    bilanganPeserta: 0,
    impak: "",
    cadangan: "",
    pautanGambar: "",
    os21000: 6000,
    os24000: 0,
    os29000: 20000,
    os42000: 0,
    gunaOs21000: 0,
    gunaOs24000: 0,
    gunaOs29000: 0,
    gunaOs42000: 0,
  },
  {
    id: "12",
    negeri: "PULAU PINANG",
    namaProgram: "Bengkel Future STEM Educators: Pemerkasaan Guru-Guru Mata Pelajaran Sains Komputer Negeri Pulau Pinang Tahun 2026",
    tarikhMula: "",
    tarikhTamat: "",
    lokasi: "",
    bilanganPeserta: 0,
    impak: "",
    cadangan: "",
    pautanGambar: "",
    os21000: 0,
    os24000: 2000,
    os29000: 10000,
    os42000: 0,
    gunaOs21000: 0,
    gunaOs24000: 0,
    gunaOs29000: 0,
    gunaOs42000: 0,
  },
  {
    id: "13",
    negeri: "PERLIS",
    namaProgram: "Bootcamp Pembangunan Modul Sokongan Profesional Bagi Intervensi Literasi Digital Murid Tahun 2026",
    tarikhMula: "",
    tarikhTamat: "",
    lokasi: "",
    bilanganPeserta: 0,
    impak: "",
    cadangan: "",
    pautanGambar: "",
    os21000: 0,
    os24000: 0,
    os29000: 3000,
    os42000: 0,
    gunaOs21000: 0,
    gunaOs24000: 0,
    gunaOs29000: 0,
    gunaOs42000: 0,
  },
  {
    id: "14",
    negeri: "WP KUALA LUMPUR",
    namaProgram: "Bengkel AI-Driven Pedagogy: Kemahiran Menjana Prompt Tersuai bagi Analisis Data Peperiksaan dan Intervensi Praktikal PdP",
    tarikhMula: "",
    tarikhTamat: "",
    lokasi: "",
    bilanganPeserta: 0,
    impak: "",
    cadangan: "",
    pautanGambar: "",
    os21000: 1400,
    os24000: 0,
    os29000: 10200,
    os42000: 0,
    gunaOs21000: 0,
    gunaOs24000: 0,
    gunaOs29000: 0,
    gunaOs42000: 0,
  },
  {
    id: "15",
    negeri: "PERAK",
    namaProgram: "Bengkel Digital Educator Upgrade: Pengaplikasian Modul TMK Tahap I dan II Dalam Platform Pelaporan Prestasi Murid",
    tarikhMula: "",
    tarikhTamat: "",
    lokasi: "",
    bilanganPeserta: 0,
    impak: "",
    cadangan: "",
    pautanGambar: "",
    os21000: 5000,
    os24000: 0,
    os29000: 14840,
    os42000: 0,
    gunaOs21000: 0,
    gunaOs24000: 0,
    gunaOs29000: 0,
    gunaOs42000: 0,
  },
  {
    id: "16",
    negeri: "KEDAH",
    namaProgram: "Bengkel Latihan Fasih Digital (Pangkalan Data) Dan Transformasi Pengurusan Digital Mata Pelajaran Asas Sains Komputer dan Sains Komputer Tahun 2026",
    tarikhMula: "",
    tarikhTamat: "",
    lokasi: "",
    bilanganPeserta: 0,
    impak: "",
    cadangan: "",
    pautanGambar: "",
    os21000: 5000,
    os24000: 0,
    os29000: 20000,
    os42000: 0,
    gunaOs21000: 0,
    gunaOs24000: 0,
    gunaOs29000: 0,
    gunaOs42000: 0,
  },
  {
    id: "17",
    negeri: "KEDAH",
    namaProgram: "Bengkel Latihan Fasih Digital (Algoritma) Dan Transformasi Pengurusan Digital Pegawai Unit TMK Tahun 2026",
    tarikhMula: "",
    tarikhTamat: "",
    lokasi: "",
    bilanganPeserta: 0,
    impak: "",
    cadangan: "",
    pautanGambar: "",
    os21000: 2000,
    os24000: 0,
    os29000: 20000,
    os42000: 0,
    gunaOs21000: 0,
    gunaOs24000: 0,
    gunaOs29000: 0,
    gunaOs42000: 0,
  }
];

function calculateDerived(p: ProgramData) {
  const jumlahWaranTerima = p.os21000 + p.os24000 + p.os29000 + p.os42000;
  const bakiOs21000 = p.os21000 - p.gunaOs21000;
  const bakiOs24000 = p.os24000 - p.gunaOs24000;
  const bakiOs29000 = p.os29000 - p.gunaOs29000;
  const bakiOs42000 = p.os42000 - p.gunaOs42000;
  const bakiKeseluruhan = bakiOs21000 + bakiOs24000 + bakiOs29000 + bakiOs42000;
  const peratusBaki = jumlahWaranTerima > 0 ? (bakiKeseluruhan / jumlahWaranTerima) * 100 : 0;

  return {
    ...p,
    jumlahWaranTerima,
    bakiOs21000,
    bakiOs24000,
    bakiOs29000,
    bakiOs42000,
    bakiKeseluruhan,
    peratusBaki
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/programs", (req, res) => {
    const enriched = programs.map(calculateDerived);
    res.json(enriched);
  });

  app.post("/api/programs/:id", (req, res) => {
    const { id } = req.params;
    const update = req.body;
    
    const index = programs.findIndex(p => p.id === id);
    if (index !== -1) {
      programs[index] = { ...programs[index], ...update };
      res.json(calculateDerived(programs[index]));
    } else {
      res.status(404).json({ error: "Program not found" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
