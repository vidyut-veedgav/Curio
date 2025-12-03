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
          title="Custom Course Creation"
          description="Generate comprehensive courses on any topic, perfectly adapted to match your current knowledge level and preferred learning approach — in seconds."
        />
        <FeatureCard
          icon="/icons/AIAssistant.png"
          title="Interactive AI Tutor"
          description="Get immediate, contextual answers to your questions as you learn, with an AI assistant that understands your course content and adapts to your pace."
        />
        <FeatureCard
          icon="/icons/Personalized.png"
          title="Deep Personalization"
          description="Track your progress through each module with intelligent insights that help you understand what you've mastered and what to focus on next."
        />
      </div>

      
    </div>
  );
}
