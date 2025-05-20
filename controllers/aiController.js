import dotenv from 'dotenv';
dotenv.config();
import fetch from "node-fetch";
import fs from "fs";
import OpenAI, { toFile } from "openai";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
import FormData from 'form-data';
// import path from 'path';

const generateVariation = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'Image PNG requise (field name = image)' });
    }
    if (file.mimetype !== 'image/png') {
      return res.status(400).json({ error: 'Le format doit être PNG' });
    }

    const form = new FormData();
    form.append('image', fs.createReadStream(file.path), file.originalname);
    form.append('n', '1');
    form.append('size', '1024x1024');
    form.append('response_format', 'url');

    const response = await fetch('https://api.openai.com/v1/images/variations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        ...form.getHeaders()
      },
      body: form
    });

    const data = await response.json();
    fs.unlinkSync(file.path);

    if (!data.data || !data.data[0]?.url) {
      return res.status(500).json({ error: 'Erreur génération variation', details: data });
    }

    return res.json({ imageUrl: data.data[0].url });
  } catch (err) {
    console.error('❌ generateVariation error:', err);
    return res.status(500).json({ error: 'Erreur serveur', details: err.message || err });
  }
};

const editImage = async (req, res) => {
  const prompt = req.body.prompt;
  const imageFile = req.file;
  
  if (!prompt || !imageFile) {
    return res.status(400).json({ error: 'Image et prompt requis' });
  }
  
  try {
    const image = await toFile(fs.createReadStream(imageFile.path), imageFile.originalname, {
      type: "image/png",
    });
  
    const response = await client.images.edit({
      model: "gpt-image-1",
      image,
      prompt,
    });
  
    fs.unlinkSync(imageFile.path);

    // Save image to disk
    // const imageBuffer = Buffer.from(response.data[0].buffer, 'base64');
    // const imagePath = path.join(__dirname, 'uploads', response.data[0].filename);
    // fs.writeFileSync(imagePath, imageBuffer);
  
    if (!response.data?.[0]?.url) {
      return res.status(500).json({ error: 'Erreur OpenAI', details: response });
    }
    res.json({ imageUrl: response.data[0].url, image: response.data[0] });
  } catch (err) {
    fs.unlinkSync(imageFile.path);
    console.error('❌ editImage error:', err);
    res.status(500).json({ error: 'Erreur serveur', details: err.message || err });
  }
};

export default { editImage, generateVariation };
