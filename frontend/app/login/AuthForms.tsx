"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import LoginForm from "./loginForm";
import RegisterForm from "./registerForm";
import Switcher from "./switcher";

export type AuthMode = "login" | "register";

export default function AuthForms() {
  const [mode, setMode] = useState<AuthMode>("login");

  return (
    <div className="flex flex-col gap-6">
      <Switcher mode={mode} setMode={setMode} />

      <div className="relative overflow-hidden border border-white/10 bg-white/[0.03]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -18, filter: "blur(8px)" }}
            transition={{
              duration: 0.32,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="p-6"
          >
            {mode === "login" ? <LoginForm /> : <RegisterForm />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
