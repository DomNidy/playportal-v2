/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../Card";
import { type LucideIcon } from "lucide-react";
import React from "react";

export default function FeatureCard({
  title,
  description,
  icon,
  iconBackgroundColor,
}: {
  title: string;
  description: string;
  iconBackgroundColor: string;
  icon: LucideIcon | React.ComponentType<any> | undefined;
}) {
  const Icon = icon;

  return (
    <Card className=" bg-gradient-to-r from-neutral-900 to-neutral-950 border-white/10 border">
      <CardHeader className="flex flex-row gap-4 pb-3">
        {Icon && (
          <Icon
            className={`${iconBackgroundColor} z-50 h-8 w-8 rounded-full p-1.5`}
            color="white"
          />
        )}
        <CardTitle className="text-white">{title}</CardTitle>
      </CardHeader>

      <CardContent>
        <CardDescription className="max-w-lg text-balance leading-relaxed">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
