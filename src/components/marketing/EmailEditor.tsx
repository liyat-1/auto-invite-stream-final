import { useState } from "react";
import { LayoutTemplate, Rows3 } from "lucide-react";
import { TemplateLibrary } from "./TemplateLibrary";
import { LayoutLibrary, LayoutThumb } from "./LayoutLibrary";
import {
  LAYOUT_LABEL,
  LAYOUT_PRESETS,
  normalizeLayout,
  renderPreview,
  useMarketing,
  type EmailContent,
  type EmailLayout,
} from "@/lib/marketing";

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-[13.5px] text-foreground outline-none transition-shadow focus:border-brand focus:ring-2 focus:ring-brand/20"
      />
    </label>
  );
}

/** Still frame used behind an image slot when nothing is attached yet. */
const PHOTO_POOL = LAYOUT_PRESETS.map((l) => l.photo);

/** Image slot in the preview: the attached asset, or the template's cover photo. */
function Banner({ photo, height }: { photo: string; height: number }) {
  return (
    <div className="relative overflow-hidden" style={{ height }}>
      <img src={photo} alt="" loading="lazy" className="size-full object-cover" />
    </div>
  );
}

/** Email channel editor: template first, then layout, copy, media and preview. */
export function EmailEditor({
  value,
  onChange,
  customized = false,
}: {
  value: EmailContent;
  onChange: (v: EmailContent) => void;
  customized?: boolean;
}) {
  const { templates } = useMarketing();
  const [lib, setLib] = useState(false);
  const [layoutLib, setLayoutLib] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<(typeof templates)[number] | null>(null);
  const template = templates.find((t) => t.id === value.templateId) ?? templates[0];
  const accent = template?.accent ?? "#2563eb";
  const layout = normalizeLayout(String(value.layout));

  const set = <K extends keyof EmailContent>(k: K, v: EmailContent[K]) => onChange({ ...value, [k]: v });

  const heroOf = (i: number) => template?.hero ?? PHOTO_POOL[i % PHOTO_POOL.length];
  const photo = heroOf(0);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        {/* Template and layout, side by side */}
        <section className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-3 shadow-card">
            <p className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">Template</p>
            <p className="mt-0.5 truncate text-[13px] font-semibold text-card-foreground">
              {template?.name ?? "None"}
            </p>
            <div className="mt-2 overflow-hidden rounded-md border border-border bg-muted">
              <div className="relative aspect-[16/9]">
                {template?.hero && (
                  <img
                    src={template.hero}
                    alt={`${template.name} cover photograph`}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                )}
                <span className="absolute inset-x-0 bottom-0 h-1" style={{ background: accent }} />
              </div>
            </div>
            <button
              onClick={() => setLib(true)}
              className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-md border border-input bg-background py-1.5 text-[12px] font-medium text-card-foreground transition-colors hover:border-brand/50 hover:bg-muted/50"
            >
              <LayoutTemplate size={13} className="text-muted-foreground" />
              {template ? "Change template" : "Choose template"}
            </button>
          </div>

          <div className="rounded-lg border border-border bg-card p-3 shadow-card">
            <p className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">Layout</p>
            <p className="mt-0.5 truncate text-[13px] font-semibold text-card-foreground">{LAYOUT_LABEL(layout)}</p>
            <div className="mt-2 rounded-md bg-muted/60 p-1.5">
              <LayoutThumb layout={layout} accent={accent} photo={photo} />
            </div>
            <button
              onClick={() => setLayoutLib(true)}
              className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-md border border-input bg-background py-1.5 text-[12px] font-medium text-card-foreground transition-colors hover:border-brand/50 hover:bg-muted/50"
            >
              <Rows3 size={13} className="text-muted-foreground" />
              Change layout
            </button>
          </div>
        </section>

        {/* Content */}
        <section className="space-y-4">
          <Field label="Subject" value={value.subject} onChange={(v) => set("subject", v)} />
          <Field label="Preheader" value={value.preheader} onChange={(v) => set("preheader", v)} />
          <Field label="Heading" value={value.heading} onChange={(v) => set("heading", v)} />

          <label className="block">
            <span className="text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">Body</span>
            <textarea
              value={value.body}
              onChange={(e) => set("body", e.target.value)}
              rows={5}
              className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-[13.5px] leading-relaxed text-foreground outline-none transition-shadow focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Button label" value={value.ctaLabel} onChange={(v) => set("ctaLabel", v)} />
            <Field label="Button link" value={value.ctaUrl} onChange={(v) => set("ctaUrl", v)} />
          </div>

        </section>
      </div>

      {/* Live preview */}
      <div className="rounded-lg border border-border bg-muted/50 p-4 lg:sticky lg:top-4 lg:self-start">
        <p className="mb-3 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          <span>Live preview</span>
          <span className="normal-case tracking-normal text-foreground/60">{LAYOUT_LABEL(layout)}</span>
        </p>
        <div className="mx-auto max-w-[460px] overflow-hidden rounded-md border border-border bg-card shadow-lift">
          <div className="border-b border-border px-5 py-3">
            <p className="text-[13px] font-semibold text-card-foreground">{renderPreview(value.subject)}</p>
            <p className="mt-0.5 text-[12px] text-muted-foreground">{renderPreview(value.preheader)}</p>
          </div>

          {(layout === "hero_top" || layout === "gallery_three") && (
            <Banner photo={heroOf(0)} height={140} />
          )}

          {layout === "full_bleed" ? (
            <div className="relative px-6 py-12 text-center">
              <img src={heroOf(0)} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
              <div
                className="absolute inset-0"
                style={{ background: `linear-gradient(180deg, ${accent}e6, ${accent}b3)` }}
              />
              <div className="relative">
                <h3 className="text-[22px] font-semibold leading-snug text-white">
                  {renderPreview(value.heading)}
                </h3>
                <p className="mx-auto mt-2.5 max-w-[320px] whitespace-pre-wrap text-[13.5px] leading-relaxed text-white/85">
                  {renderPreview(value.body)}
                </p>
                <span
                  className="mt-5 inline-block rounded bg-white px-6 py-3 text-[13px] font-semibold"
                  style={{ color: accent }}
                >
                  {value.ctaLabel}
                </span>
              </div>
            </div>
          ) : layout === "split" || layout === "image_left" || layout === "image_right" ? (
            <div className={`flex gap-4 px-6 py-6 ${layout === "image_right" ? "flex-row-reverse" : ""}`}>
              <div className="w-2/5 shrink-0 overflow-hidden rounded">
                <Banner photo={heroOf(0)} height={132} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-[17px] font-semibold leading-snug text-card-foreground">
                  {renderPreview(value.heading)}
                </h3>
                <p className="mt-2 whitespace-pre-wrap text-[13px] leading-relaxed text-muted-foreground">
                  {renderPreview(value.body)}
                </p>
                <span
                  className="mt-4 inline-block rounded px-4 py-2.5 text-[12.5px] font-semibold text-white"
                  style={{ background: accent }}
                >
                  {value.ctaLabel}
                </span>
              </div>
            </div>
          ) : (
            <div className="px-6 py-6 text-left">
              <h3 className="text-[20px] font-semibold leading-snug text-card-foreground">
                {renderPreview(value.heading)}
              </h3>
              <p className="mt-2.5 whitespace-pre-wrap text-[13.5px] leading-relaxed text-muted-foreground">
                {renderPreview(value.body)}
              </p>

              {layout === "headline_first" && <div className="mt-4 overflow-hidden rounded"><Banner photo={heroOf(0)} height={120} /></div>}

              {layout === "cta_focus" && <div className="mt-4 overflow-hidden rounded"><Banner photo={heroOf(0)} height={88} /></div>}

              {layout === "gallery_two" && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {[0, 1].map((i) => (
                    <div key={i} className="overflow-hidden rounded">
                      <Banner photo={heroOf(i)} height={92} />
                    </div>
                  ))}
                </div>
              )}

              {layout === "gallery_three" && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="overflow-hidden rounded">
                      <Banner photo={heroOf(i + 1)} height={72} />
                    </div>
                  ))}
                </div>
              )}

              <span
                className="mt-5 inline-block rounded px-5 py-3 text-[13px] font-semibold text-white"
                style={{ background: accent }}
              >
                {value.ctaLabel}
              </span>
            </div>
          )}

          <div className="border-t border-border px-6 py-4 text-[11px] text-muted-foreground">
            Holiday Inn New York City – Times Square · Unsubscribe
          </div>
        </div>
      </div>

      <TemplateLibrary
        open={lib}
        onClose={() => setLib(false)}
        selectedId={value.templateId}
        onSelect={(t) => {
          if (customized) {
            setPendingTemplate(t);
            return;
          }
          onChange({
            ...value,
            templateId: t.id,
            layout: t.layout,
            subject: t.heading,
            heading: t.heading,
            body: t.body,
            ctaLabel: t.ctaLabel,
          });
        }}
      />

      <LayoutLibrary
        open={layoutLib}
        onClose={() => setLayoutLib(false)}
        value={layout}
        accent={accent}
        photo={photo}
        onSelect={(l: EmailLayout) => set("layout", l)}
      />

      {pendingTemplate && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-foreground/45 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-5 shadow-float">
            <h3 className="text-[16px] font-semibold text-card-foreground">Change email template?</h3>
            <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">Your written content will be kept where possible. The new template’s default layout will be applied.</p>
            <div className="mt-5 flex justify-end gap-2"><button onClick={() => setPendingTemplate(null)} className="rounded-md border border-input px-3 py-2 text-[12.5px] font-medium">Cancel</button><button onClick={() => { onChange({ ...value, templateId: pendingTemplate.id, layout: pendingTemplate.layout }); setPendingTemplate(null); setLib(false); }} className="rounded-md bg-brand px-3 py-2 text-[12.5px] font-semibold text-brand-foreground">Continue</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
