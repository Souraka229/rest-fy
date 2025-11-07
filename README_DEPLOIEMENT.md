# 🚀 Guide de Déploiement Restafy

## Prérequis

- Node.js 18+
- Docker & Docker Compose
- Compte Supabase
- Compte Cloudinary
- Compte FedaPay
- Compte Resend (optionnel)

## 1. Configuration Supabase

### Créer un projet Supabase
1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez l'URL et les clés API

### Déployer le schéma
```bash
# Installer Supabase CLI
npm install -g supabase

# Se connecter
supabase login

# Initialiser le projet
supabase init

# Déployer le schéma
supabase db push
