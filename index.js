const express = require("express");
const bodyParser = require("body-parser");
const { exec } = require("child_process");
const app = express();
app.use(bodyParser.json());
app.post("/suggest", (req, res) => {
  const ingredients = req.body.ingredients.join(",");
  exec(
    `swipl -s recipes.pl -g "findall(R, suggest_recipe([${ingredients}], R), List),
writeln(List)." -t halt`,
    (error, stdout) => {
      if (error) return res.status(500).send("Error: " + error.message);
      const suggestions = stdout
        .trim()
        .split(",")
        .map((s) => s.trim().replace(/\[|\]|'/g, ""));
      res.send({ suggestions });
    }
  );
});
app.listen(3000, () => console.log("Server running on http://localhost:3000"));
