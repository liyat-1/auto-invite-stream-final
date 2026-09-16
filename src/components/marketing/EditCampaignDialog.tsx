import { AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { type MarketingCampaign } from "@/lib/marketing";

export function EditCampaignDialog({ campaign, open, onClose, onContinue }: { campaign: MarketingCampaign | null; open: boolean; onClose: () => void; onContinue: () => void }) {
  if (!campaign) return null;
  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-w-lg border-border bg-card p-0 shadow-float">
        <DialogHeader className="border-b border-border px-5 py-4 pr-12">
          <DialogTitle className="text-[16px]">Edit future invites?</DialogTitle>
          <DialogDescription>Previously sent invites will not be affected.</DialogDescription>
        </DialogHeader>
        <div className="flex items-start gap-3 px-5 py-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-md bg-warning-soft text-warning"><AlertTriangle size={17} /></span>
          <p className="text-[13px] leading-relaxed text-card-foreground">Changes to <strong>{campaign.name}</strong> will apply only to future invites.</p>
        </div>
        <DialogFooter className="border-t border-border px-5 py-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="brand" onClick={onContinue}>Continue editing<ArrowRight size={14} /></Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}