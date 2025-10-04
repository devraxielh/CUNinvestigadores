import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import CodigoUsuarioForm from "./CodigoUsuarioForm";

export default function Productos() {
  const API_BASE = import.meta.env.VITE_API_URL;

  const getAuth = () => {
    const raw = localStorage.getItem("user");
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  };

  const auth = getAuth();
  const userId = auth?.id_user;
  const token = auth?.access || auth?.token;

  return (
    <div>
      <PageMeta title="" description="" />
      <PageBreadcrumb pageTitle="Codigo de Usuario Minciencias" />

      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-5 xl:py-5">
        <div>
          <CodigoUsuarioForm API_BASE={API_BASE} userId={userId} token={token} />
        </div>
      </div>
    </div>
  );
}