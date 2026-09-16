import { useState } from "react";
import { Gift, Pencil, Plus, Search, X } from "lucide-react";
import { MarketingShell } from "./MarketingShell";
import { PromotionAssignOverlay } from "./PromotionAssignOverlay";
import { PromoBanner } from "./PromoBanner";
import { Button } from "@/components/ui/button";
import { CODE_TYPE_LABEL, campaignPromotionId, mutate, promotionValidity, uid, useMarketing } from "@/lib/marketing";

export function PromotionsPage() {
  const { campaigns, promotions } = useMarketing();
  const [managing, setManaging] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [detail, setDetail] = useState("");
  const [code, setCode] = useState("");
  const [codeType, setCodeType] = useState<"promo" | "rate" | "corporate">("promo");
  const [discount, setDiscount] = useState("");
  const [minNights, setMinNights] = useState("");
  const [tagline, setTagline] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [durationDays, setDurationDays] = useState("");

  const q = query.trim().toLowerCase();
  const list = promotions.filter(
    (promotion) => !q || `${promotion.name} ${promotion.detail} ${promotion.code}`.toLowerCase().includes(q),
  );
  const active = promotions.find((promotion) => promotion.id === managing) ?? null;

  const create = () => {
    const clean = name.trim();
    if (!clean) return;
    mutate((draft) =>
      draft.promotions.push({
        id: uid(),
        name: clean,
        detail: detail.trim() || "Custom hotel offer.",
        code: code.trim() || "OFFER",
        codeType,
        discountPercent: discount ? Number(discount) : undefined,
        minNights: minNights ? Number(minNights) : undefined,
        tagline: tagline.trim() || undefined,
        startsAt: startsAt || undefined,
        endsAt: endsAt || undefined,
        durationDays: durationDays ? Number(durationDays) : undefined,
      }),
    );
    setName("");
    setDetail("");
    setCode("");
    setCodeType("promo");
    setDiscount("");
    setMinNights("");
    setTagline("");
    setStartsAt("");
    setEndsAt("");
    setDurationDays("");
    setCreating(false);
  };

  return (
    <MarketingShell title="Promotions">
      <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-brand">Marketing assets</p>
            <h2 className="mt-1 text-[22px] font-semibold text-foreground">Promotions</h2>
            <p className="mt-1 max-w-2xl text-[13px] text-muted-foreground">
              Every offer used across automated invites, transactional and in-property messages. A campaign can carry
              one promotion at a time.
            </p>
          </div>
          <Button variant="brand" size="sm" onClick={() => setCreating((v) => !v)}>
            {creating ? <X size={14} /> : <Plus size={14} />}
            {creating ? "Cancel" : "New promotion"}
          </Button>
        </div>

        {creating && (
          <div className="mt-4 grid gap-4 rounded-md border border-border bg-card p-4 shadow-card lg:grid-cols-[1fr_250px]">
            <div>
            <div className="grid gap-2 sm:grid-cols-[1.2fr_1.6fr_0.7fr_auto]">
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Promotion name"
                className="rounded-sm border border-input bg-background px-3 py-2 text-[12.5px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
              <input
                value={detail}
                onChange={(event) => setDetail(event.target.value)}
                placeholder="Short description"
                className="rounded-sm border border-input bg-background px-3 py-2 text-[12.5px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
              <input
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="CODE"
                className="rounded-sm border border-input bg-background px-3 py-2 text-[12.5px] uppercase outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
              <Button variant="brand" size="sm" onClick={create}>
                Save
              </Button>
            </div>
            <div className="mt-3 grid gap-2 border-t border-border pt-3 sm:grid-cols-2">
              <label className="grid gap-1">
                <span className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">Code type</span>
                <select
                  value={codeType}
                  onChange={(event) => setCodeType(event.target.value as typeof codeType)}
                  className="rounded-sm border border-input bg-background px-2.5 py-1.5 text-[12.5px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                >
                  <option value="promo">Promo code</option>
                  <option value="rate">Rate code</option>
                  <option value="corporate">Corporate ID</option>
                </select>
              </label>
              <label className="grid gap-1">
                <span className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">Discount %</span>
                <input
                  value={discount}
                  onChange={(event) => setDiscount(event.target.value.replace(/[^0-9]/g, ""))}
                  inputMode="numeric"
                  placeholder="e.g. 15"
                  className="rounded-sm border border-input bg-background px-2.5 py-1.5 text-[12.5px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">Minimum nights</span>
                <input
                  value={minNights}
                  onChange={(event) => setMinNights(event.target.value.replace(/[^0-9]/g, ""))}
                  inputMode="numeric"
                  placeholder="e.g. 2"
                  className="rounded-sm border border-input bg-background px-2.5 py-1.5 text-[12.5px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </label>
              <label className="grid gap-1 sm:col-span-2">
                <span className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">Tagline on the offer banner</span>
                <input
                  value={tagline}
                  onChange={(event) => setTagline(event.target.value)}
                  placeholder="e.g. Stay longer and save"
                  className="rounded-sm border border-input bg-background px-2.5 py-1.5 text-[12.5px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="grid gap-1">
                  <span className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">Valid from</span>
                  <input
                    type="date"
                    value={startsAt}
                    onChange={(event) => setStartsAt(event.target.value)}
                    className="rounded-sm border border-input bg-background px-2.5 py-1.5 text-[12.5px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">Until</span>
                  <input
                    type="date"
                    value={endsAt}
                    onChange={(event) => setEndsAt(event.target.value)}
                    className="rounded-sm border border-input bg-background px-2.5 py-1.5 text-[12.5px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                </label>
              </div>
              <label className="grid gap-1">
                <span className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">How long it lasts (days)</span>
                <input
                  value={durationDays}
                  onChange={(event) => setDurationDays(event.target.value.replace(/[^0-9]/g, ""))}
                  inputMode="numeric"
                  placeholder="e.g. 30"
                  className="rounded-sm border border-input bg-background px-2.5 py-1.5 text-[12.5px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </label>
            </div>
            <p className="mt-2 text-[10.5px] text-muted-foreground">Leave the dates empty and the offer runs with no end date.</p>
            </div>
            <div className="lg:sticky lg:top-2">
              <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                Guest preview
              </p>
              <PromoBanner
                promotion={{
                  name: name || "New promotion",
                  detail,
                  code: code || "OFFER",
                  codeType,
                  discountPercent: discount ? Number(discount) : undefined,
                  minNights: minNights ? Number(minNights) : undefined,
                  tagline: tagline || undefined,
                  startsAt: startsAt || undefined,
                  endsAt: endsAt || undefined,
                  durationDays: durationDays ? Number(durationDays) : undefined,
                }}
              />
            </div>
          </div>
        )}

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
                className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-card transition-colors hover:border-brand/40"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-md bg-brand-soft text-brand">
                  <Gift size={16} />
                </span>
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
                <span
                  className={`hidden shrink-0 rounded-sm px-2.5 py-1 text-[11px] font-semibold sm:inline ${
                    count ? "bg-brand-soft text-brand" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {count === 0 ? "No campaigns" : `${count} campaign${count === 1 ? "" : "s"}`}
                </span>
                <Button
                  variant={count ? "outline" : "brand"}
                  size="sm"
                  className="shrink-0"
                  onClick={() => setManaging(promotion.id)}
                >
                  {count ? <Pencil size={13} /> : <Plus size={13} />}
                  {count ? "Edit" : "Assign"}
                </Button>
              </article>
            );
          })}
          {list.length === 0 && (
            <p className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-[13px] text-muted-foreground">
              No promotions match that search.
            </p>
          )}
        </div>
      </div>

      {active && <PromotionAssignOverlay promotion={active} onClose={() => setManaging(null)} />}
    </MarketingShell>
  );
}
