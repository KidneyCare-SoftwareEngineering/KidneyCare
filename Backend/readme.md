# Food API Server

A simple, fast, and efficient food-related API built using Rust, Axum, SQLx, and PostgreSQL. The API provides detailed information about food items, nutritional content, and recipe ingredients, aimed to help users access and manage food-related data.

## Table of Contents
1. [Overview](#overview)
2. [Technologies Used](#technologies-used)
3. [Features](#features)
4. [Setup](#setup)
5. [API Endpoints](#api-endpoints)
6. [Running the Application](#running-the-application)
7. [License](#license)

## Overview

This project exposes several endpoints to fetch food details, food cards, and nutritional information from a PostgreSQL database. The server is built using [Axum](https://github.com/tokio-rs/axum) for the API framework, [SQLx](https://github.com/launchbadge/sqlx) for PostgreSQL integration, and [dotenvy](https://crates.io/crates/dotenvy) for environment configuration.

## Technologies Used

- **Rust**: A systems programming language focused on safety, speed, and concurrency.
- **Axum**: A web framework built on top of [Tokio](https://tokio.rs/) for building fast and reliable APIs.
- **SQLx**: A modern, async SQL crate for interacting with PostgreSQL databases.
- **PostgreSQL**: A powerful, open-source relational database used for storing food and recipe data.
- **dotenvy**: A library to manage environment variables securely.

## Features

- Fetch all food details with nutritional information.
- Retrieve food cards with image and category data.
- Get specific food details by ID.
- Access a mockup data file for AI processing.

## Setup

### Prerequisites

- **Rust**: Ensure you have Rust installed. You can install it via [rustup](https://www.rust-lang.org/tools/install).
- **PostgreSQL**: Set up PostgreSQL and create a database for the application.

### Environment Variables

Create a `.env` file in the root directory and include the following environment variables:

```env
SERVER_ADDRESS=127.0.0.1:3000
DATABASE_URL=postgres://user:password@localhost/dbname
