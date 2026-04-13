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
import { motion, AnimatePresence } from "motion/react";
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
const GAS_URL = "https://script.google.com/macros/s/AKfycbzqL80ylcn8aYpyMAx3aIiFb0c4N51jBVrMBxnT07djSylFE3db4p0Ht0Khm3d7hYYw/exec";

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
    
    // Header
    doc.setFontSize(18);
    doc.text("LAPORAN PELAKSANAAN PROGRAM", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text("Sistem Pelaporan Digital Waran 2026", 105, 28, { align: "center" });
    
    doc.line(20, 35, 190, 35);
    
    // Content
    const data = [
      ["Negeri", program.negeri],
      ["Nama Program", program.namaProgram],
      ["Tarikh", `${program.tarikhMula} hingga ${program.tarikhTamat}`],
      ["Lokasi", program.lokasi],
      ["Bilangan Peserta", program.bilanganPeserta.toString()],
      ["Impak/Output", program.impak],
      ["Cadangan", program.cadangan],
      ["Pautan Gambar", program.pautanGambar],
    ];
    
    autoTable(doc, {
      startY: 45,
      head: [["Perkara", "Butiran"]],
      body: data,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] }
    });
    
    // Financial Table
    const financialData = [
      ["OS21000", program.gunaOs21000.toLocaleString()],
      ["OS24000", program.gunaOs24000.toLocaleString()],
      ["OS29000", program.gunaOs29000.toLocaleString()],
      ["OS42000", program.gunaOs42000.toLocaleString()],
      ["JUMLAH KESELURUHAN", (Number(program.gunaOs21000) + Number(program.gunaOs24000) + Number(program.gunaOs29000) + Number(program.gunaOs42000)).toLocaleString()],
    ];
    
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [["Objek Sebagai (OS)", "Jumlah Perbelanjaan (RM)"]],
      body: financialData,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] }
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
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-md"
            >
              <Plus size={18} />
              Tambah Laporan
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => {
                setLoading(true);
                fetchPrograms();
              }}
              className="bg-white"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </Button>
          </div>
        </header>

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
                    <TableHead>Negeri</TableHead>
                    <TableHead>Nama Program</TableHead>
                    <TableHead>Lokasi</TableHead>
                    <TableHead>Peserta</TableHead>
                    <TableHead>Tarikh</TableHead>
                    <TableHead className="text-right">OS21000 (RM)</TableHead>
                    <TableHead className="text-right">OS24000 (RM)</TableHead>
                    <TableHead className="text-right">OS29000 (RM)</TableHead>
                    <TableHead className="text-right">OS42000 (RM)</TableHead>
                    <TableHead className="text-right">Jumlah (RM)</TableHead>
                    <TableHead className="text-center">Tindakan</TableHead>
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
                          <Badge variant="secondary" className="font-medium">{p.negeri}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{p.namaProgram}</TableCell>
                        <TableCell className="text-xs">{p.lokasi}</TableCell>
                        <TableCell className="text-center">{p.bilanganPeserta}</TableCell>
                        <TableCell className="text-xs text-slate-500">{formatDate(p.tarikhMula)}</TableCell>
                        <TableCell className="text-right text-xs font-mono">{Number(p.gunaOs21000 || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-right text-xs font-mono">{Number(p.gunaOs24000 || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-right text-xs font-mono">{Number(p.gunaOs29000 || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-right text-xs font-mono">{Number(p.gunaOs42000 || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-right font-mono font-bold text-blue-600">
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

      {/* Form Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[900px] lg:max-w-[1100px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Borang Pelaporan Program & Waran</DialogTitle>
            <DialogDescription>
              Sila isi maklumat pelaksanaan program dan perbelanjaan waran dengan tepat.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wider">Maklumat Asas</h4>
              <div className="space-y-2">
                <Label>Negeri</Label>
                <Select 
                  value={formData.negeri} 
                  onValueChange={(v) => setFormData({...formData, negeri: v})}
                >
                  <SelectTrigger>
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
                <Label>Nama Program</Label>
                <Input 
                  placeholder="Masukkan nama program" 
                  value={formData.namaProgram}
                  onChange={(e) => setFormData({...formData, namaProgram: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tarikh Mula</Label>
                  <Input 
                    type="date" 
                    value={formData.tarikhMula}
                    onChange={(e) => setFormData({...formData, tarikhMula: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tarikh Tamat</Label>
                  <Input 
                    type="date" 
                    value={formData.tarikhTamat}
                    onChange={(e) => setFormData({...formData, tarikhTamat: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Lokasi Bengkel</Label>
                <Input 
                  placeholder="Contoh: Hotel Grand Continental" 
                  value={formData.lokasi}
                  onChange={(e) => setFormData({...formData, lokasi: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Bilangan Peserta</Label>
                <Input 
                  type="number" 
                  value={formData.bilanganPeserta}
                  onChange={(e) => setFormData({...formData, bilanganPeserta: parseInt(e.target.value.toString()) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label>Pautan Gambar (Drive/URL)</Label>
                <Input 
                  placeholder="https://..." 
                  value={formData.pautanGambar}
                  onChange={(e) => setFormData({...formData, pautanGambar: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-emerald-600 uppercase tracking-wider">Perbelanjaan Waran (Guna)</h4>
              <div className="space-y-2">
                <Label>Jumlah Waran Guna OS21000</Label>
                <Input 
                  type="number" 
                  value={formData.gunaOs21000}
                  onChange={(e) => setFormData({...formData, gunaOs21000: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label>Jumlah Waran Guna OS24000</Label>
                <Input 
                  type="number" 
                  value={formData.gunaOs24000}
                  onChange={(e) => setFormData({...formData, gunaOs24000: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label>Jumlah Waran Guna OS29000</Label>
                <Input 
                  type="number" 
                  value={formData.gunaOs29000}
                  onChange={(e) => setFormData({...formData, gunaOs29000: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label>Jumlah Waran Guna OS42000</Label>
                <Input 
                  type="number" 
                  value={formData.gunaOs42000}
                  onChange={(e) => setFormData({...formData, gunaOs42000: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase">Jumlah Keseluruhan Guna</p>
                <p className="text-2xl font-bold text-blue-600">
                  RM {(Number(formData.gunaOs21000) + Number(formData.gunaOs24000) + Number(formData.gunaOs29000) + Number(formData.gunaOs42000)).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="md:col-span-2 space-y-4">
              <div className="space-y-2">
                <Label>Impak / Output / Hasil Program</Label>
                <textarea 
                  className="w-full min-h-[100px] p-3 rounded-md border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Nyatakan impak program..."
                  value={formData.impak}
                  onChange={(e) => setFormData({...formData, impak: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Cadangan Penambahbaikan</Label>
                <textarea 
                  className="w-full min-h-[100px] p-3 rounded-md border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Nyatakan cadangan..."
                  value={formData.cadangan}
                  onChange={(e) => setFormData({...formData, cadangan: e.target.value})}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button 
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              {loading ? "Menghantar..." : "Simpan Laporan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

