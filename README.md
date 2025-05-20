# Vallena AI API

API RESTful pour la génération et l'édition d'images via l'intelligence artificielle (OpenAI DALL-E / GPT-Image).

## 🚀 Installation

```bash
# Cloner le repository
git clone https://github.com/Benji-devw/vallena_ai_api.git
cd vallena_ai_api

# Installer les dépendances
pnpm install
```

## 📦 Env

Créer un fichier `.env` à la racine du projet et ajoutez-y la clé API OpenAI :

```bash
OPENAI_API_KEY=sk-proj-...
```

## 📦 Endpoints

### POST `/api/ai/generate-variation`
Génère une variation d'une image PNG fournie.

- **Body (multipart/form-data)** :
  - `image`: fichier PNG

- **Réponse**
```json
{
  "imageUrl": "https://.../generated.png"
}
```

### POST `/api/ai/edit-image`
Édite une image PNG selon un prompt textuel (inpainting, composition, etc).

- **Body (multipart/form-data)** :
  - `image`: fichier PNG
  - `prompt`: texte décrivant l'édition ou la composition souhaitée

- **Réponse**
```json
{
  "imageUrl": "https://.../edited.png"
}
```

## 📦 Exemple de requête (curl)

```bash
curl -X POST http://localhost:8806/api/ai/edit-image \
  -F "image=@/chemin/vers/image.png" \
  -F "prompt=Créer un panier cadeau relaxant avec tous les produits visibles sur la photo."
```

## 📦 Fonctionnalités
- Génération de variations d'images
- Édition d'images par prompt
- Retourne une URL publique de l'image générée

## 🛡️ Sécurité
- Requiert une clé API OpenAI dans le backend (`.env` : `OPENAI_API_KEY`)

## 📦 Dépendances principales
- `openai`
- `express`, `multer`
- `node-fetch`, `form-data`

## 👤 Auteur

### [navart.dev](https://navart.dev)

