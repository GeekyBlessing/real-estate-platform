import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/marketplace/Footer";
import { ToastProvider } from "@/components/ui/Toast";

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <Navbar isAuthenticated={false} />
      {children}
      <Footer />
    </ToastProvider>
  );
}
