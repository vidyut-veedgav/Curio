import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
}

export default function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <Card className="border-0 shadow-none p-6 bg-transparent">
      <div className="space-y-1">
        <div className="w-16 h-16 flex items-start justify-start relative mb-6">
          <Image src={icon} alt={title} width={64} height={64} className="object-contain" />
        </div>
        <CardHeader className="p-0 space-y-1">
          <CardTitle className="text-2xl font-semibold">{title}</CardTitle>
          <CardDescription className="text-base text-muted-foreground leading-relaxed">
            {description}
          </CardDescription>
        </CardHeader>
      </div>
    </Card>
  );
}
