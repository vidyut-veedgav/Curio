interface DocumentTypeProps {
  fileType: string;
}

const typeColors: Record<string, string> = {
  PDF: "bg-red-100 text-red-700",
  JPG: "bg-blue-100 text-blue-700",
  PNG: "bg-orange-100 text-orange-700",
};

export function DocumentType({ fileType }: DocumentTypeProps) {
  const colorClass = typeColors[fileType.toUpperCase()] || "bg-gray-100 text-gray-700";

  return (
    <div className={`px-1.5 py-0 rounded-sm text-[10px] font-medium ${colorClass}`}>
      {fileType.toUpperCase()}
    </div>
  );
}
