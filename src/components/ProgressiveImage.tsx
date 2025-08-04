import React, { useEffect, useState } from 'react';

type ProgressiveImageProps = {
  lowSrc: string;           // low-res placeholder (e.g., 240–320px wide)
  src: string;              // high-res source
  alt?: string;
  className?: string;
  fadeDurationMs?: number;  // cross-fade duration
  blurPreview?: boolean;    // blur the low-res layer
  preserveAspectRatio?: boolean; // keep aspect via CSS aspect-ratio
  aspectRatio?: number;     // e.g., 16/9 when preserveAspectRatio is true

  // New animation controls for a longer/softer transition
  crossfadeMs?: number;     // alias of fadeDurationMs (takes precedence if provided)
  zoomOnReveal?: boolean;   // add a subtle zoom-in on the hi-res as it appears
  blurUnwind?: boolean;     // gradually reduce blur on low-res while fading out
};

export function ProgressiveImage({
  lowSrc,
  src,
  alt = '',
  className,
  fadeDurationMs = 350,
  blurPreview = true,
  preserveAspectRatio = false,
  aspectRatio = 16 / 9,
  crossfadeMs,
  zoomOnReveal = true,
  blurUnwind = true,
}: ProgressiveImageProps) {
  const [hiLoaded, setHiLoaded] = useState(false);

  const duration = typeof crossfadeMs === 'number' ? crossfadeMs : fadeDurationMs;

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.decoding = 'async';
    img.loading = 'eager';
    img.src = src;
    img.onload = () => {
      if (!cancelled) setHiLoaded(true);
    };
    img.onerror = () => {
      // keep low-res visible on error; optionally log/report
    };
    return () => {
      cancelled = true;
    };
  }, [src]);

  const wrapperStyle: React.CSSProperties = preserveAspectRatio
    ? { position: 'relative', width: '100%', aspectRatio: String(aspectRatio), overflow: 'hidden' }
    : { position: 'relative', width: '100%', height: '100%', overflow: 'hidden' };

  // Animation styles
  const lowFilter = blurPreview
    ? (blurUnwind
        ? (hiLoaded ? 'blur(0px)' : 'blur(14px)')
        : 'blur(12px)')
    : undefined;

  const hiTransform = zoomOnReveal
    ? (hiLoaded ? 'scale(1.0)' : 'scale(1.025)')
    : undefined;

  return (
    <div className={['progressive-image', className].filter(Boolean).join(' ')} style={wrapperStyle}>
      <img
        src={lowSrc}
        alt={alt}
        className="progressive-image__img progressive-image__img--low"
        style={{
          opacity: hiLoaded ? 0 : 1,
          transition: `opacity ${duration}ms ease, filter ${duration}ms ease`,
          filter: lowFilter,
          transform: blurPreview ? 'scale(1.05)' : undefined, // hide blur edges
        }}
        aria-hidden={hiLoaded ? true : undefined}
      />
      <img
        src={src}
        alt={alt}
        className="progressive-image__img progressive-image__img--hi"
        style={{
          opacity: hiLoaded ? 1 : 0,
          transition: `opacity ${duration}ms ease, transform ${duration}ms ease`,
          transform: hiTransform,
        }}
      />
    </div>
  );
}

export default ProgressiveImage;