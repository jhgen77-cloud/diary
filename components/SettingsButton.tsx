import Image from "next/image";
import Link from "next/link";
import settingsIcon from "@/images/settings.png";

export default function SettingsButton() {
  return (
    <Link
      href="/settings"
      aria-label="설정"
      className="absolute top-4 right-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-70 sm:top-6 sm:right-6 sm:h-10 sm:w-10"
    >
      <Image
        src={settingsIcon}
        alt="설정"
        className="h-full w-full object-contain"
      />
    </Link>
  );
}
