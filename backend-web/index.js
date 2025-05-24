const express = require("express");
const bodyParser = require("body-parser");
const { exec } = require("child_process");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// API endpoint to get recipe suggestions
app.post("/suggest", (req, res) => {
  try {
    const ingredients = req.body.ingredients;
    if (!ingredients || !Array.isArray(ingredients)) {
      return res.status(400).json({ error: "Invalid input. Please provide an array of ingredients." });
    }

    const formattedIngredients = ingredients.map((ing) => `'${ing.trim()}'`).join(",");
   const prologQuery = `findall(Recipe, suggest_recipe([${formattedIngredients}], Recipe), List), write(List).`;
    const command = `swipl -s recipes.pl -g "${prologQuery}" -t halt`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("Prolog stderr:", stderr);
        return res.status(500).json({ error: "Error executing Prolog query", details: error.message });
      }

      let output = stdout.trim();
      console.log("Raw Prolog output:", output); // Debug output từ Prolog
      if (!output || output === "[]") {
        return res.json({ suggestions: [] });
      }

      output = output.replace(/^\[|\]$/g, "");
      const suggestions = [...new Set(output.split(",").map((item) => item.trim().replace(/^'|'$/g, "")))]; // Loại bỏ trùng lặp
      console.log("Processed suggestions:", suggestions); // Debug sau khi xử lý

      res.json({ suggestions });
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

// API endpoint to get all available recipes
app.get("/recipes", (req, res) => {
  const prologQuery = `findall([Name, Ingredients], recipe(Name, Ingredients), List), write(List).`;
  const command = `swipl -s recipes.pl -g "${prologQuery}" -t halt`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("Prolog execution error:", error);
      return res.status(500).json({
        error: "Error fetching recipes",
        details: error.message,
      });
    }

    try {
      let output = stdout.trim();
      console.log("All recipes output:", output);

      if (!output || output === "[]") {
        return res.json({ recipes: [] });
      }

      output = output.replace(/^\[|\]$/g, "");
      const recipePairs = [];
      let currentPair = "";
      let bracketCount = 0;

      for (let i = 0; i < output.length; i++) {
        if (output[i] === "[") bracketCount++;
        if (output[i] === "]") bracketCount--;
        currentPair += output[i];

        if (bracketCount === 0 && output[i] === "]" && (i === output.length - 1 || output[i + 1] === ",")) {
          recipePairs.push(currentPair.trim());
          currentPair = "";
          i++; // Skip the comma
        }
      }

      const recipes = recipePairs.map((pair) => {
        const [name, ingredients] = pair
          .replace(/^\[|\]$/g, "")
          .split("],[")
          .map((item) => item.replace(/^\[|\]$/g, ""));

        return {
          name: name.replace(/^'|'$/g, ""),
          ingredients: ingredients
            .split(",")
            .map((ing) => ing.trim().replace(/^'|'$/g, "")),
        };
      });

      res.json({ recipes });
    } catch (parseError) {
      console.error("Error parsing recipes:", parseError);
      res.status(500).json({
        error: "Error parsing recipes",
        details: parseError.message,
      });
    }
  });
});

// Test Prolog connection
app.get("/test-prolog", (req, res) => {
  const testQuery = `suggest_recipe(['trung', 'hanh'], Recipe), write(Recipe).`;
  const command = `swipl -s recipes.pl -g "${testQuery}" -t halt`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("Prolog execution error:", error);
      return res.status(500).json({
        status: "failed",
        error: error.message,
      });
    }

    res.json({
      status: "success",
      test_result: stdout.trim(),
      message: "Prolog connection is working!",
    });
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    details: err.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`App server running on http://localhost:${PORT}`);
});

module.exports = app;