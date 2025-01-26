# CookWise

This repository contains the source code for the machine learning project developed by the CookWise Team, as part of the 'Machine learning' course.

# Members

| **Name**             | **Major**                                            | **University**                 |
| -------------------- | ---------------------------------------------------- | ------------------------------ |
| Tuan-Anh Ha          | Information Technology - Data Science                | University of Science (VNUHCM) |
| Quang-Thang Duong    | Information Technology - Computer Vision             | University of Science (VNUHCM) |
| Quoc-Thang Nguyen    | Information Technology - Computer Vision             | University of Science (VNUHCM) |
| Hai-Long Pham-Nguyen | Information Technology - Computer Vision             | University of Science (VNUHCM) |
| Thanh-Nghia Vo       | Information Technology - Natural Language Processing | University of Science (VNUHCM) |

# Project Structure

The organizational structure of our project is as follows:

## Front-End Structure

The front-end is built using React.js and is responsible for the user interface and interactions.
frontend/
├── public/
│ ├── index.html # Main HTML file to load the React app
│ ├── favicon.ico # Application favicon
│ └── manifest.json # Metadata for Progressive Web Apps
├── src/
│ ├── assets/ # Static assets like images, icons, and styles
│ │ ├── images/ # Application images
│ │ ├── icons/ # Icon assets
│ │ └── styles/ # Global CSS/SCSS files
│ ├── components/ # Reusable React components
│ │ ├── Header.js # Header component
│ │ ├── Footer.js # Footer component
│ │ └── Card.js # Example reusable card component
│ ├── pages/ # Page-level components
│ │ ├── HomePage.js # Homepage component
│ │ ├── AboutPage.js # About page component
│ │ └── RecipePage.js # Recipe details page
│ ├── services/ # API service handlers
│ │ └── api.js # Functions for interacting with the back-end
│ ├── App.js # Main app entry point
│ ├── index.js # React DOM entry point
│ ├── reportWebVitals.js # Performance reporting
│ └── setupTests.js # Configuration for testing
├── package.json # Front-end dependencies and scripts
├── .env # Environment variables for front-end
└── README.md # Front-end documentation

## Back-end Structure

The back-end is built using Express.js and is responsible for server-side logic, including API endpoints, database operations, and authentication.

backend/
├── src/
│ ├── controllers/ # Request handlers for routes
│ │ ├── recipeController.js # Business logic for recipe routes
│ │ ├── userController.js # Business logic for user routes
│ ├── middleware/ # Middleware functions
│ │ ├── authMiddleware.js # Authorization middleware
│ │ └── errorHandler.js # Global error handler
│ ├── models/ # Database models
│ │ ├── recipeModel.js # Schema for recipes
│ │ ├── userModel.js # Schema for users
│ ├── routes/ # API route definitions
│ │ ├── recipeRoutes.js # Routes for recipes
│ │ ├── userRoutes.js # Routes for users
│ ├── config/ # Configuration files
│ │ ├── dbConfig.js # Database connection setup
│ │ └── dotenvConfig.js # Environment variables configuration
│ ├── app.js # Express app setup
│ └── server.js # Server entry point
├── package.json # Back-end dependencies and scripts
├── .env # Environment variables for back-end
└── README.md # Back-end documentation
