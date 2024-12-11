import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { useAuth } from "../context/AuthContext";
import LandingHero from "./LandingHero";
import Dashboard from "./Dashboard";

const Home = () => {
  const { user: userData } = useAuth();

  const particlesInit = async (main: any) => {
    await loadFull(main);
  };

  return (
    <div className="w-full h-screen bg-slate-900 text-white overflow-hidden relative">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: {
            color: {
              value: "transparent",
            },
          },
          particles: {
            number: {
              value: 80,
              density: {
                enable: true,
                value_area: 800,
              },
            },
            color: {
              value: "#0EA5E9",
            },
            links: {
              enable: true,
              color: "#0EA5E9",
              opacity: 0.2,
            },
            move: {
              enable: true,
              speed: 1,
            },
            opacity: {
              value: 0.3,
            },
          },
        }}
        className="absolute inset-0"
      />

      <div
        className="absolute w-screen inset-0 bg-gradient-to-br from-cyan-900/30 to-amber-900/30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <main className="w-full mx-auto px-4 py-12 relative z-10">
        {userData ? <Dashboard userData={userData} /> : <LandingHero />}
      </main>
    </div>
  );
};

export default Home;
