# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Running Locally

To run this project on your local machine, you'll need to run two processes in separate terminals: one for the Next.js frontend and one for the Genkit AI backend.

### 1. Set up Environment Variables

Before you start, you'll need to configure your Google AI API key.

1.  Obtain an API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  Create a new file in the root of your project named `.env.local`.
3.  Add your API key to the `.env.local` file:

    ```
    GEMINI_API_KEY=YOUR_API_KEY_HERE
    ```

### 2. Run the AI Flows (Genkit)

In your first terminal, start the Genkit server. This makes the AI flows available to your web application.

```bash
npm run genkit:dev
```

### 3. Run the Web App (Next.js)

In your second terminal, start the Next.js development server.

```bash
npm run dev
```

Your application should now be running at [http://localhost:9002](http://localhost:9002).
