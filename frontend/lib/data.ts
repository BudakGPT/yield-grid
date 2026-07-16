export type BatchStatus = "Ready" | "In transit" | "Rescue" | "Verified";

export type HarvestBatch = {
  id: string;
  crop: string;
  farmer: string;
  cooperative: string;
  location: string;
  harvestDate: string;
  weight: number;
  grade: "A" | "B" | "C";
  status: BatchStatus;
  price: number;
  proof: string;
};

export const harvestBatches: HarvestBatch[] = [
  { id: "YG-240731", crop: "Tomat", farmer: "Siti Aminah", cooperative: "Tani Jaya", location: "Pangalengan", harvestDate: "16 Jul 2026", weight: 860, grade: "A", status: "Ready", price: 9800, proof: "0x84c1...9ae2" },
  { id: "YG-240730", crop: "Mangga", farmer: "Agus Suhendar", cooperative: "Mekar Sari", location: "Indramayu", harvestDate: "16 Jul 2026", weight: 1240, grade: "A", status: "In transit", price: 17200, proof: "0xf219...3bd0" },
  { id: "YG-240729", crop: "Cabai", farmer: "Nur Aisyah", cooperative: "Lestari", location: "Garut", harvestDate: "15 Jul 2026", weight: 395, grade: "B", status: "Rescue", price: 21600, proof: "0x2ad7...441c" },
  { id: "YG-240728", crop: "Kentang", farmer: "Rudi Hartono", cooperative: "Tani Jaya", location: "Pangalengan", harvestDate: "15 Jul 2026", weight: 970, grade: "A", status: "Verified", price: 12100, proof: "0xb543...e8d2" },
  { id: "YG-240727", crop: "Pisang", farmer: "Wayan Putra", cooperative: "Subak Makmur", location: "Tabanan", harvestDate: "14 Jul 2026", weight: 1480, grade: "B", status: "Ready", price: 8300, proof: "0x772a...0dc1" },
  { id: "YG-240726", crop: "Bawang merah", farmer: "Dedi Kurnia", cooperative: "Sumber Pangan", location: "Brebes", harvestDate: "14 Jul 2026", weight: 735, grade: "A", status: "In transit", price: 28400, proof: "0xac91...72fa" },
  { id: "YG-240725", crop: "Jeruk", farmer: "Made Suryana", cooperative: "Bali Buah", location: "Kintamani", harvestDate: "13 Jul 2026", weight: 620, grade: "B", status: "Verified", price: 14500, proof: "0x771e...1a93" },
  { id: "YG-240724", crop: "Kubis", farmer: "Hendra Gunawan", cooperative: "Lestari", location: "Garut", harvestDate: "13 Jul 2026", weight: 1120, grade: "C", status: "Rescue", price: 5100, proof: "0x3ef0...22bc" },
];

export const locations = [
  { id: "pangalengan", name: "Pangalengan Hub", area: "Bandung, Jawa Barat", lat: -7.1786, lng: 107.5728, batches: 12, capacity: 82, eta: "18 menit", temperature: "18°C" },
  { id: "garut", name: "Garut Collection Point", area: "Garut, Jawa Barat", lat: -7.2279, lng: 107.9087, batches: 7, capacity: 64, eta: "41 menit", temperature: "21°C" },
  { id: "bandung", name: "Bandung Distribution", area: "Bandung, Jawa Barat", lat: -6.9175, lng: 107.6191, batches: 21, capacity: 76, eta: "Tiba 10:42", temperature: "24°C" },
  { id: "jakarta", name: "Jakarta Fresh Market", area: "Jakarta Selatan", lat: -6.2615, lng: 106.8106, batches: 16, capacity: 58, eta: "2 jam 16 mnt", temperature: "6°C cold" },
];

export const rescueLots = [
  { id: "RS-092", crop: "Cabai merah", image: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&q=86&w=1000", seller: "Koperasi Lestari", location: "Garut", weight: "395 kg", discount: "34%", price: "Rp14.200/kg", time: "8 jam tersisa", reason: "Kelebihan panen", demand: 76 },
  { id: "RS-091", crop: "Tomat beef", image: "https://images.unsplash.com/photo-1561136594-7f68413baa99?auto=format&fit=crop&q=86&w=1000", seller: "Tani Jaya", location: "Pangalengan", weight: "240 kg", discount: "27%", price: "Rp7.100/kg", time: "13 jam tersisa", reason: "Grade visual B", demand: 62 },
  { id: "RS-089", crop: "Kubis putih", image: "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&q=86&w=1000", seller: "Mekar Tani", location: "Lembang", weight: "510 kg", discount: "41%", price: "Rp4.600/kg", time: "21 jam tersisa", reason: "Surplus lokal", demand: 48 },
];

export const proofEvents = [
  { time: "10:42:18", event: "Cold-chain checkpoint", batch: "YG-240730", actor: "Armada GD-14", hash: "0x84c1...9ae2", status: "Confirmed" },
  { time: "10:31:06", event: "Weight proof anchored", batch: "YG-240731", actor: "Pangalengan Hub", hash: "0xf219...3bd0", status: "Confirmed" },
  { time: "10:08:44", event: "Quality grade updated", batch: "YG-240729", actor: "Koperasi Lestari", hash: "0x2ad7...441c", status: "Confirmed" },
  { time: "09:54:27", event: "Buyer reservation", batch: "YG-240727", actor: "Pasar Segar ID", hash: "0xb543...e8d2", status: "Pending" },
  { time: "09:22:11", event: "Harvest identity minted", batch: "YG-240728", actor: "Rudi Hartono", hash: "0x772a...0dc1", status: "Confirmed" },
];
