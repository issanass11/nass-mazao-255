# Jinsi ya kurekebisha Run Workflow isionekane

Tatizo: folder `.github/workflows` halijapakiwa GitHub, hivyo Actions haina workflow ya ku-run.

## Njia ya haraka GitHub UI
1. Fungua repo: `issanass11/nass-mazao-255`
2. Bonyeza **Add file** → **Create new file**
3. Kwenye jina la file andika: `.github/workflows/build.yml`
4. Copy contents za file `build.yml` kutoka kwenye ZIP hii au tumia template iliyomo hapa chini.
5. Bonyeza **Commit changes**.
6. Fungua tab **Actions** → **Build Windows Installer** → **Run workflow**.

## Muhimu
- Repo owner imewekwa kuwa `issanass11`.
- Repo name imewekwa kuwa `nass-mazao-255`.
- Workflow inaweza kujenga installer bila release kupitia **Run workflow**.
- Auto-update halisi itafanya kazi vizuri ukitengeneza GitHub Release kwa tag kama `v2.0.1`.
