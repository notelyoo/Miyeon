# 🌸 miyeon.fr – Personal K‑pop Web Gallery & Portfolio

**miyeon.fr** is a fan-made, responsive, and aesthetic web project showcasing a photocard collection, favorite K‑pop albums, concerts, and travels — all wrapped into a custom portfolio.  
It features a dynamic admin interface with upload modals, real-time filtering, and media embeds. Built with **vanilla HTML, CSS, JS**, and powered by **Node.js + Express**, this project runs entirely server-side with session-based auth and local storage.

---

## ✨ Features

- 📸 **Photocard Collection Viewer** – Gallery view with real-time search, filtering, and sorting  
- 🎵 **Music & Video Embeds** – Add your favorite YouTube videos and Spotify albums  
- 🧳 **About Section** – Timeline of past concerts, travels, and personal highlights  
- 👑 **Admin Interface** – Upload, edit, and delete cards directly from the UI  
- 📱 **Fully Responsive** – Optimized layout for desktop, tablet, and mobile  
- 🔐 **Session-Based Authentication** – Secure login with admin-only routes  
- 🗃️ **Local SQLite Database** – Stores collection data on disk  
- 🧼 **Input Sanitization & CSRF Protection** – Secured backend handling user data  

---

## 🧰 Tech Stack

### Frontend
- HTML5, CSS3 (modular: base, layout, components, responsive)
- Vanilla JavaScript (DOM manipulation, modals, filters)
- Custom animations, overlays, and modals

### Backend
- Node.js + Express
- Multer for file uploads
- SQLite3 (via `database.db`)
- `express-session`, `helmet`, `csurf`, `express-rate-limit` for security

---

## 📁 Project Structure

```txt
miyeon/
├── public/
│   ├── about.html               → About page with concerts, travels, and social links
│   ├── collection.html          → Photocard gallery with filters and admin actions
│   ├── home.html                → Homepage with intro, video and album embeds
│   ├── login.html               → Admin login form for access to protected features
│   ├── favicon.ico              → Website favicon
│   ├── css/                     → Modular CSS stylesheets
│   │   ├── about.css            → Specific styles for the About page (profile, podium)
│   │   ├── base.css             → Global design tokens, variables, resets
│   │   ├── collection.css       → Styles for the collection gallery, modals, and sidebar
│   │   ├── components.css       → Shared reusable UI blocks (cards, buttons, events)
│   │   ├── home.css             → Styling for Home page embeds and layout
│   │   ├── layout.css           → Page layout, navbar, container & column structure
│   │   ├── login.css            → Custom design for the login form and inputs
│   │   └── responsive.css       → Media queries and responsive behavior
│   ├── images/                  → All static images (profile, banners, photocard assets)
│   ├── js/                      → Frontend JavaScript logic and UI interactivity
│   │   ├── filter.js            → Photocard filters by idol, group, type, etc.
│   │   ├── login.js             → Handles login form and localStorage admin flag
│   │   ├── main.js              → Shared site behavior (modals, admin UI logic)
│   │   ├── search.js            → Text-based search and card highlighting
│   │   ├── uploadCollection.js  → Upload modal behavior and data validation (collection)
│   │   └── uploadHome.js        → Embed modal handling for YouTube and Spotify (home)
│   └── uploads/                 → Folder where uploaded photocard images are stored
├── database.db                  → SQLite database file that stores all collection data
├── server.js                    → Express backend with routes, middleware, sessions
├── .env                         → Environment variables (secret keys, admin credentials)
├── package-lock.json            → Dependency lock file for consistent installs
└── README.md                    → Full project documentation (you are here!)
```

> 📝 All `.html` files are stored directly under `/public/` and rendered as static views.

---

## 🚀 Getting Started

### 1️⃣ Clone the repository

```bash
git clone https://github.com/notelyoo/miyeon.fr.git
cd miyeon.fr
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Create a `.env` file

```ini
SESSION_SECRET=your_session_secret_here
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_bcrypt_hashed_password
```

### 4️⃣ Launch the server

```bash
node server.js
```

The website will run at: [http://localhost:3000](http://localhost:3000)

---

## 🛡️ Security Notes

- 🔐 Admin credentials are stored in environment variables and hashed with bcrypt  
- 🧼 All input fields are sanitized before being stored  
- 🔒 CSRF tokens protect critical routes (upload, edit, delete)  
- 📊 Rate limiting is applied to login attempts  

---

## 📜 License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPLv3)**.  
You are free to use, share, and modify the code under the same license terms.  
See the full [`LICENSE`](./LICENSE) file for more details.

---

## 📬 Contact

- 🌐 Website: [https://miyeon.fr](https://miyeon.fr)
- 🐦 Twitter: [@NotElyoo](https://twitter.com/NotElyoo)
- 🐱 GitHub: [@NotElyoo](https://github.com/notelyoo)
- 📧 Email: contact@miyeon.fr
