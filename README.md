
# Skill Swap Platform

A full-stack Next.js web application enabling users to list the skills they offer, request swaps with others, manage requests, and rate completed exchanges. Built for Odoo Hackathon ’25 (Problem Statement 1).

---

## 📋 Table of Contents
1. [Features](#features)  
2. [Tech Stack](#tech-stack)  
3. [Getting Started](#getting-started)  
   - [Prerequisites](#prerequisites)  
   - [Installation](#installation)  
   - [Environment Variables](#environment-variables)  
   - [Database Setup](#database-setup)  
   - [Running Locally](#running-locally)  
4. [Project Structure](#project-structure)  
5. [Usage](#usage)  
6. [Deployment](#deployment)  
7. [Contributing](#contributing)  
8. [License](#license)  
9. [Contact](#contact)  

---

## 🚀 Features

- **User Profiles**  
  - Name, location (optional), profile photo (optional)  
  - Skills **Offered** & Skills **Wanted**  
  - Availability slots (e.g., weekends, evenings)  
  - Public/private visibility toggle  

- **Skill Discovery & Swap**  
  - Browse / search users by skill  
  - Request a skill swap  
  - Accept / reject swap offers  
  - Delete pending requests  
  - View current and pending swaps  

- **Feedback System**  
  - Rate completed swaps (1–5 stars)  
  - Leave review comments  

- **Admin Dashboard**  
  - Moderate user profiles & swaps  
  - Export user & swap reports  
  - Send platform-wide announcements  

---

## 🛠️ Tech Stack

- **Frontend**  
  - Next.js 14 (App Router)  
  - React + Shadcn/ui components  
  - Tailwind CSS  

- **Backend**  
  - Next.js API routes  
  - Prisma ORM  

- **Database**  
  - PostgreSQL (compatible with Neon)  

- **Deployment**  
  - Vercel  

---

## 🏁 Getting Started

### Prerequisites

- Node.js v16+ & npm  
- PostgreSQL (local or hosted)  
- Git

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/JeezzCrazzzy/Skill_Swap_Platform.git
cd Skill_Swap_Platform

# 2. Install dependencies
npm install
# or
pnpm install
````

### Environment Variables

Create a `.env` file in the project root with:

```ini
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"
```

### Database Setup

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### Running Locally

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Structure

```
.
├── app/
│   ├── auth/            # OAuth callback pages
│   ├── login/           # Login page
│   ├── signup/          # Signup page
│   ├── profile/         # Profile view & setup
│   ├── swap-requests/   # Requests listing
│   ├── page.tsx         # Landing page
│   └── layout.tsx       # Root layout
├── components/
│   ├── skill-exchange-modal.tsx
│   ├── search-results.tsx
│   ├── user-directory.tsx
│   └── ui/              # shadcn/ui & custom UI components
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/              # Static assets
├── styles/
│   └── globals.css
├── tailwind.config.ts
├── next.config.mjs
├── package.json
└── README.md
```

---

## 🎯 Usage

1. **Sign Up / Log In**
2. **Complete Profile** (add skills, availability)
3. **Discover Peers** by skill keywords
4. **Request a Swap** → peer accepts/rejects
5. **Complete Swap & Rate**

---

## 🚀 Deployment

1. Push to GitHub.
2. On Vercel, import the repo.
3. Add the same `.env` variables in Vercel Dashboard.
4. Click **Deploy** — your live URL will be provisioned automatically.

---

## 🤝 Contributing

1. Fork this repository.
2. Create a feature branch (`git checkout -b feature/...`).
3. Commit your changes (`git commit -m "feat: ..."`).
4. Push (`git push origin feature/...`).
5. Open a Pull Request.

Please follow the [Contributor Covenant](https://www.contributor-covenant.org/) and maintain code style consistency.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

---

## 📬 Contact

Your Name – \[[your-email@example.com](mailto:your-email@example.com)]
Project Link: [https://github.com/JeezzCrazzzy/Skill\_Swap\_Platform](https://github.com/JeezzCrazzzy/Skill_Swap_Platform)

```
::contentReference[oaicite:0]{index=0}
```
