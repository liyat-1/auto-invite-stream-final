import { useEffect, useMemo, useState } from "react";
import { Check, Gift, RotateCcw, X } from "lucide-react";
import { TextEditor } from "./TextEditor";
import { EmailEditor } from "./EmailEditor";
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
  const { campaigns, promotions } = marketing;
  const source = campaigns.find((campaign) => campaign.id === id);
  const [draft, setDraft] = useState<MarketingCampaign | null>(() => source ? clone(source) : null);
  const [baseline, setBaseline] = useState(() => source ? JSON.stringify(source) : "");
  const [audience, setAudience] = useState<AudienceKey>("direct");
  const [channel, setChannel] = useState<"text" | "email">("text");
  const [confirm, setConfirm] = useState<"leave" | "save" | "revert" | null>(null);
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
    <div className="fixed inset-0 z-[60] flex flex-col bg-canvas">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="min-w-0"><p className="text-[10.5px] font-medium text-muted-foreground">Automated invite</p><h2 className="truncate text-[17px] font-semibold text-card-foreground">{draft.name}</h2><p className="truncate text-[11.5px] text-muted-foreground">{STRATEGY_LABEL[draft.strategy]}</p></div>
        </div>
        <div className="flex items-center gap-2"><span className={`text-[11.5px] ${dirty ? "text-brand" : "text-muted-foreground"}`}>{dirty ? "Unsaved changes" : "All changes saved"}</span><Button variant="brand" size="sm" disabled={!dirty} onClick={requestSave}><Check size={14} />Save changes</Button><Button variant="ghost" size="icon" onClick={closeSafely} aria-label="Close editor"><X size={18} /></Button></div>
      </header>

      <div className="flex flex-wrap items-center gap-3 border-b border-border bg-card px-4 py-2.5 sm:px-6">
        <div className="flex gap-1 rounded-md bg-muted p-1">{(["direct", "ota"] as AudienceKey[]).map((key) => <button key={key} onClick={() => setAudience(key)} className={segment(audience === key)}>{AUDIENCE_LABEL[key]}{draft.variants[key].customized && <span className="ml-1.5 inline-block size-1.5 rounded-full bg-brand" />}</button>)}</div>
        <div className="flex gap-1 rounded-md bg-muted p-1"><button onClick={() => setChannel("text")} className={segment(activeChannel === "text")}>Text</button><button onClick={() => strategyHasEmail(draft.strategy) && setChannel("email")} disabled={!strategyHasEmail(draft.strategy)} className={segment(activeChannel === "email", !strategyHasEmail(draft.strategy))}>Email</button></div>
        <span className="text-[11.5px] text-muted-foreground">{activeChannel === "text" ? "Text" : "Email"} · <span className={variant.customization[activeChannel] ? "font-medium text-brand" : ""}>{variant.customization[activeChannel] ? "Customized" : "Default"}</span></span>
        <Button variant="ghost" size="sm" className="ml-auto" disabled={!variant.customization[activeChannel]} onClick={() => setConfirm("revert")}><RotateCcw size={13} />Revert content</Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6"><div className="mx-auto max-w-6xl space-y-4"><section className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4 shadow-card"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-md bg-brand-soft text-brand"><Gift size={16} /></span><div><p className="text-[12.5px] font-semibold text-card-foreground">Promotion for {AUDIENCE_LABEL[audience]}</p><p className="text-[11px] text-muted-foreground">{effectivePromotion(marketing, draft, audience)?.name ?? "No promotion selected"}</p></div></div><select value={variant.promotionMode === "custom" ? variant.promotionId ?? "none" : variant.promotionMode} onChange={(event) => setDraft((current) => { if (!current) return current; const copy = clone(current); const value = event.target.value; copy.variants[audience].promotionMode = value === "inherit" ? "inherit" : value === "none" ? "none" : "custom"; copy.variants[audience].promotionId = value === "inherit" || value === "none" ? null : value; copy.variants[audience].editedBy = { by: "Sevket Yilmaz", at: Date.now() }; return copy; })} className="h-9 min-w-56 rounded-md border border-input bg-background px-3 text-[12.5px] text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"><option value="inherit">Use global promotion</option><option value="none">No promotion</option>{promotions.map((promotion) => <option key={promotion.id} value={promotion.id}>{promotion.name}</option>)}</select></section><div className="rounded-lg border border-border bg-card p-4 shadow-card sm:p-6">{activeChannel === "text" ? <TextEditor value={variant.text} onChange={(text) => setVariant({ ...variant, text }, "text")} /> : <EmailEditor value={variant.email} customized={variant.customization.email} onChange={(email) => setVariant({ ...variant, email }, "email")} />}</div></div></div>

      <AlertDialog open={confirm !== null} onOpenChange={(value) => !value && setConfirm(null)}>
        <AlertDialogContent className="border-border bg-card shadow-float">
          <AlertDialogHeader><AlertDialogTitle>{confirm === "leave" ? "Unsaved changes" : confirm === "save" ? "Save changes to active campaign?" : "Revert content to suggested?"}</AlertDialogTitle><AlertDialogDescription>{confirm === "leave" ? "You have unsaved changes. Leave without saving?" : confirm === "save" ? "This campaign is active. Updated content will be used for future messages sent to eligible guests." : `Only ${AUDIENCE_LABEL[audience]} ${activeChannel} content for ${draft.name} will return to Directful’s suggested content.`}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>{confirm === "leave" ? "Stay and save" : "Cancel"}</AlertDialogCancel><AlertDialogAction className="bg-brand text-brand-foreground hover:bg-brand/90" onClick={confirm === "leave" ? onClose : confirm === "save" ? save : revertCurrent}>{confirm === "leave" ? "Leave" : confirm === "save" ? "Save changes" : "Revert"}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}