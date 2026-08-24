// Local fallback screen (no Base44 dependency). Kept because App.jsx imports it.
export default function UserNotRegisteredError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold mb-2">Acesso restrito</h1>
        <p className="text-sm text-muted-foreground">
          Você não tem acesso a este aplicativo.
        </p>
      </div>
    </div>
  );
}