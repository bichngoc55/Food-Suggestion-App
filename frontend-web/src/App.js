import React, { useState } from "react";
import axios from "axios";
import "./App.css";

const App = () => {
  const [ingredients, setIngredients] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const commonIngredients = [
    "trung",
    "hanh",
    "thit ga",
    "thit bo",
    "com",
    "toi",
    "rau",
    "tom",
    "muc",
    "bot",
  ];

 const handleSubmit = async (e) => {  // Thêm tham số e
  e.preventDefault();  // Ngăn chặn hành vi mặc định của form
  
  if (!ingredients.trim()) {
    setError("Vui lòng nhập ít nhất một nguyên liệu!");
    return;
  }

  setLoading(true);
  setError("");
  setSuggestions([]);

  try {
    const ingredientList = ingredients.split(",")
      .map((item) => item.trim().toLowerCase())
      .filter((item) => item.length > 0);
    
    console.log("Gửi nguyên liệu:", ingredientList); // Debug log
    
    const response = await axios.post("http://localhost:3000/suggest", { 
      ingredients: ingredientList 
    });
    
    console.log("Nhận phản hồi:", response.data); // Debug log
    
    const uniqueSuggestions = [...new Set(response.data.suggestions)];
    setSuggestions(uniqueSuggestions);

    if (uniqueSuggestions.length === 0) {
      setError("Không tìm thấy món ăn phù hợp với nguyên liệu này");
    }
  } catch (err) {
    console.error("Lỗi API:", err); // Debug log
    setError(err.response?.data?.error || "Không thể kết nối với server");
  } finally {
    setLoading(false);
  }
};

  const addIngredient = (ingredient) => {
    const currentValue = ingredients.trim();

    if (currentValue && !currentValue.includes(ingredient)) {
      setIngredients(currentValue + ", " + ingredient);
    } else if (!currentValue) {
      setIngredients(ingredient);
    }
  };

  const clearInput = () => {
    setIngredients("");
    setSuggestions([]);
    setError("");
  };

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>🍳 Đề Xuất Món Ăn</h1>
          <p>Nhập nguyên liệu bạn có, chúng tôi sẽ gợi ý món ăn phù hợp!</p>
        </header>

        <main className="main-content">
          <form onSubmit={handleSubmit} className="input-form">
            <div className="input-section">
              <label htmlFor="ingredients">Nguyên liệu hiện có:</label>
              <input
                type="text"
                id="ingredients"
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                placeholder="Ví dụ: trứng, hành, thịt gà, rau..."
                className="ingredient-input"
                autoComplete="off"
              />

              <div className="suggestion-chips">
                <p>Gợi ý nguyên liệu phổ biến:</p>
                <div className="chips-container">
                  {commonIngredients.map((ingredient, index) => (
                    <button
                      key={index}
                      type="button"
                      className="chip"
                      onClick={() => addIngredient(ingredient)}
                    >
                      {ingredient}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="button-group">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "🔄 Đang tìm..." : "🔍 Tìm Món Ăn"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={clearInput}
                disabled={loading}
              >
                🗑️ Xóa
              </button>
            </div>
          </form>

          {error && (
            <div className="error-message">
              <span>❌</span>
              <p>{error}</p>
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="results">
              <h3>🍽️ Món ăn gợi ý ({suggestions.length} món):</h3>
              <div className="recipe-list">
                {suggestions.map((recipe, index) => (
                  <div key={index} className="recipe-item">
                    <span className="recipe-icon">🍴</span>
                    <span className="recipe-name">{recipe}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
