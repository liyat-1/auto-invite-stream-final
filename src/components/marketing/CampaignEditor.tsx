import { useEffect, useMemo, useState } from "react";
import { Check, Gift, RotateCcw, Trash2, X } from "lucide-react";
import { TextEditor } from "./TextEditor";
import { EmailEditor } from "./EmailEditor";
import { PromoBanner } from "./PromoBanner";
import { PromotionSelector } from "./PromotionSelector";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  AUDIENCE_LABEL,
  STRATEGY_LABEL,
  defaultVariant,
  effectivePromotion,
  mutate,
  strategyHasEmail,
  useMarketing,
  type AudienceKey,
  type MarketingCampaign,
} from "@/lib/marketing";

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export function CampaignEditor({ id, onClose }: { id: string; onClose: () => void }) {
  const marketing = useMarketing();
  const { campaigns } = marketing;
  const source = campaigns.find((campaign) => campaign.id === id);
  const [draft, setDraft] = useState<MarketingCampaign | null>(() => source ? clone(source) : null);
  const [baseline, setBaseline] = useState(() => source ? JSON.stringify(source) : "");
  const [audience, setAudience] = useState<AudienceKey>("direct");
  const [channel, setChannel] = useState<"text" | "email">("text");
  const [confirm, setConfirm] = useState<"leave" | "save" | "revert" | null>(null);
  const [promotionPicker, setPromotionPicker] = useState(false);
  const dirty = useMemo(() => draft ? JSON.stringify(draft) !== baseline : false, [draft, baseline]);

  useEffect(() => {
    if (!dirty) return;
    const guard = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [dirty]);

  if (!source || !draft) return null;
  const variant = draft.variants[audience];
  const activeChannel = strategyHasEmail(draft.strategy) ? channel : "text";
  const activePromotion = effectivePromotion(marketing, draft, audience);
  const closeSafely = () => dirty ? setConfirm("leave") : onClose();
  const save = () => {
    mutate((state) => {
      const index = state.campaigns.findIndex((campaign) => campaign.id === id);
      if (index >= 0) state.campaigns[index] = clone(draft);
    });
    setBaseline(JSON.stringify(draft));
    onClose();
  };
  const requestSave = () => draft.enabled && dirty ? setConfirm("save") : save();
  const setVariant = (next: typeof variant, kind: "text" | "email") => setDraft((current) => {
    if (!current) return current;
    const copy = clone(current);
    copy.variants[audience] = next;
    copy.variants[audience].customization[kind] = true;
    copy.variants[audience].customized = copy.variants[audience].customization.text || copy.variants[audience].customization.email;
    copy.variants[audience].editedBy = { by: "Sevket Yilmaz", at: Date.now() };
    return copy;
  });
  const setPromotion = (value: string | null | "inherit") => setDraft((current) => {
    if (!current) return current;
    const copy = clone(current);
    const next = copy.variants[audience];
    next.promotionMode = value === "inherit" ? "inherit" : value === null ? "none" : "custom";
    next.promotionId = value === "inherit" || value === null ? null : value;
    next.editedBy = { by: "Sevket Yilmaz", at: Date.now() };
    return copy;
  });
  const revertCurrent = () => {
    const suggested = defaultVariant(id, audience);
    setDraft((current) => {
      if (!current) return current;
      const copy = clone(current);
      if (activeChannel === "text") {
        copy.variants[audience].text = suggested.text;
        copy.variants[audience].customization.text = false;
      } else {
        copy.variants[audience].email = suggested.email;
        copy.variants[audience].customization.email = false;
      }
      copy.variants[audience].customized = copy.variants[audience].customization.text || copy.variants[audience].customization.email;
      return copy;
    });
    setConfirm(null);
  };

  const segment = (active: boolean, disabled = false) => `rounded px-3 py-1.5 text-[12.5px] font-medium transition-colors ${active ? "bg-card text-card-foreground shadow-card" : disabled ? "cursor-not-allowed text-muted-foreground/45" : "text-muted-foreground hover:text-foreground"}`;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-foreground/70 p-2 sm:p-4" onMouseDown={(event) => event.target === event.currentTarget && closeSafely()}>
      <section role="dialog" aria-modal="true" aria-labelledby="campaign-editor-title" className="flex h-[92vh] max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-lg border border-border bg-canvas shadow-float">
      <header className="flex flex-col gap-3 border-b border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="min-w-0"><p className="text-[10.5px] font-medium text-muted-foreground">Automated invite</p><h2 id="campaign-editor-title" className="truncate text-[17px] font-semibold text-card-foreground">{draft.name}</h2><p className="truncate text-[11.5px] text-muted-foreground">{STRATEGY_LABEL[draft.strategy]}</p></div>
        </div>
        <div className="flex items-center gap-2"><span className={`mr-auto text-[11.5px] sm:mr-0 ${dirty ? "text-brand" : "text-muted-foreground"}`}>{dirty ? "Unsaved changes" : "All changes saved"}</span><Button variant="brand" size="sm" disabled={!dirty} onClick={requestSave}><Check size={14} />Save changes</Button><Button variant="ghost" size="icon" onClick={closeSafely} aria-label="Close editor"><X size={18} /></Button></div>
      </header>

      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-card px-4 py-2.5 sm:gap-3 sm:px-6">
        <div className="flex gap-1 rounded-md bg-muted p-1">{(["direct", "ota"] as AudienceKey[]).map((key) => <button key={key} onClick={() => setAudience(key)} className={segment(audience === key)}>{AUDIENCE_LABEL[key]}{draft.variants[key].customized && <span className="ml-1.5 inline-block size-1.5 rounded-full bg-brand" />}</button>)}</div>
        <div className="flex gap-1 rounded-md bg-muted p-1"><button onClick={() => setChannel("text")} className={segment(activeChannel === "text")}>Text</button><button onClick={() => strategyHasEmail(draft.strategy) && setChannel("email")} disabled={!strategyHasEmail(draft.strategy)} className={segment(activeChannel === "email", !strategyHasEmail(draft.strategy))}>Email</button></div>
        <span className="hidden text-[11.5px] text-muted-foreground md:inline">{activeChannel === "text" ? "Text" : "Email"} · <span className={variant.customization[activeChannel] ? "font-medium text-brand" : ""}>{variant.customization[activeChannel] ? "Customized" : "Default"}</span></span>
        <Button variant="ghost" size="sm" className="ml-auto px-2 sm:px-3" disabled={!variant.customization[activeChannel]} onClick={() => setConfirm("revert")}><RotateCcw size={13} /><span className="hidden sm:inline">Revert content</span><span className="sm:hidden">Revert</span></Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="rounded-lg border border-border bg-card p-4 shadow-card sm:p-6">
            {activeChannel === "text" ? (
              <TextEditor value={variant.text} promotion={activePromotion} onChange={(text) => setVariant({ ...variant, text }, "text")} />
            ) : (
              <EmailEditor value={variant.email} promotion={activePromotion} customized={variant.customization.email} onChange={(email) => setVariant({ ...variant, email }, "email")} />
            )}
          </div>

          <section className="rounded-lg border border-border bg-card p-4 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-md bg-brand-soft text-brand"><Gift size={16} /></span>
                <div className="min-w-0">
                  <p className="text-[12.5px] font-semibold text-card-foreground">Promotion for {AUDIENCE_LABEL[audience]}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {activePromotion?.name ?? "No promotion selected"}
                    {variant.promotionMode === "inherit" ? " · Global promotion" : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {activePromotion && (
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setPromotion(null)}>
                    <Trash2 size={13} />Remove
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setPromotionPicker(true)}>{activePromotion ? "Change" : "Add promotion"}</Button>
              </div>
            </div>
            {activePromotion && (
              <div className="mx-auto mt-4 max-w-md">
                <PromoBanner promotion={activePromotion} className="shadow-none" />
              </div>
            )}
          </section>
        </div>
      </div>

      <PromotionSelector
        open={promotionPicker}
        campaignName={`${draft.name} · ${AUDIENCE_LABEL[audience]}`}
        selectedId={variant.promotionMode === "inherit" ? "inherit" : variant.promotionMode === "custom" ? variant.promotionId : null}
        inheritedId={marketing.globalPromotions[audience]}
        allowInherit
        onClose={() => setPromotionPicker(false)}
        onSelect={setPromotion}
      />

      <AlertDialog open={confirm !== null} onOpenChange={(value) => !value && setConfirm(null)}>
        <AlertDialogContent className="border-border bg-card shadow-float">
          <AlertDialogHeader><AlertDialogTitle>{confirm === "leave" ? "Unsaved changes" : confirm === "save" ? "Save changes to active campaign?" : "Revert content to suggested?"}</AlertDialogTitle><AlertDialogDescription>{confirm === "leave" ? "You have unsaved changes. Leave without saving?" : confirm === "save" ? "This campaign is active. Updated content will be used for future messages sent to eligible guests." : `Only ${AUDIENCE_LABEL[audience]} ${activeChannel} content for ${draft.name} will return to Directful’s suggested content.`}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>{confirm === "leave" ? "Stay and save" : "Cancel"}</AlertDialogCancel><AlertDialogAction className="bg-brand text-brand-foreground hover:bg-brand/90" onClick={confirm === "leave" ? onClose : confirm === "save" ? save : revertCurrent}>{confirm === "leave" ? "Leave" : confirm === "save" ? "Save changes" : "Revert"}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </section>
    </div>
  );
}