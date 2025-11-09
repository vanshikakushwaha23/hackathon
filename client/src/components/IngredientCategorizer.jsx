import React, { useState, useRef } from "react";
import Tesseract from "tesseract.js";

export default function IngredientCapture() {
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState("");
  const [results, setResults] = useState([]);
  const [ocrDebug, setOcrDebug] = useState("");
  
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Check if text looks like an ingredient list
  function looksLikeIngredientList(text) {
    const textLower = text.toLowerCase();
    
    // Check for common ingredient list patterns
    const patterns = [
      /coating.*\d+%/i, // "coating (35%)"
      /(sugar|salt|milk|cocoa|flour|water|oil)/i, // Common ingredients
      /contains.*milk|soy|peanut|wheat/i, // Allergen statements
      /may contain/i,
      /\d+%.*:\s*[A-Z]/i, // Percentage format like "35%: Sugar"
    ];
    
    let matches = 0;
    for (const pattern of patterns) {
      if (pattern.test(textLower)) matches++;
    }
    
    // If 2+ patterns match, likely an ingredient list
    return matches >= 2;
  }

  async function handleImageCapture(e) {
    const file = e.target.files[0];
    if (!file) return;

    const imgUrl = URL.createObjectURL(file);
    setImage(imgUrl);
    setStatus("🔍 Running OCR... please wait.");
    setResults([]);
    setOcrDebug("");

    try {
      const { data } = await Tesseract.recognize(file, "eng", {
        tessedit_pageseg_mode: Tesseract.PSM.AUTO,
      });

      const text = data.text;
      setOcrDebug(text);
      console.log("OCR text:", text);

      // Check for "ingredient" keyword OR ingredient list patterns
      const textLower = text.toLowerCase();
      const hasIngredientKeyword = 
        textLower.includes("ingredient") ||
        textLower.includes("ingredients");
      
      const hasIngredientPattern = looksLikeIngredientList(text);

      console.log("Detection results:");
      console.log("- Has 'ingredient' keyword:", hasIngredientKeyword);
      console.log("- Looks like ingredient list:", hasIngredientPattern);

      if (hasIngredientKeyword || hasIngredientPattern) {
        setStatus("✅ Ingredient list detected! Uploading to n8n...");

const formData = new FormData();
formData.append('data', file, file.name);

const res = await fetch("https://ajitraner.app.n8n.cloud/webhook-test/ingredient-ocr", {
  method: "POST",
  body: formData,
});

        debugger;

        if (!res.ok) {
          throw new Error(`Upload failed with status: ${res.status}`);
        }

        const dataRes = await res.json();
        console.log("n8n response:", dataRes);

        if (dataRes.valid) {
          setResults(dataRes.ingredients || []);
          setStatus("✅ Ingredients parsed successfully!");
        } else {
          setResults([]);
          setStatus("⚠️ Image processed, but no valid ingredient list found.");
        }
      } else {
        setStatus("🚫 No ingredient list detected — image looks invalid.");
      }
    } catch (err) {
      console.error("OCR Error:", err);
      setStatus("❌ Error processing image: " + err.message);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4">🧪 Ingredient Detector</h1>
      <p className="text-sm text-gray-600 mb-4">
        Capture or upload a food label. It will only upload to n8n if "Ingredient" is found.
      </p>

      {/* Two separate options: Camera and File Upload */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 " style={{display: "flex", justifyContent: "space-around", flexWrap: "wrap"}}>
        <div style={{display:"flex", flexDirection: "column"}}>
                  {/* Capture Photo Button */}
        <button
          onClick={() => cameraInputRef.current?.click()}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition font-medium"
          style={{marginBottom: "20px"}}
        >
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" 
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" 
            />
          </svg>
          📸 Capture Photo
        </button>
              {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageCapture}
        className="hidden"
      />
        </div>
<div style={{display:"flex", flexDirection: "column"}}>
   {/* Choose File Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition font-medium"
          style={{marginBottom: "20px"}}
        >
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
          📁 Choose File
        </button>
              <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageCapture}
        className="hidden"
      />
</div>
      
      </div>


      {status && (
        <p className="text-sm mb-4 font-medium">{status}</p>
      )}
{/* 
      {image && (
        <div className="w-full max-w-md mb-6">
          <img 
            src={image} 
            alt="preview" 
            className="rounded-lg shadow-md w-full" 
          />
        </div>
      )} */}

      {/* {ocrDebug && (
        <div className="w-full max-w-2xl bg-gray-100 rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-lg font-semibold mb-2">🐛 OCR Debug Output</h2>
          <pre className="text-xs whitespace-pre-wrap bg-white p-3 rounded border overflow-x-auto max-h-64">
            {ocrDebug}
          </pre>
        </div>
      )} */}

      {results.length > 0 && (
        <div className="w-full max-w-lg bg-white rounded-xl shadow-md p-4">
          <h2 className="text-lg font-semibold mb-3">📋 Parsed Ingredients</h2>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">#</th>
                <th className="border p-2 text-left">Ingredient</th>
              </tr>
            </thead>
            <tbody>
              {results.map((ing, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="border p-2">{i + 1}</td>
                  <td className="border p-2">{ing}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}