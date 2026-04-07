import Navbar from "../components/NavBar.jsx";

export default function Home() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className='min-h-screen bg-base-200'>
      <Navbar />

      <div className='max-w-4xl mx-auto px-4 py-10'>
        {/* Message de bienvenue */}
        <div className='card bg-base-100 shadow-md p-6 mb-6'>
          <h1 className='text-2xl font-bold text-base-content'>
            Bonjour, {user.nom} 👋
          </h1>
          <p className='text-base-content/60 mt-1'>
            Niveau actuel :{" "}
            <span className='badge badge-primary'>{user.niveau}</span>
          </p>
        </div>

        {/* Placeholder — les scénarios arriveront au Sprint 3 */}
        <div className='card bg-base-100 shadow-md p-6'>
          <h2 className='text-lg font-semibold mb-2'>Scénarios disponibles</h2>
          <p className='text-base-content/50'>
            Les scénarios seront disponibles prochainement. 🚧
          </p>
        </div>
      </div>
    </div>
  );
}
