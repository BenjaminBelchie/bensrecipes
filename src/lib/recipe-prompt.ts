export const RECIPE_PROMPT = `Generate a recipe for [RECIPE NAME] and output ONLY markdown in the exact format below. Do not add any commentary, extra sections, or text outside the markdown.

---

# Recipe Title

> One-sentence description — what the dish is, what it tastes like, and when you'd make it.

## Details

| | |
|---|---|
| **Prep Time** | X minutes |
| **Cook Time** | X minutes |
| **Servings** | X |
| **Difficulty** | Easy / Medium / Hard |

## Equipment

- List every piece of kitchen equipment needed (e.g. large saucepan, baking tray, stand mixer).

## Ingredients

<!--
  Simple recipe  → use a single flat bullet list.
  Complex recipe → use ### sub-headings for each component (e.g. ### For the Sponge, ### For the Sauce).
-->

- Ingredient with prep note inline (e.g. "2 cloves garlic, minced", "100g butter, softened")

## Instructions

<!--
  Simple recipe  → use a single numbered list.
  Complex recipe → mirror the ingredient sub-headings (e.g. ### Make the Sponge, ### Make the Sauce).
  If components need to be combined, add a final ### Assemble section.
-->

1. Step one.
2. Step two.

## Storage

- **Fridge:** X days in an airtight container.
- **Freezer:** X months. [How to thaw / reheat.]

---

Rules:
- Use metric measurements (g, ml).
- Write oven temperatures as both °C and °C fan (e.g. 180°C / 160°C fan).
- Keep each instruction step to a single action.
- Do NOT add a Tips, Notes, Nutrition, or any other section.
- Output only the markdown — nothing before or after it.`;
