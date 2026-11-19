import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Eye,
  EyeOff,
  Layers,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordStrength =
    password.length === 0
      ? 0
      : password.length < 6
        ? 1
        : password.length < 10
          ? 2
          : 3;

  const strengthLabels = ["", "Weak", "Medium", "Strong"];

  const strengthBarColors: Record<number, string> = {
    1: "bg-[#F16B75]",
    2: "bg-[#E9B45B]",
    3: "bg-[#35C98A]",
  };

  const strengthTextColors: Record<number, string> = {
    1: "text-[#F16B75]",
    2: "text-[#E9B45B]",
    3: "text-[#35C98A]",
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!acceptedTerms) {
      setError("Please accept the Terms of Service.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await register(username, email, password);
      navigate("/profile", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
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

      <section className="relative z-10 w-full max-w-[490px]">
        {/* Brand */}
        <div className="mb-7 flex items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#8B7CFF]/30 bg-[#8B7CFF]/10 text-[#A397FF]">
            <Layers size={23} />
          </div>

          <div>
            <div className="text-xl font-bold tracking-[0.16em]">NEXUS</div>
            <div className="mt-0.5 text-[9px] font-semibold tracking-[0.25em] text-[#8B7CFF]">
              ENGINEERS ONLY • V2.4 PROTOCOL
            </div>
          </div>
        </div>

        {/* Register Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#151923]/95 p-7 shadow-[0_25px_80px_rgba(0,0,0,0.45)] sm:p-8">
          <div className="mb-7 text-center">
            <h1 className="text-[27px] font-semibold tracking-tight">
              Join Nexus
            </h1>
            <p className="mt-2 text-sm text-[#9298A8]">
              Create your identity in the network.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.13em] text-[#B7BDCC]"
              >
                Username
              </label>

              <div className="relative">
                <UserRound
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#737B8D]"
                />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Choose your handle"
                  autoComplete="username"
                  minLength={3}
                  required
                  className="h-11 w-full rounded-lg border border-[#303646] bg-[#10131B] pl-11 pr-4 text-sm outline-none transition placeholder:text-[#626A7A] focus:border-[#8B7CFF] focus:ring-2 focus:ring-[#8B7CFF]/15"
                />
              </div>

              <p className="mt-1.5 text-[10px] text-[#737B8D]">
                Choose a unique username (at least 3 characters).
              </p>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.13em] text-[#B7BDCC]"
              >
                Email Address
              </label>

              <div className="relative">
                <Mail
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
                  className="h-11 w-full rounded-lg border border-[#303646] bg-[#10131B] pl-11 pr-4 text-sm outline-none transition placeholder:text-[#626A7A] focus:border-[#8B7CFF] focus:ring-2 focus:ring-[#8B7CFF]/15"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.13em] text-[#B7BDCC]"
              >
                Password
              </label>

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
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  required
                  className="h-11 w-full rounded-lg border border-[#303646] bg-[#10131B] pl-11 pr-12 text-sm outline-none transition placeholder:text-[#626A7A] focus:border-[#8B7CFF] focus:ring-2 focus:ring-[#8B7CFF]/15"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737B8D] hover:text-white"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              {/* Password Strength */}
              <div className="mt-2 flex items-center gap-2">
                <div className="flex flex-1 gap-1">
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        passwordStrength >= level
                          ? strengthBarColors[passwordStrength]
                          : "bg-[#303646]"
                      }`}
                    />
                  ))}
                </div>

                <span
                  className={`text-[10px] font-medium transition-colors ${
                    strengthTextColors[passwordStrength] || "text-[#9298A8]"
                  }`}
                >
                  {strengthLabels[passwordStrength]}
                </span>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.13em] text-[#B7BDCC]"
              >
                Confirm Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#737B8D]"
                />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  required
                  className="h-11 w-full rounded-lg border border-[#303646] bg-[#10131B] pl-11 pr-12 text-sm outline-none transition placeholder:text-[#626A7A] focus:border-[#8B7CFF] focus:ring-2 focus:ring-[#8B7CFF]/15"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737B8D] hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              {confirmPassword && (
                <p
                  className={`mt-1.5 text-[10px] ${
                    password === confirmPassword ? "text-[#35C98A]" : "text-[#F16B75]"
                  }`}
                >
                  {password === confirmPassword
                    ? "Passwords match"
                    : "Passwords do not match"}
                </p>
              )}
            </div>

            {/* Terms */}
            <label className="flex cursor-pointer items-start gap-2.5 pt-1 text-[11px] leading-relaxed text-[#9298A8]">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[#8B7CFF]"
              />
              <span>
                I agree to the{" "}
                <a
                  href="#"
                  onClick={(event) => event.preventDefault()}
                  className="text-[#A397FF] hover:text-white"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  onClick={(event) => event.preventDefault()}
                  className="text-[#A397FF] hover:text-white"
                >
                  Privacy Policy
                </a>
                .
              </span>
            </label>

            {error && (
              <p
                role="alert"
                className="rounded-lg border border-[#F16B75]/30 bg-[#F16B75]/10 p-3 text-xs text-[#F16B75]"
              >
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#8B7CFF] text-sm font-semibold text-white shadow-[0_5px_25px_rgba(139,124,255,0.2)] transition hover:bg-[#A397FF] disabled:opacity-50"
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>
          </form>

          {/* Security */}
          <div className="mt-5 flex items-center gap-2 rounded-lg border border-[#303646] bg-[#10131B] p-3">
            <ShieldCheck size={16} className="shrink-0 text-[#8B7CFF]" />
            <p className="text-[10px] text-[#9298A8]">
              Your account information is handled securely.
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-[#9298A8]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-[#A397FF] hover:text-white"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between px-1 text-[9px] font-medium uppercase tracking-[0.13em] text-[#626A7A]">
          <div className="flex items-center gap-2">
            <Activity size={12} className="text-[#8B7CFF]" />
            <span>Nexus Network</span>
          </div>
          <span>System Version 2.4</span>
        </div>
      </section>
    </main>
  );
}

export default RegisterPage;