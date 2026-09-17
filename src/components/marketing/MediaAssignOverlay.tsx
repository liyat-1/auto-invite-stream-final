import { useMemo, useRef, useState } from "react";
import { Info, Search, Upload, X } from "lucide-react";
import { MediaThumb } from "./MediaPicker";
import { Button } from "@/components/ui/button";
import {
  MEDIA_DRAG_TYPE,
  attachMediaToCampaign,
  audienceMediaIds,
  commonMediaIds,
  detachMediaFromCampaign,
  mutate,
  uid,
  useMarketing,
  type AudienceKey,
  type MarketingCampaign,
  type MediaType,
  type MessageChannel,
} from "@/lib/marketing";

function typeOf(file: File): MediaType {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return "document";
}

const AUDIENCES: { key: AudienceKey; label: string; hint: string }[] = [
  { key: "direct", label: "Direct guests", hint: "Only guests who booked with you" },
  { key: "ota", label: "OTA guests", hint: "Only guests from booking sites" },
];

/** Small thumbnail chip for one attached file. */
function MediaChip({
  mediaId,
  media,
  onRemove,
  removeLabel,
}: {
  mediaId: string;
  media: ReturnType<typeof useMarketing>["media"];
  onRemove: () => void;
  removeLabel: string;
}) {
  const item = media.find((m) => m.id === mediaId);
  if (!item) return null;
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-sm border border-border bg-card py-0.5 pl-0.5 pr-1.5 text-[10px] text-muted-foreground">
      <span className="size-7 shrink-0 overflow-hidden rounded-[2px] border border-border bg-muted">
        <MediaThumb item={item} />
      </span>
      <span className="max-w-24 truncate">{item.name}</span>
      <button
        type="button"
        aria-label={removeLabel}
        title={removeLabel}
        onClick={onRemove}
        className="shrink-0 hover:text-destructive"
      >
        <X size={10} />
      </button>
    </span>
  );
}

/** One campaign's segment drop row with thumbnails for the active channel. */
function AudienceRow({
  campaign,
  audience,
  label,
  channel,
  media,
  dragging,
  onDrop,
  onRemove,
}: {
  campaign: MarketingCampaign;
  audience: AudienceKey;
  label: string;
  channel: MessageChannel;
  media: ReturnType<typeof useMarketing>["media"];
  dragging: string | null;
  onDrop: (campaignId: string, audience: AudienceKey) => void;
  onRemove: (campaignId: string, audience: AudienceKey, mediaId: string) => void;
}) {
  const [over, setOver] = useState(false);
  const ids = audienceMediaIds(campaign, audience, channel);
  return (
    <div
      onDragOver={(event) => {
        if (!event.dataTransfer.types.includes(MEDIA_DRAG_TYPE) && !dragging) return;
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = "copy";
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        event.stopPropagation();
        const id = event.dataTransfer.getData(MEDIA_DRAG_TYPE) || dragging;
        setOver(false);
        if (id) onDrop(campaign.id, audience);
      }}
      className={`rounded-sm border px-2 py-1.5 transition-colors ${
        over ? "border-brand bg-brand-soft" : "border-border bg-background"
      }`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      {ids.length === 0 ? (
        <p className="mt-0.5 text-[10.5px] text-muted-foreground">Drop a file here</p>
      ) : (
        <div className="mt-1 flex flex-wrap gap-1">
          {ids.map((id) => (
            <MediaChip
              key={id}
              mediaId={id}
              media={media}
              onRemove={() => onRemove(campaign.id, audience, id)}
              removeLabel={`Remove from ${label}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Full overlay for attaching media. Text and Email have separate tabs; each
 * has three global targets (All, Direct, OTA guests) that apply across every
 * campaign — with thumbnails and one-click removal everywhere — plus
 * individual campaign cards with per-segment drops.
 */
export function MediaAssignOverlay({
  campaigns,
  onClose,
}: {
  campaigns: MarketingCampaign[];
  onClose: () => void;
}) {
  const { media, folders } = useMarketing();
  const [channel, setChannel] = useState<MessageChannel>("text");
  const [query, setQuery] = useState("");
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const q = query.trim().toLowerCase();
  const list = useMemo(
    () => [...media].filter((item) => !q || item.name.toLowerCase().includes(q)).sort((a, b) => b.addedAt - a.addedAt),
    [media, q],
  );

  const upload = (files: FileList | File[] | null) => {
    const arr = Array.from(files ?? []);
    if (!arr.length) return;
    mutate((draft) =>
      arr.forEach((file) =>
        draft.media.unshift({
          id: uid(),
          name: file.name,
          type: typeOf(file),
          folder: folders[0] ?? "Uploads",
          size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
          url: file.type.startsWith("image/") || file.type.startsWith("video/") ? URL.createObjectURL(file) : undefined,
          addedAt: Date.now(),
        }),
      ),
    );
  };

  const allow = (event: React.DragEvent, key: string) => {
    if (!event.dataTransfer.types.includes(MEDIA_DRAG_TYPE) && !dragging) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setOver(key);
  };

  const pickedId = (event: React.DragEvent) => {
    const id = event.dataTransfer.getData(MEDIA_DRAG_TYPE) || dragging;
    if (!id) return null;
    event.preventDefault();
    setOver(null);
    setDragging(null);
    return id;
  };

  const dropGlobal = (event: React.DragEvent, audiences: AudienceKey[] | "all") => {
    const id = pickedId(event);
    if (!id) return;
    campaigns.forEach((campaign) =>
      attachMediaToCampaign(campaign.id, id, audiences === "all" ? ["direct", "ota"] : audiences, channel),
    );
  };

  const dropCampaign = (campaignId: string, audience: AudienceKey) => {
    if (!dragging) return;
    attachMediaToCampaign(campaignId, dragging, [audience], channel);
    setDragging(null);
  };

  const globalScopes: { key: string; label: string; hint: string; audiences: AudienceKey[] | "all" }[] = [
    { key: "all", label: "All guests", hint: "Every campaign · both segments", audiences: "all" },
    ...AUDIENCES.map((a) => ({ key: a.key, label: a.label, hint: a.hint, audiences: [a.key] as AudienceKey[] })),
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-canvas">
      <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-3 sm:px-6">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-brand">Media</p>
          <h2 className="truncate text-[17px] font-semibold text-card-foreground">Attach media to campaigns</h2>
          <p className="truncate text-[11.5px] text-muted-foreground">
            Drop a file on All, Direct or OTA guests to apply it everywhere, or on a single campaign.
          </p>
        </div>
        <Button variant="brand" size="sm" onClick={onClose}>
          Done
        </Button>
      </header>

      {/* Channel tabs */}
      <div className="flex gap-1 border-b border-border bg-card px-4 pt-2 sm:px-6">
        {(["text", "email"] as MessageChannel[]).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setChannel(c)}
            aria-pressed={channel === c}
            className={`rounded-t-md border-b-2 px-4 py-2 text-[12.5px] font-semibold transition-colors ${
              channel === c
                ? "border-brand text-brand"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {c === "text" ? "Text" : "Email"}
          </button>
        ))}
      </div>

      <p className="flex items-start gap-2 border-b border-border bg-brand-soft/50 px-4 py-2 text-[11.5px] text-muted-foreground sm:px-6">
        <Info size={13} className="mt-[1px] shrink-0 text-brand" />
        {channel === "text"
          ? "These files travel with the text message. Images and video are sent as MMS; documents are sent as a link."
          : "These images are placed inside the email content for every campaign in the chosen scope."}
      </p>

      <div className="grid min-h-0 flex-1 overflow-hidden md:grid-cols-[300px_1fr]">
        <aside className="flex min-h-0 flex-col overflow-hidden border-b border-border bg-card p-4 md:border-b-0 md:border-r">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[13px] font-semibold text-card-foreground">Media</h3>
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              <Upload size={13} />
              Upload
            </Button>
          </div>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.csv,.xls,.xlsx"
            className="hidden"
            onChange={(event) => {
              upload(event.target.files);
              event.target.value = "";
            }}
          />
          <div className="relative mt-2">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search media"
              className="w-full rounded-md border border-input bg-background py-1.5 pl-8 pr-2.5 text-[12.5px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div className="mt-2 grid min-h-0 flex-1 grid-cols-2 content-start gap-2 overflow-y-auto pr-1">
            {list.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData(MEDIA_DRAG_TYPE, item.id);
                  event.dataTransfer.setData("text/plain", item.id);
                  event.dataTransfer.effectAllowed = "copy";
                  setDragging(item.id);
                }}
                onDragEnd={() => setDragging(null)}
                className="cursor-grab overflow-hidden rounded-md border border-border bg-background transition-colors hover:border-brand/45 active:cursor-grabbing"
              >
                <div className="h-16 bg-muted">
                  <MediaThumb item={item} />
                </div>
                <p className="truncate px-1.5 py-1 text-[10.5px] text-muted-foreground">{item.name}</p>
              </div>
            ))}
            {list.length === 0 && (
              <p className="col-span-2 px-1 py-4 text-center text-[11.5px] text-muted-foreground">No media matches.</p>
            )}
          </div>
        </aside>

        <div className="min-h-0 overflow-y-auto p-4 sm:p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Apply to every campaign
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {globalScopes.map((scope) => {
              const common = commonMediaIds(campaigns, scope.audiences === "all" ? ["direct", "ota"] : scope.audiences, channel);
              return (
                <div
                  key={scope.key}
                  onDragOver={(event) => allow(event, scope.key)}
                  onDragLeave={() => setOver((c) => (c === scope.key ? null : c))}
                  onDrop={(event) => dropGlobal(event, scope.audiences)}
                  className={`rounded-md border-2 border-dashed px-3 py-3 transition-colors ${
                    over === scope.key
                      ? "border-brand bg-brand-soft"
                      : scope.key === "all"
                        ? "border-brand/35 bg-brand-soft/40"
                        : "border-border bg-card"
                  }`}
                >
                  <p className="text-[12.5px] font-semibold text-card-foreground">{scope.label}</p>
                  <p className="text-[11px] text-muted-foreground">{scope.hint}</p>
                  {common.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1 border-t border-border pt-2">
                      {common.map((id) => (
                        <MediaChip
                          key={id}
                          mediaId={id}
                          media={media}
                          removeLabel={`Remove from every campaign (${scope.label})`}
                          onRemove={() =>
                            campaigns.forEach((campaign) =>
                              detachMediaFromCampaign(
                                campaign.id,
                                id,
                                scope.audiences === "all" ? ["direct", "ota"] : scope.audiences,
                                channel,
                              ),
                            )
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p className="mt-5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Individual campaigns
          </p>
          <div className="mt-2 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {campaigns.map((campaign) => (
              <section
                key={campaign.id}
                onDragOver={(event) => allow(event, campaign.id)}
                onDragLeave={() => setOver((c) => (c === campaign.id ? null : c))}
                onDrop={(event) => {
                  // Dropping on the card body (not a segment) applies to both.
                  const id = pickedId(event);
                  if (id) attachMediaToCampaign(campaign.id, id, ["direct", "ota"], channel);
                }}
                className={`rounded-md border bg-card p-3 shadow-card transition-colors ${
                  over === campaign.id ? "border-brand bg-brand-soft" : "border-border"
                }`}
              >
                <p className="truncate text-[12.5px] font-semibold text-card-foreground">{campaign.name}</p>
                <div className="mt-2 grid gap-1.5">
                  {AUDIENCES.map((a) => (
                    <AudienceRow
                      key={a.key}
                      campaign={campaign}
                      audience={a.key}
                      label={a.label}
                      channel={channel}
                      media={media}
                      dragging={dragging}
                      onDrop={dropCampaign}
                      onRemove={(campaignId, audience, mediaId) =>
                        detachMediaFromCampaign(campaignId, mediaId, [audience], channel)
                      }
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
