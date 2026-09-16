import { useMemo, useState } from "react";
import { Check, Gift, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { mutate, uid, useMarketing } from "@/lib/marketing";

export function PromotionSelector({
  open,
  campaignName,
  selectedId,
  onClose,
  onSelect,
}: {
  open: boolean;
  campaignName: string;
  selectedId: string | null;
  onClose: () => void;
  onSelect: (id: string | null) => void;
}) {
  const { promotions } = useMarketing();
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [detail, setDetail] = useState("");
  const [code, setCode] = useState("");
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return promotions.filter((promotion) =>
      !q || `${promotion.name} ${promotion.detail} ${promotion.code}`.toLowerCase().includes(q),
    );
  }, [promotions, query]);

  const createPromotion = () => {
    const cleanName = name.trim();
    if (!cleanName) return;
    const id = uid();
    mutate((draft) => {
      draft.promotions.push({ id, name: cleanName, detail: detail.trim() || "Custom hotel offer.", code: code.trim() });
    });
    onSelect(id);
    setName("");
    setDetail("");
    setCode("");
    setCreating(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-h-[86vh] max-w-2xl overflow-hidden border-border bg-card p-0 shadow-float">
        <DialogHeader className="border-b border-border px-5 py-4 pr-12">
          <DialogTitle className="text-[16px]">Promotion for {campaignName}</DialogTitle>
          <DialogDescription>Select the offer you’d like to include in this campaign.</DialogDescription>
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

          <div className="mt-4 space-y-2">
            {results.map((promotion) => {
              const active = promotion.id === selectedId;
              return (
                <button
                  key={promotion.id}
                  onClick={() => {
                    onSelect(promotion.id);
                    onClose();
                  }}
                  className={`flex w-full items-start gap-3 rounded-md border p-3 text-left transition-colors ${
                    active ? "border-brand bg-brand-soft" : "border-border bg-background hover:border-brand/50"
                  }`}
                >
                  <span className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-md ${active ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground"}`}>
                    {active ? <Check size={15} /> : <Gift size={15} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-semibold text-card-foreground">{promotion.name}</span>
                    <span className="mt-0.5 block text-[11.5px] leading-relaxed text-muted-foreground">{promotion.detail}</span>
                    {promotion.code && <span className="mt-1 block text-[10.5px] font-semibold text-brand">Code {promotion.code}</span>}
                  </span>
                </button>
              );
            })}
          </div>

          {creating ? (
            <div className="mt-4 rounded-md border border-border bg-muted/35 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-[11.5px] font-semibold text-muted-foreground">Name
                  <input value={name} onChange={(event) => setName(event.target.value)} className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-[13px] text-foreground outline-none focus:border-brand" />
                </label>
                <label className="text-[11.5px] font-semibold text-muted-foreground">Promo code
                  <input value={code} onChange={(event) => setCode(event.target.value)} className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-[13px] text-foreground outline-none focus:border-brand" />
                </label>
              </div>
              <label className="mt-3 block text-[11.5px] font-semibold text-muted-foreground">Offer details
                <input value={detail} onChange={(event) => setDetail(event.target.value)} className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-[13px] text-foreground outline-none focus:border-brand" />
              </label>
              <div className="mt-3 flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setCreating(false)}><X size={14} />Cancel</Button>
                <Button variant="brand" size="sm" onClick={createPromotion} disabled={!name.trim()}>Create and select</Button>
              </div>
            </div>
          ) : (
            <Button variant="ghost" size="sm" className="mt-3 text-brand" onClick={() => setCreating(true)}>
              <Plus size={14} />Create promotion
            </Button>
          )}
        </div>

        <DialogFooter className="border-t border-border px-5 py-3">
          {selectedId && <Button variant="ghost" onClick={() => { onSelect(null); onClose(); }}>Remove promotion</Button>}
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}