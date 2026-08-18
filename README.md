# FairShare

FairShare is a modern, privacy-focused web application designed to help friends, roommates, and groups easily track and split shared expenses in real-time.

🚀 **[Launch FairShare Web App](https://fairshare-dffe.vercel.app)**

## Features

- **Real-Time Synchronization**: Powered by **Supabase**, all events, participants, and expenses are instantly synced across all users' devices.
- **Smart Debt Optimization**: Automatically calculates the most efficient way to settle debts between participants, minimizing the number of transactions needed.
- **Progressive Web App (PWA)**: Install it on your phone or desktop for a native app-like experience.
- **Clean UI & Animations**: Built with Tailwind CSS and Framer Motion for a smooth, accessible, and intuitive user experience.
- **Secure by Default**: Uses Supabase Row Level Security (RLS) to ensure that only participants who know the unique event link can view or modify data.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com) v4
- **Backend & Database**: [Supabase](https://supabase.com) (PostgreSQL + Realtime)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Testing**: [Playwright](https://playwright.dev/) for E2E testing

## Getting Started

First, clone the repository and install the dependencies:

```bash
git clone https://github.com/xxxx1no/fairshare.git
cd fairshare
npm install
```

### Database Setup
This project requires a Supabase instance.
1. Create a new project on [Supabase](https://supabase.com/).
2. Run the SQL schema to create the `events`, `participants`, and `expenses` tables.
3. Enable **Row Level Security (RLS)** on all tables and configure policies for anonymous access.
4. Copy the `.env.example` file to `.env.local` and fill in your Supabase URL and Anon Key:

```bash
cp .env.example .env.local
```

### Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application running.

## Running Tests

FairShare uses Playwright to ensure end-to-end reliability.

To run the test suite:

```bash
npm run test:e2e
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an Issue.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
