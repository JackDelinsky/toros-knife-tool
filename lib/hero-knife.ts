export type HeroKnifeLayerId = "back" | "middle" | "front";

export const HERO_KNIFE_LAYERS: ReadonlyArray<{
  id: HeroKnifeLayerId;
  slug: string;
  image: string;
  width: number;
  height: number;
}> = [
  {
    id: "back",
    slug: "bos-stag-golden-horn",
    image: "/images/brand/hero-knife-cutout.png",
    width: 724,
    height: 456,
  },
  {
    id: "middle",
    slug: "bos-stag-frontier",
    image: "/images/brand/hero-knife-frontier-cutout.png",
    width: 783,
    height: 485,
  },
  {
    id: "front",
    slug: "toros-jellybean",
    image: "/images/brand/hero-knife-jellybean-cutout.png",
    width: 306,
    height: 776,
  },
];
