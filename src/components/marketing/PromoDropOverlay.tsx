import { useMemo, useState } from "react";
import { CalendarClock, Gift, Info, Search, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CODE_TYPE_LABEL,
  PROMO_DRAG_TYPE,
  campaignPromotionIds,
  promotionDuration,
  promotionValidity,
  setVariantPromotion,
  useMarketing,
  type AudienceKey,
  type MarketingCampaign,
  type Promotion,
} from "@/lib/marketing";

const AUDIENCE_LABEL: Record<AudienceKey, string> = { direct: "Direct", ota: "OTA" };
const AUDIENCE_KEYS: AudienceKey[] = ["direct", "ota"];

/**
 * Full overlay for attaching offers. Promotions live on the left and are
 * dragged onto a whole campaign, or onto just its Direct or OTA guests.
 */
export function PromoDropOverlay({
  campaigns,
  onClose,
}: {
  campaigns: MarketingCampaign[];
  onClose: () => void;
}) {
  const { promotions } = useMarketing();
  const [query, setQuery] = useState("");
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);

  const q = query.trim().toLowerCase();
  const list = useMemo(
    () => promotions.filter((p) => !q || `${p.name} ${p.detail} ${p.code}`.toLowerCase().includes(q)),
    [promotions, q],
  );
  const byId = (id: string | null) => promotions.find((p) => p.id === id) ?? null;

  const allow = (event: React.DragEvent, key: string) => {
    if (!event.dataTransfer.types.includes(PROMO_DRAG_TYPE) && !dragging) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setOver(key);
  };

  const drop = (event: React.DragEvent, campaignId: string, audiences: AudienceKey[]) => {
    const id = event.dataTransfer.getData(PROMO_DRAG_TYPE) || dragging;
    if (!id) return;
    event.preventDefault();
    audiences.forEach((audience) => setVariantPromotion(campaignId, audience, id));
    setOver(null);
    setDragging(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-canvas">
      <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-3 sm:px-6">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-brand">Promotions</p>
          <h2 className="truncate text-[17px] font-semibold text-card-foreground">Manage promo</h2>
          <p className="truncate text-[11.5px] text-muted-foreground">
            Drag an offer onto a whole campaign, or onto just Direct or OTA guests.
          </p>
        </div>
        <Button variant="brand" size="sm" onClick={onClose}>
          Done
        </Button>
        <Button variant="ghost" size="icon" className="size-8" aria-label="Close" onClick={onClose}>
          <X size={16} />
        </Button>
      </header>

      <p className="flex items-start gap-2 border-b border-border bg-brand-soft/50 px-4 py-2 text-[11.5px] text-muted-foreground sm:px-6">
        <Info size={13} className="mt-[1px] shrink-0 text-brand" />
        A campaign carries one offer per guest segment, so Direct and OTA guests can each get a different one. Dropping a
        new offer replaces the one already there.
      </p>

      <div className="grid min-h-0 flex-1 overflow-hidden md:grid-cols-[300px_1fr]">
        <aside className="flex min-h-0 flex-col overflow-hidden border-b border-border bg-card p-4 md:border-b-0 md:border-r">
          <h3 className="text-[13px] font-semibold text-card-foreground">Offers</h3>
          <div className="relative mt-2">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search offers"
              className="w-full rounded-sm border border-input bg-background py-1.5 pl-8 pr-2.5 text-[12.5px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div className="mt-2 min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
            {list.map((promotion) => (
              <article
                key={promotion.id}
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData(PROMO_DRAG_TYPE, promotion.id);
                  event.dataTransfer.setData("text/plain", promotion.id);
                  event.dataTransfer.effectAllowed = "copy";
                  setDragging(promotion.id);
                }}
                onDragEnd={() => setDragging(null)}
                className={`cursor-grab rounded-sm border bg-background px-2.5 py-2 transition-colors active:cursor-grabbing ${
                  dragging === promotion.id ? "border-brand bg-brand-soft" : "border-border hover:border-brand/45"
                }`}
              >
                <p className="flex items-center gap-1.5 truncate text-[12.5px] font-semibold text-card-foreground">
                  <Gift size={12} className="shrink-0 text-brand" />
                  <span className="truncate">{promotion.name}</span>
                </p>
                <p className="mt-0.5 flex items-center gap-1 truncate text-[10.5px] text-muted-foreground">
                  <Tag size={10} className="shrink-0" />
                  {CODE_TYPE_LABEL[promotion.codeType ?? "promo"]} {promotion.code}
                  {promotion.discountPercent ? ` · ${promotion.discountPercent}% off` : ""}
                </p>
                <p className="mt-0.5 flex items-center gap-1 truncate text-[10.5px] text-muted-foreground">
                  <CalendarClock size={10} className="shrink-0" />
                  {promotionValidity(promotion)}
                </p>
                <p className="truncate text-[10.5px] text-muted-foreground">{promotionDuration(promotion)}</p>
              </article>
            ))}
            {list.length === 0 && (
              <p className="px-1 py-4 text-center text-[11.5px] text-muted-foreground">No offers match.</p>
            )}
          </div>
        </aside>

        <div className="min-h-0 overflow-y-auto p-4 sm:p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Campaigns</p>
          <div className="mt-2 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {campaigns.map((campaign) => {
              const ids = campaignPromotionIds(campaign);
              const wholeKey = `${campaign.id}:all`;
              return (
                <section key={campaign.id} className="rounded-md border border-border bg-card shadow-card">
                  <div
                    onDragOver={(event) => allow(event, wholeKey)}
                    onDragLeave={() => setOver((c) => (c === wholeKey ? null : c))}
                    onDrop={(event) => drop(event, campaign.id, ["direct", "ota"])}
                    className={`rounded-t-md border-b-2 border-dashed px-3 py-2.5 transition-colors ${
                      over === wholeKey ? "border-brand bg-brand-soft" : "border-border"
                    }`}
                  >
                    <p className="truncate text-[12.5px] font-semibold text-card-foreground">{campaign.name}</p>
                    <p className="text-[10.5px] text-muted-foreground">Drop here for the whole campaign</p>
                  </div>
                  <div className="grid gap-2 p-3 sm:grid-cols-2">
                    {AUDIENCE_KEYS.map((audience) => {
                      const key = `${campaign.id}:${audience}`;
                      const promotion: Promotion | null = byId(ids[audience]);
                      return (
                        <div
                          key={audience}
                          onDragOver={(event) => allow(event, key)}
                          onDragLeave={() => setOver((c) => (c === key ? null : c))}
                          onDrop={(event) => drop(event, campaign.id, [audience])}
                          className={`rounded-sm border-2 border-dashed px-2.5 py-2 transition-colors ${
                            over === key
                              ? "border-brand bg-brand-soft"
                              : promotion
                                ? "border-brand/35 bg-brand-soft/35"
                                : "border-border bg-background"
                          }`}
                        >
                          <p className="flex items-center justify-between gap-1 text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                            {AUDIENCE_LABEL[audience]} guests
                            {promotion && (
                              <button
                                type="button"
                                aria-label={`Remove offer from ${AUDIENCE_LABEL[audience]} guests`}
                                onClick={() => setVariantPromotion(campaign.id, audience, null)}
                                className="hover:text-destructive"
                              >
                                <X size={11} />
                              </button>
                            )}
                          </p>
                          <p className="mt-1 truncate text-[11.5px] text-card-foreground">
                            {promotion ? promotion.name : "Drop an offer here"}
                          </p>
                          {promotion && (
                            <p className="truncate text-[10px] text-muted-foreground">{promotionValidity(promotion)}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
