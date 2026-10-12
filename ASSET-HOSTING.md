# Product image hosting and performance

The product images have been recolored (dress) and converted to optimized WebP. They now total about 0.9 MB instead of roughly 5 MB of original PNG product images. WebP is supported by current Safari, Chrome, Firefox, and mobile browsers.

## Default setup (works immediately)

Leave `assetBaseUrl: ""` in `config.js`. The website loads images from the local `assets/` folder, which is the simplest option for GitHub Pages and avoids an extra network dependency.

## Optional Supabase Storage setup

The previous Supabase project credentials were removed from `config.js` because the project was deleted. I cannot upload these images to a new Supabase project until you create one and have its storage URL available.

1. Create a new Supabase project.
2. Open **Storage** and create a bucket named `surprise-assets`.
3. Set the bucket to **Public** if these gift images are intended to be visible to anyone with the website link.
4. Upload all six `.webp` files from this `assets/` folder directly into the bucket root (do not upload the old PNGs).
5. In the bucket's public URL, use the base URL format below, replacing `YOUR_PROJECT_REF` with the new project's reference:

   `https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/surprise-assets`

6. Paste that URL into `assetBaseUrl` in `config.js`, for example:

   `assetBaseUrl: "https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/surprise-assets"`

7. Save and redeploy the website. The JavaScript automatically uses the remote images for both gift cards and the larger image reveal.

## Will Supabase make images faster?

Not automatically. Supabase Storage can serve cached public assets, but moving files to another host does not guarantee faster loading. The largest improvement here is the WebP conversion and size reduction. Keep the local WebP assets as a fallback. If using Storage, upload the files before setting `assetBaseUrl`; otherwise the images will return 404 errors.

## Analytics / replies

`supabaseUrl`, `supabaseAnonKey`, and `enableAnalytics` are intentionally blank/off in `config.js` because the old project was deleted. To restore saved replies and analytics, create a new project, run `supabase-schema.sql` and `admin-access.sql` as described in `README.md`, and configure the new project's credentials. Do not put a Supabase service-role key in frontend code.
