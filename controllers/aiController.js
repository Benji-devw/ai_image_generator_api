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

const editImage = async (req, res) => {
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

    const base64 = response.data[0].b64_json;
    const imageUrl = `data:image/png;base64,${base64}`;

    // Save to /uploads
    const buffer = Buffer.from(base64, "base64");
    fs.writeFileSync("uploads/edited_image.png", buffer);

    return res.json({ imageUrl });

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


export default { editImage, generateVariation };
