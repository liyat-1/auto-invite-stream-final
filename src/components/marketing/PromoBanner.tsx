import { BANNER_THEMES, CODE_TYPE_LABEL, CURRENT_USER, promotionValidity, type Promotion } from "@/lib/marketing";

/** Deterministic banner tint so every offer keeps the same colour everywhere. */
export function bannerTheme(seed: string, chosen?: string) {
  const picked = BANNER_THEMES.find((theme) => theme.id === chosen);
  if (picked) return picked;
  let n = 0;
  for (let i = 0; i < seed.length; i += 1) n = (n + seed.charCodeAt(i)) % 997;
  return BANNER_THEMES[n % BANNER_THEMES.length];
}

export function bannerTint(seed: string, chosen?: string) {
  return bannerTheme(seed, chosen).gradient;
}

/**
 * The offer banner a guest sees. Used as the live preview while an offer is
 * being created and as the visual for an offer everywhere else.
 */
export function PromoBanner({
  promotion,
  property = "Your hotel",
  className = "",
}: {
  promotion: Pick<Promotion, "name" | "code" | "codeType" | "discountPercent" | "minNights" | "tagline"> &
    Partial<Promotion>;
  property?: string;
  className?: string;
}) {
  const firstName = CURRENT_USER.name.split(" ")[0]?.toUpperCase() ?? "GUEST";
  const headline = (promotion.tagline || promotion.name || "The best rate").toUpperCase();
  const theme = bannerTheme(promotion.code || promotion.name || "offer", promotion.bannerStyle);

  return (
    <div className={`overflow-hidden rounded-lg border border-border bg-card shadow-card ${className}`}>
      <div className={`relative bg-gradient-to-br ${theme.gradient} px-4 py-7`}>
        <p className="text-right text-[11px] font-semibold text-white/90">{property}</p>
        <div className="relative mt-5 pb-3">
          <span className="absolute -top-3 left-1 z-10 -rotate-[4deg] rounded-[3px] bg-white px-2.5 py-1 text-[10px] font-bold tracking-wide text-foreground shadow-sm">
            {firstName}, YOU UNLOCKED
          </span>
          <div className={`rotate-[-2deg] rounded-[3px] ${theme.ribbon} px-4 py-4 pl-8 shadow-md`}>
            <p className="text-[19px] font-extrabold uppercase leading-tight tracking-wide text-white">{headline}</p>
          </div>
        </div>
      </div>
      <div className="space-y-1 px-3.5 py-2.5">
        <p className="text-[11.5px] font-semibold text-card-foreground">
          {CODE_TYPE_LABEL[promotion.codeType ?? "promo"]}: {promotion.code || "—"}
        </p>
        <p className="text-[10.5px] text-muted-foreground">
          {promotion.discountPercent ? `${promotion.discountPercent}% off` : "No discount set"}
          {promotion.minNights ? ` · min ${promotion.minNights} night${promotion.minNights === 1 ? "" : "s"}` : ""}
        </p>
        <p className="text-[10.5px] text-muted-foreground">{promotionValidity(promotion as Promotion)}</p>
      </div>
    </div>
  );
}
