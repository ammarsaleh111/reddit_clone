import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Hexagon,
  LockKeyhole,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { getApiErrorMessage } from "../../../services/authservices";

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/profile";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter both your email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to sign in."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0B0D12] px-5 py-12 text-white">
      {/* Background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage: "radial-gradient(#737B8D 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="pointer-events-none absolute -left-40 top-[-180px] h-[500px] w-[500px] rounded-full bg-[#8B7CFF]/10 blur-[130px]" />
      <div className="pointer-events-none absolute -right-40 bottom-[-180px] h-[500px] w-[500px] rounded-full bg-[#8B7CFF]/10 blur-[130px]" />

      {/* Login Card */}
      <section className="relative z-10 w-full max-w-[440px]">
        {/* Brand */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#8B7CFF]/30 bg-[#8B7CFF]/10 text-[#A397FF]">
            <Hexagon size={25} strokeWidth={1.8} />
          </div>

          <div>
            <div className="text-2xl font-bold tracking-[0.16em]">NEXUS</div>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#151923]/95 p-7 shadow-[0_25px_80px_rgba(0,0,0,0.45)] sm:p-9">
          <div className="mb-8 text-center">
            <h1 className="text-[27px] font-semibold tracking-tight text-white">
              Welcome Back
            </h1>

            <p className="mt-2 text-sm text-[#9298A8]">
              Enter your credentials to access the network.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400"
            >
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.13em] text-[#B7BDCC]"
              >
                email address
              </label>

              <div className="relative">
                <Terminal
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#737B8D]"
                />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                  className="h-[50px] w-full rounded-lg border border-[#303646] bg-[#10131B] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-[#626A7A] focus:border-[#8B7CFF] focus:ring-2 focus:ring-[#8B7CFF]/15"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[#B7BDCC]"
                >
                  password
                </label>
              </div>

              <div className="relative">
                <LockKeyhole
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#737B8D]"
                />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="h-[50px] w-full rounded-lg border border-[#303646] bg-[#10131B] pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-[#626A7A] focus:border-[#8B7CFF] focus:ring-2 focus:ring-[#8B7CFF]/15"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737B8D] transition hover:text-white"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Sign In */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="group flex h-[50px] w-full items-center justify-center gap-2 rounded-lg bg-[#8B7CFF] text-sm font-semibold text-white shadow-[0_5px_25px_rgba(139,124,255,0.2)] transition hover:bg-[#A397FF] disabled:opacity-50"
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-7 flex gap-3 rounded-lg border border-[#8B7CFF]/15 bg-[#8B7CFF]/[0.06] p-4">
            <ShieldCheck size={19} className="mt-0.5 shrink-0 text-[#A397FF]" />

            <div>
              <p className="text-xs font-semibold text-[#D7D2FF]">Secure Access</p>
              <p className="mt-1 text-[11px] leading-relaxed text-[#9298A8]">
                Your account session is managed through the Nexus authentication
                system.
              </p>
            </div>
          </div>

          {/* Register Link */}
          <p className="mt-7 text-center text-xs text-[#9298A8]">
            New to the network?{" "}
            <Link
              to="/register"
              className="font-semibold text-[#A397FF] transition hover:text-white"
            >
              Create an account
            </Link>
          </p>
        </div>

        {/* Bottom Status */}
        <div className="mt-6 flex items-center justify-between px-1 text-[9px] font-medium uppercase tracking-[0.13em] text-[#626A7A]">
          <div className="flex items-center gap-2">
            <Activity size={12} className="text-[#8B7CFF]" />
            <span>Nexus Network</span>
          </div>

        </div>
      </section>
    </main>
  );
}

export default LoginPage;