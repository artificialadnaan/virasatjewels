// Client-safe module — no Node.js SDK import.
// Contains only the pure URL transformation helper.

type ImageVariant = "thumbnail" | "detail" | "zoom" | "og";

const transforms: Record<ImageVariant, string> = {
  thumbnail: "c_fill,w_400,h_400,g_auto,q_auto,f_auto",
  detail: "c_limit,w_1200,h_1200,q_auto,f_auto",
  zoom: "c_limit,w_2400,h_2400,q_auto:best,f_auto",
  og: "c_fill,w_1200,h_630,g_auto,q_auto,f_auto",
};

export function getImageUrl(url: string, variant: ImageVariant): string {
  if (!url.includes("cloudinary.com")) return url;
  const parts = url.split("/upload/");
  if (parts.length !== 2) return url;
  return `${parts[0]}/upload/${transforms[variant]}/${parts[1]}`;
}
