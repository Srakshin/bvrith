import { Link } from "react-router-dom";

const StudiaLanding = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-primary text-[var(--txt)] p-4">
      <h1 className="text-4xl md:text-6xl font-bold mb-8">Welcome to Studia</h1>
      <Link
        to="/auth/login"
        className="bg-[var(--btn)] hover:bg-[var(--btn-hover)] text-white px-8 py-3 rounded-full text-lg font-semibold transition-all shadow-lg hover:scale-105"
      >
        Get Started
      </Link>
    </div>
  );
};

export default StudiaLanding;
