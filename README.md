# Disney Pin Collection App

A comprehensive Disney Enamel Pin portfolio application that enables collectors to manage, track, and explore their pin collections with advanced features and dynamic visualization tools.

## Features

- **User Authentication:** Register, login, and manage your personal pin collection with secure authentication
- **Pin Collection Management:** Easily add, remove, and organize your Disney pins
- **Want List:** Keep track of pins you're looking to acquire
- **Price Tracking:** Real-time market values from eBay integration
- **Price History:** Track value changes over time with interactive charts
- **Pin Statistics:** See how many users "have" or "want" each pin
- **Responsive Design:** Works great on mobile, tablet, and desktop

## Technology Stack

- **Frontend:** React with TypeScript, Shadcn/UI components
- **Backend:** Node.js with Express
- **Database:** PostgreSQL with Drizzle ORM
- **Authentication:** Passport.js with session-based auth
- **External APIs:** eBay Marketplace Insights API
- **UI/UX:** Multiple theme options (light, dark, princess, villain)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Setup

1. Clone the repository
```
git clone https://github.com/swynnejr/mypincollection.git
cd mypincollection
```

2. Install dependencies
```
npm install
```

3. Set environment variables
```
DATABASE_URL=your_postgres_connection_string
EBAY_APP_ID=your_ebay_app_id
EBAY_CERT_ID=your_ebay_cert_id
EBAY_DEV_ID=your_ebay_dev_id
```

4. Run database migrations
```
npm run db:push
```

5. Start the development server
```
npm run dev
```

## License

MIT