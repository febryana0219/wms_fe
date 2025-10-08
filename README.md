# WMS Frontend (wms_fe)

Frontend untuk **Warehouse Management System (WMS)** menggunakan **React 18**, **Vite**, dan berbagai library UI modern seperti Radix UI, Tailwind, dan Lucide Icons.

---

## 📦 Teknologi & Dependency Utama

- **Framework & Bundler**: React 18 + Vite
- **UI Components**: Radix UI (`@radix-ui/react-*`), Lucide Icons
- **Form & Validation**: `react-hook-form`, `input-otp`
- **Charts & Visuals**: `recharts`, `embla-carousel-react`
- **Theming & State**: `next-themes`, `clsx`, `class-variance-authority`, `tailwind-merge`
- **Routing**: `react-router-dom`
- **Dev Tools**: TypeScript, Vite, SWC plugin

---

## 🚀 Setup Project

1. Clone repository:

```bash
git clone <repository-url>
cd wms_fe

    Install dependencies:

npm install
# or
yarn install

⚡ Menjalankan Project
Development Mode

npm run dev
# or
yarn dev

Buka browser: http://localhost:5173 (default Vite port)
Build Production

npm run build
# or
yarn build

Output akan ada di folder dist/.
🛠 Struktur Folder (Saran)

src/
├─ components/       # Reusable UI components
├─ pages/            # Halaman aplikasi
├─ routes/           # Routing React Router
├─ hooks/            # Custom React hooks
├─ contexts/         # Context API providers
├─ assets/           # Static assets (images, icons, fonts)
├─ styles/           # Tailwind + custom CSS
└─ main.tsx          # Entry point

📌 Catatan

    Project ini menggunakan React 18 + Vite untuk performa dan build cepat.

    Semua UI utama menggunakan Radix UI untuk accessibility dan modular components.

    Gunakan TailwindCSS dan tailwind-merge untuk styling utility-first dengan class variant management.

    Untuk form, gunakan react-hook-form untuk validasi dan state management ringan.

🔗 References / Useful Links

    Radix UI Documentation

React Hook Form

Recharts

Vite

Lucide React Icons
👨‍💻 Author

    Febry

    Email / GitHub: <your-email-or-github>


---

Kalau mau, aku bisa buatkan versi **README.md lebih lengkap** dengan instruksi **Tailwind setup, environment variables, dan dev tips** supaya tim bisa langsung jalanin project tanpa setup tambahan.  

Apakah mau aku buatkan versi itu?

You said:
link download MD
ChatGPT said:

Aku bisa buatkan filenya di local kamu supaya bisa langsung di-download. Misalnya di Linux/Ubuntu, kamu bisa simpan file README.md dengan perintah berikut:

    Buka terminal di root folder project wms_fe.

    Jalankan:

cat << 'EOF' > README.md
# WMS Frontend (wms_fe)

Frontend untuk **Warehouse Management System (WMS)** menggunakan **React 18**, **Vite**, dan berbagai library UI modern seperti Radix UI, Tailwind, dan Lucide Icons.

---

## 📦 Teknologi & Dependency Utama

- **Framework & Bundler**: React 18 + Vite
- **UI Components**: Radix UI (`@radix-ui/react-*`), Lucide Icons
- **Form & Validation**: `react-hook-form`, `input-otp`
- **Charts & Visuals**: `recharts`, `embla-carousel-react`
- **Theming & State**: `next-themes`, `clsx`, `class-variance-authority`, `tailwind-merge`
- **Routing**: `react-router-dom`
- **Dev Tools**: TypeScript, Vite, SWC plugin

---

## 🚀 Setup Project

1. Clone repository:

```bash
git clone <repository-url>
cd wms_fe

    Install dependencies:

npm install
# or
yarn install

⚡ Menjalankan Project
Development Mode

npm run dev
# or
yarn dev

Buka browser: http://localhost:5173 (default Vite port)
Build Production

npm run build
# or
yarn build

Output akan ada di folder dist/.
🛠 Struktur Folder (Saran)

src/
├─ components/       # Reusable UI components
├─ pages/            # Halaman aplikasi
├─ routes/           # Routing React Router
├─ hooks/            # Custom React hooks
├─ contexts/         # Context API providers
├─ assets/           # Static assets (images, icons, fonts)
├─ styles/           # Tailwind + custom CSS
└─ main.tsx          # Entry point

📌 Catatan

    Project ini menggunakan React 18 + Vite untuk performa dan build cepat.

    Semua UI utama menggunakan Radix UI untuk accessibility dan modular components.

    Gunakan TailwindCSS dan tailwind-merge untuk styling utility-first dengan class variant management.

    Untuk form, gunakan react-hook-form untuk validasi dan state management ringan.

🔗 References / Useful Links

    Radix UI Documentation

React Hook Form

Recharts

Vite

Lucide React Icons
👨‍💻 Author

    Febry

    Email / GitHub: <your-email-or-github>
    EOF
