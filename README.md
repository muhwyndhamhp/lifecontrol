# LifeControl

LifeControl is a full-stack application designed to help you manage your life. 

## Architecture

The project is a monorepo with two main components:

- `client/`: A React frontend built with Vite, using TanStack Router for navigation and Zustand for state management.
- `server/`: A serverless backend powered by Hono, running on Cloudflare Workers. It uses Kysely for database queries and Valibot for schema validation.

## Technologies Used

### Frontend

- **React**: A JavaScript library for building user interfaces.
- **Vite**: A fast build tool for modern web development.
- **TanStack Router**: A powerful and type-safe routing library for React.
- **Zustand**: A small, fast, and scalable state management solution.
- **Stitches**: A CSS-in-JS library for styling components.

### Backend

- **Hono**: A small, simple, and ultrafast web framework for the edge.
- **Cloudflare Workers**: A serverless platform for running backend code.
- **Kysely**: A type-safe SQL query builder for TypeScript.
- **Valibot**: A lightweight and modular validation library.
- **SST**: A framework for building and deploying serverless applications on Cloudflare and AWS.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/)
- [Node.js](https://nodejs.org/)
- [Cloudflare Account](https://www.cloudflare.com/)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/muhwyndhamhp/lifecontrol.git
    cd lifecontrol
    ```

2.  **Install dependencies for both the client and server:**

    ```bash
    bun install
    cd client && bun install && cd ..
    ```

### Development

1.  **Start the frontend development server:**

    ```bash
    cd client
    bun run dev
    ``

2.  **Start the backend server:**

    The backend is deployed using SST to Cloudflare. You'll need to configure your Cloudflare credentials. Follow the [SST documentation](https://sst.dev/docs/) to set up your environment.

### Deployment

To deploy the application to production, run the following command from the root directory:

```bash
bun run deploy
```

This command will build the client, and then deploy both the client and server using SST.
