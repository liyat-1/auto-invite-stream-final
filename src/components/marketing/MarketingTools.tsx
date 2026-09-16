import { useState } from "react";
import { CalendarClock, ChevronDown, Gift, Image, Layers, MessageSquare, Mail, Shuffle } from "lucide-react";
import { StrategyOverlay } from "./StrategyOverlay";
import { PromoDropOverlay } from "./PromoDropOverlay";
import { MediaAssignOverlay } from "./MediaAssignOverlay";
import { Button } from "@/components/ui/button";
import {
  STRATEGIES,
  campaignMediaIds,
  campaignPromotionIds,
  promotionValidity,
  useMarketing,
  type CampaignGroup,
  type MarketingCampaign,
  type Strategy,
} from "@/lib/marketing";

const STRATEGY_ICONS: Record<Strategy, React.ComponentType<{ size?: number; className?: string }>> = {
  text: MessageSquare,
  text_email: Mail,
  text_fallback: Shuffle,
};

function Panel({
  icon: Icon,
  title,
  summary,
  open,
  onToggle,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  summary: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-md border border-border bg-card shadow-card">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-muted/50"
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-sm bg-brand-soft text-brand">
          <Icon size={15} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-semibold text-card-foreground">{title}</span>
          <span className="block truncate text-[11px] text-muted-foreground">{summary}</span>
        </span>
        <ChevronDown size={15} className={`shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="border-t border-border px-3.5 py-3">{children}</div>}
    </section>
  );
}

/**
 * Collapsible tool rail above the campaign grid: channel strategy, promotions
 * and text media. Each panel explains itself and opens its own full overlay.
 */
export function MarketingTools({ campaigns }: { group?: CampaignGroup; campaigns: MarketingCampaign[] }) {
  const { promotions } = useMarketing();
  const [open, setOpen] = useState<"strategy" | "promo" | "media" | null>(null);
  const [overlay, setOverlay] = useState<"strategy" | "promo" | "media" | null>(null);
  const toggle = (key: "strategy" | "promo" | "media") => setOpen((current) => (current === key ? null : key));

  const withPromo = campaigns.filter((c) => {
    const ids = campaignPromotionIds(c);
    return ids.direct || ids.ota;
  });
  const usedPromos = promotions.filter((p) =>
    campaigns.some((c) => {
      const ids = campaignPromotionIds(c);
      return ids.direct === p.id || ids.ota === p.id;
    }),
  );
  const withMedia = campaigns.filter((c) => campaignMediaIds(c).length > 0);

  return (
    <div className="grid gap-2 lg:grid-cols-3">
      <Panel
        icon={Layers}
        title="Manage channel strategy"
        summary={`How each of the ${campaigns.length} campaigns is delivered`}
        open={open === "strategy"}
        onToggle={() => toggle("strategy")}
      >
        <ul className="space-y-2">
          {STRATEGIES.map((strategy) => {
            const Icon = STRATEGY_ICONS[strategy.value];
            const count = campaigns.filter((c) => c.strategy === strategy.value).length;
            return (
              <li key={strategy.value} className="flex items-start gap-2.5 rounded-sm border border-border bg-background px-2.5 py-2">
                <Icon size={14} className="mt-0.5 shrink-0 text-brand" />
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold text-card-foreground">
                    {strategy.label} <span className="font-normal text-muted-foreground">· {count}</span>
                  </p>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">{strategy.hint}</p>
                </div>
              </li>
            );
          })}
        </ul>
        <Button variant="brand" size="sm" className="mt-2.5 w-full" onClick={() => setOverlay("strategy")}>
          Manage channel strategy
        </Button>
      </Panel>

      <Panel
        icon={Gift}
        title="Manage promo"
        summary={`${withPromo.length} of ${campaigns.length} campaigns carry an offer`}
        open={open === "promo"}
        onToggle={() => toggle("promo")}
      >
        <p className="text-[11.5px] leading-relaxed text-muted-foreground">
          A campaign can carry only one promotion per guest segment, so Direct and OTA guests can each get a different
          offer. Drag an offer onto a whole campaign, or onto just Direct or OTA. Some offers run between set dates and
          expire on their own, others run with no end date.
        </p>
        <ul className="mt-2.5 space-y-1.5">
          {usedPromos.map((promotion) => (
            <li key={promotion.id} className="rounded-sm border border-border bg-background px-2.5 py-2">
              <p className="truncate text-[12px] font-semibold text-card-foreground">{promotion.name}</p>
              <p className="mt-0.5 flex items-center gap-1 truncate text-[10.5px] text-muted-foreground">
                <CalendarClock size={10} className="shrink-0" />
                {promotion.code} · {promotionValidity(promotion)}
              </p>
            </li>
          ))}
          {usedPromos.length === 0 && (
            <li className="rounded-sm border border-dashed border-border px-2.5 py-3 text-center text-[11px] text-muted-foreground">
              No promotion is attached to these campaigns yet.
            </li>
          )}
        </ul>
        <Button variant="brand" size="sm" className="mt-2.5 w-full" onClick={() => setOverlay("promo")}>
          Manage promo
        </Button>
      </Panel>

      <Panel
        icon={Image}
        title="Text media"
        summary={`${withMedia.length} of ${campaigns.length} campaigns have a file attached`}
        open={open === "media"}
        onToggle={() => toggle("media")}
      >
        <p className="text-[11.5px] leading-relaxed text-muted-foreground">
          This media is for text messages only. Images and short video are sent as MMS, documents are shared as a link.
          Attach one file to every campaign at once, or pick a single campaign.
        </p>
        <Button variant="brand" size="sm" className="mt-2.5 w-full" onClick={() => setOverlay("media")}>
          Attach media to text campaigns
        </Button>
      </Panel>

      <StrategyOverlay open={overlay === "strategy"} campaigns={campaigns} onClose={() => setOverlay(null)} />
      {overlay === "promo" && <PromoDropOverlay campaigns={campaigns} onClose={() => setOverlay(null)} />}
      {overlay === "media" && <MediaAssignOverlay campaigns={campaigns} onClose={() => setOverlay(null)} />}
    </div>
  );
}
