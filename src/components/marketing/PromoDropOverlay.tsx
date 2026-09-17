import { useEffect, useMemo, useState } from "react";
import { Ban, CalendarClock, Check, Gift, GripVertical, Info, Search, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  CAMPAIGN_DRAG_TYPE,
  CODE_TYPE_LABEL,
  promotionDuration,
  promotionValidity,
  setVariantPromotion,
  useMarketing,
  type AudienceKey,
  type MarketingCampaign,
  type Promotion,
} from "@/lib/marketing";

const AUDIENCE_KEYS: AudienceKey[] = ["direct", "ota"];
const AREA_COUNT = 3;
const STORAGE_KEY = "directful.promo-areas-v3";

type Areas = (string | null)[];

function loadAreas(promotions: Promotion[]): Areas {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Areas;
      if (Array.isArray(parsed) && parsed.length === AREA_COUNT) return parsed;
    }
  } catch {
    /* ignore */
  }
  return Array.from({ length: AREA_COUNT }, (_, i) => promotions[i]?.id ?? null);
}

/** One campaign chip under an offer: which guest segments receive it. */
function SegmentChecks({
  campaign,
  promotionId,
  conflict,
  onToggle,
  onRemove,
  onDragStart,
}: {
  campaign: MarketingCampaign;
  promotionId: string;
  conflict: Record<AudienceKey, boolean>;
  onToggle: (audience: AudienceKey, value: boolean) => void;
  onRemove: () => void;
  onDragStart: (event: React.DragEvent) => void;
}) {
  const ids = { direct: campaign.variants.direct, ota: campaign.variants.ota };
  return (
    <div draggable onDragStart={onDragStart} className="flex cursor-grab items-center gap-2 rounded-sm border border-border bg-background px-2 py-1.5 active:cursor-grabbing">
      <GripVertical size={11} className="shrink-0 text-muted-foreground/60" />
      <span className="min-w-0 flex-1 truncate text-[11.5px] font-medium text-card-foreground">{campaign.name}</span>
      {AUDIENCE_KEYS.map((audience) => {
        const checked = ids[audience].promotionMode === "custom" && ids[audience].promotionId === promotionId;
        return (
          <label
            key={audience}
            className={`flex shrink-0 cursor-pointer items-center gap-1 rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition-colors ${
              checked ? "border-brand/50 bg-brand-soft text-brand" : "border-border text-muted-foreground hover:border-brand/40"
            } ${conflict[audience] ? "opacity-50" : ""}`}
            title={conflict[audience] ? "This segment already receives a different offer" : undefined}
          >
            <input
              type="checkbox"
              checked={checked}
              disabled={conflict[audience]}
              onChange={(event) => onToggle(audience, event.target.checked)}
              className="sr-only"
            />
            <span className="grid size-2.5 place-items-center rounded-[2px] border border-current">
              {checked && <Check size={8} strokeWidth={3.5} />}
            </span>
            {audience}
          </label>
        );
      })}
      <button
        type="button"
        aria-label={`Remove ${campaign.name} from this offer`}
        onClick={onRemove}
        className="shrink-0 text-muted-foreground hover:text-destructive"
      >
        <X size={11} />
      </button>
    </div>
  );
}

/**
 * Assignment-only promotion surface: four user-chosen offer areas with their
 * campaigns listed beneath, a horizontal row of draggable campaign cards, and
 * Direct/OTA checkboxes on every campaign/offer relationship.
 */
export function PromoDropOverlay({
  campaigns,
  onClose,
}: {
  campaigns: MarketingCampaign[];
  onClose: () => void;
}) {
  const { promotions } = useMarketing();
  const [areas, setAreas] = useState<Areas>(() => loadAreas(promotions));
  const [dragging, setDragging] = useState<string | null>(null);
  const [overArea, setOverArea] = useState<number | null>(null);
  const [picker, setPicker] = useState<number | null>(null);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(areas));
    } catch {
      /* ignore */
    }
  }, [areas]);

  // Seed with the most-used offers when no saved choice exists.
  useEffect(() => {
    setAreas((current) => {
      if (current.some((id) => id && promotions.some((p) => p.id === id))) return current;
      const used = new Map<string, number>();
      campaigns.forEach((c) =>
        AUDIENCE_KEYS.forEach((a) => {
          const id = c.variants[a].promotionId;
          if (c.variants[a].promotionMode === "custom" && id) used.set(id, (used.get(id) ?? 0) + 1);
        }),
      );
      const ranked = [...promotions].sort(
        (x, y) => (used.get(y.id) ?? 0) - (used.get(x.id) ?? 0),
      );
      return ranked.slice(0, AREA_COUNT).map((p) => p.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const byId = (id: string | null) => (id ? promotions.find((p) => p.id === id) ?? null : null);

  const campaignsOn = (promotionId: string) =>
    campaigns.filter((c) =>
      AUDIENCE_KEYS.some(
        (a) => c.variants[a].promotionMode === "custom" && c.variants[a].promotionId === promotionId,
      ),
    );

  const unassigned = campaigns.filter((campaign) =>
    AUDIENCE_KEYS.every((audience) => campaign.variants[audience].promotionMode !== "custom"),
  );

  const beginDrag = (event: React.DragEvent, campaignId: string) => {
    event.dataTransfer.setData(CAMPAIGN_DRAG_TYPE, campaignId);
    event.dataTransfer.effectAllowed = "move";
    setDragging(campaignId);
  };

  /** True when the segment already carries a different offer. */
  const conflictOf = (campaign: MarketingCampaign, promotionId: string): Record<AudienceKey, boolean> => ({
    direct:
      campaign.variants.direct.promotionMode === "custom" &&
      campaign.variants.direct.promotionId !== null &&
      campaign.variants.direct.promotionId !== promotionId,
    ota:
      campaign.variants.ota.promotionMode === "custom" &&
      campaign.variants.ota.promotionId !== null &&
      campaign.variants.ota.promotionId !== promotionId,
  });

  const toggle = (campaignId: string, audience: AudienceKey, promotionId: string, value: boolean) => {
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign) return;
    const conflict = conflictOf(campaign, promotionId);
    if (value && conflict[audience]) {
      setNote(`${campaign.name} · ${audience === "direct" ? "Direct" : "OTA"} guests already receive a different offer. Remove that one first.`);
      return;
    }
    setVariantPromotion(campaignId, audience, value ? promotionId : null);
  };

  const dropCampaign = (campaignId: string, promotionId: string) => {
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign) return;
    const conflict = conflictOf(campaign, promotionId);
    AUDIENCE_KEYS.forEach((audience) => {
      if (!conflict[audience]) setVariantPromotion(campaignId, audience, promotionId);
    });
    const blocked = AUDIENCE_KEYS.filter((a) => conflict[a]);
    if (blocked.length === 2) {
      setNote(`${campaign.name} already receives a different offer for both guest segments.`);
    } else if (blocked.length === 1) {
      setNote(
        `${campaign.name} attached for ${blocked[0] === "direct" ? "OTA" : "Direct"} guests. Its ${blocked[0] === "direct" ? "Direct" : "OTA"} guests keep their existing offer — untick or replace it below.`,
      );
    }
  };

  const allow = (event: React.DragEvent) => {
    if (!event.dataTransfer.types.includes(CAMPAIGN_DRAG_TYPE)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-canvas">
      <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-3 sm:px-6">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-brand">Promotions</p>
          <h2 className="truncate text-[17px] font-semibold text-card-foreground">Manage promos</h2>
          <p className="truncate text-[11.5px] text-muted-foreground">
            Move campaigns from No promotion to an offer, then choose which guest segments receive it.
          </p>
        </div>
        <Button variant="brand" size="sm" onClick={onClose}>
          Done
        </Button>
      </header>

      <p className="flex items-start gap-2 border-b border-border bg-brand-soft/50 px-4 py-2 text-[11.5px] text-muted-foreground sm:px-6">
        <Info size={13} className="mt-[1px] shrink-0 text-brand" />
         Every campaign starts in No promotion. A campaign can carry one offer per guest segment, so Direct and OTA guests can each get a different one. Creating
        or editing the offers themselves stays in the Promotions tab.
      </p>

      {note && (
        <div className="flex items-center justify-between gap-3 border-b border-border bg-amber-500/10 px-4 py-2 text-[12px] text-foreground sm:px-6">
          <span className="min-w-0">{note}</span>
          <button type="button" onClick={() => setNote(null)} className="shrink-0 text-muted-foreground hover:text-foreground" aria-label="Dismiss">
            <X size={13} />
          </button>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Your offers</p>
          <p className="text-[11px] text-muted-foreground">Drag campaign cards between columns</p>
        </div>

        <div className="mt-3 grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <section
            onDragOver={(event) => { allow(event); setOverArea(-1); }}
            onDragLeave={() => setOverArea((current) => (current === -1 ? null : current))}
            onDrop={(event) => {
              event.preventDefault();
              const campaignId = event.dataTransfer.getData(CAMPAIGN_DRAG_TYPE);
              if (campaignId) AUDIENCE_KEYS.forEach((key) => setVariantPromotion(campaignId, key, null));
              setOverArea(null);
              setDragging(null);
            }}
            className={`flex min-h-[340px] flex-col rounded-xl border p-4 transition-colors ${overArea === -1 ? "border-brand bg-brand-soft" : "border-border bg-card"}`}
          >
            <div className="flex items-start gap-2 border-b border-border pb-2.5">
              <span className="grid size-8 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground"><Ban size={15} /></span>
              <div><p className="text-[12.5px] font-semibold text-card-foreground">No promotion</p><p className="mt-0.5 text-[10.5px] text-muted-foreground">Campaigns without an assigned offer</p></div>
            </div>
            <div className="mt-2 min-h-0 flex-1 space-y-1.5 overflow-y-auto">
              {unassigned.map((campaign) => (
                <article key={campaign.id} draggable onDragStart={(event) => beginDrag(event, campaign.id)} onDragEnd={() => setDragging(null)} className={`flex cursor-grab items-center gap-2 rounded-sm border border-border bg-background px-2 py-2 active:cursor-grabbing ${dragging === campaign.id ? "opacity-50" : ""}`}>
                  <GripVertical size={11} className="shrink-0 text-muted-foreground/60" />
                  <div className="min-w-0"><p className="truncate text-[11.5px] font-medium text-card-foreground">{campaign.name}</p><p className="truncate text-[10px] text-muted-foreground">{campaign.timing}</p></div>
                </article>
              ))}
              {unassigned.length === 0 && <p className="rounded-md border border-dashed border-border px-3 py-5 text-center text-[11px] text-muted-foreground">Drop here to remove a promotion</p>}
            </div>
          </section>
          {areas.map((promotionId, index) => {
            const promotion = byId(promotionId);
            const assigned = promotion ? campaignsOn(promotion.id) : [];
            return (
              <section
                key={index}
                onDragOver={(event) => {
                  allow(event);
                  setOverArea(index);
                }}
                onDragLeave={() => setOverArea((c) => (c === index ? null : c))}
                onDrop={(event) => {
                  event.preventDefault();
                  const id = event.dataTransfer.getData(CAMPAIGN_DRAG_TYPE);
                  setOverArea(null);
                  setDragging(null);
                  if (id && promotion) dropCampaign(id, promotion.id);
                }}
                className={`flex min-h-[220px] flex-col rounded-lg border p-3 transition-colors ${
                  overArea === index ? "border-brand bg-brand-soft" : promotion ? "border-brand/30 bg-brand-soft/30" : "border-dashed border-border bg-card"
                }`}
              >
                {promotion ? (
                  <>
                    <div className="flex items-start justify-between gap-2 border-b border-border pb-2.5">
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 truncate text-[12.5px] font-semibold text-card-foreground">
                          <Gift size={13} className="shrink-0 text-brand" />
                          {promotion.name}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 truncate text-[10.5px] text-muted-foreground">
                          <Tag size={10} className="shrink-0" />
                          {CODE_TYPE_LABEL[promotion.codeType ?? "promo"]} {promotion.code}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 truncate text-[10.5px] text-muted-foreground">
                          <CalendarClock size={10} className="shrink-0" />
                          {promotionValidity(promotion)}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => setPicker(index)}
                          className="text-[10.5px] font-semibold text-brand hover:underline"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={() => setAreas((current) => current.map((v, i) => (i === index ? null : v)))}
                          className="text-[10.5px] text-muted-foreground hover:text-destructive"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 min-h-0 flex-1 space-y-1.5 overflow-y-auto">
                      {assigned.map((campaign) => (
                        <SegmentChecks
                          key={campaign.id}
                          campaign={campaign}
                          promotionId={promotion.id}
                          conflict={conflictOf(campaign, promotion.id)}
                          onToggle={(audience, value) => toggle(campaign.id, audience, promotion.id, value)}
                          onRemove={() =>
                            AUDIENCE_KEYS.forEach((a) => setVariantPromotion(campaign.id, a, null))
                          }
                          onDragStart={(event) => beginDrag(event, campaign.id)}
                        />
                      ))}
                      {assigned.length === 0 && (
                        <p className="rounded-md border border-dashed border-border px-3 py-5 text-center text-[11px] text-muted-foreground">
                          Drop a campaign here
                        </p>
                      )}
                    </div>
                    <p className="mt-2 border-t border-border pt-1.5 text-[10px] text-muted-foreground">
                      {promotionDuration(promotion)}
                    </p>
                  </>
                ) : (
                  <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 text-center">
                    <p className="text-[12px] font-medium text-muted-foreground">Empty offer area</p>
                    <Button variant="outline" size="sm" onClick={() => setPicker(index)}>
                      Choose promotion
                    </Button>
                  </div>
                )}
              </section>
            );
          })}
        </div>

      </div>

      <PromotionAreaPicker
        open={picker !== null}
        promotions={promotions}
        activeIds={areas}
        onClose={() => setPicker(null)}
        onSelect={(id) => {
          if (picker !== null) setAreas((current) => current.map((v, i) => (i === picker ? id : v)));
          setPicker(null);
        }}
      />
    </div>
  );
}

/** Compact chooser for which offer occupies one of the four areas. */
function PromotionAreaPicker({
  open,
  promotions,
  activeIds,
  onClose,
  onSelect,
}: {
  open: boolean;
  promotions: Promotion[];
  activeIds: Areas;
  onClose: () => void;
  onSelect: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return promotions.filter((p) => !q || `${p.name} ${p.detail} ${p.code}`.toLowerCase().includes(q));
  }, [promotions, query]);

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-h-[80vh] max-w-lg overflow-hidden border-border bg-card p-0 shadow-float">
        <DialogHeader className="border-b border-border px-5 py-4 pr-12">
          <DialogTitle className="text-[16px]">Choose a promotion</DialogTitle>
          <DialogDescription>Pick which offer fills this area.</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 overflow-y-auto p-5">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search promotions"
              className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-[13px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div className="mt-3 space-y-1.5">
            {list.map((promotion) => {
              const usedElsewhere = activeIds.includes(promotion.id);
              return (
                <button
                  key={promotion.id}
                  onClick={() => onSelect(promotion.id)}
                  className="flex w-full items-start gap-3 rounded-md border border-border bg-background p-3 text-left transition-colors hover:border-brand/50"
                >
                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                    <Gift size={15} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-semibold text-card-foreground">{promotion.name}</span>
                    <span className="mt-0.5 block text-[11.5px] text-muted-foreground">
                      {CODE_TYPE_LABEL[promotion.codeType ?? "promo"]} {promotion.code} · {promotionValidity(promotion)}
                    </span>
                    {usedElsewhere && (
                      <span className="mt-1 block text-[10.5px] font-medium text-brand">
                        Already shown in another area — selecting moves it here
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
            {list.length === 0 && (
              <p className="py-4 text-center text-[12px] text-muted-foreground">No promotions match.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
