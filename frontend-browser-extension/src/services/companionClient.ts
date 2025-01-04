/**
 * companionClient.ts
 *
 * Sends a visited URL to the local companion app for scraping/extraction.
 * Adjust the endpoint to match your local service's port/path.
 */

export async function sendUrlToCompanion(url: string): Promise<void> {
  try {
    const response = await fetch("http://127.0.0.1:5000/scrape", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      console.error(`Failed to send URL to companion app: ${response.statusText}`);
    } else {
      console.log(`Successfully sent URL to companion: ${url}`);
    }
  } catch (error) {
    console.error("Error communicating with companion app:", error);
  }
}
