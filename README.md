# 🔔 Smart School Bell - Aplikasi Bel Sekolah Digital Berbasis Web

Aplikasi Bel Sekolah Otomatis modern dan responsif berbasis web dengan sistem suara **Web Audio API** dan **Text-to-Speech (TTS) Bahasa Indonesia**. Berjalan langsung di peramban web (*browser*) tanpa perlu server atau instalasi rumit.

![Preview Bel Sekolah](https://img.shields.io/badge/Status-Active-emerald)
![License](https://img.shields.io/badge/License-MIT-blue)
![Platform](https://img.shields.io/badge/Platform-Web%20Browser-orange)

---

## ✨ Fitur Utama

- ⏰ **Jam & Tanggal Digital Real-Time**: Tampilan jam presisi tinggi (Jam:Menit:Detik) dan kalender bahasa Indonesia.
- ⏳ **Hitung Mundur Bel Berikutnya**: Menampilkan nama kegiatan dan hitung mundur sisa waktu secara otomatis.
- 🎵 **Sistem Audio Web Audio API**: Menghasilkan berbagai variasi nada bel murni (*Westminster Chimes*, *3-Tone Melody*, *Ding Dong*, *Lonceng Listrik Kring*, *Sirine Darurat*) tanpa dependensi file eksternal.
- 🗣️ **Text-to-Speech (TTS) Pengumuman**: Membacakan teks kegiatan otomatis setelah nada bel berbunyi.
- 📅 **Manajemen Jadwal Lengkap**:
  - Pengaturan per hari (Senin s/d Minggu).
  - Preset Jadwal Bawaan (*Jadwal Normal*, *Jadwal Ujian/PTS/PAS*, *Jadwal Ramadhan*).
  - Fitur Salin Jadwal ke hari lain.
  - Tambah, Edit, Hapus, dan Sakelar Aktif/Nonaktif per item jadwal.
- 🔘 **Tombol Bunyi Manual (Quick Ring)**: Masuk Kelas, Istirahat, Pulang, Darurat/Sirine, dan ucapan suara kustom instan.
- 💾 **Backup & Restore Data**: Ekspor jadwal ke format file JSON dan pulihkan kapan saja.
- 🖥️ **Mode Layar Penuh (Fullscreen)**: Tampilan display untuk monitor di ruang guru, piket, atau lobi sekolah.
- 📢 **Teks Berjalan (Marquee)**: Menampilkan pengumuman/informasi sekolah yang dapat diedit langsung.
- 📋 **Log Riwayat Bel**: Mencatat riwayat bel yang telah berbunyi setiap hari.

---

## 🚀 Cara Menjalankan

1. Clone repositori ini atau unduh sebagai file ZIP:
   ```bash
   git clone https://github.com/USERNAME/REPO_NAME.git
   ```
2. Buka folder proyek dan jalankan file `index.html` langsung di browser favorit Anda (*Google Chrome, Microsoft Edge, Firefox, Safari*).
3. Klik tombol **"Aktifkan Suara Bel"** pada banner atas untuk mengizinkan pemutaran audio browser.

---

## 📁 Struktur Berkas

```
Bel/
├── index.html        # Antarmuka web utama
├── css/
│   └── style.css     # Styling tampilan, animasi lonceng, dan layout responsif
├── js/
│   ├── audio.js      # Generator nada Web Audio API & Text-to-Speech
│   ├── storage.js    # Pengelolaan LocalStorage, preset jadwal & backup JSON
│   ├── scheduler.js  # Mesin waktu presisi & kalkulasi hitung mundur
│   └── app.js        # Controller aplikasi dan event handler UI
└── README.md         # Dokumentasi proyek
```

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah lisensi MIT. Bebas digunakan dan dimodifikasi untuk kebutuhan sekolah atau instansi pendidikan.
