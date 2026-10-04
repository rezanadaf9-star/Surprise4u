# Creator Admin Dashboard

## 1. Create the admin login
In Supabase Dashboard:
Authentication -> Users -> Add user
Create an email/password user for yourself.

## 2. Protect the data
Open `admin-access.sql`.
Replace:

YOUR_ADMIN_EMAIL@example.com

with the exact email of your Supabase Auth user, then run the SQL in Supabase SQL Editor.

Do not add a public SELECT policy and never put a service_role/secret key in the website.

## 3. Publish the admin page
Put these files in the same GitHub Pages folder as the surprise website:

- creator-admin.html
- config.js

Then open:

https://YOUR-USERNAME.github.io/YOUR-REPO/creator-admin.html

Sign in with the Supabase admin email/password.

## 3. Run the updated schema
Run `supabase-schema.sql` first, then `admin-access.sql` in Supabase SQL Editor. Both files are included in this ZIP.

The updated schema also creates `surprise_recipients`, which lets the public links resolve the current recipient name and lets the admin rename recipients.

## What the dashboard shows
- recipient cards and personalized links
- unique anonymous visitors per recipient
- visit count / return visits
- nickname entered
- event counts
- every gift item clicked (dress, shoes, earrings, handbag, perfume)
- messages submitted
- full activity timeline with timestamps and visit numbers

The dashboard does not use IP addresses, browser fingerprinting, camera, microphone, or hidden recording.


## Recipient names

Open the recipient card in the creator dashboard, edit the name, and click **Save name**. The public `?to=...` link keeps the same recipient ID, while the displayed name changes.

Example:
- `?to=abc` can be renamed from `ABC` to `Sana`.
- `?to=gunchasanam` is seeded as `Guncha Sanam` and receives the special personal message in `script.js`.
