# Quran One

Holy Quran App - 114 Surahs with Audio and Synchronized Reading.

## Project Structure

```
quran-project/
├── www/                  <- All web app files (HTML, JSON, images, audio)
├── package.json
├── capacitor.config.json
└── .github/workflows/build-apk.yml
```

## Push to GitHub (from Termux)

```bash
cd quran-project
git init
git add .
git commit -m "Initial commit with Capacitor + GitHub Actions"
git branch -M main
git remote add origin https://github.com/onetechdev/Quran-one.git
git push -u origin main
```

If prompted for login, use a GitHub Personal Access Token (not your password).

## Build APK

After pushing, go to:
```
https://github.com/onetechdev/Quran-one/actions
```

The workflow runs automatically. Once finished, download the APK
from the **Artifacts** section of the workflow run (app-debug-apk.zip).

## Local build (optional, requires Node + Android SDK)

```bash
npm install
npx cap add android
npx cap sync android
cd android
./gradlew assembleDebug
```

APK output: `android/app/build/outputs/apk/debug/app-debug.apk`
