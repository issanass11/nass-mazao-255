# NASS MAZAO 255 Business Manager

Toleo hili ni production foundation ya Windows desktop app.

## Iliyoongezwa
- Electron desktop app kwa Windows 11
- SQLite local database
- Database migrations kwa updates zijazo bila kufuta data
- Auto update kupitia GitHub Releases
- Backup kabla ya update na kabla ya format
- CRUD: Mtaji, Manunuzi, Mauzo, Stoo, Matumizi, Madeni, Mazao
- Dashboard ya faida/hasara na Financial Discipline Score
- Audit log ya mabadiliko
- GitHub Actions workflow ya kutengeneza installer

## Kuanza kwenye PC
```bash
npm install
npm start
```

## Kutengeneza installer
```bash
npm run dist
```

Installer itatokea kwenye folder `release`.

## Kutoa update mpya
```bash
npm version patch
git push
git push --tags
```
Kisha workflow ya GitHub itajenga release.

## Repo config
Package imeunganishwa na:
- GitHub owner: `issanass`
- Repo: `nass-mazao-255`
- Visibility: private

Kwa private repo, hakikisha GitHub Actions ina secret inayoitwa `GH_TOKEN` yenye ruhusa ya repo/workflow.
