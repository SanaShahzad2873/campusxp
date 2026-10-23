# CampusXP deploy guide (Vercel, free)

Koi database ya API key zaroori nahi. Sirf GitHub + Vercel account chahiye.

## 1. Local mein ek dafa chala kar dekhein
```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build check
```

## 2. GitHub par upload
1. github.com par login, **New repository** -> name `campusxp` -> Create.
2. Is folder mein terminal kholen:
```bash
git init
git add .
git commit -m "CampusXP first version"
git branch -M main
git remote add origin https://github.com/<APNA-USERNAME>/campusxp.git
git push -u origin main
```
(`node_modules` aur `.next` `.gitignore` ki wajah se upload nahi hote, yeh theek hai.)

## 3. Vercel par deploy
1. vercel.com -> **Sign up with GitHub**.
2. **Add New -> Project** -> `campusxp` repo -> **Import**.
3. Framework "Next.js" khud detect hoga. Kuch change na karein -> **Deploy**.
4. 1-2 minute baad link milega: `https://campusxp-xxxx.vercel.app`.

## 4. Update karna
Code badlein, phir `git add . && git commit -m "update" && git push`. Vercel khud dobara deploy kar deta hai.

## 5. Optional features
- **AI Coach**: Vercel -> Project -> Settings -> Environment Variables: `AI_API_KEY` (aur chahein to `AI_BASE_URL`, `AI_MODEL`). Phir Redeploy. Key kabhi code mein na likhein.
- **Server sync**: free Postgres (Neon/Supabase) ka connection string `DATABASE_URL` mein dein, phir ek dafa local se `npx drizzle-kit push`. Iske baghair bhi sab kuch chalta hai.

## Masle
- Build fail ho to local `npm run build` ka error dekhein.
- Purana design nazar aaye to browser mein hard refresh (Ctrl+Shift+R).
