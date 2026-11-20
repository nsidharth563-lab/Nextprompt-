# NextPrompt — iOS & Android app

Expo SDK 58 + Expo Router. The app talks to the NextPrompt web app's API (`../web`), so deploy that first.

```
src/app/                  screens (Expo Router)
  _layout.tsx             root stack, dark theme, splash, first-launch onboarding
  onboarding.tsx          3-slide welcome + Terms/Privacy consent
  (tabs)/index.tsx        Create: photo / video / camera / link → prompts
  (tabs)/detect.tsx       Detect: website / App Store / Play link → AI verdict
  (tabs)/history.tsx      saved results (on-device only)
  (tabs)/settings.tsx     rate, support, privacy, terms, clear history
  result/[id].tsx         full result with copy / share / report
src/components/           UI kit, result views, report button
src/lib/                  API client, frame extraction, storage, config
store/                    listing text, screenshots, feature graphic (see store/LISTING.md)
```

## Run it on your phone (development)

```bash
cd web && npm install && npm run dev           # API on http://localhost:3000 (needs ANTHROPIC_API_KEY)
cd mobile && npm install
cp .env.example .env                            # set EXPO_PUBLIC_API_URL=http://<your-computer-LAN-IP>:3000
npx expo start                                  # scan the QR code with the Expo Go app
```

## Publish to the App Store and Google Play

You need: an **Apple Developer** account ($99/year), a **Google Play Console** account ($25 one-time) and a free
**Expo** account.

1. **Deploy the web app** (e.g. Vercel) with `ANTHROPIC_API_KEY` set. Check `https://<your-domain>/privacy` loads.
2. **Point the app at it:** in `eas.json`, replace every `https://YOUR-NEXTPROMPT-DOMAIN` with your domain and set
   `EXPO_PUBLIC_SUPPORT_EMAIL` to your support address.
3. **Check the app IDs:** `com.nextprompt.app` is set as the iOS bundle identifier and Android package in `app.json`.
   If it's taken, change both (for example `com.yourname.nextprompt`). They can't change after the first release.
4. **Link the project to Expo:**
   ```bash
   npx eas-cli@latest login
   npx eas-cli@latest init          # adds your projectId to app.json
   ```
5. **Test builds first** (optional but recommended):
   ```bash
   npx eas-cli@latest build -p android --profile preview   # installable .apk
   npx eas-cli@latest build -p ios --profile production    # then: eas submit -p ios → TestFlight
   ```
6. **Production builds** (EAS creates and stores signing certificates and keys for you):
   ```bash
   npx eas-cli@latest build -p ios --profile production
   npx eas-cli@latest build -p android --profile production   # .aab for Play
   ```
7. **Create the store entries** and fill them in from `store/LISTING.md` (texts, privacy answers, screenshots).
   - App Store Connect → My Apps → + New App (name *NextPrompt: AI Prompt Maker*, bundle ID from step 3).
   - Play Console → Create app (*NextPrompt: AI Prompt Maker*). Upload the **first** `.aab` by hand in Play Console;
     later builds can be sent with `eas submit`.
8. **Submit:**
   ```bash
   npx eas-cli@latest submit -p ios --latest
   npx eas-cli@latest submit -p android --latest   # goes to the internal track as a draft (see eas.json)
   ```
   Then send the iOS build for review in App Store Connect and promote the Android release in Play Console.

Version numbers: bump `version` in `app.json` for each store release. Build numbers increase automatically
(`autoIncrement` + `appVersionSource: remote` in `eas.json`).

## Checks

```bash
npx tsc --noEmit && npx expo lint
npx expo-doctor        # needs internet access to Expo's servers
```
