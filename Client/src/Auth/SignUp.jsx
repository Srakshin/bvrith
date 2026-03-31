import { useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import axiosInstance from "@/utils/axios";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";

const backendUrl = import.meta.env.VITE_API_URL;

function SignUp() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const hasSubmitted = useRef(false);

  const validateEmail = (value) => {
    if (!value) return "Email is required";
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(value) ? true : "Enter a valid email address";
  };

  const validateName = (value, fieldName) => {
    if (!value) return `${fieldName} is required`;
    if (!/^[A-Za-z ]*$/.test(value)) return "Please input only letters";
    if (value.length < 2) return "Min 2 letters";
    return true;
  };

  const validateUsername = async (value) => {
    if (!value) return "Username is required";
    if (!/^[A-Za-z0-9_]*$/.test(value))
      return "Letters, numbers, and underscores only";
    if (value.length < 3) return "Min 3 characters";

    try {
      setIsCheckingUsername(true);
      const response = await axiosInstance.get(
        `/user/check-username?username=${value}`
      );
      if (response.data.exists) return "Username taken";
    } catch {
      return "Validation failed";
    } finally {
      setIsCheckingUsername(false);
    }
    return true;
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
  } = useForm({
    mode: "onBlur",
  });

  const handleGoogleLogin = () => {
    window.location.href = `${backendUrl}/auth/google`;
  };

  const onSubmit = async (data) => {
    if (hasSubmitted.current) return;
    try {
      hasSubmitted.current = true;
      const response = await axiosInstance.post(`/auth/signup`, data);
      reset();
      const { activationToken } = response.data;
      if (activationToken) {
        localStorage.setItem("activationToken", activationToken);
        navigate("/auth/verify");
      } else {
        toast.success("Account created successfully!");
        navigate("/auth/login");
      }
    } catch (error) {
      hasSubmitted.current = false;
      toast.error(error.response?.data?.error || "Signup failed");
    }
  };

  const inputClass = "block w-full rounded-md border border-[#eeeeee] dark:border-[#333333] px-3 py-2 text-sm bg-[#f7f7f7] dark:bg-[#3e3e3e] focus:outline-none focus:ring-1 focus:ring-red-500 transition-all";

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <div className="flex gap-3">
          <div className="flex-1 space-y-1">
            <input
              type="text"
              placeholder="First Name"
              {...register("FirstName", { validate: (v) => validateName(v, "First Name") })}
              className={inputClass}
            />
            {errors.FirstName && <p className="text-red-500 text-[10px]">{errors.FirstName.message}</p>}
          </div>
          <div className="flex-1 space-y-1">
            <input
              type="text"
              placeholder="Last Name"
              {...register("LastName", { validate: (v) => validateName(v, "Last Name") })}
              className={inputClass}
            />
            {errors.LastName && <p className="text-red-500 text-[10px]">{errors.LastName.message}</p>}
          </div>
        </div>

        <div className="space-y-1 relative">
          <Controller
            name="Username"
            control={control}
            rules={{ validate: validateUsername }}
            render={({ field }) => (
              <>
                <input
                  {...field}
                  type="text"
                  placeholder="Username"
                  className={inputClass}
                />
                {isCheckingUsername && <Loader2 className="absolute right-3 top-2.5 size-4 animate-spin text-gray-400" />}
              </>
            )}
          />
          {errors.Username && <p className="text-red-500 text-[10px]">{errors.Username.message}</p>}
        </div>

        <div className="space-y-1">
          <input
            type="email"
            placeholder="Email Address"
            {...register("Email", { validate: validateEmail })}
            className={inputClass}
          />
          {errors.Email && <p className="text-red-500 text-[10px]">{errors.Email.message}</p>}
        </div>

        <div className="space-y-1 relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            {...register("Password", { required: "Required", minLength: { value: 6, message: "Min 6 chars" } })}
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
          {errors.Password && <p className="text-red-500 text-[10px]">{errors.Password.message}</p>}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || hasSubmitted.current}
          className="w-full bg-[var(--btn)] hover:bg-[var(--btn-hover)] text-white py-2 rounded-md font-medium transition-colors mt-2"
        >
          {isSubmitting || hasSubmitted.current ? "Creating Account..." : "Sign Up"}
        </Button>

        <p className="text-center text-xs text-gray-500 mt-4">
          Have an account?{" "}
          <Link to="/auth/login" className="text-txt-red hover:text-red-600 font-medium">
            Sign In
          </Link>
        </p>
      </form>

      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#eeeeee] dark:border-[#333333]"></div>
        </div>
        <div className="relative flex justify-center text-[10px] uppercase">
          <span className="bg-white dark:bg-[#282828] px-2 text-gray-500">or</span>
        </div>
      </div>

      <Button
        onClick={handleGoogleLogin}
        variant="outline"
        className="flex items-center justify-center gap-2 w-full border border-[#eeeeee] dark:border-[#333333] py-2 rounded-md text-sm font-medium hover:bg-hover-red hover:text-txt-red dark:hover:bg-red-950/30 transition-colors"
      >
        <img src="/GoogleIcon.svg" alt="Google" className="size-4" />
        <span>Continue with Google</span>
      </Button>
    </div>
  );
}

export default SignUp;
