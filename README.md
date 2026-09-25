# PAU Marketplace

Buy. Sell. Exchange. Connect. — a digital marketplace built exclusively for the
Pan-African University student community, with student stores, a peer-to-peer
Exchange, a "Leaving PAU" graduation-sale section, buyer↔seller chat, and an
admin panel that approves who's allowed to join.

Built with **Next.js 14** (App Router, TypeScript) and **Firebase**
(Authentication, Firestore, Storage).

---

## 1. What you're getting

```
src/app/
  page.tsx                 Home / Shop (browse + search + filter listings)
  sell/                     Create a listing (photo upload, category, price…)
  exchange/                 Peer-to-peer used-item marketplace
  leaving-pau/              Graduation / "leaving PAU" sales, grouped by cohort
  listing/[id]/             Single listing page + "Contact seller"
  store/[userId]/           A seller's public storefront
  messages/, messages/[chatId]/   Buyer↔seller chat inbox and thread
  login/, signup/           Firebase email/password auth
  pending-approval/         Shown to signed-up users awaiting admin approval
  admin/                    Admin-only: overview, user approvals, listing moderation
src/components/             Navbar, ListingCard, FilterBar, route guards…
src/lib/                    firebase.ts, auth-context.tsx, listings.ts, messaging.ts
src/types/                  Shared TypeScript types (Listing, UserProfile, …)
firestore.rules             Security rules — enforce the approval gate server-side
storage.rules                Security rules for uploaded photos
firestore.indexes.json      Composite indexes the queries need
firebase.json                Ties the two rules files + indexes together for the CLI
```

**How approval works:** anyone can sign up, but every new account is created
with `status: "pending"`. Pages that show marketplace content are wrapped in
`<ProtectedRoute>`, which redirects pending users to `/pending-approval`. The
`firestore.rules` file enforces the same rule *on the server*, so it can't be
bypassed by editing the app's code — only an admin (`isAdmin: true` on their
user doc) can flip a user's status to `approved`, from `/admin/users`.

---

## 2. Prerequisites

- [Node.js](https://nodejs.org) 18.18 or newer (check with `node -v`)
- A free [Firebase](https://firebase.google.com) account
- VS Code (or any editor)

---

## 3. Create your Firebase project

1. Go to the [Firebase Console](https://console.firebase.google.com) → **Add
   project** → give it a name (e.g. `pau-marketplace`) → finish the wizard
   (you can disable Google Analytics, you don't need it).

2. **Add a web app**: on the project overview page, click the `</>` icon →
   register an app (any nickname) → Firebase will show you a `firebaseConfig`
   object. Keep this tab open, you'll copy values from it in step 5.

3. **Enable Authentication**:
   - Left sidebar → *Build* → *Authentication* → *Get started*
   - *Sign-in method* tab → enable **Email/Password**.

4. **Enable Firestore**:
   - Left sidebar → *Build* → *Firestore Database* → *Create database*
   - Start in **production mode** (we'll deploy our own rules in step 7) →
     pick a region close to your users (e.g. `eur3` for Europe/Africa) →
     Enable.

5. **Enable Storage** (for listing photos):
   - Left sidebar → *Build* → *Storage* → *Get started* → production mode →
     same region → Done.

---

## 4. Install the project

1. Unzip this project and open the folder in VS Code.
2. Open a terminal in VS Code (`` Ctrl+` ``) and run:

   ```bash
   npm install
   ```

---

## 5. Connect the app to your Firebase project

1. Duplicate `.env.local.example` and rename the copy to `.env.local`.
2. Fill in the values from the `firebaseConfig` object you saw in step 3.2 —
   they map directly:

   ```bash
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=pau-marketplace.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=pau-marketplace
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=pau-marketplace.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
   NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abcdef
   ```

3. Optionally, restrict signup to specific email domain(s) — comma-separate
   multiple if needed:

   ```bash
   NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS=ui.edu.ng,jkuat.ac.ke
   ```

   PAU is a network hosted across several universities (JKUAT Kenya, U. of
   Ibadan Nigeria, U. of Yaoundé II Cameroon, U. of Tlemcen Algeria) with no
   single shared student email domain, so most deployments leave this blank
   and rely on the admin approval step (plus the Student ID field at signup)
   to verify members instead.

---

## 6. Deploy the security rules & indexes

This is the step that actually enforces "only approved PAU members can use
the marketplace" and "only admins can approve users" at the database level.

1. Install the Firebase CLI (one-time, globally):

   ```bash
   npm install -g firebase-tools
   ```

2. Log in and link this folder to your project:

   ```bash
   firebase login
   firebase use --add
   ```
   Pick the project you created in step 3 when prompted, and give it an
   alias like `default`.

3. Deploy the rules and indexes:

   ```bash
   firebase deploy --only firestore:rules,firestore:indexes,storage
   ```

   (Index creation can take a few minutes to finish building in the
   background — Firestore will tell you in the console if a query needs an
   index that isn't ready yet, with a direct link to create it.)

---

## 7. Run it locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

1. Click **Join PAU Marketplace** and sign up with an allowed email.
   You'll land on `/pending-approval` — that's expected, your account isn't
   approved yet.
2. **Make yourself the first admin** (there's no UI for this on purpose — an
   unapproved app has no admins yet, so this one-time step is manual):
   - Firebase Console → Firestore Database → `users` collection → open the
     document with your UID.
   - Edit the fields: set `status` to `"approved"` and `isAdmin` to `true`.
   - Save, then refresh the app — you'll now see an **Admin** link in the
     navbar.
3. From `/admin/users` you can now approve everyone else who signs up, and
   from `/admin/listings` you can remove any listing that breaks the rules.

---

## 8. Deploy it live (optional)

The easiest option is [Vercel](https://vercel.com) (made by the Next.js
team, free tier is enough for this):

1. Push this project to a GitHub repository.
2. On [vercel.com](https://vercel.com), *Add New → Project*, import that repo.
3. In the project's *Environment Variables* settings, add the same variables
   from your `.env.local` file.
4. Deploy. Vercel gives you a live URL immediately, and redeploys
   automatically on every push.

---

## 9. Customizing

- **Categories** — edit the `CATEGORIES` array in `src/types/index.ts`.
- **Colors / branding** — edit `tailwind.config.js` (`forest`, `gold`, `clay`
  colors) and the `PAU Marketplace` name in `src/components/Navbar.tsx` and
  `src/app/layout.tsx`.
- **Currency** — listings default to EUR; change it in `src/app/sell/page.tsx`
  (the `currency: 'EUR'` line) if you'd rather use Naira, USD, etc.
- **Extra fields at signup** (e.g. requiring a Student ID) — see
  `src/app/signup/page.tsx` and the `UserProfile` type.

---

## 10. Troubleshooting

- **"Missing or insufficient permissions" in the browser console** — almost
  always means the Firestore rules haven't been deployed yet, or you're
  testing with a `pending` account. Re-run step 6, and confirm your own user
  doc's `status` is `approved`.
- **A listings page shows nothing / a console error links to an index** —
  click the link Firestore gives you in that error, or re-run
  `firebase deploy --only firestore:indexes` and wait a few minutes.
- **Photo upload fails** — check that Storage is enabled (step 3.5) and that
  `storage.rules` was deployed (step 6).
