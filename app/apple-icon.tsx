import { ImageResponse } from "next/og";

// iOS Safari ignores SVG touch icons, so we rasterize the same spruce mark
// to a 180×180 PNG at build time via Next.js's ImageResponse. Same brand
// colors as `app/icon.svg`; the Isabelline background prevents iOS from
// compositing the icon against an unintended color.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const SPRUCE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <g fill="#3C695C">
    <rect x="14" y="24" width="4" height="5" rx="0.5" />
    <path d="M16 14 L3 26 L29 26 Z" />
    <path d="M16 8 L6 19 L26 19 Z" />
    <path d="M16 3 L9 12 L23 12 Z" />
  </g>
</svg>
`.trim();

export default function AppleIcon(): ImageResponse {
  const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(SPRUCE_SVG)}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FAF6F2",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={dataUrl} width={140} height={140} alt="" />
      </div>
    ),
    { ...size }
  );
}
