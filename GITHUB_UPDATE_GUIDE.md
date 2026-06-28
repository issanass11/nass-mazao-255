# Kuunganisha Auto Update na GitHub Releases

App hii tayari imeunganishwa na GitHub Releases kwa repo:

- GitHub owner: `issanass11`
- Repo: `nass-mazao-255-business-manager`

## Hatua za kwanza

1. Fungua GitHub.
2. Tengeneza repository mpya inayoitwa:
   `nass-mazao-255-business-manager`
3. Upload files zote za folder hii kwenye repo hiyo.
4. Hakikisha repository iko Public au GitHub token ina ruhusa ya Releases.

## Kutengeneza installer ya kwanza

Kwenye PC yako, ndani ya folder ya app:

```bash
npm install
npm run dist
```

Installer itatokea kwenye folder `release/`.

## Kupublish update mpya

Kila ukiongeza feature mpya:

1. Badilisha version kwenye `package.json` mfano kutoka `1.0.1` kwenda `1.0.2`.
2. Run:

```bash
npm run publish
```

Au tumia:

```bash
npm run release
```

Baada ya hapo, app ya Windows ikibonyeza **Angalia Updates** itaona update mpya.

## Muhimu kuhusu data

Data za biashara hazikai ndani ya files za app. Zinahifadhiwa kwenye eneo la Windows user data, kwa hiyo update mpya haitafuta taarifa zako.
Pia app inatengeneza backup kabla ya kupakua update.

## Kama update haionekani

Angalia haya:

- Repo jina liwe `nass-mazao-255-business-manager`.
- GitHub username iwe `issanass11` au ubadilishe `owner` kwenye `package.json`.
- Version mpya iwe kubwa kuliko ya zamani.
- Release iwe imewekwa GitHub.
- Internet iwepo.
