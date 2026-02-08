import { auth, googleProvider } from "../utils/firebase";
import { signInWithPopup } from "firebase/auth";

export default function SignIn() {
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      alert("Login successful");
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo / Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-semibold tracking-tight">
            Trader’s Paradise
          </h1>
          <p className="text-zinc-400 mt-2 text-sm">
            Analyze your trades. Track performance. Grow smarter.
          </p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900/70 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-medium mb-6 text-center">
            Sign in to continue
          </h2>

          <button
            onClick={handleGoogleLogin}
            className="w-full bg-white text-black py-3 rounded-xl font-medium hover:opacity-90 transition-all duration-200"
          >
            Continue with Google
          </button>

          <p className="text-xs text-zinc-500 text-center mt-6">
            By continuing, you agree to our Terms & Privacy Policy.
          </p>
        </div>

        {/* Footer note */}
        <p className="text-center text-zinc-600 text-xs mt-8">
          © {new Date().getFullYear()} Trader’s Paradise
        </p>
      </div>
    </div>
  );}
