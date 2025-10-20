# Project Overview: RecipeScan PWA

RecipeScan is a mobile-first Progressive Web App (PWA) built with React. It allows users to digitize physical recipe cards using OCR and AI, manage them in a local database, and generate shopping lists.

## Architecture

The application follows a client-side, single-page application (SPA) architecture.

- **Frontend:** React (bootstrapped with `create-react-app`).
- **Styling:** Bootstrap with Material Design principles.
- **Database:** IndexedDB, managed via the `idb` library for robust client-side storage.
- **OCR:** `Tesseract.js` runs in the browser to perform on-device text recognition.
- **AI Processing:** The Google Gemini API is used to structure the raw OCR text into a formatted JSON recipe.
- **Image Handling:** The `browser-image-compression` library is used for pre-processing images (orientation correction, resizing) before OCR.

## Core Technologies

- **React:** v18+
- **Bootstrap:** v5+
- **idb:** v7+ (for IndexedDB)
- **Tesseract.js:** v5+ (for OCR)
- **browser-image-compression:** v2+

## Directory Structure

```
src/
├── components/
│   ├── App.js             # Main component, router, and state management
│   ├── RecipeList.js      # Displays all recipes, handles selection
│   ├── RecipeScanner.js   # Handles camera input, image processing, and OCR
│   ├── RecipeEditor.js    # Form for editing/creating recipes, handles AI call
│   ├── RecipeDetail.js    # Displays a single formatted recipe
│   ├── Settings.js        # Manages API key and data import/export
│   └── ShoppingList.js    # Displays the consolidated ingredient list
├── db.js                  # IndexedDB helper module
├── index.js               # Application entry point, service worker registration
└── serviceWorkerRegistration.js # PWA service worker logic
```

## Key Component Logic

- **`App.js`:** Acts as a simple router, managing the `view` state (`list`, `scanner`, `editor`, etc.) and passing data and handlers between child components.
- **`RecipeScanner.js`:**
    1.  Uses `<input type="file">` to capture images.
    2.  Uses `browser-image-compression` to correct orientation.
    3.  Provides a manual rotation fallback using an HTML canvas.
    4.  Initializes a `Tesseract.worker` to perform OCR on the processed images.
    5.  Passes the resulting raw text up to `App.js`.
- **`RecipeEditor.js`:**
    1.  Receives either `rawText` (for scanning) or a `recipeId` (for editing).
    2.  If `rawText` is present, it constructs a prompt and calls the Gemini API.
    3.  It includes robust logic to parse the JSON response from the AI.
    4.  If `recipeId` is present, it fetches the existing recipe from IndexedDB.
    5.  Provides a form for the user to review, edit, and save the recipe.
- **`db.js`:** A crucial abstraction layer that simplifies all IndexedDB transactions (CRUD operations, bulk import) into async functions.

## Development Setup

1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **Start the Server:**
    ```bash
    npm start
    ```
    The app will be available at `http://localhost:3000`.
