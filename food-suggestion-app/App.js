import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import axios from "axios";

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

  const handleSubmit = async () => {
  if (!ingredients.trim()) {
    setError("Vui lòng nhập ít nhất một nguyên liệu!");
    return;
  }

  setLoading(true);
  setError("");
  setSuggestions([]);

  try {
    const ingredientList = ingredients.split(",").map((item) => item.trim().toLowerCase()).filter((item) => item.length > 0);
    const response = await axios.post("http://localhost:3000/suggest", { ingredients: ingredientList });
    console.log("API Response:", response.data);
    const uniqueSuggestions = [...new Set(response.data.suggestions || [])];
    console.log("Unique Suggestions:", uniqueSuggestions);
    setSuggestions(uniqueSuggestions);

    if (uniqueSuggestions.length === 0) {
      setError("Không tìm thấy món ăn phù hợp với nguyên liệu này");
    }
  } catch (err) {
    console.error("Error:", err);
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
    <SafeAreaView style={styles.app}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>🍳 Đề Xuất Món Ăn</Text>
            <Text style={styles.headerSubtitle}>
              Nhập nguyên liệu bạn có, chúng tôi sẽ gợi ý món ăn phù hợp!
            </Text>
          </View>

          <View style={styles.mainContent}>
            <View style={styles.inputSection}>
              <Text style={styles.label}>Nguyên liệu hiện có:</Text>
              <TextInput
                style={styles.ingredientInput}
                value={ingredients}
                onChangeText={setIngredients}
                placeholder="Ví dụ: trứng, hành, thịt gà, rau..."
                placeholderTextColor="#7f8c8d"
                autoCapitalize="none"
              />

              <View style={styles.suggestionChips}>
                <Text style={styles.suggestionText}>
                  Gợi ý nguyên liệu phổ biến:
                </Text>
                <View style={styles.chipsContainer}>
                  {commonIngredients.map((ingredient, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.chip}
                      onPress={() => addIngredient(ingredient)}
                    >
                      <Text style={styles.chipText}>{ingredient}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.btn, styles.btnPrimary]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.btnText}>🔍 Tìm Món Ăn</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnSecondary]}
                onPress={clearInput}
                disabled={loading}
              >
                <Text style={[styles.btnText, { color: "#7f8c8d" }]}>
                  🗑️ Xóa
                </Text>
              </TouchableOpacity>
            </View>

            {error ? (
              <View style={styles.errorMessage}>
                <Text style={styles.errorIcon}>❌</Text>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {suggestions.length > 0 && (
              <View style={styles.results}>
                <Text style={styles.resultsTitle}>
                  🍽️ Món ăn gợi ý ({suggestions.length} món):
                </Text>
                <FlatList
                  data={suggestions}
                  renderItem={({ item, index }) => (
                    <View style={styles.recipeItem}>
                      <Text style={styles.recipeIcon}>🍴</Text>
                      <Text style={styles.recipeName}>{item}</Text>
                    </View>
                  )}
                  keyExtractor={(item, index) => index.toString()}
                />
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: "#19547b",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 15,
  },
  container: {
    maxWidth: 600,
    width: "100%",
    backgroundColor: "white",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 40,
    elevation: 10,
  },
  header: {
    backgroundColor: "#ffd89b",
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: "400",
    color: "#34495e",
    opacity: 0.8,
  },
  mainContent: {
    padding: 20,
  },
  inputSection: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 12,
  },
  ingredientInput: {
    width: "100%",
    padding: 16,
    borderWidth: 2,
    borderColor: "#f1c40f",
    borderRadius: 12,
    fontSize: 16,
    backgroundColor: "#fefefe",
  },
  suggestionChips: {
    marginTop: 20,
  },
  suggestionText: {
    fontSize: 14,
    color: "#7f8c8d",
    fontWeight: "500",
    marginBottom: 12,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: "#fff3cd",
    borderWidth: 1,
    borderColor: "#f1c40f",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 14,
    color: "#856404",
    fontWeight: "500",
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 20,
  },
  btn: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  btnPrimary: {
    backgroundColor: "#f1c40f",
  },
  btnSecondary: {
    backgroundColor: "#ecf0f1",
    borderWidth: 2,
    borderColor: "#bdc3c7",
  },
  btnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  errorMessage: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#ffeaa7",
    borderWidth: 1,
    borderColor: "#fdcb6e",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  errorIcon: {
    fontSize: 18,
  },
  errorText: {
    fontSize: 14,
    color: "#2d3436",
    fontWeight: "500",
  },
  results: {
    marginTop: 30,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 20,
  },
  recipeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    backgroundColor: "#fffbf0",
    borderWidth: 1,
    borderColor: "#f1c40f",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  recipeIcon: {
    fontSize: 18,
    color: "#f39c12",
  },
  recipeName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2c3e50",
  },
});

export default App;