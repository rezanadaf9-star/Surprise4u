# Pink Surprise — Updated Interactive Gift

This version keeps the same single-site + Supabase architecture, but updates the interactions to be more tactile and cinematic.

## Main changes

- Only 4 balloons.
- Balloons have a glossy 3D-style look.
- Tapping a balloon creates 8 flying fragments that scatter in random directions and fade out.
- The balloon message appears at the exact position where that balloon was, without a message card/background.
- Only 3 chocolates.
- Chocolates have a transparent/golden cover that peels away when tapped.
- The opened chocolate moves slightly downward and its message appears at the original chocolate position.
- Gift box starts in the center, opens, moves downward, and the five product cards emerge from the box one-by-one into a single row.
- Product cards use the supplied images.
- Tapping a product opens a large product reveal modal.
- The folded dress changes to `dress.png` after opening it.
- The opening title now says **A Small Gift For You**.
- A clearly marked custom-message section was added to `script.js`.

## Customize your messages

Open `script.js` and find:

```js
const customMessages = {
```

Edit the text inside `balloons`, `chocolates`, `products`, `personal`, and the final hint fields. You do not need to edit the animation code.

## Supabase

The website continues to use `visitor_events` and `visitor_messages` when Supabase is configured in `config.js`.

No camera, microphone, video recording, audio recording, fingerprinting, or hidden surveillance is included.

## Files

- `index.html`
- `style.css`
- `script.js`
- `config.js`
- `supabase-schema.sql`
- `assets/` with the supplied product images


## Creator analytics and editable recipient names

The supplied `creator-admin.html` is now a dark creator command center.

It groups data as:

**Recipient → Visitor → Visit #**

Each visit shows:
- exact timestamped activity timeline
- balloon/chocolate interactions
- gift box opening
- each gift card opened and its item name
- personal-message read status
- whether a reply was sent
- the exact reply text, when sent
- nickname and visit number

Recipient names are stored in `surprise_recipients`, so you can rename `xyz`, `abc`, etc. from the admin dashboard without editing the HTML.

Run both `supabase-schema.sql` and `admin-access.sql`. In `admin-access.sql`, replace `YOUR_ADMIN_EMAIL@example.com` with the exact Supabase Auth email you will use for the creator login.

The public site only reads recipient names and inserts analytics. Visitor analytics remain protected by RLS.

## Favicon, app icon and sharing metadata

A root-level `site-icons/` folder has been added beside `assets/`. It contains the supplied:
- `favicon.ico`
- `favicon-16x16.png`
- `favicon-32x32.png`
- `favicon-48x48.png`
- `apple-touch-icon.png`
- `icon-192.png`
- `icon-512.png`
- `og-image.png`
- `site.webmanifest`

Both `index.html` and `creator-admin.html` include the favicon, Apple/mobile app icon, manifest, theme-color, Microsoft tile, Open Graph sharing, and Twitter card metadata. The admin page is marked `noindex,nofollow,noarchive`.
