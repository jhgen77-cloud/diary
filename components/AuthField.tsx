interface AuthFieldProps {
  id: string;
  label: string;
  type: "email" | "password";
  placeholder: string;
  autoComplete?: string;
  /** 지정하면 컨트롤드 인풋으로 동작합니다(로그인/회원가입 폼처럼 값 검증이
   * 필요한 경우). 지정하지 않으면 기존처럼 언컨트롤드 인풋으로 동작합니다. */
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
}

/** 로그인/회원가입 폼의 라벨+인풋 한 쌍 (이메일, 비밀번호, 비밀번호 확인 등). */
export default function AuthField({
  id,
  label,
  type,
  placeholder,
  autoComplete,
  value,
  onChange,
  required,
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
        value={value}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        required={required}
        className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 text-sm text-[var(--text)] outline-none placeholder:text-[var(--placeholder)] focus:border-[var(--accent)]"
      />
    </div>
  );
}
