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
    console.log("Received ingredients:", ingredients);
    if (!ingredients || !Array.isArray(ingredients)) {
      return res.status(400).json({
        error: "Invalid input. Please provide an array of ingredients.",
      });
    }

    const formattedIngredients = ingredients
      .map((ing) => `'${ing.trim()}'`)
      .join(",");

    const prologQuery = `findall(R, suggest_recipe([${formattedIngredients}], R), List), write(List).`;

    const command = `swipl -s recipes.pl -g "${prologQuery}" -t halt`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("Prolog execution error:", error);
        return res.status(500).json({
          error: "Error executing Prolog query",
          details: error.message,
        });
      }

      if (stderr) {
        console.error("Prolog stderr:", stderr);
      }

      try {
        // Parse Prolog output
        let output = stdout.trim();
        console.log("Raw Prolog output:", output);

        // Handle empty result
        if (!output || output === "[]") {
          return res.json({ suggestions: [] });
        }

        // Clean up the output and extract recipe names
        output = output.replace(/^\[|\]$/g, ""); // Remove outer brackets
        const suggestions = output
          .split(",")
          .map(
            (item) => item.trim().replace(/^'|'$/g, "") // Remove quotes
          )
          .filter((item) => item.length > 0);

        res.json({ suggestions });
      } catch (parseError) {
        console.error("Error parsing Prolog output:", parseError);
        res.status(500).json({
          error: "Error parsing Prolog response",
          details: parseError.message,
        });
      }
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({
      error: "Internal server error",
      details: err.message,
    });
  }
});

// API endpoint to get all available recipes
app.get("/recipes", (req, res) => {
  const prologQuery = `findall([Name, Ingredients], recipe(Name, Ingredients), List), write(List).`;
  const command = `swipl -s recipes.pl -g "${prologQuery}" -t halt`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
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
      res.json({ raw_output: output });
    } catch (parseError) {
      res.status(500).json({
        error: "Error parsing recipes",
        details: parseError.message,
      });
    }
  });
});

app.get("/test-prolog", (req, res) => {
  const testQuery = `suggest_recipe(['trung', 'hanh'], Recipe), write(Recipe).`;
  const command = `swipl -s recipes.pl -g "${testQuery}" -t halt`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
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
