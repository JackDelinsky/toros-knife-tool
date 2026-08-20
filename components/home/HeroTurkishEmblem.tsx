/**
 * Turkish crescent & star — heritage mark with forge sparks.
 */
export function HeroTurkishEmblem() {
  return (
    <div className="hero-turkish-emblem" aria-hidden="true">
      <div className="hero-turkish-emblem-stage">
        <svg className="hero-turkish-emblem-svg" viewBox="0 0 280 200" fill="none">
          <defs>
            <linearGradient
              id="heroTurkishEmblemFill"
              x1="40"
              y1="30"
              x2="240"
              y2="170"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#f2e8d6" />
              <stop offset="0.55" stopColor="#e8dcc8" />
              <stop offset="1" stopColor="#c4a574" />
            </linearGradient>
            <mask id="heroTurkishCrescentMask">
              <rect width="280" height="200" fill="white" />
              <circle cx="118" cy="100" r="36" fill="black" />
            </mask>
          </defs>
          <circle
            cx="96"
            cy="100"
            r="46"
            fill="url(#heroTurkishEmblemFill)"
            mask="url(#heroTurkishCrescentMask)"
          />
          <path
            fill="url(#heroTurkishEmblemFill)"
            d="M155 100 L166.5 96 L166.75 83.83 L174.1 93.53 L185.75 90.01 L178.8 100 L185.75 109.99 L174.1 106.47 L166.75 116.17 L166.5 104 Z"
          />
        </svg>

        <div className="hero-atmosphere-sparks hero-turkish-emblem-sparks">
          <div className="hero-atmosphere-spark hero-turkish-emblem-spark hero-turkish-emblem-spark--1" />
          <div className="hero-atmosphere-spark hero-turkish-emblem-spark hero-turkish-emblem-spark--2" />
          <div className="hero-atmosphere-spark hero-turkish-emblem-spark hero-turkish-emblem-spark--3" />
          <div className="hero-atmosphere-spark hero-turkish-emblem-spark hero-turkish-emblem-spark--4" />
          <div className="hero-atmosphere-spark hero-turkish-emblem-spark hero-turkish-emblem-spark--5" />
          <div className="hero-atmosphere-spark hero-turkish-emblem-spark hero-turkish-emblem-spark--6" />
          <div className="hero-atmosphere-spark hero-turkish-emblem-spark hero-turkish-emblem-spark--7" />
          <div className="hero-atmosphere-spark hero-turkish-emblem-spark hero-turkish-emblem-spark--8" />
          <div className="hero-atmosphere-spark hero-turkish-emblem-spark hero-turkish-emblem-spark--9" />
          <div className="hero-atmosphere-spark hero-turkish-emblem-spark hero-turkish-emblem-spark--10" />
          <div className="hero-atmosphere-spark hero-turkish-emblem-spark hero-turkish-emblem-spark--11" />
          <div className="hero-atmosphere-spark hero-turkish-emblem-spark hero-turkish-emblem-spark--12" />
        </div>
      </div>
    </div>
  );
}
