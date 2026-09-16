import { useRef } from "react";
import { TagTextArea } from "@/components/campaign/TagTextArea";
import { SmsPreview } from "@/components/editor/SmsPreview";
import { MediaStrip } from "./MediaStrip";
import { MERGE_TAGS, useMarketing, type TextContent } from "@/lib/marketing";

/** Text (SMS) channel editor with merge tags, media attachments and live preview. */
export function TextEditor({
  value,
  onChange,
}: {
  value: TextContent;
  onChange: (v: TextContent) => void;
}) {
  const { media } = useMarketing();
  const ref = useRef<HTMLDivElement | null>(null);
  const ids = value.mediaIds ?? [];
  const firstImage = ids
    .map((id) => media.find((m) => m.id === id))
    .find((m) => m?.type === "image" && m.url);
  const chars = value.message.length;

  return (
    <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Message</label>
        <div className="mt-2 flex max-w-full gap-1.5 overflow-x-auto pb-1 sm:flex-wrap">
          {MERGE_TAGS.map((t) => (
            <button
              key={t.token}
              type="button"
              onClick={() => (ref.current as any)?.__insertToken?.(t.token)}
              className={`rounded px-2 py-1 text-[11.5px] font-semibold transition-colors ${t.chip}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="mt-2">
          <TagTextArea
            value={value.message}
            onChange={(message) => onChange({ ...value, message })}
            tags={MERGE_TAGS}
            inputRef={ref}
            placeholder="Write your text message"
            minHeight={150}
          />
        </div>
        <p className="mt-1.5 text-[11.5px] tabular-nums text-muted-foreground">
          {chars} characters · {Math.max(1, Math.ceil(chars / 160))} segment
          {chars > 160 ? "s" : ""}
        </p>

        <div className="mt-6">
          <MediaStrip
            ids={ids}
            onChange={(mediaIds) => onChange({ ...value, mediaIds })}
            label="Attachments"
          />
        </div>
      </div>

      <div className="flex justify-center lg:justify-start">
        <SmsPreview
          message={value.message}
          imageUrl={firstImage?.url ?? null}
          sender="Holiday Inn"
          scale={0.62}
        />
      </div>
    </div>
  );
}
