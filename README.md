# Book Explorer

This project is a full-stack application designed to scrape book data from `books.toscrape.com`, store it in a MongoDB database, upload book cover images to Cloudinary, and display the data through a React frontend. The project is structured as a monorepo with three main components:

Live Link=https://book-explorer-frontend-4ek8.onrender.com/

-   `/scraper`: A Node.js script using Puppeteer to scrape book details and manage image uploads to Cloudinary.
-   `/backend`: A Node.js Express API that serves book data from MongoDB, supporting pagination, filtering, and searching.
-   `/frontend`: A React application that consumes the backend API to display books in a user-friendly interface.

## Table of Contents

-   [Prerequisites](#prerequisites)
-   [Setup Instructions](#setup-instructions)
    -   [1. Clone the Repository](#1-clone-the-repository)
    -   [2. Environment Variables (.env)](#2-environment-variables-env)
    -   [3. Backend Setup](#3-backend-setup)
    -   [4. Scraper Setup](#4-scraper-setup)
    -   [5. Frontend Setup](#5-frontend-setup)
-   [Running the Application](#running-the-application)
    -   [Start Backend](#start-backend)
    -   [Run Scraper (Optional, for Data Population)](#run-scraper-optional-for-data-population)
    -   [Start Frontend](#start-frontend)
-   [API Endpoints](#api-endpoints)

## Prerequisites

Before you begin, ensure you have the following installed:

-   **Node.js** (LTS version recommended)
-   **npm** (Node Package Manager) or **Yarn**
-   **MongoDB**: A running MongoDB instance (local or cloud-hosted like MongoDB Atlas).
-   **Cloudinary Account**: An account for image storage and delivery.

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Book-Explorer
```

### 2. Environment Variables (.env)

Create a `.env` file in the `backend/` directory with the following content. Replace the placeholder values with your actual credentials:

```env
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
MONGODB_CONNECTION_STRING=your_mongodb_connection_string
PORT=5000
```

-   `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Get these from your Cloudinary dashboard.
-   `MONGODB_CONNECTION_STRING`: Your MongoDB connection string (e.g., `mongodb://localhost:27017/bookexplorer` or your MongoDB Atlas URI).
-   `PORT`: The port for your backend API (default is 5000).

### 3. Backend Setup

Navigate to the `backend` directory and install its dependencies:

```bash
cd backend
npm install
# or yarn install
```

### 4. Scraper Setup

Navigate to the `scraper` directory and install its dependencies:

```bash
cd scraper
npm install
# or yarn install
```

### 5. Frontend Setup

Navigate to the `frontend` directory and install its dependencies:

```bash
cd frontend
npm install
# or yarn install
```

## Running the Application

You will need **three separate terminal windows** to run the backend, scraper, and frontend concurrently.

### Start Backend

In the **first terminal**, navigate to `backend/` and start the server:

```bash
cd backend
node server.js
```

Alternatively, for Windows PowerShell users:

```powershell
cd backend
node server.js
```

Expected output will include "MongoDB Connected" and "Server running on port 5000" (or your specified port).

### Run Scraper (Optional, for Data Population)

In the **second terminal**, navigate to `scraper/` and run the scraper. This will populate your MongoDB database and upload images to Cloudinary. You only need to run this once for initial data, or whenever you want to refresh the data.

```bash
cd scraper
node index.js
```

Alternatively, for Windows PowerShell users:

```powershell
cd scraper
node index.js
```

Expected output will show messages for each book being saved/updated.

### Start Frontend

In the **third terminal**, navigate to `frontend/` and start the React development server:

```bash
cd frontend
npm start
```

Alternatively, for Windows PowerShell users:

```powershell
cd frontend
npm start
```

This will open the application in your browser, usually at `http://localhost:3000`.

## API Endpoints

The backend API provides the following endpoints:

-   **GET `/api/books`**
    -   Returns a paginated list of books.
    -   **Query Parameters:**
        -   `page`: (Number) Current page number (default: 1).
        -   `limit`: (Number) Number of books per page (default: 10).
        -   `title`: (String) Search by book title (case-insensitive).
        -   `minPrice`: (Number) Filter by minimum price.
        -   `maxPrice`: (Number) Filter by maximum price.
        -   `rating`: (String) Filter by minimum rating (e.g., "Three" for 3 stars and up).
        -   `inStock`: (Boolean) Filter by in-stock status (set to `true` to show only in-stock books).

-   **GET `/api/books/:id`**
    -   Returns detailed information for a single book based on its MongoDB `_id`.
