# FairShare

FairShare is a modern, privacy-focused, local-first web application designed to help friends, roommates, and groups easily track and split shared expenses. It works completely offline and stores all your data directly on your device.

🚀 **[Play with the Live Demo here!](https://fairshare-dffe.vercel.app)**

## Features

- **Local-First & Offline Support**: Powered by IndexedDB (via Dexie.js), all data is stored securely on your device. No internet connection? No problem!
- **Smart Debt Optimization**: Automatically calculates the most efficient way to settle debts between participants, minimizing the number of transactions needed.
- **Multiple Currencies**: (Coming Soon) Seamless support for tracking expenses across different base currencies.
- **Progressive Web App (PWA)**: Install it on your phone or desktop for a native app-like experience.
- **Clean UI & Animations**: Built with Tailwind CSS and Framer Motion for a smooth, accessible, and intuitive user experience.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com) v4
- **State & Database**: [Dexie.js](https://dexie.org) (IndexedDB Wrapper) + `dexie-react-hooks`
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Testing**: [Playwright](https://playwright.dev/) for E2E testing

## Getting Started

First, clone the repository and install the dependencies:

```bash
git clone https://github.com/your-username/fairshare.git
cd fairshare
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application running.

## Running Tests

FairShare uses Playwright to ensure end-to-end reliability.

To run the test suite:

```bash
npx playwright test
```

To view the HTML report of the test run:

```bash
npx playwright show-report
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an Issue.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
