import dotenv from "dotenv";
dotenv.config();
import fetch from "node-fetch";
import fs from "fs";
import OpenAI, { toFile } from "openai";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
import FormData from "form-data";
// import path from 'path';

const generateVariation = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res
        .status(400)
        .json({ error: "Image PNG requise (field name = image)" });
    }
    if (file.mimetype !== "image/png") {
      return res.status(400).json({ error: "Le format doit être PNG" });
    }

    const form = new FormData();
    form.append("image", fs.createReadStream(file.path), file.originalname);
    form.append("n", "1");
    form.append("size", "1024x1024");
    form.append("response_format", "url");

    const response = await fetch(
      "https://api.openai.com/v1/images/variations",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          ...form.getHeaders(),
        },
        body: form,
      }
    );

    const data = await response.json();
    fs.unlinkSync(file.path);

    if (!data.data || !data.data[0]?.url) {
      return res
        .status(500)
        .json({ error: "Erreur génération variation", details: data });
    }

    return res.json({ imageUrl: data.data[0].url });
  } catch (err) {
    console.error("❌ generateVariation error:", err);
    return res
      .status(500)
      .json({ error: "Erreur serveur", details: err.message || err });
  }
};

const editGptImage = async (req, res) => {
  const prompt = req.body.prompt;
  const imageFiles = req.files;
  let model = req.body.model;

  if (!model) {
    return res.status(400).json({ error: "Model requis" });
  }
  if (!prompt || !imageFiles || imageFiles.length === 0) {
    return res.status(400).json({ error: "Images et prompt requis" });
  }

  try {
    const images = await Promise.all(
      imageFiles.map(file =>
        toFile(fs.createReadStream(file.path), file.originalname, {
          type: file.mimetype // ex: "image/jpeg", "image/webp", "image/png" "image/jpg"
        })
      )
    );

    const response = await client.images.edit({
      model,
      image: images,
      prompt,
      n: 1,
      size: "1024x1024" // "256x256", "512x512", "1024x1024"
    });

    // Nettoyage des fichiers temporaires
    imageFiles.forEach(file => fs.unlinkSync(file.path));

    const results = response.data.map((img, index) => {
      const base64 = img.b64_json;
      if (!base64) return null;

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `gpt_${timestamp}_${index}.png`;
      const imageUrl = `data:image/png;base64,${base64}`;

      const buffer = Buffer.from(base64, 'base64');
      fs.writeFileSync(`uploads/${filename}`, buffer);

      return {
        url: imageUrl,
        filename
      };
    }).filter(Boolean);

    if (results.length === 0) {
        throw new Error("Aucune image n'a pu être traitée et sauvegardée.");
    }

    return res.json({
      success: true,
      images: results
    });

  } catch (err) {
    // Nettoyage en cas d’erreur
    imageFiles.forEach(file => {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    });

    console.error("❌ editImage error:", err);
    return res.status(500).json({
      error: "Erreur serveur",
      details: err.message || err
    });
  }
};

const editDallE3 = async (req, res) => {
  const { prompt, model, n, size } = req.body;
  
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        error: "Corps de la requête manquant, vide ou non parsé. Assurez-vous que le header 'Content-Type' est 'application/json' et que le corps est un JSON valide."
      });
    }


    if (!prompt) {
      return res.status(400).json({
        error: "Le paramètre 'prompt' est requis"
      });
    }

    if (model !== 'dall-e-3') {
      return res.status(400).json({
        error: "Seul le modèle 'dall-e-3' est supporté pour cet endpoint"
      });
    }

    const response = await client.images.generate({ // Corrigé: utilise .generate pour DALL-E 3
      model,
      prompt,
      n: Math.min(parseInt(n, 10) || 1, 4), // Limite n entre 1 et 4
      size,
      quality: 'standard',
      response_format: 'b64_json'
    });

    if (!response.data || !response.data.length) {
      throw new Error("Aucune image générée par l'API OpenAI.");
    }

    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads', { recursive: true });
    }

    const results = response.data.map((img, index) => {
      const base64 = img.b64_json;
      if (!base64) return null;

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `dalle3_${timestamp}_${index}.png`;
      const imageUrl = `data:image/png;base64,${base64}`;

      const buffer = Buffer.from(base64, 'base64');
      fs.writeFileSync(`uploads/${filename}`, buffer);

      return {
        url: imageUrl,
        filename
      };
    }).filter(Boolean);

    if (results.length === 0) {
        throw new Error("Aucune image n'a pu être traitée et sauvegardée.");
    }

    return res.json({
      success: true,
      images: results
    });

  } catch (error) {
    console.error('❌ editDallE3 error:', error);

    if (error.response) { // Erreur provenant de l'API OpenAI
      return res.status(error.response.status || 500).json({
        error: 'Erreur lors de la génération d\'image via l\'API OpenAI',
        details: error.response.data?.error?.message || error.message
      });
    } else if (error.message.includes("Aucune image générée") || error.message.includes("Aucune image n'a pu être traitée")) {
        return res.status(500).json({
            error: "Erreur lors du traitement de l'image",
            details: error.message
        });
    }

    return res.status(500).json({
      error: 'Erreur serveur interne',
      details: error.message || 'Une erreur inattendue est survenue'
    });
  }
};


export default { editGptImage, generateVariation, editDallE3 };
