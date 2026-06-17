import type { Story } from "../features/story-player/types";

export const stories: Story[] = [
  {
    id: "kilas-balik-cover",
    type: "cover",
    eyebrow: "Kilas Balik",
    title: "Perjalanan tokomu di 2026",
    subtitle: "Lihat ringkasan performa dan aktivitas tokomu sepanjang tahun.",
    duration: 5000,
    background:
      "radial-gradient(circle at 16% 10%, rgb(244 161 26 / 0.3) 0, transparent 30%), linear-gradient(160deg, #0f2a7b, #081a50)",
    accent: "#f4a11a",
  },
  {
    id: "pesanan-mingguan",
    type: "stat",
    label: "Rata-rata pesananmu",
    value: "2x",
    note: "setiap minggu, lebih tinggi dari mayoritas toko lain di Bandung.",
    duration: 5000,
    background:
      "radial-gradient(circle at 86% 12%, rgb(255 255 255 / 0.2) 0, transparent 26%), linear-gradient(145deg, #0f2f96, #06184d)",
    accent: "#f4a11a",
  },
  {
    id: "top-10-aktif",
    type: "hero",
    title: "Kamu pesan 2 kali tiap minggu.",
    description:
      "Kamu masuk Top 10 toko paling aktif. Keren!",
    duration: 6200,
    shareable: true,
    background:
      "linear-gradient(180deg, rgb(8 31 104 / 0.98) 0 48%, rgb(8 31 104 / 0.82) 66%, rgb(8 31 104 / 0.3) 100%), url('https://placehold.co/600x400/png?text=Aktivitas+Toko') center bottom / cover no-repeat, #081f68",
    accent: "#f4a11a",
  },
  {
    id: "ranking-area",
    type: "ranking",
    title: "Top area pesananmu",
    items: ["Bandung Barat", "Cicendo", "Cibeunying", "Lengkong", "Antapani"],
    duration: 6500,
    shareable: true,
    background:
      "radial-gradient(circle at 85% 10%, rgb(244 161 26 / 0.36) 0, transparent 28%), linear-gradient(145deg, #132f87, #091a4f)",
    accent: "#f4a11a",
  },
  {
    id: "kilas-balik-final",
    type: "cover",
    eyebrow: "Sampai jumpa",
    title: "Terima kasih sudah bertumbuh bersama kami",
    subtitle: "Pantau insight berikutnya untuk dorong performa tokomu lebih jauh.",
    duration: 6000,
    background:
      "linear-gradient(170deg, #0e2c83, #071744)",
    accent: "#f4a11a",
  },
];