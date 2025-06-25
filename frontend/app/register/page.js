import RegisterForm from "../../components/RegisterForm";
import Navbar from "../../components/Navbar";

export default function RegisterPage() {
  return (
    <main className="no-scrollbar">
      <Navbar title="INSCRIPTION" />
      <RegisterForm />
    </main>
  );
}