/*
  EDIT THIS FILE when you want to add/change friends.
  The URL decides which recipient is shown.

  Example links:
  https://rezanadaf9-star.github.io/Surprise4u/?to=sahela
  https://YOUR-SITE.github.io/YOUR-REPO/?to=abc
*/

window.SURPRISE_CONFIG = {
  creatorName: "Nadaf",

  recipients: {
    sahela: { name: "Sahela" },
    sana: { name: "Sana" },
    saniya: { name: "Saniya" },
    pakeezah: { name: "Pakeezah" },
    kashish: { name: "Kashish" },
    nazrana: { name: "Nazrana" },
    foryou: { name: "For You" },
    sidra: { name: "Sidra" },
    sanam: { name: "Sanam" },
    gunchasanam: { name: "Guncha Sanam" },
    shafaque: { name: "Al Shafaque Fatmi" },
    friend: { name: "Friend" }

  },

  // Supabase is optional. Put your project values here AFTER creating the table.
  // Leave blank while testing locally; the website still works without Supabase.
  supabaseUrl: "https://wgbkjhvgoijyocygjvjc.supabase.co",
  supabaseAnonKey: "sb_publishable_hbhuY7AAxX0AhwPrqDJ_GA_-LqPH-uh",
  enableAnalytics: false,

  // Optional: public Supabase Storage bucket URL ending in /storage/v1/object/public/surprise-assets
  // Leave blank to use the optimized local WebP files in assets/.
  assetBaseUrl: "https://wgbkjhvgoijyocygjvjc.supabase.co/storage/v1/object/public/surprise-assets"
};
