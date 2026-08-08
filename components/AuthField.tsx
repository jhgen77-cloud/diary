interface AuthFieldProps {
  id: string;
  label: string;
  type: "email" | "password";
  placeholder: string;
  autoComplete?: string;
}

/** 로그인/회원가입 폼의 라벨+인풋 한 쌍 (이메일, 비밀번호, 비밀번호 확인 등). */
export default function AuthField({
  id,
  label,
  type,
  placeholder,
  autoComplete,
}: AuthFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-[var(--text)]">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 text-sm text-[var(--text)] outline-none placeholder:text-[var(--placeholder)] focus:border-[var(--accent)]"
      />
    </div>
  );
}
