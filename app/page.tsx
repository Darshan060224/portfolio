"use client";

import dynamic from "next/dynamic";
import { useState, useCallback } from "react";
import LoadingScreen from "./components/LoadingScreen";
import HUDOverlay from "./components/HUDOverlay";
import AmbientSoundToggle from "./components/AmbientSoundToggle";

const Room3D = dynamic(() => import("./components/Room3D"), { ssr: false });

export default function Home() {
  const [loaded, setLoaded] = useState(false);

  const handleLoadComplete = useCallback(() => {
    setLoaded(true);
  }, []);

  return (
    <main className="h-screen w-screen overflow-hidden bg-[#0A0F1C]">
      {!loaded && <LoadingScreen onComplete={handleLoadComplete} />}
      <div className={`h-full w-full transition-opacity duration-1000 ${loaded ? "opacity-100" : "opacity-0"}`}>
        <Room3D />
      </div>
      {loaded && (
        <>
          <HUDOverlay />
          <AmbientSoundToggle />
        </>
      )}
    </main>
  );
}
