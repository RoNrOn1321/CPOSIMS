# CPOSIMS — Canteen Point-of-Sale & Inventory Management System

<p align="center">
  <strong>Saint Theresa College of Tandag, Inc. (STCT)</strong><br>
  <em>An RFID-Powered Smart Canteen Cashless Payment, Inventory, and Parent Guardian Oversight Ecosystem</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Laravel-11%20%2F%2012-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel">
  <img src="https://img.shields.io/badge/Inertia.js-v2.0-9553E9?style=for-the-badge&logo=inertia&logoColor=white" alt="Inertia.js">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/MySQL-InnoDB-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL">
  <img src="https://img.shields.io/badge/Hardware-58mm_ESC%2FPOS-10B981?style=for-the-badge&logo=print&logoColor=white" alt="ESC/POS">
</p>

---

## 📌 About The Project

**CPOSIMS** is an integrated canteen point-of-sale, automated inventory tracking, and cashless student payment system engineered specifically for educational institutions. Designed for **Saint Theresa College of Tandag, Inc.**, it replaces vulnerable physical cash transactions with secure student RFID card taps while providing parents with transparent real-time visibility into their children's cafeteria nutrition and spending habits.

The application bridges web technologies with physical point-of-sale hardware—including plug-and-play **USB RFID card readers**, **58mm thermal receipt printers (Xprinter XP-58IIH / POS-58)**, and **RJ11 electronic cash drawers**.

---

## 🚀 Key Modules & Capabilities

### 1. 🛒 Canteen Cashier Register (POS Terminal)
* **High-Speed Checkout**: Categorized touchscreen food and school supplies product grid with instant barcode/name filtering.
* **Dual Payment Processing**:
  * **Cash**: Automatically calculates change due and triggers the cash drawer solenoid.
  * **RFID Cashless**: Rapid zero-contact payment via student card tap with real-time balance validation and spending limit enforcement.
* **Hardware USB RFID Scanner Support**: Native keyboard-emulator capture (`KeyDown` buffer) allowing instant student balance lookup without requiring manual keyboard entry.
* **Over-the-Counter RFID Balance Reloads**: Cashiers can top up student cards on-site with physical cash (`CASH-YYYYMMDD-XXXX` receipts).
* **Automated Thermal Printing**: Generates 32-column ESC/POS raw byte streams dispatched directly to Windows print queues via `winspool.drv` with browser fallback printing.
* **Atomic Transaction Voiding**: Restores product stock, logs an `action: void` in inventory records, and automatically refunds cashless deductions back to the student's RFID wallet.

### 2. 🛡️ Money Security & Fraud Prevention
* **ACID Database Transactions (`DB::transaction`)**: Every monetary transfer, balance mutation, and checkout operation is atomic. Any disruption results in an immediate rollback.
* **Pessimistic Row Locking (`lockForUpdate()`)**: High-concurrency race conditions (e.g. duplicate register taps or simultaneous online reload while purchasing) are completely blocked at the database row level.
* **Server-Side Price Authority**: The server re-evaluates item prices from the database; cart prices submitted by the browser are zero-trusted.
* **Double-Entry Balance Snapshots**: Every reload and purchase captures `previous_balance`, `amount`, and `new_balance` in immutable audit tables.
* **Instant Lost Card Freeze (`lost_card`)**: Compromised or misplaced student tags can be locked instantly by parents or admins. Locked cards are rejected across all checkout and reload endpoints.
* **Full Audit Trail (`OwenIt\Auditing`)**: Every change to user permissions, card links, balance adjustments, or spending caps is preserved in the system audits ledger.

### 3. 👨‍👩‍👦 Parent Guardian Portal
* **Linked Student Accounts**: Parents can view and manage all of their enrolled children from a single dashboard.
* **Nutritional & Meal Breakdown**: Itemized meal transactions classified by time period (*Morning Recess*, *Lunch Meal*, *Afternoon Snack*).
* **Multi-Channel Online Top-Up**: Simulated instant digital balance reloads via **GCash**, **Maya**, and **Bank Transfer** (₱50.00 – ₱10,000.00).
* **Budgetary Spending Limits**: Parents can adjust daily spending allowances (e.g., ₱200/day). The POS terminal automatically calculates today's remaining budget.
* **One-Click Card Freeze**: Instant toggle between `active` and `lost_card` status to safeguard remaining balances.
* **Digital E-Receipts**: Itemized digital slips showing date, time, cashier name, terminal ID, item sub-totals, and remaining balance.

### 4. 📦 Inventory & Supply Chain Management
* **Dual Product Categories**: Manages both fresh cafeteria food items and school bookstore supplies.
* **Reorder Level Alerts**: Automatic indicators for products approaching or dipping below minimum safety stock levels.
* **Movement Auditing**: Comprehensive `InventoryLog` tracking all inventory deltas categorized by `sale`, `restock`, `void`, and `adjustment`.
* **Product Catalog Controls**: Create, edit, soft-delete, and update products with image upload support and barcode assignments.

### 5. 📊 Administrative Analytics & Financial Reports
* **Executive Metrics**: Tracks gross revenue, cash vs. cashless distribution, completed vs. voided receipts, total top-ups, and inventory valuation.
* **Export to Excel (.xlsx)**: Generates styled spreadsheets with Saint Theresa College brand maroon headers, zebra striping, currency formats, and auto-sized columns using `PhpSpreadsheet`.
* **Streaming CSV Downloads**: High-speed memory-efficient data streaming for large date ranges.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend Framework** | [Laravel 11 / 13](https://laravel.com) (PHP 8.3+) |
| **Frontend Architecture** | [Inertia.js v2](https://inertiajs.com) + [React 18](https://react.dev) + [TypeScript](https://www.typescriptlang.org) |
| **Styling & Components** | [Tailwind CSS v4](https://tailwindcss.com), [Shadcn UI](https://ui.shadcn.com), [Lucide React](https://lucide.dev) |
| **Routing & Types** | [Laravel Wayfinder](https://github.com/laravel/wayfinder) (TypeScript route generator) |
| **Database** | MySQL / MariaDB (InnoDB engine with Foreign Key Constraints & Row Locks) |
| **Role-Based Access** | [Spatie Laravel Permission](https://spatie.be/docs/laravel-permission) |
| **Audit Logging** | [owen-it/laravel-auditing](https://github.com/owen-it/laravel-auditing) |
| **Spreadsheet Generation** | [PhpSpreadsheet](https://phpspreadsheet.readthedocs.io) |
| **Testing Suite** | [Pest PHP](https://pestphp.com) + [Pest Plugin Laravel](https://pestphp.com) |
| **Hardware Integration** | USB HID RFID Readers, 58mm ESC/POS RAW Windows Spooler (`winspool.drv`), RJ11 Solenoid Kick |

---

## ⚙️ Installation & Setup

### Prerequisites
* **PHP** `>= 8.3` (with extensions: `pdo_mysql`, `mbstring`, `openssl`, `curl`, `gd`, `zip`)
* **Composer** `>= 2.x`
* **Node.js** `>= 18.x` & **npm**
* **MySQL** / **MariaDB** (via XAMPP, Laragon, or standalone service)
* **Windows OS** *(recommended for direct raw thermal spooler communication with XP-58 / POS-58)*

### 1. Clone & Environment Configuration
```bash
cd c:\xampp\htdocs
git clone <repository-url> CPOSIMS
cd CPOSIMS

# Create environment configuration
cp .env.example .env
```

Ensure your database connection is configured properly in `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cposims
DB_USERNAME=root
DB_PASSWORD=
```

### 2. Install Dependencies
```bash
# Install PHP dependencies
composer install

# Install JavaScript/Node dependencies
npm install
```

### 3. Initialize Application Key & Database
```bash
# Generate unique app key
php artisan key:generate

# Run migrations and seed default roles, users, categories, products, and RFID data
php artisan migrate --seed
```

### 4. Build Frontend Assets
```bash
# Build production bundle
npm run build

# OR run in live development watch mode
npm run dev
```

### 5. Launch the Local Development Server
```bash
# In separate terminal or using composer dev runner
php artisan serve
```
Access the application at `http://127.0.0.1:8000` (or `http://localhost/CPOSIMS` if running under Apache virtual host).

---

## 👥 Default Demo Accounts

The database seeder creates default accounts for all primary system roles with the default password: **`password`**

| Role | Username | Email | Access Scope |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin` | `admin@stct.edu.ph` | Full access: Reports, Product Catalog, Inventory, Audit Logs, Student Management, POS |
| **Canteen Cashier** | `cashier` | `cashier@stct.edu.ph` | Canteen POS Register, Student Lookup, Cash Reloads, Void Transactions |
| **Parent Guardian** | `parent` | `parent@stct.edu.ph` | Parent Portal, View Child's Meal History, Top Up RFID Wallet, Daily Limit Controls |
| **Faculty Member** | `faculty` | `faculty@stct.edu.ph` | Faculty portal & personal account view |
| **Student** | `student` | `student@stct.edu.ph` | Student portal & personal balance view |

*Note: The seeded parent account is automatically linked to student **Therese Dela Cruz** (Student ID: `2026-0001`, RFID UID: `E28011700000020`, Starting Balance: `₱350.00`).*

---

## 🖨️ Hardware Configuration Guide

### 1. RFID Card Reader
* Plug any standard 13.56MHz or 125kHz USB RFID Reader into the POS terminal.
* The device must operate in **USB HID Keyboard Emulation mode** (outputs UID followed by an `Enter` keypress).
* The POS Register listens for rapid hardware key arrivals and automatically fills the RFID identification field.

### 2. Xprinter XP-58 / POS-58 Thermal Printer
* Connect printer via USB (e.g. port `USB001`, `USB002`, or `USB020`).
* Ensure printer is recognized in Windows Printers & Scanners under the name matching `XP-58` or `POS-58`.
* CPOSIMS features **automatic port-healing**: if Windows defaults the printer to `LPT1:`, the backend auto-detects connected USB print queues and redirects RAW ESC/POS data cleanly.
* **RJ11 Cash Drawer**: Connect the cash drawer's RJ11 cable directly into the DK port behind the XP-58 printer. The server issues a `256ms` dual-pin pulse (`\x1Bp\x00\x80\x80\x1Bp\x01\x80\x80`) on checkout to kick the drawer open.

---

## 🧪 Testing & Code Quality

The system includes automated tests powered by **Pest PHP**:

```bash
# Run the test suite
php artisan test --compact

# Run Pint code style formatter
vendor/bin/pint --format agent
```

---

## 📂 Project Directory Structure

```text
CPOSIMS/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/                  # Reports, Audits, Products, Students, Dashboard
│   │   │   ├── BalanceTopupController  # Online & POS Cash balance reloads
│   │   │   ├── ParentDashboardController # Parent oversight & meal breakdowns
│   │   │   ├── ParentStudentLimitController # Daily spending limit controls
│   │   │   ├── ParentStudentStatusController # Lost card freeze toggle
│   │   │   ├── PosCheckoutController   # Atomic cashless & cash checkout engine
│   │   │   └── PosController           # Register view, student lookup, voiding, ESC/POS
│   │   └── Requests/                   # Validation form requests (PosCheckoutRequest, etc.)
│   └── Models/                         # StudentAccount, BalanceTopup, Transaction, Product, etc.
├── database/
│   ├── migrations/                     # Database schema definitions
│   └── seeders/                        # Default roles, demo users, products, categories
├── resources/
│   ├── js/
│   │   ├── Components/                 # Shared UI & thermal receipt templates
│   │   └── Pages/
│   │       ├── Admin/                  # Admin reports, products, audit logs, students
│   │       ├── ParentDashboard/        # Parent portal tabs, e-receipt, reload modal
│   │       └── POS/                    # Register UI, cart, checkout modal, reload modal
└── tests/                              # Pest feature & unit tests
```

---

## 📄 License & Institutional Attribution

This project is developed for **Saint Theresa College of Tandag, Inc.**  
Licensed under the [MIT License](LICENSE).
