# Panduan Instalasi — Generator Soal AI Ujangil

## A. Backend (Google Apps Script)
1. Buka https://script.google.com → Proyek baru → ganti nama `Code.gs` menjadi `Kode`, tempel seluruh isi `Kode.gs`.
2. Pilih fungsi `setupAppEnvironment` → ▶ Run **satu kali** → izinkan akses Drive & Sheets.
3. Buka **Execution log**: catat username & PIN Admin (hanya tampil sekali; lupa PIN → jalankan `resetPinAdmin`).
4. Isi sheet `Users` di spreadsheet database untuk daftar guru (kolom: username, nama, sekolah, role, status = Aktif).
5. Deploy → New deployment → Web app → Execute as **Me**, Access **Anyone** → salin URL `/exec`.
   Setelah ubah kode: Manage deployments → Edit → **New version** (URL tetap).

## B. Frontend (GitHub Pages)
1. Ekstrak ZIP. Folder hasil ekstrak (berisi `index.html`) **adalah** folder yang di-`git init`.
2. Buka `js/config.js`, ganti `GAS_URL` dengan URL `/exec`.
3. Di folder itu jalankan: `git init`, `git add .`, `git commit -m "Upload pertama"`, lalu hubungkan ke repo Public dan `git push` (pandu langkah demi langkah di chat).
4. Settings → Pages → Branch `main`, folder `/ (root)`.

## C. Pemakaian
Masuk sebagai Admin/Guru → menu **API Key** (tempel kunci Gemini dari aistudio.google.com) → **Buat Soal**.

## D. Pasang di HP (PWA)
- **Android (Chrome):** buka situs → tombol **📲 Pasang** (atau menu ⋮ → *Instal aplikasi*).
- **iPhone (Safari):** ketuk **Bagikan** → **Tambah ke Layar Utama**.
- Syarat: situs diakses lewat `https://` (GitHub Pages sudah otomatis). Setelah memperbarui file, naikkan `VERSI` di `sw.js` (mis. `soal-ai-v2`) agar HP mengambil versi baru.
- Cek di Chrome PC: F12 → Application → Manifest & Service Workers.
