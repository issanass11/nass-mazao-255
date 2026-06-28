# NASS MAZAO 255 Enterprise

Windows desktop app kwa biashara ya mazao: mtaji, manunuzi, mauzo, stoo, matumizi, madeni, backup na auto-update.

## Kutumia local
```bash
npm install
npm start
```

## Kutengeneza Windows installer
```bash
npm install
npm run dist
```
Installer itatokea kwenye folder `release`.

## GitHub Actions
Workflow iko hapa:
`.github/workflows/build.yml`

GitHub: Actions → Build Windows Installer → Run workflow → Artifacts.

## Auto Update
Auto update imewekwa kutumia GitHub Releases:
owner: `issanass11`
repo: `nass-mazao-255`

Ili kutoa update:
1. Badilisha version kwenye `package.json`, mfano `1.0.1`.
2. Push GitHub.
3. Run workflow `Release Windows Installer`.
4. App iliyopo itaweza kuona update kupitia GitHub Releases.

## Data
Data zinahifadhiwa kwenye userData ya Windows, si ndani ya app. Update haitafuta data.
