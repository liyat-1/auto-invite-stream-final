import { ChevronLeft, Info, Camera, AppWindow, Mic, Plus } from "lucide-react";
import { PhoneMockup } from "./PhoneMockup";
import { renderTokens } from "@/lib/campaign";
import { CODE_TYPE_LABEL, type Promotion } from "@/lib/marketing";

/**
 * iMessage-style SMS preview inside the shared iPhone frame, with the latest
 * frosted-glass navigation and composer treatment.
 */
export function SmsPreview({
  message,
  link,
  imageUrl,
  sender = "Hellas Gadgets",
  scale = 0.78,
  promotion,
}: {
  message: string;
  link?: string;
  imageUrl?: string | null;
  sender?: string;
  scale?: number;
  promotion?: Promotion | null;
}) {
  return (
    <PhoneMockup
      scale={scale}
      contentClassName="bg-[#f2f2f7]"
      chrome={
        <div className="relative z-20 flex shrink-0 items-center justify-between border-b border-white/40 bg-white/65 px-4 py-2.5 shadow-[0_1px_0_rgba(0,0,0,0.04)] backdrop-blur-xl">
          <ChevronLeft size={22} className="text-[#007aff]" strokeWidth={2.5} />
          <div className="flex flex-col items-center">
            <span className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-zinc-300 to-zinc-400 text-[10px] font-semibold text-white shadow-sm">
              {sender.slice(0, 2).toUpperCase()}
            </span>
            <span className="mt-0.5 text-[10.5px] font-medium text-zinc-700">{sender}</span>
          </div>
          <Info size={20} className="text-[#007aff]" />
        </div>
      }
    >
      <div className="space-y-2 px-3.5 py-4">
        <p className="mb-1 text-center text-[10.5px] font-medium text-zinc-400">
          Text Message · Today 5:00 PM
        </p>
        {imageUrl && (
          <div className="max-w-[75%] overflow-hidden rounded-[1.35rem] rounded-bl-md shadow-sm ring-1 ring-black/5">
            <img src={imageUrl} alt="" className="block h-40 w-full object-cover" />
          </div>
        )}
        <div className="max-w-[85%] rounded-[1.35rem] rounded-bl-md bg-white/85 px-3.5 py-2.5 shadow-sm ring-1 ring-black/5 backdrop-blur">
          <p className="whitespace-pre-wrap text-[14.5px] leading-[1.35] text-zinc-900">
            {renderTokens(message)}
          </p>
          {link && (
            <p className="mt-1 break-all text-[14px] leading-[1.35] text-[#007aff] underline">
              {link}
            </p>
          )}
        </div>
        {promotion && (
          <div className="max-w-[85%] overflow-hidden rounded-[1.35rem] rounded-bl-md bg-white/90 shadow-sm ring-1 ring-black/5 backdrop-blur">
            <div className="bg-zinc-900 px-3.5 py-2.5 text-white">
              <p className="text-[10px] font-semibold uppercase text-zinc-300">Your exclusive offer</p>
              <p className="mt-0.5 text-[14px] font-semibold leading-snug">{promotion.tagline || promotion.name}</p>
            </div>
            <div className="px-3.5 py-2.5">
              <p className="text-[12px] leading-snug text-zinc-600">{promotion.detail}</p>
              <p className="mt-2 text-[12px] font-semibold text-[#007aff]">
                {CODE_TYPE_LABEL[promotion.codeType ?? "promo"]}: {promotion.code}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 mt-auto flex items-center gap-2.5 border-t border-white/50 bg-white/70 px-3 py-2.5 backdrop-blur-xl">
        <Camera size={20} className="shrink-0 text-zinc-500" />
        <AppWindow size={20} className="shrink-0 text-zinc-500" />
        <div className="flex h-8 flex-1 items-center justify-between rounded-full border border-zinc-300/80 bg-white/80 px-3 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]">
          <span className="text-[13px] text-zinc-400">iMessage</span>
          <Plus size={14} className="text-zinc-400" />
        </div>
      </div>
    </PhoneMockup>
  );
}
