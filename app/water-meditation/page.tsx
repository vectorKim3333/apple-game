import WaterMeditation from "@/app/components/water-meditation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "물멍 - 께에임즈",
  description: "잔잔한 물결을 보며 마음의 안정을 찾아보세요.",
};

export default function WaterMeditationPage() {
  return (
    <div className="game-page no-scroll h-full">
      <WaterMeditation />
    </div>
  );
} 