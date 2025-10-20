# RecipeScan PWA

RecipeScan is a modern Progressive Web App (PWA) that transforms your physical recipe cards into a digital, searchable collection right on your phone.

Using your device's camera, it can scan a recipe card, intelligently extract the title, ingredients, and instructions using AI, and save it to a local, private database on your device.

## Key Features

- **Scan with Your Camera:** Digitize recipe cards using your phone's camera. The app supports multi-page scans for two-sided cards.
- **Automatic Image Rotation:** Automatically corrects the orientation of photos for better accuracy.
- **Manual Rotation Control:** Manually rotate images that don't have orientation data.
- **AI-Powered Text Recognition:** Employs AI to parse the scanned text into a structured recipe format (Title, Ingredients, Instructions).
- **Manual & Edit Modes:** Add recipes manually or edit any existing recipe at any time.
- **Delete Recipes:** Easily remove recipes you no longer need.
- **Local & Private:** All recipes are stored securely on your device in IndexedDB. Your data is never sent to a server.
- **Shopping List Generator:** Select multiple recipes to create a consolidated, de-duplicated shopping list.
- **Data Portability:** Export your entire recipe collection to a JSON file for backup, or import recipes from a file.
- **Offline Access:** As a PWA, your saved recipes are available even when you don't have an internet connection.

## Getting Started

1.  **Go to Settings:** Navigate to the settings page using the button on the main screen.
2.  **Enter API Key:** Provide your Google AI API Key. You can get a free key from [Google AI Studio](https://aistudio.google.com/app/apikey).
3.  **Set Model Name:** It is recommended to use `gemini-1.5-pro` for the best results.
4.  **Start Scanning:** Use the "Scan New Recipe" button to start digitizing your cards, or "Add Manually" to type one in.

## Development

To run this project locally:

1.  Clone the repository.
2.  Install dependencies: `npm install`
3.  Start the development server: `npm start`