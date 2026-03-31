import { Button } from "@/components/ui/button";
import axiosInstance from "@/utils/axios";
import { Eye, EyeOff } from "lucide-react";
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/contexts/ToastContext";

const backendUrl = import.meta.env.VITE_API_URL;

function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const hasLoggedIn = useRef(false);

  const handleGoogleLogin = () => {
    window.location.href = `${backendUrl}/auth/google`;
  };

  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    if (hasLoggedIn.current) return;
    try {
      const url = `/auth/login`;
      const response = await axiosInstance.post(url, data);
      hasLoggedIn.current = true;
      reset();
      const { token, refreshToken } = response.data;
      if (token) localStorage.setItem("token", token);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      window.dispatchEvent(new Event("tokenChanged"));
      toast.success("Login successful!");
      navigate("/");
    } catch (error) {
      hasLoggedIn.current = false;
      toast.error(error.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <input
            id="identifier"
            type="text"
            placeholder="Username or Email"
            {...register("identifier", { required: "Required" })}
            className="block w-full rounded-md border border-[#eeeeee] dark:border-[#333333] px-3 py-2.5 text-sm bg-[#f7f7f7] dark:bg-[#3e3e3e] focus:outline-none focus:ring-1 focus:ring-red-500 transition-all"
          />
          {errors.identifier && <p className="text-red-500 text-xs">{errors.identifier.message}</p>}
        </div>

        <div className="space-y-1 relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            {...register("Password", { required: "Required", minLength: 6 })}
            className="block w-full rounded-md border border-[#eeeeee] dark:border-[#333333] px-3 py-2.5 text-sm bg-[#f7f7f7] dark:bg-[#3e3e3e] focus:outline-none focus:ring-1 focus:ring-red-500 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
          {errors.Password && <p className="text-red-500 text-xs">{errors.Password.message || "Invalid password"}</p>}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || hasLoggedIn.current}
          className="w-full bg-[var(--btn)] hover:bg-[var(--btn-hover)] text-white py-2.5 rounded-md font-medium transition-colors"
        >
          {isSubmitting || hasLoggedIn.current ? "Signing In..." : "Sign In"}
        </Button>

        <div className="flex justify-between items-center text-xs">
          <Link to="/auth/forgot-password" size="sm" className="text-gray-500 hover:text-txt-red transition-colors">
            Forgot Password?
          </Link>
          <Link to="/auth/signup" className="text-txt-red hover:text-red-600 font-medium">
            Sign Up
          </Link>
        </div>
      </form>

      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#eeeeee] dark:border-[#333333]"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-[#282828] px-2 text-gray-500">or</span>
        </div>
      </div>

      <Button
        onClick={handleGoogleLogin}
        variant="outline"
        className="flex items-center justify-center gap-2 w-full border border-[#eeeeee] dark:border-[#333333] py-2.5 rounded-md text-sm font-medium hover:bg-hover-red hover:text-txt-red dark:hover:bg-red-950/30 transition-colors"
      >
        <img src="/GoogleIcon.svg" alt="Google" className="size-4" />
        <span>Continue with Google</span>
      </Button>
    </div>
  );
}

export default Login;
