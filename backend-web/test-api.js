const fetch = require("node-fetch");

async function testSuggestApi() {
  const ingredients = ["thit bo", "bot", "hanh"];
  try {
    const response = await fetch("http://localhost:3000/suggest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ingredients }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Suggested recipes:", data.suggestions);
  } catch (error) {
    console.error("Error testing API:", error.message);
  }
}

testSuggestApi();
