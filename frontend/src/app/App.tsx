import { Route, Routes } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { routes } from "./router";
import { AuthInitializer } from "./AuthInitializer";

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <AuthInitializer />
      
      <Header />

      <main className="flex-1 flex flex-col">
        <Routes>
          {routes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={route.element}
            />
          ))}
        </Routes>
      </main>

      <Footer />
    </div>
  );
}