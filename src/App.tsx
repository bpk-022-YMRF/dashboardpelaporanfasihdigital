/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, ReactNode } from "react";
import { 
  LayoutDashboard, 
  Search, 
  TrendingUp, 
  Wallet, 
  CheckCircle2, 
  AlertCircle,
  Edit2,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Plus,
  X,
  FileText,
  Printer,
  Download
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  Legend
} from "recharts";
import { cn } from "@/lib/utils";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

import { ProgramData, ProgramUpdate } from "./types";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#84cc16', '#a855f7'];

const NEGERI_LIST = [
  "JOHOR", "SABAH", "SARAWAK", "KELANTAN", "TERENGGANU", 
  "PULAU PINANG", "PERLIS", "WP KUALA LUMPUR", "PERAK", "KEDAH"
];

// GANTIKAN URL INI DENGAN URL DARI GOOGLE APPS SCRIPT ANDA
const GAS_URL = "https://script.google.com/macros/s/AKfycbwoFYkI71R_QNG-Gqg2PyTzTbHb5Xrk_dVLJN92EMh9txU45UMwF2_B0b5a664rztMz/exec";

export default function App() {
  const [programs, setPrograms] = useState<ProgramData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterNegeri, setFilterNegeri] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<ProgramUpdate>({
    negeri: "",
    namaProgram: "",
    tarikhMula: "",
    tarikhTamat: "",
    lokasi: "",
    bilanganPeserta: 0,
    impak: "",
    cadangan: "",
    pautanGambar: "",
    gunaOs21000: 0,
    gunaOs24000: 0,
    gunaOs29000: 0,
    gunaOs42000: 0
  });

  useEffect(() => {
    console.log("App version: 2026-04-15 16:30 (Fixed Dialog)");
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      // Tambah timestamp untuk elakkan caching
      const res = await fetch(`${GAS_URL}?t=${new Date().getTime()}`);
      const data = await res.json();
      
      console.log("Data received:", data);

      if (Array.isArray(data)) {
        console.log("Raw data from GAS:", data);
        
        // Helper to clean numeric strings (remove RM, commas, spaces)
        const cleanNum = (val: any) => {
          if (val === undefined || val === null || val === "") return 0;
          if (typeof val === "number") return val;
          const cleaned = String(val).replace(/RM/gi, "").replace(/,/g, "").trim();
          const num = parseFloat(cleaned);
          return isNaN(num) ? 0 : num;
        };

        // Map data with extremely robust key matching
        const mappedData = data
          .filter(item => item && typeof item === "object")
          .map((item, index) => {
            const normalized: any = {};
            Object.keys(item).forEach(key => {
              const normalizedKey = key.toLowerCase().replace(/[\s_]/g, "");
              normalized[normalizedKey] = item[key];
            });

            const getVal = (search: string, fallback: any = "") => {
              const searchKey = search.toLowerCase().replace(/[\s_]/g, "");
              // Try exact match first
              if (normalized[searchKey] !== undefined) return normalized[searchKey];
              // Try partial match
              const key = Object.keys(normalized).find(k => k.includes(searchKey));
              return key !== undefined ? normalized[key] : fallback;
            };

            return {
              ...item,
              id: getVal("id") || `row-${index}`,
              negeri: getVal("negeri"),
              namaProgram: getVal("namaprogram") || getVal("program"),
              tarikhMula: getVal("tarikhmula") || getVal("tarikh"),
              tarikhTamat: getVal("tarikhtamat"),
              lokasi: getVal("lokasi"),
              bilanganPeserta: cleanNum(getVal("peserta")),
              gunaOs21000: cleanNum(getVal("21000")),
              gunaOs24000: cleanNum(getVal("24000")),
              gunaOs29000: cleanNum(getVal("29000")),
              gunaOs42000: cleanNum(getVal("42000")),
              impak: getVal("impak"),
              cadangan: getVal("cadangan"),
              pautanGambar: getVal("pautan"),
            };
          });
        
        if (mappedData.length === 0) {
          toast.info("Tiada data ditemui dalam Google Sheets.");
        } else {
          toast.success(`Berjaya memuatkan ${mappedData.length} laporan.`);
        }
        setPrograms(mappedData);
      } else if (data && data.status === "error") {
        toast.error(`Ralat GAS: ${data.message}`);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error(`Gagal berhubung dengan Google Sheets: ${error instanceof Error ? error.message : 'Ralat tidak diketahui'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.negeri || !formData.namaProgram) {
      toast.error("Sila pilih Negeri dan masukkan Nama Program");
      return;
    }

    try {
      setLoading(true);
      await fetch(GAS_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(formData),
      });
      
      toast.success("Laporan berjaya dihantar!");
      setIsModalOpen(false);
      setFormData({
        negeri: "",
        namaProgram: "",
        tarikhMula: "",
        tarikhTamat: "",
        lokasi: "",
        bilanganPeserta: 0,
        impak: "",
        cadangan: "",
        pautanGambar: "",
        gunaOs21000: 0,
        gunaOs24000: 0,
        gunaOs29000: 0,
        gunaOs42000: 0
      });
      setTimeout(fetchPrograms, 3000);
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(`Gagal menghantar laporan: ${error instanceof Error ? error.message : 'Ralat tidak diketahui'}`);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = (program: ProgramData) => {
    const doc = new jsPDF();
    
    // Logo Jata Negara
    const logoUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Coat_of_arms_of_Malaysia.svg/500px-Coat_of_arms_of_Malaysia.svg.png";
    doc.addImage(logoUrl, 'PNG', 90, 10, 30, 25);

    // Header
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    const title = "LAPORAN PELAKSANAAN BENGKEL KERJA LATIHAN KOMPETENSI FASIH DIGITAL TAHUN 2026";
    const splitTitle = doc.splitTextToSize(title, 160);
    doc.text(splitTitle, 105, 45, { align: "center" });
    
    doc.line(20, 55, 190, 55);
    
    // Content
    const data = [
      ["Negeri", program.negeri],
      ["Nama Program", program.namaProgram],
      ["Tarikh", `${formatDate(program.tarikhMula)} hingga ${formatDate(program.tarikhTamat)}`],
      ["Lokasi", program.lokasi],
      ["Bilangan Peserta", program.bilanganPeserta.toString()],
      ["Impak/Output", program.impak],
      ["Cadangan", program.cadangan],
      ["Pautan Gambar", program.pautanGambar],
    ];
    
    autoTable(doc, {
      startY: 65,
      head: [["Perkara", "Butiran"]],
      body: data,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 10 }
    });
    
    // Financial Table
    const total = Number(program.gunaOs21000) + Number(program.gunaOs24000) + Number(program.gunaOs29000) + Number(program.gunaOs42000);
    const financialData = [
      ["OS21000", program.gunaOs21000.toLocaleString()],
      ["OS24000", program.gunaOs24000.toLocaleString()],
      ["OS29000", program.gunaOs29000.toLocaleString()],
      ["OS42000", program.gunaOs42000.toLocaleString()],
      ["JUMLAH KESELURUHAN", total.toLocaleString()],
    ];
    
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [["Objek Sebagai (OS)", "Jumlah Perbelanjaan (RM)"]],
      body: financialData,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] },
      styles: { fontSize: 10 },
      didParseCell: function(data) {
        if (data.row.index === 4) {
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });
    
    doc.save(`Laporan_${program.namaProgram}_${program.negeri}.pdf`);
  };

  const filteredPrograms = useMemo(() => {
    return programs.filter(p => {
      const matchesSearch = (p.namaProgram?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
                           (p.negeri?.toLowerCase() || "").includes(searchQuery.toLowerCase());
      const matchesNegeri = filterNegeri === "all" || p.negeri === filterNegeri;
      return matchesSearch && matchesNegeri;
    });
  }, [programs, searchQuery, filterNegeri]);

  const osAnalysis = useMemo(() => {
    return [
      { name: "OS21000", value: programs.reduce((acc, p) => acc + (Number(p.gunaOs21000) || 0), 0) },
      { name: "OS24000", value: programs.reduce((acc, p) => acc + (Number(p.gunaOs24000) || 0), 0) },
      { name: "OS29000", value: programs.reduce((acc, p) => acc + (Number(p.gunaOs29000) || 0), 0) },
      { name: "OS42000", value: programs.reduce((acc, p) => acc + (Number(p.gunaOs42000) || 0), 0) },
    ];
  }, [programs]);

  const stateAnalysis = useMemo(() => {
    const counts: Record<string, number> = {};
    programs.forEach(p => {
      counts[p.negeri] = (counts[p.negeri] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [programs]);

  const totalSpent = useMemo(() => {
    return osAnalysis.reduce((acc, curr) => acc + curr.value, 0);
  }, [osAnalysis]);

  const formatDate = (dateStr: any) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return String(dateStr);
      return date.toLocaleDateString('ms-MY', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return String(dateStr);
    }
  };

  if (loading && programs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 font-medium">Memuatkan Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Toaster position="top-right" />
      
      <main className="max-w-7xl mx-auto p-4 lg:p-8">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200">
              <LayoutDashboard size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Sistem Pelaporan Digital</h2>
              <p className="text-slate-500">Pemantauan perbelanjaan waran dan laporan program</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {loading && programs.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium animate-pulse">
                <RefreshCw size={12} className="animate-spin" />
                Mengemaskini...
              </div>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setLoading(true);
                fetchPrograms();
              }}
              className="bg-white gap-2"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh Data
            </Button>
          </div>
        </header>

        {/* Borang Pengisian Data - Sentiasa Dipaparkan di Atas */}
        <div className="mb-12">
          <Card className="border-none shadow-md bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg text-white">
                  <Plus size={20} />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-slate-800">Borang Pelaporan Program & Waran</CardTitle>
                  <CardDescription>Sila isi maklumat pelaksanaan program dan perbelanjaan waran dengan tepat.</CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <div className="w-1.5 h-5 bg-blue-600 rounded-full" />
                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Maklumat Asas Program</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-5">
                    <div className="space-y-2">
                      <Label className="text-slate-600 font-semibold">Negeri</Label>
                      <Select 
                        value={formData.negeri} 
                        onValueChange={(v) => setFormData({...formData, negeri: v})}
                      >
                        <SelectTrigger className="bg-white border-slate-200 h-11">
                          <SelectValue placeholder="Pilih Negeri" />
                        </SelectTrigger>
                        <SelectContent>
                          {NEGERI_LIST.map(n => (
                            <SelectItem key={n} value={n}>{n}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-slate-600 font-semibold">Nama Program</Label>
                      <Input 
                        placeholder="Masukkan nama penuh program" 
                        value={formData.namaProgram}
                        onChange={(e) => setFormData({...formData, namaProgram: e.target.value})}
                        className="bg-white border-slate-200 h-11"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-slate-600 font-semibold">Tarikh Mula</Label>
                        <Input 
                          type="date" 
                          value={formData.tarikhMula}
                          onChange={(e) => setFormData({...formData, tarikhMula: e.target.value})}
                          className="bg-white border-slate-200 h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-600 font-semibold">Tarikh Tamat</Label>
                        <Input 
                          type="date" 
                          value={formData.tarikhTamat}
                          onChange={(e) => setFormData({...formData, tarikhTamat: e.target.value})}
                          className="bg-white border-slate-200 h-11"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-600 font-semibold">Lokasi Bengkel</Label>
                      <Input 
                        placeholder="Contoh: Hotel Grand Continental, Kuantan" 
                        value={formData.lokasi}
                        onChange={(e) => setFormData({...formData, lokasi: e.target.value})}
                        className="bg-white border-slate-200 h-11"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-slate-600 font-semibold">Bilangan Peserta</Label>
                        <Input 
                          type="number" 
                          value={formData.bilanganPeserta}
                          onChange={(e) => setFormData({...formData, bilanganPeserta: parseInt(e.target.value.toString()) || 0})}
                          className="bg-white border-slate-200 h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-600 font-semibold">Pautan Gambar (Drive/URL)</Label>
                        <Input 
                          placeholder="https://drive.google.com/..." 
                          value={formData.pautanGambar}
                          onChange={(e) => setFormData({...formData, pautanGambar: e.target.value})}
                          className="bg-white border-slate-200 h-11"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <div className="w-1.5 h-5 bg-emerald-600 rounded-full" />
                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Perbelanjaan Waran (Guna)</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="text-slate-600 font-semibold">OS21000 (RM)</Label>
                      <Input 
                        type="number" 
                        value={formData.gunaOs21000}
                        onChange={(e) => setFormData({...formData, gunaOs21000: parseFloat(e.target.value) || 0})}
                        className="bg-white border-slate-200 h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-600 font-semibold">OS24000 (RM)</Label>
                      <Input 
                        type="number" 
                        value={formData.gunaOs24000}
                        onChange={(e) => setFormData({...formData, gunaOs24000: parseFloat(e.target.value) || 0})}
                        className="bg-white border-slate-200 h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-600 font-semibold">OS29000 (RM)</Label>
                      <Input 
                        type="number" 
                        value={formData.gunaOs29000}
                        onChange={(e) => setFormData({...formData, gunaOs29000: parseFloat(e.target.value) || 0})}
                        className="bg-white border-slate-200 h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-600 font-semibold">OS42000 (RM)</Label>
                      <Input 
                        type="number" 
                        value={formData.gunaOs42000}
                        onChange={(e) => setFormData({...formData, gunaOs42000: parseFloat(e.target.value) || 0})}
                        className="bg-white border-slate-200 h-11"
                      />
                    </div>
                  </div>

                  <div className="p-6 bg-blue-600 rounded-2xl shadow-lg shadow-blue-100 flex flex-col items-center justify-center text-center text-white">
                    <p className="text-xs font-bold opacity-80 uppercase tracking-widest mb-1">Jumlah Keseluruhan Guna</p>
                    <p className="text-4xl font-black">
                      RM {(Number(formData.gunaOs21000) + Number(formData.gunaOs24000) + Number(formData.gunaOs29000) + Number(formData.gunaOs42000)).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label className="text-slate-600 font-semibold">Impak / Output / Hasil Program</Label>
                    <textarea 
                      className="w-full min-h-[140px] p-4 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                      placeholder="Nyatakan impak program kepada peserta..."
                      value={formData.impak}
                      onChange={(e) => setFormData({...formData, impak: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-600 font-semibold">Cadangan Penambahbaikan</Label>
                    <textarea 
                      className="w-full min-h-[140px] p-4 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                      placeholder="Nyatakan cadangan untuk program akan datang..."
                      value={formData.cadangan}
                      onChange={(e) => setFormData({...formData, cadangan: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </CardContent>

            <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-center md:justify-end gap-4">
              <Button 
                variant="outline" 
                onClick={() => setFormData({
                  negeri: "",
                  namaProgram: "",
                  tarikhMula: "",
                  tarikhTamat: "",
                  lokasi: "",
                  bilanganPeserta: 0,
                  impak: "",
                  cadangan: "",
                  pautanGambar: "",
                  gunaOs21000: 0,
                  gunaOs24000: 0,
                  gunaOs29000: 0,
                  gunaOs42000: 0
                })} 
                className="rounded-xl px-8 h-12 font-semibold"
              >
                Kosongkan Borang
              </Button>
              <Button 
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-12 h-12 rounded-xl shadow-xl shadow-blue-200 font-bold text-lg transition-all active:scale-95"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw size={20} className="animate-spin" />
                    Menghantar...
                  </div>
                ) : "Simpan Laporan"}
              </Button>
            </div>
          </Card>
        </div>

        {/* Analisis & Graf - Dipaparkan di Bawah Borang */}
        <div className="space-y-8">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-blue-600" size={24} />
            <h3 className="text-2xl font-bold text-slate-800">Analisis & Statistik</h3>
          </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard 
            title="Jumlah Perbelanjaan (Semua OS)" 
            value={`RM ${totalSpent.toLocaleString()}`} 
            icon={<Wallet className="text-blue-600" />}
            trend="Berdasarkan laporan dihantar"
          />
          <StatCard 
            title="Jumlah Laporan Diterima" 
            value={programs.length.toString()} 
            icon={<FileText className="text-amber-600" />}
            trend="Keseluruhan negeri"
          />
          <StatCard 
            title="Negeri Paling Aktif" 
            value={stateAnalysis.sort((a,b) => b.value - a.value)[0]?.name || "-"} 
            icon={<TrendingUp className="text-emerald-600" />}
            trend="Bilangan laporan tertinggi"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Perbelanjaan mengikut OS</CardTitle>
              <CardDescription>Rumusan penggunaan waran bagi setiap kategori OS</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={osAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    formatter={(value: number) => `RM ${value.toLocaleString()}`}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" name="Jumlah Guna" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Laporan mengikut Negeri</CardTitle>
              <CardDescription>Taburan bilangan program yang telah dilaporkan</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stateAnalysis}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stateAnalysis.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Filter & Table */}
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-semibold">Senarai Laporan Program</CardTitle>
              <CardDescription>Senarai lengkap program dan perbelanjaan yang telah direkodkan</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <Input 
                  placeholder="Cari program..." 
                  className="pl-9 w-full md:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={filterNegeri} onValueChange={setFilterNegeri}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Semua Negeri" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Negeri</SelectItem>
                  {NEGERI_LIST.map(n => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader className="bg-slate-50 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="text-sm font-semibold">Negeri</TableHead>
                    <TableHead className="text-sm font-semibold">Nama Program</TableHead>
                    <TableHead className="text-sm font-semibold">Lokasi</TableHead>
                    <TableHead className="text-sm font-semibold text-center">Peserta</TableHead>
                    <TableHead className="text-sm font-semibold">Tarikh</TableHead>
                    <TableHead className="text-sm font-semibold text-right">OS21000 (RM)</TableHead>
                    <TableHead className="text-sm font-semibold text-right">OS24000 (RM)</TableHead>
                    <TableHead className="text-sm font-semibold text-right">OS29000 (RM)</TableHead>
                    <TableHead className="text-sm font-semibold text-right">OS42000 (RM)</TableHead>
                    <TableHead className="text-sm font-semibold text-right">Jumlah (RM)</TableHead>
                    <TableHead className="text-sm font-semibold text-center">Tindakan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPrograms.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="h-32 text-center text-slate-400">
                        Tiada data laporan ditemui.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPrograms.map((p) => (
                      <TableRow key={p.id} className="hover:bg-slate-50/50">
                        <TableCell>
                          <Badge variant="secondary" className="font-medium text-xs">{p.negeri}</Badge>
                        </TableCell>
                        <TableCell className="text-sm font-medium text-slate-700">{p.namaProgram}</TableCell>
                        <TableCell className="text-sm text-slate-600">{p.lokasi}</TableCell>
                        <TableCell className="text-sm text-center text-slate-600">{p.bilanganPeserta}</TableCell>
                        <TableCell className="text-sm text-slate-500">{formatDate(p.tarikhMula)}</TableCell>
                        <TableCell className="text-right text-sm text-slate-600">{Number(p.gunaOs21000 || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-right text-sm text-slate-600">{Number(p.gunaOs24000 || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-right text-sm text-slate-600">{Number(p.gunaOs29000 || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-right text-sm text-slate-600">{Number(p.gunaOs42000 || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-right text-sm font-bold text-blue-600">
                          {(Number(p.gunaOs21000 || 0) + Number(p.gunaOs24000 || 0) + Number(p.gunaOs29000 || 0) + Number(p.gunaOs42000 || 0)).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-blue-600 hover:bg-blue-50 gap-2"
                            onClick={() => generatePDF(p)}
                          >
                            <Download size={14} />
                            PDF
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        </div>

        <footer className="mt-12 py-8 border-t border-slate-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Kementerian Pendidikan</p>
              <p className="text-xs text-slate-400 font-medium">Bahagian Pembangunan Kurikulum</p>
              <p className="text-xs text-slate-400">Unit Literasi Komputer</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-300 font-medium uppercase tracking-tighter">Sistem Pelaporan Digital Waran © 2026</p>
            </div>
          </div>
        </footer>
      </main>

    </div>
  );
}

function StatCard({ title, value, icon, trend }: { title: string; value: string; icon: ReactNode; trend: string }) {
  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-slate-50 rounded-lg">
            {icon}
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
        </div>
        <p className="text-xs text-slate-400 mt-4 flex items-center gap-1">
          {trend}
        </p>
      </CardContent>
    </Card>
  );
}

