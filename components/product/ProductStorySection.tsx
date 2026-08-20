interface ProductStorySectionProps {
  story: string;
  longDescription?: string;
}

export function ProductStorySection({ story, longDescription }: ProductStorySectionProps) {
  const showDetail =
    longDescription &&
    longDescription.trim() !== story.trim() &&
    !longDescription.startsWith(story.slice(0, 40));

  return (
    <section className="product-story" aria-labelledby="product-story-heading">
      <h2 id="product-story-heading" className="product-section-heading">
        Craftsmanship
      </h2>
      <p className="product-story-lead">{story}</p>
      {showDetail && <p className="product-story-detail">{longDescription}</p>}
    </section>
  );
}
