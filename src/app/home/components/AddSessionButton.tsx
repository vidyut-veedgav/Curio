import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function AddSessionButton() {
  return (
    <Button
      className="h-16 px-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow text-base font-semibold"
    >
      <Plus className="h-5 w-5 mr-2" />
      Create Learning Session
    </Button>
  );
}
