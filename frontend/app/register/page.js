import RegisterForm from "../../components/RegisterForm";
import Navbar from "../../components/Navbar";

export default function RegisterPage() {
  return (
    <main className="no-scrollbar">
      <Navbar title="INSCRIPTION" />
      <div className="h-20" />
      <RegisterForm />
    </main>
  );
}