import AppleNumberGame from "@/app/components/apple-number-game";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "사과 숫자 게임 - 께에임즈",
  description: "사과를 클릭하여 숫자를 맞추는 게임입니다.",
};

export default function AppleGame() {
  return (
    <div className="container mx-auto px-4">
      <AppleNumberGame />
    </div>
  );
} 