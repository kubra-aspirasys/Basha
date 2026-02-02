# Basha Biryani Backend

This is the backend foundation for the Basha Biryani application, built with Node.js, Express, MySQL, and Sequelize.

## Prerequisites

- Node.js (v18+)
- MySQL Server

## Setup

1.  **Install Dependencies**
    ```bash
    cd Backend
    npm install
    ```

2.  **Environment Configuration**
    - Copy `.env.example` to `.env`
    - Update the database credentials in `.env`
    ```bash
    cp .env.example .env
    ```

3.  **Database Setup**
    - Create the database in MySQL:
      ```sql
      CREATE DATABASE basha_biryani_db;
      ```
    - Run Migrations:
      ```bash
      npm run migrate
      ```

4.  **Running the Server**
    ```bash
    npm run dev
    ```

## Project Structure

- `src/config`: Database configuration
- `src/controllers`: Request logic
- `src/middleware`: Auth and Error handling
- `src/migrations`: Database schema changes
- `src/models`: Sequelize definitions
- `src/routes`: API endpoints

## implemented Modules

- **Auth**: Admin and Customer login/signup
- **Menu**: Full CRUD for Menu Items and Categories

## Next Steps

- Implement Controllers/Routes for Orders, Customers, Inquiries, and CMS.
- Add validation logic (using express-validator).
- Set up unit tests.
