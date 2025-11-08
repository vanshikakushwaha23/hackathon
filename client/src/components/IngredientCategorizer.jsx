import React, { useState } from "react";
import Tesseract from "tesseract.js";
import Fuse from "fuse.js";

const curated = [
  { name: "sodium benzoate", category: "Preservative (Additive)", tags: "preservative, additive", notes: "Common preservative" },
  { name: "potassium sorbate", category: "Preservative (Additive)", tags: "preservative", notes: "Common preservative" },
  { name: "monosodium glutamate", category: "Additive (Flavor enhancer)", tags: "MSG, flavor enhancer", notes: "Flavor enhancer" },
  { name: "aspartame", category: "Artificial sweetener", tags: "artificial sweetener", notes: "Low-calorie sweetener" },
  { name: "sucralose", category: "Artificial sweetener", tags: "artificial sweetener", notes: "Low-calorie sweetener" },
  { name: "acesulfame potassium", category: "Artificial sweetener", tags: "artificial sweetener", notes: "Low-calorie sweetener" },
  { name: "high fructose corn syrup", category: "Added sugar (Processed)", tags: "sweetener, sugar", notes: "Added sugar; processed" },
  { name: "sugar", category: "Added sugar (Natural/Processed)", tags: "sugar", notes: "Sugar" },
  { name: "partially hydrogenated oil", category: "Potential TransFat / Regulated", tags: "trans fat suspect", notes: "Potential source of industrial trans fats — verify with regulator" },
  { name: "palm oil", category: "Oil (vegetable)", tags: "oil", notes: "Vegetable oil" },
  { name: "soy lecithin", category: "Emulsifier / Natural", tags: "emulsifier", notes: "Emulsifier from soy" },
  { name: "natural flavour", category: "Natural / Ambiguous", tags: "flavor", notes: "Ambiguous — may be natural or contains additives" },
  { name: "artificial flavour", category: "Artificial additive", tags: "flavor additive", notes: "Artificial flavouring" },
];

const fuse = new Fuse(curated, { keys: ["name", "tags"], threshold: 0.35 });

export default function IngredientCategorizer() {
  const [image, setImage] = useState(null);
  const [ocrText, setOcrText] = useState(
    "Ingredients: Wheat flour (maida), Sugar, Partially hydrogenated oil, Salt, Sodium benzoate, Natural flavour, Emulsifiers (soy lecithin)"
  );
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("");

  function parseIngredients(text) {
    if (!text) return [];
    text = text.replace(/ingredients[:\-\s]*/i, "").replace(/\r?\n/g, ", ");
    const raw = text.split(/[,;•\n]+/).map(s => s.trim()).filter(Boolean);
    return raw.map(s =>
      s.replace(/\b\d+(\.\d+)?\s?(g|mg|%)\b/gi, "").replace(/\(.*?\)/g, "").trim()
    ).filter(Boolean);
  }

  function colorForCategory(cat) {
    if (!cat) return "gray";
    if (cat.includes("Banned") || cat.includes("Regulated") || cat.includes("TransFat")) return "red";
    if (cat.includes("Artificial") || cat.includes("Preservative") || cat.includes("Added") || cat.includes("Processed")) return "orange";
    if (cat.includes("Natural") || cat.includes("Oil") || cat.includes("Protein") || cat.includes("Dairy")) return "green";
    return "gray";
  }

  async function runOCR() {
    if (!image) {
      alert("Please select an image first.");
      return;
    }
    setStatus("Running OCR...");
    const { data } = await Tesseract.recognize(image, "eng");
    setOcrText(data.text);
    setStatus("OCR done (you can edit text below).");
  }

  function matchIngredient(token) {
    const q = token.toLowerCase().trim();
    for (const item of curated) if (item.name === q) return { item, score: 1.0 };
    const res = fuse.search(q);
    if (res.length) {
      const top = res[0];
      return { item: top.item, score: 1 - (top.score || 0) };
    }
    return null;
  }

  function runAnalysis() {
    const arr = parseIngredients(ocrText);
    const mapped = arr.map(t => {
      const match = matchIngredient(t);
      return {
        ingredient: t,
        matched: match ? match.item.name : "—",
        category: match ? match.item.category : "Unknown",
        notes: match
          ? `${match.item.notes || ""} (confidence ${(match.score * 100).toFixed(0)}%)`
          : "Not in curated DB — mark for review",
        color: colorForCategory(match ? match.item.category : null),
      };
    });
    setResults(mapped);
  }

  return (
    <div
      style={{
        fontFamily: "Inter, Arial, sans-serif",
        backgroundColor: "#f7f8fb",
        minHeight: "100vh",
        padding: "32px",
        color: "#111",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          background: "#fff",
          borderRadius: "16px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
          padding: "32px",
        }}
      >
        <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "6px" }}>
          🧪 Ingredient Categorizer — Hackathon MVP
        </h1>
        <p style={{ fontSize: "13px", color: "#555", marginBottom: "24px" }}>
          Upload an ingredient list photo → OCR → Parsed ingredients → Match against curated DB → Categorized results.
        </p>

        {/* Controls */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(URL.createObjectURL(e.target.files[0]))}
            style={{
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              background: "#fafafa",
              cursor: "pointer",
              flex: "1",
            }}
          />
          <button
            onClick={runOCR}
            style={{
              background: "#007bff",
              color: "#fff",
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Run OCR
          </button>
          <button
            onClick={() => runAnalysis()}
            style={{
              background: "#28a745",
              color: "#fff",
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Analyze
          </button>
          <span style={{ fontSize: "12px", color: "#777" }}>{status}</span>
        </div>

        {/* Image Preview */}
        {image && (
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <img
              src={image}
              alt="preview"
              style={{
                maxWidth: "100%",
                borderRadius: "12px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
              }}
            />
          </div>
        )}

        {/* OCR Section */}
        <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "8px" }}>
          📝 OCR Text (edit if needed)
        </h3>
        <textarea
          value={ocrText}
          onChange={(e) => setOcrText(e.target.value)}
          style={{
            width: "100%",
            height: "100px",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            fontFamily: "inherit",
            fontSize: "14px",
            marginBottom: "24px",
          }}
        />

        {/* Results Table */}
        <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "8px" }}>
          🧩 Parsed Ingredients & Categories
        </h3>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "14px",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#f0f2f5",
                  textAlign: "left",
                }}
              >
                <th style={{ padding: "10px", fontWeight: 600 }}>Ingredient</th>
                <th style={{ padding: "10px", fontWeight: 600 }}>Matched Canonical</th>
                <th style={{ padding: "10px", fontWeight: 600 }}>Category</th>
                <th style={{ padding: "10px", fontWeight: 600 }}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      color: "#777",
                      fontSize: "13px",
                    }}
                  >
                    No ingredients parsed yet.
                  </td>
                </tr>
              ) : (
                results.map((r, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom: "1px solid #eee",
                      backgroundColor: i % 2 === 0 ? "#fff" : "#fafafa",
                    }}
                  >
                    <td style={{ padding: "10px" }}>{r.ingredient}</td>
                    <td style={{ padding: "10px" }}>{r.matched}</td>
                    <td style={{ padding: "10px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "6px 10px",
                          borderRadius: "12px",
                          fontWeight: 600,
                          background:
                            r.color === "green"
                              ? "#2ecc71"
                              : r.color === "orange"
                              ? "#f39c12"
                              : r.color === "red"
                              ? "#e74c3c"
                              : "#95a5a6",
                          color: "#fff",
                        }}
                      >
                        {r.category}
                      </span>
                    </td>
                    <td style={{ padding: "10px", color: "#555" }}>{r.notes}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
