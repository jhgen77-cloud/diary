/** 일기 종단 간(client-side) 암호화의 순수 암호화 로직만 모아둔 파일입니다.
 * Web Crypto API(crypto.subtle)만 쓰고, 브라우저 밖으로 나가는 값은 전부
 * base64 문자열입니다 — 실제 키(CryptoKey)나 원문 암호는 여기서도 저장하지
 * 않고, 호출부(lib/diaryEncryptionKey.ts)가 세션 메모리에만 들고 있습니다.
 *
 * 이 파일이 하는 일은 "브라우저에서 암호화해서 서버엔 암호문만 보낸다"는
 * 전제를 지키는 것뿐입니다 — 그래야 Supabase 프로젝트 관리자(service_role,
 * 대시보드 SQL Editor 등 RLS를 우회하는 접근)도 실제 일기 내용은 못 봅니다. */

// PBKDF2 반복 횟수. 너무 낮으면 무차별 대입에 약하고, 너무 높으면 매번 잠금
// 해제할 때마다 체감되게 느려집니다 — OWASP 권장 하한(SHA-256 기준 60만회)
// 보다는 낮지만, 잠금 해제가 잦은(글마다 매번 입력하진 않고 세션당 한 번)
// 이 앱 특성상 30만회로 절충했습니다.
const PBKDF2_ITERATIONS = 300_000;
const AES_KEY_LENGTH = 256;
// AES-GCM 표준 IV 길이(96bit/12byte) — 이 길이가 아니면 브라우저마다 동작이
// 달라질 수 있어 고정합니다.
const IV_BYTES = 12;
const SALT_BYTES = 16;

// verifier(암호 확인용)로 암호화해 저장해두는 알려진 문자열. 이 문자열
// 자체는 비밀이 아닙니다 — 복호화 결과가 이 값과 같으면 "입력한 암호로
// 정상적으로 복호화됐다"는 것만 확인하는 용도입니다.
const VERIFIER_PLAINTEXT = "diary-encryption-verifier-v1";

function bufToBase64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(base64);
  // new ArrayBuffer(...)로 명시적으로 감싸야 TypeScript가 Uint8Array<ArrayBuffer>로
  // 추론합니다 — 그냥 new Uint8Array(n)만 쓰면 lib.dom.d.ts 버전에 따라
  // Uint8Array<ArrayBufferLike>(SharedArrayBuffer 포함)로 추론돼, crypto.subtle이
  // 요구하는 BufferSource 타입과 안 맞는다는 에러가 났습니다.
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** salt를 새로 만듭니다 — 사용자가 암호를 처음 설정할 때 한 번만 생성해
 * diary_encryption_keys에 저장하고, 이후 같은 사용자는 계속 이 salt로
 * 키를 도출합니다(salt가 바뀌면 같은 암호를 넣어도 다른 키가 나옴). */
export function generateSalt(): string {
  return bufToBase64(crypto.getRandomValues(new Uint8Array(SALT_BYTES)));
}

/** 암호(passphrase)와 salt로 AES-GCM 256bit 키를 도출합니다. extractable을
 * false로 둬 CryptoKey 자체를 바이트로 꺼낼 수 없게 합니다 — 세션 메모리에
 * 들고 있는 동안에도 실수로 어딘가에 직렬화될 여지를 차단합니다. */
export async function deriveKeyFromPassphrase(
  passphrase: string,
  saltBase64: string
): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: base64ToBytes(saltBase64),
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: AES_KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
}

export interface EncryptedText {
  cipher: string;
  iv: string;
}

/** 텍스트(제목/본문)를 암호화합니다. 호출마다 새 IV를 뽑으므로 같은 평문을
 * 여러 번 암호화해도 매번 다른 암호문이 나옵니다(정상 — AES-GCM의 요구사항,
 * 같은 키로 같은 IV를 재사용하면 안 되기 때문). */
export async function encryptText(key: CryptoKey, plaintext: string): Promise<EncryptedText> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const cipherBuf = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(plaintext)
  );
  return { cipher: bufToBase64(cipherBuf), iv: bufToBase64(iv) };
}

/** encryptText로 만든 암호문을 원래 텍스트로 되돌립니다. 키가 틀리면(또는
 * 데이터가 손상되면) crypto.subtle.decrypt 자체가 예외를 던집니다. */
export async function decryptText(
  key: CryptoKey,
  cipherBase64: string,
  ivBase64: string
): Promise<string> {
  const plainBuf = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToBytes(ivBase64) },
    key,
    base64ToBytes(cipherBase64)
  );
  return new TextDecoder().decode(plainBuf);
}

/** 첨부 이미지를 암호화합니다. 별도 컬럼 없이, 암호문 앞에 IV(12바이트)를
 * 그대로 붙여서 하나의 Blob으로 돌려줍니다 — decryptBlob이 같은 규칙으로
 * 앞 12바이트를 IV로 떼어내 나머지를 복호화합니다. 원래 mime 타입은 이제
 * 의미가 없어(암호문은 이미지가 아님) application/octet-stream으로 올립니다. */
export async function encryptBlob(key: CryptoKey, blob: Blob): Promise<Blob> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const plainBuf = await blob.arrayBuffer();
  const cipherBuf = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plainBuf);
  return new Blob([iv, cipherBuf], { type: "application/octet-stream" });
}

/** encryptBlob으로 올린 파일을 원래 이미지 바이트로 되돌립니다. mimeType은
 * 화면에 표시할 때 필요한 값을 호출부가 알고 있는 그대로 넘겨줍니다(이 앱은
 * 첨부 이미지를 항상 image/jpeg로 올리므로 고정값을 씁니다 — lib/memoryEntries.ts 참고). */
export async function decryptBlob(
  key: CryptoKey,
  encryptedBlob: Blob,
  mimeType: string
): Promise<Blob> {
  const bytes = new Uint8Array(await encryptedBlob.arrayBuffer());
  const iv = bytes.slice(0, IV_BYTES);
  const cipher = bytes.slice(IV_BYTES);
  const plainBuf = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, cipher);
  return new Blob([plainBuf], { type: mimeType });
}

/** 암호를 처음 설정할 때, 나중에 "이 암호가 맞는지" 확인할 수 있도록 알려진
 * 문자열을 암호화해서 돌려줍니다 — diary_encryption_keys.verifier/verifier_iv에
 * 그대로 저장합니다. */
export async function createVerifier(key: CryptoKey): Promise<EncryptedText> {
  return encryptText(key, VERIFIER_PLAINTEXT);
}

/** 저장해둔 verifier를 이 키로 복호화했을 때 원래 문자열이 나오는지 봅니다.
 * 키가 틀리면 decrypt 자체가 예외를 던지므로(AES-GCM 인증 실패), 그 경우도
 * false로 처리합니다 — 호출부는 예외 처리 없이 boolean만 보면 됩니다. */
export async function checkVerifier(
  key: CryptoKey,
  verifierCipherBase64: string,
  verifierIvBase64: string
): Promise<boolean> {
  try {
    const decrypted = await decryptText(key, verifierCipherBase64, verifierIvBase64);
    return decrypted === VERIFIER_PLAINTEXT;
  } catch {
    return false;
  }
}
