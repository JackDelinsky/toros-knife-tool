import { BRAND_IMAGE_PATHS, productFlatImage } from "@/lib/image-paths";
import type { Product } from "@/types/product";

/** Defaults applied to every product until checkout URLs are wired */
function withDefaults(
  product: Omit<Product, "images" | "spinImages" | "customAvailable" | "checkoutUrl"> &
    Partial<Pick<Product, "images" | "spinImages" | "customAvailable" | "checkoutUrl">>,
): Product {
  const slug = product.slug;
  return {
    images: [productFlatImage(slug)],
    spinImages: [],
    customAvailable: false,
    checkoutUrl: "",
    ...product,
  };
}

export const products: Product[] = [
  withDefaults({
    id: "bos-deri",
    name: "BOS Deri",
    slug: "bos-deri",
    category: "fixed-blades",
    price: 135,
    shortDescription:
      "Leather-stitched metal handle with a slicey blade profile for precise work.",
    longDescription:
      "The Deri stands out with leather stitched straight through the metal handle for a look and feel that's hard to replicate. Lightweight and clean, it's built with a slicey blade profile for precise work, and finished with a lanyard hole for easy carry.",
    steel: "N690 Steel",
    handleMaterial: "Leather",
    bladeLength: "3 3/4\"",
    totalLength: "7 3/4\"",
    weight: "3.1 oz knife, 4.5 oz with sheath",
    sheath: "Leather",
    madeIn: "Türkiye",
    warranty: "Limited Lifetime Warranty",
    craftsmanshipBlurb:
      "The BOS Deri stands out with a stitched leather handle wrapped through the metal body, giving it a rugged handmade look that is difficult to replicate. Lightweight, clean, and field-ready, it uses a slicey blade profile for precise everyday work and compact carry.",
    specRows: [
      { label: "Knife Type", value: "Fixed blade" },
      { label: "Blade Material", value: "N690 Steel" },
      { label: "Handle Material", value: "Leather" },
      { label: "Blade Length", value: "3 3/4\"" },
      { label: "Overall Length", value: "7 3/4\"" },
      { label: "Weight", value: "3.1 oz knife, 4.5 oz with sheath" },
      { label: "Sheath", value: "Leather" },
      { label: "Made In", value: "Türkiye" },
      { label: "Warranty", value: "Limited Lifetime Warranty" },
    ],
    bestUses: ["EDC", "Camping", "Detail work"],
    inStock: true,
    featured: false,
    tags: ["bos", "fixed-blade", "leather"],
    craftsmanshipStory:
      "Handmade in Türkiye by BOS bladesmiths near Uludağ Mountain, with rugged landscape reflected in both form and function.",
    careInstructions:
      "Hand wash and dry immediately. Oil the blade after use. Keep leather dry and conditioned.",
  }),
  withDefaults({
    id: "bos-recurve-survivor",
    name: "BOS Recurve Survivor",
    slug: "bos-recurve-survivor",
    category: "fixed-blades",
    price: 140,
    shortDescription:
      "Larger micarta handle and recurve profile built for a solid grip and real use.",
    longDescription:
      "Built for a solid grip and real use, the Recurve Survivor features a larger handle that fits comfortably in any hand. Made by a bladesmith based near Uludağ Mountain in Bursa, it reflects that rugged landscape in both form and function, finished with a standout mosaic pin.",
    steel: "N690 Steel",
    handleMaterial: "Paper Micarta",
    bladeLength: "5 ⅛ in",
    totalLength: "9 ¾ in",
    bestUses: ["Camping", "Bushcraft", "Hunting"],
    inStock: true,
    featured: true,
    tags: ["bos", "fixed-blade", "featured"],
    craftsmanshipStory:
      "Forged in Bursa near Uludağ Mountain. Each Recurve Survivor carries the character of its highland origin.",
    careInstructions:
      "Hand wash and dry immediately. Oil carbon-touch areas as needed. Micarta handles require minimal care.",
  }),
  withDefaults({
    id: "bos-stag-frontier",
    name: "BOS Stag Frontier",
    slug: "bos-stag-frontier",
    category: "fixed-blades",
    price: 185,
    shortDescription:
      "Traditional stag handle with a polished, classic fixed-blade profile.",
    longDescription:
      "The Frontier carries a clean, polished look with a traditional stag handle and aesthetic design. A lanyard hole adds versatility, while the overall build keeps it ready for both display and use.",
    steel: "N690 Steel",
    handleMaterial: "Antler",
    bladeLength: "5 ⅛ in",
    totalLength: "9 ⅜ in",
    bestUses: ["Hunting", "Collecting", "Camping"],
    inStock: true,
    featured: true,
    tags: ["bos", "fixed-blade", "stag"],
    craftsmanshipStory:
      "Traditional Turkish fixed-blade craft paired with natural antler selected for grain and character.",
    careInstructions:
      "Hand wash and dry the blade. Avoid prolonged moisture on antler. Oil blade regularly.",
  }),
  withDefaults({
    id: "bos-stag-golden-horn",
    name: "BOS Stag Golden Horn",
    slug: "bos-stag-golden-horn",
    category: "fixed-blades",
    price: 190,
    shortDescription:
      "Classic antler handle with brass bolster, refined and ready to work.",
    longDescription:
      "An elegant take on a working knife, the Golden Horn pairs a classic antler handle with a brass bolster for a refined feel. Its blade shape is functional and built to perform.",
    steel: "N690 Steel",
    handleMaterial: "Antler and brass bolster",
    bladeLength: "4 ⅞ in",
    totalLength: "9 ⅝ in",
    bestUses: ["Hunting", "Collecting", "Gifting"],
    inStock: true,
    featured: true,
    tags: ["bos", "fixed-blade", "stag"],
    craftsmanshipStory:
      "Brass bolsters and hand-selected antler on a full-performance fixed blade.",
    careInstructions:
      "Hand wash and dry. Polish brass lightly. Oil blade after use.",
  }),
  withDefaults({
    id: "bos-tera",
    name: "BOS Tera",
    slug: "bos-tera",
    category: "fixed-blades",
    price: 130,
    shortDescription:
      "Ergonomic micarta handle with a secure sheath for everyday carry.",
    longDescription:
      "The Tera is all about balance and control. With an ergonomic handle, secure lanyard hole, and a tight-fitting sheath, it's a reliable blade you'll reach for again and again.",
    steel: "N690 Steel",
    handleMaterial: "Paper Micarta",
    bladeLength: "4 3/16 in",
    totalLength: "8 ½ in",
    bestUses: ["EDC", "Camping", "Bushcraft"],
    inStock: true,
    featured: false,
    tags: ["bos", "fixed-blade"],
    craftsmanshipStory:
      "Balanced Turkish fixed-blade design built for control and repeat use in the field.",
    careInstructions: "Hand wash and dry. Oil blade after use in wet conditions.",
  }),
  withDefaults({
    id: "bos-zirve",
    name: "BOS Zirve",
    slug: "bos-zirve",
    category: "fixed-blades",
    price: 145,
    shortDescription:
      "Drop-point blade with finger guard, mosaic pin, and locking sheath.",
    longDescription:
      "Sleek and well-balanced, the Zirve features a drop point blade, finger guard, and mosaic pin for added character. Paired with a secure locking sheath, it's built for confidence and ease on the move.",
    steel: "N690 Steel",
    handleMaterial: "White and gray paper micarta",
    bladeLength: "4 7/16 in",
    totalLength: "8 ⅞ in",
    bestUses: ["Camping", "Hunting", "EDC"],
    inStock: true,
    featured: false,
    tags: ["bos", "fixed-blade"],
    craftsmanshipStory:
      "Mosaic pin detailing and a secure leather sheath, built for the field.",
    careInstructions: "Hand wash and dry. Oil blade after use.",
  }),
  withDefaults({
    id: "gur-mizrak",
    name: "GUR Mızrak",
    slug: "gur-mizrak",
    category: "custom-knives",
    price: 225,
    shortDescription:
      "Traditional walnut-handled fixed blade with a clean, refined profile.",
    longDescription:
      "With a clean, straightforward design, the Mızrak stands out as both traditional and refined. The walnut handle showcases natural grain, separated from the blade by a distinct black spacer that adds contrast and definition.",
    steel: "1075 Carbon Steel",
    handleMaterial: "Turkish Walnut",
    bladeLength: "3 ¾ in",
    totalLength: "8 5/16 in",
    bestUses: ["Hunting", "Camping", "Collecting"],
    inStock: true,
    featured: false,
    tags: ["gur", "custom", "walnut"],
    craftsmanshipStory:
      "GUR series blades from Turkish makers: walnut, carbon steel, and timeless profiles.",
    careInstructions:
      "Hand wash and dry immediately. Oil carbon steel after each use.",
  }),
  withDefaults({
    id: "gur-tombik",
    name: "GUR Tombik",
    slug: "gur-tombik",
    category: "custom-knives",
    price: 225,
    shortDescription:
      "Girthy walnut handle and darkened half-tang blade for a rugged look.",
    longDescription:
      "Built with a girthy handle that fills the hand, the Tombik is designed for those who prefer a larger, more substantial grip. The darkened steel blade with a half tang gives it a distinct, rugged look, paired with a Turkish walnut handle that adds warmth and character.",
    steel: "1075 Carbon Steel",
    handleMaterial: "Turkish Walnut",
    bladeLength: "3 ½ in",
    totalLength: "7 ½ in",
    bestUses: ["Camping", "Hunting", "Bushcraft"],
    inStock: true,
    featured: false,
    tags: ["gur", "custom", "walnut"],
    craftsmanshipStory:
      "A substantial GUR hunter profile with walnut warmth against darkened carbon steel.",
    careInstructions: "Hand wash and dry. Oil blade regularly to prevent rust.",
  }),
  withDefaults({
    id: "gur-tuva",
    name: "GUR Tuva",
    slug: "gur-tuva",
    category: "custom-knives",
    price: 265,
    shortDescription:
      "Sheepsfoot blade with blackened finish and rustic deer antler handle.",
    longDescription:
      "The Tuva pairs a sheepsfoot blade shape with a blackened finish, creating a unique, straightforward profile. A rustic deer antler handle adds natural character, making this one-of-a-kind piece stand out.",
    steel: "1075 Carbon Steel",
    handleMaterial: "Deer Antler",
    bladeLength: "4 in",
    totalLength: "8 9/16 in",
    bestUses: ["Collecting", "Hunting", "Camping"],
    inStock: true,
    featured: true,
    tags: ["gur", "custom", "antler"],
    craftsmanshipStory:
      "Natural antler and blackened carbon in a distinctive GUR profile for collectors and field use.",
    careInstructions: "Hand wash and dry. Oil blade after use. Keep antler dry.",
  }),
  withDefaults({
    id: "misty-rebar-shank",
    name: "Misty Rebar Shank",
    slug: "misty-rebar-shank",
    category: "custom-knives",
    price: 140,
    shortDescription:
      "In-house rebar blade with optional paracord wrap, raw utility built in the USA.",
    longDescription:
      "What began as an angle grinder test turned into the Misty Rebar Shank. Made from rebar and kept simple by design, it features an optional paracord wrap for added grip, available in black, olive green, or desert tan. Raw and direct, it's built for utility and self-defense.",
    steel: "Rebar",
    handleMaterial: "Rebar / optional paracord",
    bladeLength: "N/A",
    totalLength: "6 5/16 in (approx.)",
    bestUses: ["EDC", "Utility", "Camping"],
    inStock: true,
    featured: false,
    tags: ["misty", "custom", "usa-made"],
    craftsmanshipStory:
      "Designed and forged in-house by Aydin in the U.S., part of the Misty Series.",
    careInstructions: "Wipe clean and dry. Oil rebar if used in wet conditions.",
  }),
  withDefaults({
    id: "misty-stubby-giraffe",
    name: "Misty Stubby Giraffe",
    slug: "misty-stubby-giraffe",
    category: "custom-knives",
    price: 140,
    shortDescription:
      "Compact puukko-inspired knife with Thuya burl handle and blue liners.",
    longDescription:
      "The Misty Stubby Giraffe is a small, eye-catching knife. The Thuya burl handle shows a natural grain pattern that reminded Aydin of giraffe spots, and with an overall length of just over 5 inches the Stubby part of its name just seemed to fit.",
    steel: "1084 Steel",
    handleMaterial: "Thuya Burl",
    bladeLength: "2 7/16 in",
    totalLength: "5 5/16 in",
    bestUses: ["EDC", "Camping", "Collecting"],
    inStock: true,
    featured: true,
    tags: ["misty", "custom", "puukko"],
    craftsmanshipStory:
      "Misty Series in-house craft with Thuya burl and puukko inspiration in a pocketable size.",
    careInstructions: "Hand wash and dry. Oil carbon steel after use.",
  }),
  withDefaults({
    id: "sakra-bear-claw-neck-knives",
    name: "Sakra Bear Claw Neck Knives",
    slug: "sakra-bear-claw-neck-knives",
    category: "neck-knives",
    price: 140,
    shortDescription:
      "Compact bear-claw profile neck knives with colorful stabilized handles.",
    longDescription:
      "Sakra Bear Claw neck knives offer a compact claw-inspired profile with vivid stabilized handles and kydex or leather carry options. Each piece is finished for backup carry and everyday utility.",
    steel: "4116 Steel",
    handleMaterial: "Stabilized resin / wood",
    bladeLength: "~2 in",
    totalLength: "~4 in",
    bestUses: ["EDC", "Backup carry", "Collecting"],
    inStock: true,
    featured: false,
    tags: ["neck-knife", "sakra", "bear-claw"],
    craftsmanshipStory:
      "Small-batch neck knives with bold handle colors and a distinctive claw profile.",
    careInstructions: "Hand wash and dry. Oil blade after use.",
  }),
  withDefaults({
    id: "toros-jellybean",
    name: "Toros Jellybean",
    slug: "toros-jellybean",
    category: "neck-knives",
    price: 30,
    shortDescription:
      "Ultra-compact neck knife with a one-of-a-kind epoxy handle.",
    longDescription:
      "Small but mighty, the Jellybean is an ultra-compact neck knife that's always within reach on a keychain or lanyard. It weighs next to nothing and is ready for everyday carry. Each epoxy handle is unique, with colors ranging from bold and vibrant to more muted tones.",
    steel: "4116 Steel",
    handleMaterial: "Epoxy",
    bladeLength: "1 ¾ in",
    totalLength: "3 ½ in",
    bestUses: ["EDC", "Backup carry", "Gifting"],
    inStock: true,
    featured: true,
    tags: ["jellybean", "neck-knife", "compact"],
    craftsmanshipStory:
      "Toros Jellybean knives with marbled epoxy handles, each one unique from small-batch runs.",
    careInstructions: "Hand wash and dry. Epoxy handles require no special care.",
  }),
  withDefaults({
    id: "kam-ram",
    name: "Kam Ram",
    slug: "kam-ram",
    category: "folding-knives",
    price: 115,
    shortDescription:
      "Quick-deploy folder with Ottoman-inspired mechanism and micarta handle.",
    longDescription:
      "The Kam Ram is a foldable knife with a quick-deploy mechanism inspired by traditional Ottoman sword design. Its paper and linen Micarta handle is both durable and visually striking, with a unique multi-colored pattern and a brass inlay that adds a refined touch.",
    steel: "N690 Steel",
    handleMaterial: "Paper & Linen Micarta",
    bladeLength: "3 ½ in",
    totalLength: "8 ¼ in (open)",
    bestUses: ["EDC", "Collecting", "Gifting"],
    inStock: true,
    featured: true,
    tags: ["folder", "kam-ram", "edc"],
    craftsmanshipStory:
      "Ottoman-inspired deployment mechanics meet modern N690 steel and micarta.",
    careInstructions: "Keep pivot clean. Hand wash blade. Dry thoroughly.",
  }),
  withDefaults({
    id: "toros-ceviz",
    name: "Toros Ceviz",
    slug: "toros-ceviz",
    category: "folding-knives",
    price: 40,
    shortDescription:
      "Slicey lockback folder with two-toned walnut handle and mosaic pin.",
    longDescription:
      "The Ceviz is built with a slicey blade profile for smooth, precise cuts. Its walnut handle shows two-toned variation, accented by a mosaic pin and is rounded off with a dependable lockback mechanism.",
    steel: "N690 Steel",
    handleMaterial: "Walnut",
    bladeLength: "3 1/16 in",
    totalLength: "7 3/16 in (open)",
    bestUses: ["EDC", "Everyday tasks", "Gifting"],
    inStock: true,
    featured: false,
    tags: ["folder", "walnut", "lockback"],
    craftsmanshipStory:
      "Compact Turkish folder with walnut grain and a precise slicey edge.",
    careInstructions: "Hand wash and dry. Oil blade occasionally.",
  }),
  withDefaults({
    id: "toros-shepherd-knife",
    name: "Toros Shepherd Knife",
    slug: "toros-shepherd-knife",
    category: "folding-knives",
    price: 25,
    shortDescription:
      "Ultra-light ring-lock folder rooted in Turkish shepherd tradition.",
    longDescription:
      "Ultra-light and designed for life on the move, the Shepherd Knife is a foldable blade with a reliable ring lock mechanism. Originally used by farmers and shepherds in the fields of Türkiye, it's perfect for camping, backpacking, and everyday outdoor tasks.",
    steel: "4116 Steel",
    handleMaterial: "Walnut",
    bladeLength: "4 1/16 in",
    totalLength: "9 ⅛ in (open)",
    bestUses: ["EDC", "Camping", "Backpacking"],
    inStock: false,
    featured: false,
    tags: ["folder", "shepherd", "lightweight"],
    craftsmanshipStory:
      "A traditional Turkish shepherd pattern with minimal weight for life on the move.",
    careInstructions: "Hand wash and dry. Keep walnut handle dry.",
  }),
  withDefaults({
    id: "toros-rhino",
    name: "Toros Rhino",
    slug: "toros-rhino",
    category: "folding-knives",
    price: 65,
    shortDescription:
      "Textured composite handle folder with lockback security.",
    longDescription:
      "The Rhino stands out with a textured handle that adds both grip and character. An attractive blade shape and sturdy lockback mechanism round it out, making it a solid, dependable folder.",
    steel: "N690 Steel",
    handleMaterial: "Composite",
    bladeLength: "3 3/16 in",
    totalLength: "7 7/16 in (open)",
    bestUses: ["EDC", "Everyday tasks", "Camping"],
    inStock: true,
    featured: false,
    tags: ["folder", "lockback"],
    craftsmanshipStory:
      "Dependable Turkish folder with textured grip and a confident lockback.",
    careInstructions: "Hand wash and dry. Wipe composite handle clean.",
  }),
  withDefaults({
    id: "toros-ram-horn",
    name: "Toros Ram Horn",
    slug: "toros-ram-horn",
    category: "folding-knives",
    price: 50,
    shortDescription:
      "Lockback folder with individually unique ram horn handle scales.",
    longDescription:
      "Each Ram Horn handle is individually unique, with color and grain that tell a story in every piece. Built with a lockback design, it's a classic folding knife with character you won't find twice.",
    steel: "N690 Steel",
    handleMaterial: "Ram horn",
    bladeLength: "3 ⅝ in",
    totalLength: "8 ½ in (open)",
    bestUses: ["EDC", "Collecting", "Gifting"],
    inStock: true,
    featured: false,
    tags: ["folder", "ram-horn", "lockback"],
    craftsmanshipStory:
      "Natural ram horn scales; each folder carries its own grain and color story.",
    careInstructions:
      "Avoid direct sunlight and water on horn handles. Store at room temperature. Oil blade after use.",
  }),
  withDefaults({
    id: "mystery-jellybean-knife-bag",
    name: "Mystery Jellybean Knife Bag",
    slug: "mystery-jellybean-knife-bag",
    category: "neck-knives",
    price: 25,
    shortDescription:
      "A sealed surprise bag containing one Jellybean-style knife. Colors and handle styles vary.",
    longDescription:
      "Each Mystery Jellybean Knife Bag holds a single sealed Jellybean-style neck knife from our small-batch stock. Handle colors, burl patterns, paracord wraps, and finishes are selected at random. Jellybean knives only.",
    images: [BRAND_IMAGE_PATHS.jellybeanKnives],
    steel: "Varies by Jellybean series",
    handleMaterial: "Surprise epoxy / stabilized materials",
    bladeLength: "~1 ¾ in",
    totalLength: "~3 ½ in",
    bestUses: ["EDC", "Backup carry", "Collecting"],
    inStock: true,
    featured: false,
    tags: ["mystery", "jellybean", "surprise"],
    craftsmanshipStory:
      "Small-batch Jellybean colorways and one-off epoxy patterns, sealed until opened.",
    careInstructions:
      "Care depends on your surprise knife. Hand wash, dry immediately, and oil carbon blades after use.",
  }),
];
