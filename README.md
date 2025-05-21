# Vallena AI API

API RESTful pour la génération et l'édition d'images via l'intelligence artificielle (OpenAI DALL-E / GPT-Image).

## 📦 Fonctionnalités

- Génération de variations d'images
- Édition d'images par prompt
- Retourne une URL publique de l'image générée

## 🚀 Installation

```bash
# Cloner le repository
git clone https://github.com/Benji-devw/ai_image_generator_api.git
cd ai_image_generator_api

# Installer les dépendances
pnpm install

# Lancer le serveur
pnpm run start
```

### Variables d'environnement

Créer un fichier `.env` à la racine du projet et ajoutez-y la clé API OpenAI :

```bash
OPENAI_API_KEY=sk-proj-...
```

# 🚀 Usage

### Modèles d'IA pour la génération d'images

# 🖼️ DALL·E 2

### - 📦 Endpoints

```bash
POST /api/ai/generate-variation
POST /api/ai/edit-image
```

### - Génération de variations

```javascript
{
  image: <File>,      // Fichier image (PNG, < 4MB, carré)
  n: 1,              // Nombre de variations (1-10, défaut: 1)
  size: "1024x1024",  // Taille de sortie (256x256, 512x512, 1024x1024)
  response_format: "url"
}
```

**Réponse** :

```json
{
  "imageUrl": "https://.../generated_image.png"
}
```

### Tarification

| Résolution | Prix               |
| ---------- | ------------------ |
| 256×256    | ~0,016 $ par image |
| 512×512    | ~0,018 $ par image |
| 1024×1024  | ~0,020 $ par image |

> 💡 Idéal pour des tests ou des prototypes à faible coût.

### 🟦 1. dall-e-2 (variations)

| Paramètre         | Type      | Obligatoire  | Description                                             |
| ----------------- | --------- | ------------ | ------------------------------------------------------- |
| `image`           | image/png | ✅ Oui       | image carrée, < 4MB                                     |
| `n`               | int       | ❌ Optionnel | nombre d'images à générer (1-10)                        |
| `size`            | string    | ❌ Optionnel | `256x256`, `512x512`, `1024x1024` (défaut: `1024x1024`) |
| `response_format` | string    | ❌ Optionnel | `url` ou `b64_json` (défaut: `url`)                     |

# 🖼️ DALL·E 3

### - 📦 Endpoints

```bash
POST /api/ai/dalle-edit
```

### - Génération d'image

```json
{
  "prompt": "Generate a realistic photo of ...",
  "model": "dall-e-3",
  "n": 1,
  "size": "1024x1024"
}
```

**Réponse** :

```json
{
  "success": true,
  "images": [
    {
      "url": "data:image/png;base64,...",
      "filename": "dalle3_2025-05-21T14-26-59-271Z_0.png"
    }
  ]
}
```

### Tarification

- **Standard**
  - 1024×1024 : 0,040 $ par image
  - 1024×1792 ou 1792×1024 : 0,080 $ par image

> 💡 Offre une qualité supérieure, adaptée aux besoins professionnels.

🟨 2. dall-e-3 (génération uniquement)
| Paramètre | Type | Obligatoire | Description |
|-----------|------|-------------|-------------|
| `prompt` | string | ✅ Oui | max 4000 caractères |
| `n` | int | ❌ Optionnel | toujours 1 (pas encore multi-image) |
| `size` | string | ❌ Optionnel | `1024x1024`, `1792x1024`, `1024x1792` (défaut: `1024x1024`) |
| `style` | string | ❌ Optionnel | `vivid` ou `natural` (défaut: `vivid`) |
| `response_format` | string | ❌ Optionnel | `url` ou `b64_json` (défaut: `url`) |

> ❌ Pas de variations, pas d'edit avec dall-e-3 (au 2025-05)

# 🧠 GPT-Image-1 (via API)

### - 📦 Endpoints

```bash
POST /api/ai/edit-image
```

### - Édition avancée

```javascript
{
  model: "gpt-image-1",  // Modèle à utiliser (requis)
  prompt: "texte",    // Description détaillée (max 32 000 caractères)
  image: [<File>],    // Tableau de 1 à 16 images
  mask: <File>,       // Fichier masque (optionnel)
  background: "auto", // "auto", "transparent" ou "opaque"
  n: 1,              // Nombre de résultats
  size: "1024x1024"   // Taille de sortie
}
```

**Réponse** :

```json
{
  "imageUrl": "data:image/png;base64,..."
}
```

### Tarification basée sur les tokens

- Entrée texte : 5 $ par million de tokens
- Entrée image : 10 $ par million de tokens
- Sortie image : 40 $ par million de tokens

### Équivalence approximative

- Qualité basse (1024×1024) : ~0,01 $ par image
- Qualité moyenne (1024×1024) : ~0,04 $ par image
- Qualité élevée (1024×1024) : ~0,17 $ par image

> 💡 Convient aux cas d'utilisation avancés nécessitant une compréhension contextuelle approfondie.

### ⚖️ Comparatif rapide

| Modèle      | Prix min. | Prix max. | Points forts                            |
| ----------- | --------- | --------- | --------------------------------------- |
| DALL·E 2    | 0,016 $   | 0,020 $   | Économique, idéal pour les tests        |
| DALL·E 3    | 0,040 $   | 0,120 $   | Qualité supérieure, usage professionnel |
| GPT-Image-1 | 0,01 $    | 0,17 $    | Compréhension contextuelle, flexible    |

### 🟩 3. gpt-image-1 (edits + multi-image prompt)

| Paramètre    | Type                           | Obligatoire  | Description                                         |
| ------------ | ------------------------------ | ------------ | --------------------------------------------------- |
| `prompt`     | string                         | ✅ Oui       | max 32 000 caractères                               |
| `image`      | File[] (jpg, png, webp < 25MB) | ✅ Oui       | jusqu'à 16 images                                   |
| `background` | string                         | ❌ Optionnel | `auto`, `transparent`, ou `opaque` (défaut: `auto`) |
| `mask`       | image/png                      | ❌ Optionnel | zones transparentes → zone à modifier               |
| `n`          | int                            | ❌ Optionnel | nombre d'images générées                            |
| `size`       | string                         | ❌ Optionnel | uniquement `1024x1024` actuellement                 |

## 📝 Conclusion

- **DALL·E 2** : Parfait pour des expérimentations à faible coût.
- **DALL·E 3** : Recommandé pour des visuels de haute qualité nécessitant une précision accrue.
- **GPT-Image-1** : Idéal pour des applications avancées où la compréhension du contexte est essentielle.

### Résumé

- `response_format: "url"` : évite de gérer les fichiers base64
- Champs obligatoires : `image`, `prompt`
- `mask` est optionnel
- `gpt-image-1` nécessite une vérification d'organisation

> Prêt à être intégré dans votre application sans nécessiter d'intervention manuelle.

## 🛡️ Sécurité

- Requiert une clé API OpenAI dans le backend (`.env` : `OPENAI_API_KEY`)

## 📦 Dépendances principales

- `openai`
- `express`, `multer`
- `form-data`

## 👤 Auteur

### [navart.dev](https://navart.dev)
