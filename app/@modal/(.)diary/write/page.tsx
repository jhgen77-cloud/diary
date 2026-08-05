import { Suspense } from "react";
import DiaryWriteForm from "@/components/DiaryWriteForm";

export default function DiaryWriteModal() {
  return (
    <Suspense fallback={null}>
      <DiaryWriteForm />
    </Suspense>
  );
}
