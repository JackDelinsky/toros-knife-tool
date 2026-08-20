import Image from "next/image";
import { JELLYBEAN_IMAGE_PATHS } from "@/lib/image-paths";

const JELLYBEAN_KNIVES = [
  {
    key: "red",
    src: JELLYBEAN_IMAGE_PATHS.red,
    glowClass: "jellybean-glow-red",
    floatClass: "jellybean-collect-float-red",
    offsetClass: "jellybean-collect-offset-low",
    sizeClass: "jellybean-collect-knife--red",
    width: 210,
    height: 856,
    alt: "Jellybean Drop — crimson burl handle",
  },
  {
    key: "blue",
    src: JELLYBEAN_IMAGE_PATHS.blue,
    glowClass: "jellybean-glow-blue",
    floatClass: "jellybean-collect-float-blue",
    offsetClass: "jellybean-collect-offset-mid",
    sizeClass: "jellybean-collect-knife--blue",
    width: 390,
    height: 855,
    alt: "Jellybean Drop — ocean burl handle",
  },
  {
    key: "green",
    src: JELLYBEAN_IMAGE_PATHS.green,
    glowClass: "jellybean-glow-green",
    floatClass: "jellybean-collect-float-green",
    offsetClass: "jellybean-collect-offset-high",
    sizeClass: "jellybean-collect-knife--green",
    width: 300,
    height: 854,
    alt: "Jellybean Drop — forest burl handle",
  },
] as const;

export function JellybeanKnivesVisual() {
  return (
    <div className="jellybean-visual jellybean-collect-visual relative mx-auto w-full max-w-[640px] select-none">
      <div className="jellybean-visual-mist jellybean-visual-mist-1" />
      <div className="jellybean-visual-mist jellybean-visual-mist-2" />
      <div className="jellybean-visual-mist jellybean-visual-mist-3" />

      <div className="jellybean-collect-stage">
        {JELLYBEAN_KNIVES.map((knife) => (
          <div
            key={knife.key}
            className={`jellybean-collect-knife ${knife.sizeClass} ${knife.offsetClass}`}
          >
            <div className="jellybean-collect-knife-inner">
              <div
                className={`jellybean-knife-glow jellybean-collect-glow ${knife.glowClass}`}
              />
              <Image
                src={knife.src}
                alt={knife.alt}
                width={knife.width}
                height={knife.height}
                priority
                className={`jellybean-knife-img jellybean-collect-img ${knife.floatClass}`}
                sizes="(max-width: 640px) 30vw, 200px"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
