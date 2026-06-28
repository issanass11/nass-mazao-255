# NASS MAZAO 255 Business Manager

Hii ni Electron Windows desktop app yenye:

- Dashboard ya mtaji, mauzo, matumizi, faida/hasara
- Taarifa za zao moja moja
- Manunuzi, mauzo, stoo, madeni, matumizi
- Kufuta taarifa moja moja
- Format taarifa zote kwa kuanza upya
- Backup kabla ya format na kabla ya update
- Mfumo wa Auto Update kupitia electron-updater
- Data zinahifadhiwa tofauti na files za app ili update zisifute taarifa zako

## Kuitumia kwenye Windows 11

1. Install Node.js LTS kwenye PC yako.
2. Fungua folder hii kwenye VS Code au Command Prompt.
3. Run:

```bash
npm install
npm start
```

## Kutengeneza Installer ya Windows

```bash
npm run dist
```

Installer itapatikana kwenye folder:

```bash
release/
```

## Auto Update

Auto update inatumia GitHub Releases. Badili sehemu hii kwenye `package.json`:

```json
"owner": "issanass11",
"repo": "nass-mazao-255-business-manager"
```

Kisha tengeneza GitHub repository yenye jina hilo, halafu publish release mpya kwa kuongeza version kwenye package.json.

Mfano version mpya:

```json
"version": "1.0.1"
```

Kisha run:

```bash
npm run publish
```

App iliyopo kwenye PC itaweza kuona update mpya kupitia kitufe cha `Angalia Updates`.


## Faili ya ziada

Angalia `GITHUB_UPDATE_GUIDE.md` kwa hatua kamili za kuunganisha GitHub Releases.
