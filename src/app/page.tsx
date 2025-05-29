import LoginForm from '@/components/login/LoginForm';


export default function Home() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-gradient-to-br from-seasalt to-seasalt/80 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
        <img
          src="/illustration/illustration.png"
          alt="Login Illustration"
          className="w-full h-full object-contain"
        />
        </div>
      </div>
      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center bg-seasalt">
        <div className="w-full max-w-md px-8 rounded-xl shadow-lg py-12 my-12">
          <LoginForm />
        </div>
      </div>
      {/* Mobile illustration - shown on smaller screens */}
      <div className="lg:hidden absolute inset-0 bg-gradient-to-br from-seasalt to-seasalt opacity-5 pointer-events-none"></div>
    </div>
  );
}
