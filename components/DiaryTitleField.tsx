import FieldLabel from "@/components/FieldLabel";

interface DiaryTitleFieldProps {
  value: string;
  onChange: (title: string) => void;
}

export default function DiaryTitleField({
  value,
  onChange,
}: DiaryTitleFieldProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-1 sm:px-4">
      <FieldLabel>제목</FieldLabel>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="제목을 입력하세요"
        className="h-7 min-w-0 flex-1 rounded-full border border-black/10 bg-white/60 px-3 text-xs text-black outline-none placeholder:text-black/40 focus:border-black/30 sm:h-8 sm:text-sm dark:border-white/15 dark:bg-white/[.04] dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-white/30"
      />
    </div>
  );
}
