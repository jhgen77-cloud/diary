"use client";

import { useState, type FormEvent } from "react";
import {
  changePassphrase,
  lockEncryption,
  setUpEncryption,
  unlockEncryption,
  useEncryptionSetupStatus,
  useUnlockedKey,
} from "@/lib/diaryEncryptionKey";
import Toast from "@/components/Toast";

const inputClass =
  "h-8 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-2.5 text-xs text-[var(--text)] outline-none placeholder:text-[var(--placeholder)] focus:border-[var(--accent)] sm:h-9 sm:text-sm";

const actionButtonClass =
  "shrink-0 rounded-full border border-[var(--border)] px-4 py-1.5 text-xs text-[var(--text-sub)] transition-colors hover:bg-[var(--hover)] disabled:pointer-events-none disabled:opacity-40 sm:text-sm";

const MIN_PASSPHRASE_LENGTH = 6;

/** 환경 설정 3번째 패널 — "일기 암호"(로그인 비밀번호와 별개)를 설정/잠금
 * 해제/변경합니다. 이 암호로 도출한 키가 있어야 글의 제목/본문/첨부 이미지를
 * 암호화해서 저장할 수 있고, 그래야 Supabase를 직접 들여다보는 관리자도
 * 내용을 못 봅니다(README/개인정보처리방침과 별개로, 이 프로젝트 관리자
 * 본인의 요청으로 추가된 기능).
 *
 * FontSettingsPanel/BackgroundSettingsPanel과 같은 값(draft)을 쓰지 않습니다
 * — 이건 "확인/적용"으로 저장을 미루는 값이 아니라, 누르는 즉시 서버(설정)와
 * 세션 키에 반영되는 동작이라 그 두 패널과는 성격이 다릅니다. */
export default function EncryptionSettingsPanel() {
  const { loading, isSetUp } = useEncryptionSetupStatus();
  const key = useUnlockedKey();

  const [passphrase, setPassphrase] = useState("");
  const [confirmPassphrase, setConfirmPassphrase] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showChangeForm, setShowChangeForm] = useState(false);
  const [oldPassphrase, setOldPassphrase] = useState("");
  const [newPassphrase, setNewPassphrase] = useState("");
  const [confirmNewPassphrase, setConfirmNewPassphrase] = useState("");

  function resetSetupFields() {
    setPassphrase("");
    setConfirmPassphrase("");
  }

  async function handleSetUp(event: FormEvent) {
    event.preventDefault();
    if (submitting) return;
    if (passphrase.length < MIN_PASSPHRASE_LENGTH) {
      setError(`암호는 ${MIN_PASSPHRASE_LENGTH}자 이상으로 설정해주세요.`);
      return;
    }
    if (passphrase !== confirmPassphrase) {
      setError("입력한 두 암호가 서로 다릅니다.");
      return;
    }
    setSubmitting(true);
    const ok = await setUpEncryption(passphrase);
    setSubmitting(false);
    if (!ok) {
      setError("암호 설정에 실패했습니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    resetSetupFields();
  }

  async function handleUnlock(event: FormEvent) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    const ok = await unlockEncryption(passphrase);
    setSubmitting(false);
    if (!ok) {
      setError("암호가 일치하지 않습니다.");
      return;
    }
    resetSetupFields();
  }

  async function handleChangePassphrase(event: FormEvent) {
    event.preventDefault();
    if (submitting) return;
    if (newPassphrase.length < MIN_PASSPHRASE_LENGTH) {
      setError(`새 암호는 ${MIN_PASSPHRASE_LENGTH}자 이상으로 설정해주세요.`);
      return;
    }
    if (newPassphrase !== confirmNewPassphrase) {
      setError("입력한 두 새 암호가 서로 다릅니다.");
      return;
    }
    setSubmitting(true);
    const ok = await changePassphrase(oldPassphrase, newPassphrase);
    setSubmitting(false);
    if (!ok) {
      setError("현재 암호가 일치하지 않습니다.");
      return;
    }
    setOldPassphrase("");
    setNewPassphrase("");
    setConfirmNewPassphrase("");
    setShowChangeForm(false);
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] p-3">
      <div>
        <p className="text-xs font-semibold text-[var(--text)] sm:text-sm">일기 암호</p>
        <p className="mt-0.5 text-[0.7rem] text-[var(--text-sub)] sm:text-xs">
          로그인 비밀번호와는 별개입니다. 이 암호가 있어야만 글의 제목·본문·첨부
          이미지가 브라우저에서 암호화되어 저장되고, 저장 후엔 이 암호를 입력한
          사람만 다시 볼 수 있습니다(서비스 운영자도 포함 — 암호를 잊으면 그
          글은 영영 복구할 수 없습니다).
        </p>
      </div>

      {loading ? (
        <p className="text-xs text-[var(--text-sub)] sm:text-sm">확인 중…</p>
      ) : !isSetUp ? (
        <form onSubmit={handleSetUp} className="flex flex-col gap-2">
          <input
            type="password"
            placeholder={`암호 (${MIN_PASSPHRASE_LENGTH}자 이상)`}
            autoComplete="new-password"
            value={passphrase}
            onChange={(event) => setPassphrase(event.target.value)}
            className={inputClass}
          />
          <input
            type="password"
            placeholder="암호 확인"
            autoComplete="new-password"
            value={confirmPassphrase}
            onChange={(event) => setConfirmPassphrase(event.target.value)}
            className={inputClass}
          />
          <button type="submit" disabled={submitting} className={`${actionButtonClass} self-end`}>
            설정
          </button>
        </form>
      ) : !key ? (
        <form onSubmit={handleUnlock} className="flex flex-wrap items-center gap-2">
          <input
            type="password"
            placeholder="암호 입력"
            autoComplete="current-password"
            value={passphrase}
            onChange={(event) => setPassphrase(event.target.value)}
            className={`${inputClass} min-w-0 flex-1`}
          />
          <button type="submit" disabled={submitting} className={actionButtonClass}>
            잠금 해제
          </button>
        </form>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-[var(--text-sub)] sm:text-sm">🔓 잠금 해제됨</p>
            <div className="flex shrink-0 gap-2">
              <button type="button" onClick={lockEncryption} className={actionButtonClass}>
                잠그기
              </button>
              <button
                type="button"
                onClick={() => setShowChangeForm((prev) => !prev)}
                className={actionButtonClass}
              >
                암호 변경
              </button>
            </div>
          </div>
          {showChangeForm && (
            <form onSubmit={handleChangePassphrase} className="flex flex-col gap-2">
              <input
                type="password"
                placeholder="현재 암호"
                autoComplete="current-password"
                value={oldPassphrase}
                onChange={(event) => setOldPassphrase(event.target.value)}
                className={inputClass}
              />
              <input
                type="password"
                placeholder={`새 암호 (${MIN_PASSPHRASE_LENGTH}자 이상)`}
                autoComplete="new-password"
                value={newPassphrase}
                onChange={(event) => setNewPassphrase(event.target.value)}
                className={inputClass}
              />
              <input
                type="password"
                placeholder="새 암호 확인"
                autoComplete="new-password"
                value={confirmNewPassphrase}
                onChange={(event) => setConfirmNewPassphrase(event.target.value)}
                className={inputClass}
              />
              {/* 새 암호로 바뀌는 건 "앞으로 저장할 글"부터입니다 — 이미
                 예전 암호로 암호화되어 저장된 글은 예전 암호를 기억해야만
                 다시 열어 새 암호로 저장해야 넘어갑니다(전체 재암호화는
                 하지 않음). 착각하지 않도록 미리 안내합니다. */}
              <p className="text-[0.65rem] text-[var(--text-sub)] sm:text-xs">
                변경해도 이미 암호화되어 저장된 글은 예전 암호로만 열립니다. 그
                글을 새 암호로 옮기려면 다시 열어 저장해주세요.
              </p>
              <button
                type="submit"
                disabled={submitting}
                className={`${actionButtonClass} self-end`}
              >
                변경
              </button>
            </form>
          )}
        </div>
      )}

      {error && <Toast message={error} onDismiss={() => setError(null)} />}
    </div>
  );
}
