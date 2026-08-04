import IconOption from "@/components/IconOption";
import FieldLabel from "@/components/FieldLabel";
import { MOOD_ICONS, MOOD_LABELS, type MoodKey } from "@/lib/diaryIcons";

interface DiaryMoodFieldProps {
  value: MoodKey;
  onChange: (mood: MoodKey) => void;
}

const MOOD_KEYS: MoodKey[] = [
  "angry",
  "bad",
  "sad",
  "sarcastic",
  "smile",
  "none",
];

export default function DiaryMoodField({
  value,
  onChange,
}: DiaryMoodFieldProps) {
  return (
    <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
      <FieldLabel>기분</FieldLabel>
      <div className="flex min-w-0 flex-wrap items-center gap-0.5 sm:gap-1">
        {MOOD_KEYS.map((key) => (
          <IconOption
            key={key}
            icon={MOOD_ICONS[key]}
            label={MOOD_LABELS[key]}
            selected={value === key}
            onSelect={() => onChange(key)}
          />
        ))}
      </div>
    </div>
  );
}
