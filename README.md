# WEARLY – Fashion E-Commerce

**WEARLY** is a fashion e-commerce website designed to provide a convenient online shopping experience for **Male, Female, and Kids** fashion collections.

The project is developed as part of the **Uji Kompetensi Keahlian (UKK)** for the Software Engineering (Rekayasa Perangkat Lunak) program.

## Overview

WEARLY aims to provide an integrated online shopping platform with dedicated interfaces and functionalities for three user roles:

- **Owner** – Manages the overall business operations and monitors sales performance.
- **Admin** – Manages products, categories, inventory, orders, promotions, and other store operations.
- **Customer** – Browses fashion collections, manages shopping carts, places orders, and tracks purchases.

## Tech Stack

The project is built using the following technologies:

| Technology | Purpose |
|---|---|
| Next.js | Full-stack web framework |
| TypeScript | Type-safe development |
| React | User interface library |
| Tailwind CSS | CSS utility framework |
| shadcn/ui | UI component library |
| MySQL | Relational database |
| Prisma ORM | Database management and ORM |
| XAMPP | Local database environment |
| Git & GitHub | Version control |

## Main Features

The planned features include:

- **Authentication & Authorization** – User authentication and role-based access control.
- **Product Management** – Manage fashion products, categories, variants, and inventory.
- **Product Catalog** – Browse Male, Female, and Kids fashion collections.
- **Shopping Cart** – Manage selected products before checkout.
- **Wishlist** – Save favorite products.
- **Checkout & Payment** – Process orders and manage payments.
- **Order Management** – Track and manage customer orders.
- **Voucher & Promotions** – Manage discounts and promotional offers.
- **Reviews & Ratings** – Allow customers to review purchased products.
- **Dashboard & Reports** – Monitor store operations and sales performance.

*Note: Features are planned and will be implemented progressively throughout development.*

## Getting Started

Follow these steps to run the project locally.

### Prerequisites

Make sure the following tools are installed:

- [Node.js](https://nodejs.org/)
- [XAMPP](https://www.apachefriends.org/)
- [Git](https://git-scm.com/)
- [Visual Studio Code](https://code.visualstudio.com/)

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/USERNAME/wearly.git
```

**2. Navigate to the project directory**

```bash
cd wearly
```

**3. Install dependencies**

```bash
npm install
```

**4. Configure the database**

- Open XAMPP Control Panel.
- Start MySQL.
- Open phpMyAdmin at `http://localhost/phpmyadmin`.
- Create a database named `wearly_db`.

**5. Configure environment variables**

Create a `.env` file in the project root and configure the database connection according to your local MySQL settings.

```env
DATABASE_URL="mysql://root:@localhost:3306/wearly_db"
```

**6. Generate Prisma Client**

```bash
npx prisma generate
```

**7. Run database migrations**

```bash
npx prisma migrate dev
```

**8. Start the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Status

<kbd>In Development</kbd>

WEARLY is currently under development. Features, database structures, and user interfaces will be implemented and refined progressively.

## License

This project is developed for educational purposes as part of the Software Engineering (RPL) competency assessment.

---

**WEARLY – Your Style, Your Way.**