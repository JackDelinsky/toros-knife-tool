import Image from "next/image";
import Link from "next/link";
import { BRAND_IMAGES } from "@/lib/brand-images";

/**
 * The family story, as an edited page rather than three identical two-column
 * blocks under a centred logo.
 *
 * Every fact below already existed in the repository: the names, the 2023
 * buying trip, the 2025 launch, the Georgia Bushcraft and Atlanta Blade Show
 * events, Greg and Lee at Olde Towne Cutlery. Nothing has been added to make
 * the story sound older or larger than it is.
 */
const CHAPTERS = [
  {
    id: "started",
    title: "How it started",
    image: BRAND_IMAGES.aboutBushcraft,
    alt: "Aydin, Murat and Greg at a Georgia Bushcraft event",
    caption: "Georgia Bushcraft — with Greg, who made the first introductions.",
    paragraphs: [
      "Aydin started whittling when he was ten: spoons, small animals, you name it. That hobby soon turned into a fascination with knives. He dove in, learning as much as he could (thank God for YouTube), and quickly fell in love with the knife community.",
      "Murat, an avid supporter of all Aydin's interests, took him to Georgia Bushcraft events, the Atlanta Blade Show, and reconnected with Greg, a close friend with over 30 years of experience in the knife industry. Greg introduced them to Lee at Olde Towne Cutlery, who has also been a huge support from the beginning.",
      "Grateful for Greg and Lee's guidance and the tight-knit knife community that welcomed them, they began looking beyond their local circle toward something bigger.",
    ],
  },
  {
    id: "connection",
    title: "The international connection",
    image: BRAND_IMAGES.aboutInternational,
    alt: "Murat and Aydin showing Turkish knives and leather sheaths",
    caption: "Knives and sheaths hand-selected on the 2023 trip through Türkiye.",
    paragraphs: [
      "In towns and villages across Türkiye, bladesmiths have been passing down their skills for centuries, crafting survival tools, Ottoman-era weaponry, and knives built to last.",
      "In 2023, Murat and Aydin traveled through Türkiye, visiting numerous knife makers and hand-selecting the finest products to bring to America.",
      "Inspired by that experience, Aydin moved from collecting knives to making them himself in his garage.",
    ],
  },
  {
    id: "going",
    title: "How it's going",
    image: BRAND_IMAGES.aboutJellybeanDisplay,
    alt: "Toros Jellybean knives on a wooden display stand",
    caption: "The Jellybean series on the display stand at a show.",
    paragraphs: [
      "After sampling dozens of products, Murat and Aydin officially launched Toros Knife & Tool in 2025.",
      "They partner with experienced makers who take pride in every blade, working with quality materials and building on generations of skill. Aydin continues to craft his own knives in Georgia, producing one-of-a-kind pieces featuring fresh designs.",
      "At its core, Toros is about grit, adaptability and perseverance: connecting with the outdoors, learning from your surroundings, and putting that knowledge to use.",
    ],
  },
];

export function AboutUsContent() {
  return (
    <div className="about">
      <header className="page-container about-open">
        <p className="eyebrow">About</p>
        <h1 className="t-display about-title">
          A father, a son,
          <br />
          and two countries&rsquo; worth of steel.
        </h1>
        <p className="t-lead about-standfirst">
          Toros Knife &amp; Tool is a family-owned business founded by father-and-son duo Murat
          and Aydin, with a little behind-the-scenes help from Momma&nbsp;C.
        </p>
      </header>

      <figure className="page-container about-banner">
        <div className="media media--wide">
          <Image
            src={BRAND_IMAGES.aboutBanner}
            alt="Murat and Aydin holding the Toros Knife & Tool banner outdoors"
            fill
            sizes="100vw"
            className="about-banner-img"
          />
        </div>
      </figure>

      <div className="page-container about-chapters">
        {CHAPTERS.map((chapter, index) => (
          <section
            key={chapter.id}
            className={`about-chapter editorial ${index % 2 === 1 ? "editorial--reverse about-chapter--flip" : ""}`}
            aria-labelledby={`about-${chapter.id}`}
          >
            <figure className="about-figure">
              <div className="media media--landscape">
                <Image
                  src={chapter.image}
                  alt={chapter.alt}
                  fill
                  sizes="(max-width: 900px) 100vw, 55vw"
                  className="about-img"
                />
              </div>
              <figcaption className="about-caption">{chapter.caption}</figcaption>
            </figure>

            <div className="about-text">
              <p className="about-chapter-index">{String(index + 1).padStart(2, "0")}</p>
              <h2 id={`about-${chapter.id}`} className="t-h2 about-chapter-title">
                {chapter.title}
              </h2>
              {chapter.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 24)} className="t-body about-para">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="page-container about-close">
        <p className="t-h3 about-close-line">See what came of it.</p>
        <Link href="/shop" className="btn btn--primary">
          Browse the knives
        </Link>
      </div>
    </div>
  );
}
