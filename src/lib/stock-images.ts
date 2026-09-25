/**
 * Stock photography used in place of emoji across the site (category rail,
 * promo tiles). All from Unsplash (free to use under the Unsplash License —
 * https://unsplash.com/license). Swap any of these for real photos of PAU
 * students, stores, or campus life whenever you have them — that will look
 * better than stock photos and is worth doing before launch.
 *
 * `unsplash(id)` builds a right-sized, compressed URL from a photo's ID
 * (the part of the images.unsplash.com URL after "photo-").
 */
/**
 * Stock photography used in place of emoji across the site.
 * Replace with real PAU photos before launch if available.
 */

function unsplash(id: string, w = 400) {
  return `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;
}

export const CATEGORY_IMAGES: Record<string, string> = {
  'Fashion & Clothing': unsplash('1483985988355-763728e1935b'),
  'Shoes & Bags': unsplash('1542291026-7eec264c27ff'),
  'Cosmetics & Beauty': unsplash('1522335789203-aabd1fc54bc9'),
  'Food & Snacks': unsplash('1504674900247-0877df9cc836'),
  Electronics: unsplash('1518770660439-4636190af475'),
  'Phone Accessories': unsplash('1511707171634-5f897ff02aa9'),
  'Books & Academic Materials': unsplash('1491841550275-ad7854e35ca6'),
  'Printing & Design Services': unsplash('1516321318423-f06f85e504b3'),
  'Hair & Barbing Services': unsplash('1621605815971-fbc98d665033'),
  Photography: unsplash('1452587925148-ce544e77e70d'),
  'Digital Services': unsplash('1498050108023-c5249f4df085'),
  'Handmade Products': unsplash('1513495972909-fc0d3027d7e2'),
  Furniture: unsplash('1505693416388-ac5ce068fe85'),
  'Kitchen & Appliances': unsplash('1556910103-1c02745aae4d'),
  'Housing & Accommodation': unsplash('1560448204-603b3fc33ddc'),
  'Jobs & Gigs': unsplash('1454165804606-c3d57bc86b40'),
  Other: unsplash('1500530855697-b586d89ba3ee'),
};

export const PROMO_IMAGES = {
  leavingPau: unsplash('1560448204-603b3fc33ddc', 900),
  store: unsplash('1483985988355-763728e1935b', 700),
  exchange: unsplash('1556740749-887f6717d7e4', 700),
};

export const DEFAULT_CATEGORY_IMAGE =
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400&q=80&auto=format&fit=crop';