import { useRoutes } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { routes } from "./router";
import { AuthInitializer } from "./AuthInitializer";

export default function App() {
  const element = useRoutes(routes);

  return (
    <div className="flex flex-col min-h-screen">
      <AuthInitializer />
      
      <Header />

      <main className="flex-1 flex flex-col">
        {element}
      </main>

      <Footer />
    </div>
  );
}