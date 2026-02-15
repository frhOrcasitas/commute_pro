import Sidebar from "../components/sidebar";

export default function ProtectedLayout({ children }) {
  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 bg-gray-100 min-h-screen">
        {children}
      </main>
    </div>
  );
}
