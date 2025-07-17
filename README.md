# Roblox Profit Lens 📊

**Advanced Revenue Analytics Dashboard for Roblox Developers**

Roblox Profit Lens is a professional SaaS tool that helps Roblox developers analyze their revenue data, track profits, and gain valuable insights into their game performance through powerful data visualization and analytics.

## 🚀 Features

- **CSV Data Upload**: Import your Roblox revenue data via CSV files
- **Advanced Analytics**: Comprehensive charts and visualizations
- **Profit Tracking**: Monitor your earnings and DevEx calculations
- **Subscription Management**: Stripe-powered billing system
- **Authentication**: Secure user accounts with Supabase
- **Real-time Dashboard**: Live data insights and reporting
- **Responsive Design**: Works perfectly on desktop and mobile

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase (Database + Auth + Functions)
- **Payment Processing**: Stripe
- **Charts**: Recharts
- **File Processing**: Papa Parse (CSV)
- **Hosting**: Ready for Vercel/Netlify deployment

## 🏗️ Local Development

### Prerequisites

- Node.js 18+ or Bun
- Supabase account
- Stripe account (for payments)

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd roblox-profit-lens
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your actual Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:8080`

## 🗄️ Database Setup

The project uses Supabase with the following key tables:
- `profiles` - User profiles and subscription data
- `csv_data` - Uploaded revenue data
- `subscriptions` - Stripe subscription management

Migration files are located in `supabase/migrations/`.

## 🔧 Supabase Functions

The project includes several Edge Functions:
- `check-subscription` - Validate user subscriptions
- `create-checkout` - Handle Stripe checkout sessions
- `parse_csv` - Process uploaded CSV files
- `stripe-webhook` - Handle Stripe webhooks
- `send_weekly_report` - Automated email reports

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   npx vercel --prod
   ```

3. **Set environment variables** in your deployment platform:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Supabase Functions Deployment

```bash
supabase functions deploy --project-ref your-project-ref
```

## 📱 Features Overview

### Authentication & Subscriptions
- Email/password authentication
- Stripe-powered subscriptions
- Trial periods and seat counting
- Customer portal for billing management

### Data Analysis
- CSV upload with validation
- Revenue trend analysis
- Profit margin calculations
- DevEx rate tracking
- Export capabilities

### Dashboard
- Interactive charts and graphs
- Real-time data updates
- Responsive data tables
- Filter and search functionality

## 🔒 Security

- Environment variables for sensitive data
- Supabase Row Level Security (RLS)
- JWT-based authentication
- Stripe webhook signature validation
- CORS protection

## 📞 Support

For technical support or feature requests, visit the Support page in the application or contact the development team.

## 📄 License

This project is proprietary software. All rights reserved.

---

**Built with ❤️ for the Roblox developer community**
