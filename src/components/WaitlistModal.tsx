"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Check, Loader2 } from "lucide-react";
import { posthog } from "./PostHogProvider";
import { trackWaitlistClosed } from "@/lib/analytics";

type Platform = "macos" | "linux";

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: Platform;
}

export function WaitlistModal({ isOpen, onClose, platform }: WaitlistModalProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const platformName = platform === "macos" ? "macOS" : "Linux";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === "loading") return;

    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, platform }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus("success");
        posthog?.capture("newsletter_subscribed", { source: "waitlist", platform, email });
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Something went wrong");
        posthog?.capture("form_error", { source: "waitlist", platform, error: data.error });
      }
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please try again.");
    }
  };

  const handleClose = () => {
    // Only track close if user didn't successfully submit
    if (status !== "success") {
      trackWaitlistClosed(platform, email.length > 0);
    }
    setEmail("");
    setStatus("idle");
    setErrorMessage("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-2xl">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-zinc-500 hover:text-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {status === "success" ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="font-mono font-semibold text-xl mb-2">You&apos;re on the list!</h3>
                  <p className="text-zinc-600 text-sm">
                    We&apos;ll notify you when {platformName} support is ready.
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="font-mono font-semibold text-xl mb-2">
                    Join the {platformName} Waitlist
                  </h3>
                  <p className="text-zinc-600 text-sm mb-6">
                    Be the first to know when Terminator comes to {platformName}.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-lg font-mono text-sm focus:outline-none focus:border-accent transition-colors"
                      />
                    </div>

                    {status === "error" && (
                      <p className="text-red-600 text-sm">{errorMessage}</p>
                    )}

                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent hover:bg-accent-hover text-white font-mono font-semibold rounded-lg transition-colors disabled:opacity-50"
                    >
                      {status === "loading" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          Join Waitlist
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
