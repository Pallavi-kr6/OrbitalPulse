import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeatureGrid from './components/FeatureGrid';
import Footer from './components/Footer';
import Lightfall from './Lightfall';
import LandingNarrator from './components/LandingNarrator';

export default function Home() {
  return (
    <div className="relative min-h-screen">
      <LandingNarrator />
      {/* Whole-screen Lightfall background */}
      <div className="fixed inset-0 w-screen h-screen -z-50">
        <Lightfall
          colors={['#A6C8FF', '#5227FF', '#FF9FFC']}
          backgroundColor="#0A29FF"
          speed={0.5}
          streakCount={2}
          streakWidth={1}
          streakLength={1}
          glow={1}
          density={0.6}
          twinkle={1}
          zoom={3}
          backgroundGlow={0.5}
          opacity={1}
          mouseInteraction
          mouseStrength={0.5}
          mouseRadius={1}
          color1="#A6C8FF"
          color2="#5227FF"
          color3="#FF9FFC"
        />
      </div>

      <Navbar />
      <main className="relative z-10 flex flex-col items-center min-h-screen pt-20">
        <Hero />
        <FeatureGrid />
      </main>
      <Footer />
    </div>
  );
}
