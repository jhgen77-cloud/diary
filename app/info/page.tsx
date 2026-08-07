import Modal from "@/components/Modal";
import InfoContent from "@/components/InfoContent";

// app/@modal/(.)info/page.tsx와 내용이 같습니다. 직접 접속/새로고침 시엔
// 인터셉트 라우트가 적용되지 않으므로(다른 /diary, /data, /settings 경로와
// 같은 이유) 같은 내용을 그대로 미러링해, 빈 페이지 대신 같은 화면이 보이게 합니다.
export default function InfoPage() {
  return (
    <Modal title="정보 및 도움말" closeHref="/">
      <InfoContent />
    </Modal>
  );
}
