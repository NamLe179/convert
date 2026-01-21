import { ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

export default function DropZoneIndicator({ children }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-card/80 backdrop-blur-sm">
      <p className="rounded border bg-card p-4">
        {children ?? "Drop file to load scenario"}
      </p>
    </div>
  );
}