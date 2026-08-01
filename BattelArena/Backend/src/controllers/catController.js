import { store } from "../store/memoryStore.js";
import { AIService } from "../services/aiService.js";

export const getAllCats = (req, res) => {
  try {
    const cats = store.getAllCats();
    res.json({
      success: true,
      count: cats.length,
      data: cats
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCatById = (req, res) => {
  try {
    const cat = store.getCatById(req.params.id);
    if (!cat) {
      return res.status(404).json({ success: false, message: "Cat Bot not found" });
    }
    res.json({ success: true, data: cat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCat = (req, res) => {
  try {
    const { name, title, element, avatar, hp, attack, defense, speed, specialPower, specialDescription, personality } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: "Cat name is required" });
    }

    const newCat = store.addCat({
      name,
      title,
      element,
      avatar,
      hp: Number(hp) || 100,
      attack: Number(attack) || 20,
      defense: Number(defense) || 15,
      speed: Number(speed) || 20,
      specialPower,
      specialDescription,
      personality
    });

    res.status(201).json({ success: true, message: "Cat Bot created successfully!", data: newCat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateAICat = async (req, res) => {
  try {
    const { prompt } = req.body;
    const aiCatData = await AIService.generateCatBot(prompt || "Futuristic Cyber Meow Warrior");
    const createdCat = store.addCat(aiCatData);

    res.status(201).json({
      success: true,
      message: "AI Cat Bot generated and summoned to Arena!",
      data: createdCat
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
