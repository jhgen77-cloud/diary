interface DiaryContentFieldProps {
  value: string;
  onChange: (content: string) => void;
}

export default function DiaryContentField({
  value,
  onChange,
}: DiaryContentFieldProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-black/[.06] p-3 sm:p-4 dark:border-white/[.08]">
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="오늘 하루를 기록해보세요"
        className="min-h-0 flex-1 resize-none bg-transparent text-sm text-black outline-none placeholder:text-black/40 sm:text-base dark:text-zinc-50 dark:placeholder:text-zinc-500"
      />
    </div>
  );
}
