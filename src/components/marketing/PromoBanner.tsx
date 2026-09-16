import {
  BANNER_THEMES,
  CODE_TYPE_LABEL,
  CURRENT_USER,
  bannerTemplateOf,
  promotionValidity,
  useMarketing,
  type BannerTheme,
  type Promotion,
} from "@/lib/marketing";

type BannerPromotion = Pick<Promotion, "name" | "code" | "codeType" | "discountPercent" | "minNights" | "tagline"> &
  Partial<Promotion>;

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

function defaultKicker(fullName: string) {
  const first = fullName.split(" ")[0]?.toUpperCase() ?? "GUEST";
  return `${first}, YOU UNLOCKED`;
}

function useBannerArt(promotion: BannerPromotion) {
  const { media } = useMarketing();
  const pick = (id?: string) => media.find((m) => m.id === id && m.type === "image")?.url;
  return { logo: pick(promotion.logoId), photo: pick(promotion.bannerImageId) };
}

type BannerCtx = {
  promotion: BannerPromotion;
  kicker: string;
  propertyName: string;
  headline: string;
  theme: BannerTheme;
  logo?: string;
  photo?: string;
};

function RibbonBanner({ ctx }: { ctx: BannerCtx }) {
  const { theme, kicker, propertyName, headline, logo, photo } = ctx;
  return (
    <div className={`relative bg-gradient-to-br ${theme.gradient} px-4 py-7`}>
      {photo && <img src={photo} alt="" loading="lazy" className="absolute inset-0 size-full object-cover opacity-20" />}
      <div className="relative flex items-start justify-between gap-2">
        {logo ? (
          <img src={logo} alt="" loading="lazy" className="size-9 rounded-full bg-white/95 object-contain p-1 shadow-sm" />
        ) : (
          <span className="size-9" />
        )}
        <p className="text-right text-[11px] font-semibold text-white/90">{propertyName}</p>
      </div>
      <div className="relative mt-5 pb-3">
        <span className="absolute -top-3 left-1 z-10 -rotate-[4deg] rounded-[3px] bg-white px-2.5 py-1 text-[10px] font-bold tracking-wide text-foreground shadow-sm">
          {kicker}
        </span>
        <div className={`rotate-[-2deg] rounded-[3px] ${theme.ribbon} px-4 py-4 pl-8 shadow-md`}>
          <p className="text-[19px] font-extrabold uppercase leading-tight tracking-wide text-white">{headline}</p>
        </div>
      </div>
    </div>
  );
}

function TicketBanner({ ctx }: { ctx: BannerCtx }) {
  const { theme, kicker, propertyName, headline, logo, photo, promotion } = ctx;
  return (
    <div className={`relative bg-gradient-to-br ${theme.gradient} px-4 py-5`}>
      {photo && <img src={photo} alt="" loading="lazy" className="absolute inset-0 size-full object-cover opacity-15" />}
      <div className="relative flex items-stretch gap-3">
        <div className="min-w-0 flex-1 text-white">
          {logo && (
            <img src={logo} alt="" loading="lazy" className="size-8 rounded-full bg-white/95 object-contain p-0.5 shadow-sm" />
          )}
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/80">{kicker}</p>
          <p className="mt-1.5 text-[16px] font-extrabold uppercase leading-tight">{headline}</p>
        </div>
        <div className="flex w-[92px] shrink-0 flex-col items-center justify-center border-l-2 border-dashed border-white/50 pl-3 text-center text-white">
          <p className="text-[19px] font-extrabold leading-none">{promotion.discountPercent ? `${promotion.discountPercent}%` : "★"}</p>
          <p className="mt-1.5 break-all text-[10px] font-bold uppercase tracking-wider">{promotion.code || "OFFER"}</p>
        </div>
      </div>
      <p className="relative mt-3 text-right text-[10px] font-semibold text-white/85">{propertyName}</p>
    </div>
  );
}

function SpotlightBanner({ ctx }: { ctx: BannerCtx }) {
  const { theme, kicker, propertyName, headline, logo, photo, promotion } = ctx;
  return (
    <div className={`relative min-h-[158px] bg-gradient-to-br ${theme.gradient} px-4 py-6`}>
      {photo && <img src={photo} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/40" />
      <div className="relative flex min-h-[134px] flex-col items-center justify-center text-center text-white">
        {logo && (
          <img src={logo} alt="" loading="lazy" className="size-11 rounded-full bg-white/95 object-contain p-1 shadow" />
        )}
        <p className="mt-2 text-[9.5px] font-bold uppercase tracking-[0.2em] text-white/85">
          {propertyName} · {kicker}
        </p>
        <p className="mt-1.5 max-w-[95%] text-[17px] font-extrabold uppercase leading-tight [text-shadow:0_1px_10px_rgba(0,0,0,0.5)]">
          {headline}
        </p>
        {promotion.discountPercent ? (
          <span className="mt-2.5 rounded-full bg-white px-3 py-1 text-[11px] font-extrabold" style={{ color: theme.swatch }}>
            {promotion.discountPercent}% OFF
          </span>
        ) : null}
      </div>
    </div>
  );
}

function FrameBanner({ ctx }: { ctx: BannerCtx }) {
  const { theme, kicker, propertyName, headline, logo, photo, promotion } = ctx;
  return (
    <div className={`relative bg-gradient-to-br ${theme.gradient} p-2.5`}>
      {photo && <img src={photo} alt="" loading="lazy" className="absolute inset-0 size-full object-cover opacity-10" />}
      <div className="relative rounded-[3px] border-2 border-white/70 bg-card px-4 py-5 text-center">
        <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-muted-foreground">{propertyName}</p>
        {logo && <img src={logo} alt="" loading="lazy" className="mx-auto mt-2 size-12 object-contain" />}
        <p className="mt-2 text-[9.5px] font-bold uppercase tracking-[0.18em]" style={{ color: theme.swatch }}>
          {kicker}
        </p>
        <p className="mt-1 text-[17px] font-extrabold uppercase leading-tight text-foreground">{headline}</p>
        <span
          className="mt-3 inline-block rounded-sm px-3 py-1 text-[10.5px] font-bold uppercase tracking-wide text-white"
          style={{ backgroundColor: theme.swatch }}
        >
          {promotion.code || "OFFER"}
        </span>
      </div>
    </div>
  );
}

function MinimalBanner({ ctx }: { ctx: BannerCtx }) {
  const { theme, kicker, propertyName, headline, logo, promotion } = ctx;
  return (
    <div className="relative bg-card px-4 pb-4 pt-5">
      <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${theme.gradient}`} />
      <div className="flex items-center gap-4">
        <div className="shrink-0 text-center">
          <p className="text-[30px] font-extrabold leading-none" style={{ color: theme.swatch }}>
            {promotion.discountPercent ? `${promotion.discountPercent}%` : "★"}
          </p>
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            {promotion.discountPercent ? "off" : "offer"}
          </p>
        </div>
        <div className="min-w-0 flex-1 border-l border-border pl-4">
          <p className="truncate text-[9.5px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            {kicker} · {propertyName}
          </p>
          <p className="mt-1 text-[15.5px] font-extrabold uppercase leading-tight text-foreground">{headline}</p>
          {logo && <img src={logo} alt="" loading="lazy" className="mt-2 size-7 object-contain" />}
        </div>
      </div>
    </div>
  );
}

function BannerFooter({ promotion, showCode = true }: { promotion: BannerPromotion; showCode?: boolean }) {
  return (
    <div className="space-y-1 border-t border-border/60 px-3.5 py-2.5">
      {showCode && (
        <p className="text-[11.5px] font-semibold text-card-foreground">
          {CODE_TYPE_LABEL[promotion.codeType ?? "promo"]}: {promotion.code || "—"}
        </p>
      )}
      <p className="text-[10.5px] text-muted-foreground">
        {promotion.discountPercent ? `${promotion.discountPercent}% off` : "No discount set"}
        {promotion.minNights ? ` · min ${promotion.minNights} night${promotion.minNights === 1 ? "" : "s"}` : ""}
      </p>
      <p className="text-[10.5px] text-muted-foreground">{promotionValidity(promotion as Promotion)}</p>
    </div>
  );
}

/**
 * The offer banner a guest sees. Five layout templates, eight colour themes,
 * optional logo and background photo from the media library, and fully
 * editable wording. Used as the live preview while an offer is being edited
 * and as the visual for an offer everywhere else.
 */
export function PromoBanner({
  promotion,
  property = "Your hotel",
  className = "",
}: {
  promotion: BannerPromotion;
  property?: string;
  className?: string;
}) {
  const template = bannerTemplateOf(promotion);
  const { logo, photo } = useBannerArt(promotion);
  const kicker = promotion.kicker?.trim() || defaultKicker(CURRENT_USER.name);
  const propertyName = promotion.propertyName?.trim() || property;
  const headline = (promotion.tagline || promotion.name || "The best rate").toUpperCase();
  const theme = bannerTheme(promotion.code || promotion.name || "offer", promotion.bannerStyle);
  const ctx: BannerCtx = { promotion, kicker, propertyName, headline, theme, logo, photo };

  const body =
    template === "ticket" ? (
      <TicketBanner ctx={ctx} />
    ) : template === "spotlight" ? (
      <SpotlightBanner ctx={ctx} />
    ) : template === "frame" ? (
      <FrameBanner ctx={ctx} />
    ) : template === "minimal" ? (
      <MinimalBanner ctx={ctx} />
    ) : (
      <RibbonBanner ctx={ctx} />
    );

  return (
    <div className={`overflow-hidden rounded-lg border border-border bg-card shadow-card ${className}`}>
      {body}
      <BannerFooter promotion={promotion} showCode={template !== "ticket"} />
    </div>
  );
}
