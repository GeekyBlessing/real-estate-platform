import Link from "next/link";
import { ToastProvider } from "@/components/ui/Toast";
import { APP_NAME } from "@/lib/brand";

/**
 * Deliberately not the marketplace shell: no primary navigation, no
 * footer, nothing competing with the one task on the page. Just a
 * way back to the marketplace.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col">
        <div className="px-6 py-6">
          <Link href="/" className="font-display text-lg font-bold text-ink">
            {APP_NAME}
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 pb-16">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </ToastProvider>
  );
}
