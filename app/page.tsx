import { FindYourBlade } from "@/components/home/FindYourBlade";
import { Hero } from "@/components/home/Hero";
import { MeetTheMaker } from "@/components/home/MeetTheMaker";
import { MysteryKnifeBag } from "@/components/home/MysteryKnifeBag";
import { StayConnected } from "@/components/home/StayConnected";

export default function Home() {
  return (
    <>
      <Hero />
      <FindYourBlade />
      <MysteryKnifeBag />
      <MeetTheMaker />
      <StayConnected />
    </>
  );
}
