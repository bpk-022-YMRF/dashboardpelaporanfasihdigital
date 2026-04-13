/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, ReactNode } from "react";
import { 
  LayoutDashboard, 
  Filter, 
  Plus, 
  Search, 
  TrendingUp, 
  Wallet, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  Edit2,
  Image as ImageIcon,
  Calendar as CalendarIcon,
  MapPin,
  Users,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight
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
  Pie
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { format, isWithinInterval, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

import { ProgramData, ProgramUpdate } from "./types";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// GANTIKAN URL INI DENGAN URL DARI GOOGLE APPS SCRIPT ANDA
const GAS_URL = "https://script.google.com/macros/s/AKfycbwKhfzJASz_FgrvVlLAytCR8LrnWYDJoYRy4JakmAq469GsiU8kltcFrkB4tlnb9M7b/exec";

export default function App() {
  const [programs, setPrograms] = useState<ProgramData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterNegeri, setFilterNegeri] = useState("all");
  const [editingProgram, setEditingProgram] = useState<ProgramData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      // Tambah timestamp untuk elakkan caching
      const res = await fetch(`${GAS_URL}?t=${new Date().getTime()}`);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setPrograms(data);
      } else if (data.status === "error") {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Gagal memuatkan data dari Google Sheets. Sila pastikan Web App anda di-deploy dengan akses 'Anyone'.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string, update: ProgramUpdate) => {
    try {
      // Google Apps Script memerlukan data dihantar sebagai string dalam body untuk doPost
      await fetch(GAS_URL, {
        method: "POST",
        mode: "no-cors", // Penting untuk mengelakkan ralat CORS pada Google Apps Script
        headers: {
          "Content-Type": "text/plain", // GAS lebih stabil dengan text/plain untuk JSON string
        },
        body: JSON.stringify({ id, update }),
      });
      
      toast.success("Permintaan kemaskini dihantar. Sila tunggu beberapa saat untuk data dikemaskini.");
      
      // Tutup modal dan refresh data selepas delay pendek
      setIsModalOpen(false);
      setTimeout(fetchPrograms, 3000);
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Gagal menghantar data kemaskini");
    }
  };

  const filteredPrograms = useMemo(() => {
    return programs.filter(p => {
      const matchesSearch = p.namaProgram.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.negeri.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesNegeri = filterNegeri === "all" || p.negeri === filterNegeri;
      return matchesSearch && matchesNegeri;
    });
  }, [programs, searchQuery, filterNegeri]);

  const stats = useMemo(() => {
    const totalWaran = programs.reduce((acc, p) => acc + p.jumlahWaranTerima, 0);
    const totalGuna = programs.reduce((acc, p) => acc + (p.jumlahWaranTerima - p.bakiKeseluruhan), 0);
    const totalBaki = programs.reduce((acc, p) => acc + p.bakiKeseluruhan, 0);
    const peratusGuna = totalWaran > 0 ? (totalGuna / totalWaran) * 100 : 0;
    
    return { totalWaran, totalGuna, totalBaki, peratusGuna };
  }, [programs]);

  const chartData = useMemo(() => {
    const negeriData: Record<string, { name: string; waran: number; baki: number }> = {};
    programs.forEach(p => {
      if (!negeriData[p.negeri]) {
        negeriData[p.negeri] = { name: p.negeri, waran: 0, baki: 0 };
      }
      negeriData[p.negeri].waran += p.jumlahWaranTerima;
      negeriData[p.negeri].baki += p.bakiKeseluruhan;
    });
    return Object.values(negeriData);
  }, [programs]);

  const osData = useMemo(() => {
    return [
      { name: "OS21000", value: programs.reduce((acc, p) => acc + p.os21000, 0) },
      { name: "OS24000", value: programs.reduce((acc, p) => acc + p.os24000, 0) },
      { name: "OS29000", value: programs.reduce((acc, p) => acc + p.os29000, 0) },
      { name: "OS42000", value: programs.reduce((acc, p) => acc + p.os42000, 0) },
    ];
  }, [programs]);

  const negeriOptions = useMemo(() => {
    const unique = Array.from(new Set(programs.map(p => p.negeri)));
    return unique.sort();
  }, [programs]);

  if (loading) {
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
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 lg:p-8">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200">
              <LayoutDashboard size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Dashboard Pelaporan</h2>
              <p className="text-slate-500">Pemantauan waran dan program digital tahun 2026</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input 
                placeholder="Cari program atau negeri..." 
                className="pl-10 w-full md:w-64 bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterNegeri} onValueChange={setFilterNegeri}>
              <SelectTrigger className="w-[180px] bg-white">
                <SelectValue placeholder="Semua Negeri" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Negeri</SelectItem>
                {negeriOptions.map(n => (
                  <SelectItem key={n} value={n}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Jumlah Waran Terima" 
            value={`RM ${stats.totalWaran.toLocaleString()}`} 
            icon={<Wallet className="text-blue-600" />}
            trend="+12% dari bulan lepas"
            trendUp={true}
          />
          <StatCard 
            title="Jumlah Waran Guna" 
            value={`RM ${stats.totalGuna.toLocaleString()}`} 
            icon={<TrendingUp className="text-amber-600" />}
            trend={`${stats.peratusGuna.toFixed(1)}% penggunaan`}
          />
          <StatCard 
            title="Baki Waran" 
            value={`RM ${stats.totalBaki.toLocaleString()}`} 
            icon={<AlertCircle className="text-emerald-600" />}
            trend="Dalam bajet"
            trendUp={true}
          />
          <StatCard 
            title="Program Aktif" 
            value={programs.length.toString()} 
            icon={<CheckCircle2 className="text-indigo-600" />}
            trend="17 program berdaftar"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Agihan Waran & Baki mengikut Negeri</CardTitle>
              <CardDescription>Perbandingan peruntukan dan baki semasa</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="waran" name="Waran Terima" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="baki" name="Baki Waran" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Agihan mengikut OS</CardTitle>
              <CardDescription>Pecahan peruntukan keseluruhan</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={osData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {osData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-4 mt-4 w-full">
                {osData.map((os, i) => (
                  <div key={os.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-xs font-medium text-slate-600">{os.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Program Table */}
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Senarai Program & Pelaporan</CardTitle>
              <CardDescription>Klik butang kemaskini untuk memasukkan data bengkel</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <ExternalLink size={14} />
              Eksport CSV
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader className="bg-slate-50 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="w-[250px]">Nama Program</TableHead>
                    <TableHead>Negeri</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Waran Terima</TableHead>
                    <TableHead className="text-right">Baki</TableHead>
                    <TableHead className="text-right">% Baki</TableHead>
                    <TableHead className="text-center">Tindakan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {filteredPrograms.map((p) => (
                      <motion.tr 
                        key={p.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="group hover:bg-slate-50/50 transition-colors"
                      >
                        <TableCell className="font-medium">
                          <div className="flex flex-col gap-1">
                            <span className="line-clamp-1">{p.namaProgram}</span>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase font-bold">
                              <CalendarIcon size={10} />
                              {p.tarikhMula ? `${p.tarikhMula} - ${p.tarikhTamat}` : "Belum Mula"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-none">
                            {p.negeri}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {p.tarikhMula ? (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100">Selesai</Badge>
                          ) : (
                            <Badge variant="outline" className="text-slate-400 border-slate-200">Belum Mula</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          RM {p.jumlahWaranTerima.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-emerald-600 font-semibold">
                          RM {p.bakiKeseluruhan.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={cn(
                                  "h-full rounded-full",
                                  p.peratusBaki > 50 ? "bg-emerald-500" : p.peratusBaki > 20 ? "bg-amber-500" : "bg-red-500"
                                )}
                                style={{ width: `${p.peratusBaki}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium">{p.peratusBaki.toFixed(1)}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                            onClick={() => {
                              setEditingProgram(p);
                              setIsModalOpen(true);
                            }}
                          >
                            <Edit2 size={16} />
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
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

      {/* Update Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kemaskini Pelaporan Program</DialogTitle>
            <DialogDescription>
              Sila masukkan maklumat pelaksanaan bengkel dan penggunaan waran.
            </DialogDescription>
          </DialogHeader>
          
          {editingProgram && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Maklumat Bengkel</h4>
                <div className="space-y-2">
                  <Label>Tarikh Mula</Label>
                  <Input 
                    type="date" 
                    defaultValue={editingProgram.tarikhMula} 
                    id="tarikhMula"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tarikh Tamat</Label>
                  <Input 
                    type="date" 
                    defaultValue={editingProgram.tarikhTamat} 
                    id="tarikhTamat"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Lokasi Bengkel</Label>
                  <Input 
                    placeholder="Contoh: Hotel Grand Continental" 
                    defaultValue={editingProgram.lokasi}
                    id="lokasi"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bilangan Peserta</Label>
                  <Input 
                    type="number" 
                    defaultValue={editingProgram.bilanganPeserta}
                    id="bilanganPeserta"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pautan Gambar</Label>
                  <Input 
                    placeholder="URL Google Drive/Photos" 
                    defaultValue={editingProgram.pautanGambar}
                    id="pautanGambar"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Penggunaan Waran (Guna)</h4>
                <div className="space-y-2">
                  <Label>Jumlah Waran Guna OS21000</Label>
                  <Input 
                    type="number" 
                    defaultValue={editingProgram.gunaOs21000}
                    id="gunaOs21000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Jumlah Waran Guna OS24000</Label>
                  <Input 
                    type="number" 
                    defaultValue={editingProgram.gunaOs24000}
                    id="gunaOs24000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Jumlah Waran Guna OS29000</Label>
                  <Input 
                    type="number" 
                    defaultValue={editingProgram.gunaOs29000}
                    id="gunaOs29000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Jumlah Waran Guna OS42000</Label>
                  <Input 
                    type="number" 
                    defaultValue={editingProgram.gunaOs42000}
                    id="gunaOs42000"
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-4">
                <div className="space-y-2">
                  <Label>Impak / Output / Hasil Program</Label>
                  <textarea 
                    className="w-full min-h-[80px] p-3 rounded-md border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Nyatakan impak program..."
                    defaultValue={editingProgram.impak}
                    id="impak"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cadangan Penambahbaikan</Label>
                  <textarea 
                    className="w-full min-h-[80px] p-3 rounded-md border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Nyatakan cadangan..."
                    defaultValue={editingProgram.cadangan}
                    id="cadangan"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button onClick={() => {
              if (!editingProgram) return;
              const update: ProgramUpdate = {
                tarikhMula: (document.getElementById("tarikhMula") as HTMLInputElement).value,
                tarikhTamat: (document.getElementById("tarikhTamat") as HTMLInputElement).value,
                lokasi: (document.getElementById("lokasi") as HTMLInputElement).value,
                bilanganPeserta: parseInt((document.getElementById("bilanganPeserta") as HTMLInputElement).value) || 0,
                pautanGambar: (document.getElementById("pautanGambar") as HTMLInputElement).value,
                gunaOs21000: parseFloat((document.getElementById("gunaOs21000") as HTMLInputElement).value) || 0,
                gunaOs24000: parseFloat((document.getElementById("gunaOs24000") as HTMLInputElement).value) || 0,
                gunaOs29000: parseFloat((document.getElementById("gunaOs29000") as HTMLInputElement).value) || 0,
                gunaOs42000: parseFloat((document.getElementById("gunaOs42000") as HTMLInputElement).value) || 0,
                impak: (document.getElementById("impak") as HTMLTextAreaElement).value,
                cadangan: (document.getElementById("cadangan") as HTMLTextAreaElement).value,
              };
              handleUpdate(editingProgram.id, update);
            }}>Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ title, value, icon, trend, trendUp }: { title: string; value: string; icon: ReactNode; trend: string; trendUp?: boolean }) {
  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-slate-50 rounded-lg">
            {icon}
          </div>
          {trendUp !== undefined && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
              trendUp ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
            )}>
              {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              12%
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
        </div>
        <p className="text-xs text-slate-400 mt-4 flex items-center gap-1">
          <TrendingUp size={12} />
          {trend}
        </p>
      </CardContent>
    </Card>
  );
}

