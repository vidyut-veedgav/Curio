"use client";

import Image from "next/image";
import SignInButton from "./components/SignInButton";
import FeatureCard from "./components/FeatureCard";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-accent/5 to-accent/20 flex flex-col items-center px-48 pt-8">
      {/* Logo */}
      <div className="w-24 h-auto relative">
        <Image
          src="/CurioLogo.png"
          alt="Curio Logo"
          width={128}
          height={128}
          className="object-contain"
          priority
        />
      </div>

      {/* Headline */}
      <div className="text-center mt-16">
        <h1 className="text-7xl sm:text-8xl tracking-tight">
          Learn anything.
        </h1>
        <p className="text-xl text-muted-foreground mt-8">
          Create courses on anything tailored to your unique background and interests — powered by AI.
        </p>
      </div>

      {/* CTA Button */}
      <div className="mt-8">
        <SignInButton />
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-1 mt-16">
        <FeatureCard
          icon="/icons/OnlineLearning.png"
          title="Course Generation"
          description="Generate comprehensive, structured courses on any topic in seconds, automatically adapted to your knowledge level and time constraints."
        />
        <FeatureCard
          icon="/icons/AIAssistant.png"
          title="Interactive AI Tutor"
          description="Get immediate, expert answers to your questions as you learn, with contextual explanations that build on your current lesson."
        />
        <FeatureCard
          icon="/icons/Personalized.png"
          title="Deep Personalization"
          description="Teaching is tailored to each user’s unique interests, experiences, and background — making learning more relevant and engaging."
        />
      </div>

      
    </div>
  );
}
