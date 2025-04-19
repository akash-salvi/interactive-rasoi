import React from "react";

export const ArrowRight = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

// eslint-disable-next-line react-refresh/only-export-components
export const parseGeminiResponseToRecipe = (
  responseText,
  aiSearchTerm,
  nextRecipeId,
  setAiError
) => {
  try {
    // Attempt to find JSON block (might be wrapped in ```json ... ```)
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    let potentialJson = responseText;
    if (jsonMatch && jsonMatch[1]) {
      potentialJson = jsonMatch[1];
    } else {
      // If no markdown block, look for the first '{' and last '}'
      const firstBrace = responseText.indexOf("{");
      const lastBrace = responseText.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        potentialJson = responseText.substring(firstBrace, lastBrace + 1);
      } else {
        throw new Error("No clear JSON block found in response.");
      }
    }

    const parsed = JSON.parse(potentialJson);

    // **Basic Validation:** Check for essential fields
    if (
      !parsed.title ||
      !parsed.description ||
      !Array.isArray(parsed.ingredients) ||
      !Array.isArray(parsed.instructions)
    ) {
      throw new Error(
        "AI response missing essential recipe fields (title, description, ingredients, instructions)."
      );
    }
    // Validate ingredient structure (basic check)
    if (parsed.ingredients.length > 0 && typeof parsed.ingredients[0].name === "undefined") {
      throw new Error("AI ingredients format seems incorrect.");
    }
    // Validate instruction structure (basic check) - expect {text: string, estimatedTime?: number}
    if (
      parsed.instructions.length > 0 &&
      (typeof parsed.instructions[0] !== "object" ||
        typeof parsed.instructions[0].text === "undefined")
    ) {
      // Try simple string array if object fails
      if (typeof parsed.instructions[0] === "string") {
        parsed.instructions = parsed.instructions.map((text) => ({ text })); // Convert string array to object array
      } else {
        throw new Error("AI instructions format seems incorrect.");
      }
    } else if (parsed.instructions.length > 0 && typeof parsed.instructions[0] === "object") {
      // Ensure text exists, add estimatedTime if missing
      parsed.instructions = parsed.instructions.map((inst) => ({
        text: inst.text || "Missing instruction text",
        estimatedTime: typeof inst.estimatedTime === "number" ? inst.estimatedTime : undefined,
      }));
    }

    // Add default/missing fields if needed by the app structure
    const recipeObject = {
      title: parsed.title,
      description: parsed.description,
      image: parsed.image || "", // Use placeholder if AI doesn't provide
      prepTime: parsed.prepTime || "N/A",
      cookTime: parsed.cookTime || "N/A",
      totalTime: parsed.totalTime || "N/A",
      servings: parsed.servings || 2,
      rating: parsed.rating || 4.0, // Default rating
      difficulty: parsed.difficulty || "Medium", // Default difficulty
      tags: parsed.tags || ["AI Generated", aiSearchTerm.split(" ")[0]],
      ingredients: parsed.ingredients.map((ing) => ({
        // Ensure basic ingredient structure
        quantity: ing.quantity || 0,
        unit: ing.unit || "",
        name: ing.name || "Unknown Ingredient",
      })),
      instructions: parsed.instructions, // Already validated/formatted above
      id: nextRecipeId.current++, // Assign new ID
      recipeType: "AI Generated",
    };

    return recipeObject;
  } catch (error) {
    console.error("Error parsing AI response:", error);
    console.error("Raw AI response text:", responseText);
    setAiError(`Failed to understand AI response format. ${error.message}`);
    return null; // Indicate parsing failure
  }
};
