# Technical Specification: RecipeScan PWA

## 1. Project Overview

RecipeScan is a mobile-first Progressive Web App (PWA) for digitizing, storing, and managing physical recipe cards. It uses on-device Optical Character Recognition (OCR) for privacy and a cloud-based AI for structuring text into a usable recipe format.

- **Core Technologies:** React, Bootstrap, Tesseract.js, IndexedDB (with `idb` library).
- **AI Integration:** Google Gemini API for natural language processing (NLP) to structure OCR'd text.

## 2. PWA & Scaffolding

The application will be bootstrapped using `create-react-app` to provide a standard PWA foundation, including a service worker and manifest.

- **Command:** `npx create-react-app RecipeScan`
- **Key Files to Modify:**
    - `manifest.json`: Update with app name (`RecipeScan`), icons, theme colors, and display settings.
    - `src/index.js`: Register the service worker to enable offline capabilities.
    - `public/`: Add high-resolution app icons.

## 3. Component Architecture

The UI will be built with a modular, component-based architecture.

- **`App.js` (Main Router):**
    - Manages routing between the main recipe list, the scanner view, the recipe detail view, and the settings page.
    - Will use a simple state-based routing or a lightweight router like `react-router-dom`.

- **`RecipeList.js` (Home Screen):**
    - Fetches and displays all recipes from IndexedDB.
    - Renders recipes as a list of `RecipeCard` components.
    - Features a floating action button (FAB) to navigate to the `RecipeScanner` view.
    - Includes a selection mode to choose recipes for the shopping list.

- **`RecipeCard.js` (Display Component):**
    - A simple, presentational component that displays a recipe's title and a preview image or summary.
    - Clicking it navigates to the `RecipeDetail` view.

- **`RecipeScanner.js` (Camera & OCR View):**
    - **State:** `images[]`, `ocrProgress`, `rawText`, `error`.
    - **Functionality:**
        1.  Uses `<input type="file" accept="image/*" capture="environment">` to access the device camera.
        2.  Displays captured images. Provides an "Add Back Side" button.
        3.  On user confirmation, initializes Tesseract.js worker.
        4.  Processes each image, updating the `ocrProgress` state.
        5.  Concatenates the recognized text into the `rawText` state.
        6.  Once complete, it passes `rawText` to the `RecipeEditor` view.

- **`RecipeEditor.js` (AI Structuring & Editing):**
    - **State:** `isLoading`, `recipeData {title, ingredients, instructions}`, `apiKey`.
    - **Functionality:**
        1.  Receives `rawText` as a prop.
        2.  Checks for the Gemini API key from `localStorage`. If not present, prompts the user to enter it.
        3.  Sends the `rawText` to the Gemini API with a structured prompt.
        4.  Displays a loading indicator while waiting for the API response.
        5.  Populates an editable form with the structured `recipeData` received from the API.
        6.  Allows the user to correct any fields.
        7.  On save, it adds or updates the recipe in the IndexedDB database and navigates back to the `RecipeList`.

- **`RecipeDetail.js` (Viewing Screen):**
    - Fetches a single recipe by ID from IndexedDB.
    - Displays the title, ingredients, and instructions in a clean, readable format.

- **`ShoppingList.js` (Modal or Page):**
    - Receives a list of selected recipe IDs.
    - Fetches the corresponding recipes from IndexedDB.
    - Consolidates all ingredients into a single, de-duplicated list with checkboxes.

- **`Settings.js` (Data Management):**
    - **API Key Input:** A form field to save the user's Google Gemini API key to `localStorage`.
    - **Export Button:**
        - Fetches all recipes from IndexedDB.
        - Creates a JSON string.
        - Triggers a browser download of the `recipes.json` file.
    - **Import Button:**
        - Opens a file picker for `.json` files.
        - Reads the file content.
        - Presents "Add to existing" and "Overwrite" options.
        - Performs the corresponding database operations, checking for duplicates by recipe title.

## 4. Database (IndexedDB)

- **Library:** `idb` (a lightweight wrapper around the IndexedDB API).
- **Database Name:** `RecipeScanDB`
- **Object Store:** `recipes`
    - **`keyPath`:** `id` (auto-incrementing).
    - **Indexes:** `title` (to prevent duplicates during import).
- **Schema:**
    ```typescript
    interface Recipe {
      id?: number;
      title: string;
      ingredients: string[]; // Array of strings
      instructions: string;
    }
    ```

## 5. AI & OCR Integration

- **Tesseract.js:**
    - Will be loaded from a CDN to keep the initial bundle size small.
    - A `TesseractWorker` will be created on-demand to avoid blocking the main thread.
    - The worker will be configured for English (`eng`).

- **Gemini API Interaction:**
    - A dedicated helper function `getStructuredRecipe(text, apiKey)` will handle the API call.
    - **Prompt:**
        ```
        You are a recipe parsing expert. Analyze the following raw text extracted from a recipe card and format it into a valid JSON object. The JSON object must have three keys: "title" (string), "ingredients" (an array of strings), and "instructions" (a single string with newlines preserved). Clean up any OCR errors.

        Raw Text:
        """
        [rawText from Tesseract]
        """
        ```
    - The function will use the `fetch` API to make a POST request to the Gemini API endpoint.

## 6. Implementation Steps

1.  **Scaffold App:** Run `create-react-app`.
2.  **Setup PWA:** Configure `manifest.json` and service worker.
3.  **Install Dependencies:** `npm install bootstrap idb`.
4.  **Database Module:** Create a `db.js` helper to manage all IndexedDB operations (init, getAll, add, update, etc.).
5.  **Build Components:** Create the component files outlined in section 3, starting with the main layout and navigation.
6.  **Implement Recipe List & Detail:** Build the core functionality of viewing recipes from the database.
7.  **Implement Scanner & OCR:** Integrate the camera input and Tesseract.js.
8.  **Implement Editor & AI:** Build the editing form and the Gemini API integration.
9.  **Implement Shopping List:** Add the selection and consolidation logic.
10. **Implement Settings:** Build the import/export and API key functionality.
11. **Styling & Polish:** Apply Bootstrap classes and custom CSS to ensure a professional look and feel.
12. **Testing:** Thoroughly test on a mobile device.

This specification provides a clear roadmap for building a robust and feature-complete application.
