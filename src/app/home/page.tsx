"use client";

import { useState } from "react";
import { Header } from "../../components/Header";
import { SessionCard } from "./components/SessionCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Menu, X } from "lucide-react";

const mockSessions = [
  { id: 1, title: "Operating Systems", progress: 34, modulesCompleted: 7, totalModules: 20 },
  { id: 2, title: "Building Apps with AI", progress: 78, modulesCompleted: 14, totalModules: 18 },
  { id: 3, title: "Woodworking from Scratch", progress: 50, modulesCompleted: 10, totalModules: 20 },
  { id: 4, title: "Swedish Architecture", progress: 11, modulesCompleted: 2, totalModules: 18 },
];

export default function HomePage() {
  const [topic, setTopic] = useState("");
  const [length, setLength] = useState("medium");
  const [complexity, setComplexity] = useState("beginner");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <Header />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`${sidebarOpen ? "w-[480px]" : "w-0"} transition-all duration-300 overflow-hidden border-r bg-background fixed md:relative h-full z-50 md:z-auto`}>
          <div className="p-6 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Learning Sessions</h2>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="h-10 w-10">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-4">
              {mockSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  title={session.title}
                  progress={session.progress}
                  modulesCompleted={session.modulesCompleted}
                  totalModules={session.totalModules}
                />
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Toggle Button */}
          {!sidebarOpen && (
            <div className="absolute top-6 left-6">
              <Button variant="outline" size="icon" onClick={() => setSidebarOpen(true)} className="h-10 w-10">
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          )}

          <main className="flex-1 flex justify-center px-6 pt-24">
            <div className="w-full max-w-3xl flex flex-col items-center space-y-10">
              <h1 className="text-4xl font-semibold text-center">
                What do you want to learn today, Krishin?
              </h1>

              <Textarea
                placeholder="Ask Curio to teach you anything..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full max-w-2xl h-32 !text-lg resize-none rounded-2xl px-4 py-4"
              />

              <RadioGroup value={length} onValueChange={setLength} className="flex gap-8">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="short" id="short" />
                  <Label htmlFor="short" className="text-base cursor-pointer">Short</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium" className="text-base cursor-pointer">Medium</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="long" id="long" />
                  <Label htmlFor="long" className="text-base cursor-pointer">Long</Label>
                </div>
              </RadioGroup>

              <RadioGroup value={complexity} onValueChange={setComplexity} className="flex gap-8">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="beginner" id="beginner" />
                  <Label htmlFor="beginner" className="text-base cursor-pointer">Beginner</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="intermediate" id="intermediate" />
                  <Label htmlFor="intermediate" className="text-base cursor-pointer">Intermediate</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="advanced" id="advanced" />
                  <Label htmlFor="advanced" className="text-base cursor-pointer">Advanced</Label>
                </div>
              </RadioGroup>

              <Button size="lg" className="w-full max-w-2xl h-14 text-base font-semibold">
                Create Learning Session
              </Button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}