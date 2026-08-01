import dotenv from "dotenv";
dotenv.config();

/**
 * Service for AI Cat Generation and Battle Commentary via Google Gemini / Heuristic AI fallback
 */
export class AIService {
  /**
   * Generate an AI Cat Bot definition based on prompt or theme
   */
  static async generateCatBot(prompt) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey !== "your_gemini_api_key_here") {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `You are an AI Cat Bot creator for a Battle Arena game. Generate a creative AI Cat Bot JSON matching prompt: "${prompt}".
Return strictly valid JSON with no markdown block, with these fields:
{
  "name": "Creative Cat Name",
  "title": "Cool Title",
  "element": "Tech|Magic|Shadow|Earth|Lightning|Fire|Cyber",
  "avatar": "Cat Emoji like 🤖🐱 or 🐉🐱 or ⚡🐈",
  "hp": number (80-160),
  "attack": number (18-35),
  "defense": number (10-30),
  "speed": number (15-35),
  "specialPower": "Name of ultimate attack",
  "specialDescription": "Short description of what the move does",
  "personality": "Witty 1-sentence personality description"
}`
                    }
                  ]
                }
              ]
            })
          }
        );

        if (response.ok) {
          const data = await response.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          const cleanedText = rawText.replace(/```json|```/g, "").trim();
          return JSON.parse(cleanedText);
        }
      } catch (err) {
        console.warn("Gemini API call failed, using heuristic AI generator fallback:", err.message);
      }
    }

    // Heuristic AI Fallback Cat Generator
    const elements = ["Tech", "Magic", "Shadow", "Earth", "Lightning", "Fire", "Cyber"];
    const emojis = ["🚀🐱", "⚔️🐈", "🔥🐱", "⚡🐈", "🔮🐱", "🦾🐯", "🕶️🐈‍⬛"];
    const element = elements[Math.floor(Math.random() * elements.length)];
    const avatar = emojis[Math.floor(Math.random() * emojis.length)];

    return {
      name: `${prompt ? prompt.substring(0, 12) : "Quantum"} Mew-${Math.floor(Math.random() * 900 + 100)}`,
      title: `Master of ${element} Cat Combat`,
      element: element,
      avatar: avatar,
      hp: Math.floor(Math.random() * 60) + 100,
      attack: Math.floor(Math.random() * 15) + 20,
      defense: Math.floor(Math.random() * 15) + 12,
      speed: Math.floor(Math.random() * 15) + 18,
      specialPower: `${element} Claws Blast`,
      specialDescription: `Unleashes powerful ${element.toLowerCase()} claw strikes dealing massive damage.`,
      personality: `Driven by pure ${element.toLowerCase()} power and intense catnip cravings.`
    };
  }

  /**
   * Generate battle action commentary
   */
  static generateCommentary(attacker, defender, moveName, damage, isCritical, isSpecial, defenderDefeated) {
    const criticalPhrases = [
      "💥 CRITICAL CAT STRIKE! The claws went straight for the eyes!",
      "⚡ DEVASTATING HIT! The arena floors are shaking with meows!",
      "🎯 PERFECT HISS! Direct hit with maximum precision!"
    ];

    const standardPhrases = [
      `😼 ${attacker.name} pounces forward and lands a vicious ${moveName}!`,
      `🐾 ${attacker.name} swiping with high velocity! ${defender.name} takes ${damage} damage!`,
      `🔥 ${attacker.name} executes ${moveName}! Direct hit on ${defender.name}!`
    ];

    const specialPhrases = [
      `🌟 ULTIMATE MOVE ACTIVATED! ${attacker.name} unleashes [${moveName}]!`,
      `✨ UNBELIEVABLE POWER! ${attacker.name} channelled catnip energy into [${moveName}]!`
    ];

    let log = "";
    if (isSpecial) {
      log = specialPhrases[Math.floor(Math.random() * specialPhrases.length)] + ` Dealing ${damage} damage to ${defender.name}!`;
    } else if (isCritical) {
      log = criticalPhrases[Math.floor(Math.random() * criticalPhrases.length)] + ` (${damage} critical damage!)`;
    } else {
      log = standardPhrases[Math.floor(Math.random() * standardPhrases.length)];
    }

    if (defenderDefeated) {
      log += ` 🏆 KNOCKOUT! ${defender.name} has run out of 9 lives and is DEFEATED!`;
    }

    return log;
  }
}
