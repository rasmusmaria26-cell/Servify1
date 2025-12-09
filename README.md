# Servify 🛠️

**Servify** is a modern, full-stack service aggregation platform designed to connect customers with trusted local service providers. Whether you need a plumber, electrician, or IT specialist, Servify bridges the gap with a seamless, real-time booking experience.

![Servify Banner](/placeholder-banner.png)

## 🚀 Features

### 👤 Customer Portal
- **Service Discovery**: Browse a wide range of categories (Electronics, Plumbing, Vehicles, etc.).
- **Real-Time Booking**: specific time slots and location-based vendor matching.
- **Interactive Maps**: Pinpoint service locations using Google Maps integration.
- **Dashboard**: Track booking status (Pending, In Progress, Completed) and view history.
- **Reviews**: Rate and review vendors to help the community.

### 🏢 Vendor Dashboard
- **Live Job Board**: Accept or decline incoming service requests in real-time.
- **Earnings & Analytics**: Visualize daily revenue, job completion rates, and payout history.
- **Profile Management**: Update hourly rates, availability, and business details.
- **KYC & Verification**: Secure onboarding process with document verification.

### 🛡️ Admin Panel
- **Platform Overview**: High-level stats on revenue, active users, and verified vendors.
- **User & Vendor Management**: Full control to verify vendors or manage user accounts.
- **Booking Oversight**: Monitor all platform activity and resolve disputes.
- **Analytics**: Data-driven insights into platform growth and financial health.

## 💻 Tech Stack

- **Frontend**: [React](https://react.dev/) + [Vite](https://vitejs.dev/) - Blazing fast build tool.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/) - Beautiful, accessible components.
- **Database & Auth**: [Supabase](https://supabase.com/) - Postgres database, Authentication, and Real-time subscriptions.
- **Maps**: [Google Maps API](https://developers.google.com/maps) - Location services and geocoding.
- **Internationalization**: [i18next](https://www.i18next.com/) - Multi-language support (English, Hindi, Tamil, Telugu).
- **Charts**: [Recharts](https://recharts.org/) - Data visualization for dashboards.

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- A Supabase project
- Google Maps API Key

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/rasmusmaria26-cell/Servify1.git
    cd Servify1
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory and add your keys:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```

## 🗄️ Database Schema
The project uses a relational Postgres schema on Supabase. Key tables include:
- `profiles` / `vendors`: User data and service provider details.
- `bookings`: Core transaction records linking customers, vendors, and services.
- `services` / `service_categories`: Catalog of available offerings.
- `reviews`: Customer feedback loop.

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
