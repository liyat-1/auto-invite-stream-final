import { useState } from "react";
import { Pencil, Plus, Search } from "lucide-react";
import { MarketingShell } from "./MarketingShell";
import { PromotionAssignOverlay } from "./PromotionAssignOverlay";
import { PromotionEditorOverlay } from "./PromotionEditorOverlay";
import { PromoBanner } from "./PromoBanner";
import { Button } from "@/components/ui/button";
import {
  CODE_TYPE_LABEL,
  campaignPromotionId,
  promotionValidity,
  useMarketing,
} from "@/lib/marketing";

export function PromotionsPage() {
  const { campaigns, promotions } = useMarketing();
  const [managing, setManaging] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const list = promotions.filter(
    (promotion) => !q || `${promotion.name} ${promotion.detail} ${promotion.code}`.toLowerCase().includes(q),
  );
  const active = promotions.find((promotion) => promotion.id === managing) ?? null;
  const editTarget = promotions.find((promotion) => promotion.id === editingId) ?? null;

  return (
    <MarketingShell title="Promotions">
      <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-brand">Marketing assets</p>
            <h2 className="mt-1 text-[22px] font-semibold text-foreground">Promotions</h2>
            <p className="mt-1 max-w-2xl text-[13px] text-muted-foreground">
              Create and design every offer here — layout, colour, logo and wording included. Assigning an offer to
              campaigns is a separate step, so nothing gets mixed up.
            </p>
          </div>
          <Button variant="brand" size="sm" onClick={() => setCreating(true)}>
            <Plus size={14} />
            New promotion
          </Button>
        </div>

        <div className="relative mt-5 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search promotions"
            className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-[13px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>

        <div className="mt-4 space-y-2 pb-16">
          {list.map((promotion) => {
            const count = campaigns.filter((campaign) => campaignPromotionId(campaign) === promotion.id).length;
            return (
              <article
                key={promotion.id}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-card transition-colors hover:border-brand/40"
              >
                <button
                  type="button"
                  title="Edit this promotion"
                  onClick={() => setEditingId(promotion.id)}
                  className="relative hidden h-[122px] w-[176px] shrink-0 overflow-hidden rounded-md border border-border bg-muted/30 sm:block"
                >
                  <div
                    className="absolute left-0 top-0 w-[292px] origin-top-left"
                    style={{ transform: "scale(0.6)" }}
                  >
                    <PromoBanner promotion={promotion} className="shadow-none" />
                  </div>
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-semibold text-card-foreground">{promotion.name}</p>
                  <p className="truncate text-[11.5px] text-muted-foreground">
                    {promotion.detail} · {promotion.code}
                  </p>
                  <p className="mt-0.5 truncate text-[10.5px] text-muted-foreground">
                    {CODE_TYPE_LABEL[promotion.codeType ?? "promo"]}
                    {promotion.discountPercent ? ` · ${promotion.discountPercent}% off` : ""}
                    {promotion.minNights ? ` · min ${promotion.minNights} night${promotion.minNights === 1 ? "" : "s"}` : ""} ·{" "}
                    {promotionValidity(promotion)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span
                    className={`rounded-sm px-2.5 py-1 text-[11px] font-semibold ${
                      count ? "bg-brand-soft text-brand" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {count === 0 ? "No campaigns" : `${count} campaign${count === 1 ? "" : "s"}`}
                  </span>
                  <div className="flex gap-1.5">
                    <Button variant="outline" size="sm" onClick={() => setEditingId(promotion.id)}>
                      <Pencil size={13} />
                      Edit
                    </Button>
                    <Button variant={count ? "outline" : "brand"} size="sm" onClick={() => setManaging(promotion.id)}>
                      {!count && <Plus size={13} />}
                      Assign
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
          {list.length === 0 && (
            <p className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-[13px] text-muted-foreground">
              {promotions.length === 0
                ? "No promotions yet — create your first offer."
                : "No promotions match that search."}
            </p>
          )}
        </div>
      </div>

      {creating && <PromotionEditorOverlay promotion={null} onClose={() => setCreating(false)} />}
      {editTarget && <PromotionEditorOverlay promotion={editTarget} onClose={() => setEditingId(null)} />}
      {active && <PromotionAssignOverlay promotion={active} onClose={() => setManaging(null)} />}
    </MarketingShell>
  );
}
