import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { projectsApi } from '../api/projects'
import { useAuthStore } from '../stores/authStore'

export default function Dashboard() {
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.getAll,
  })

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800">
      <nav className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <h1 className="text-2xl font-bold text-white">Perfect Cut</h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-white hover:text-amber-400 font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-bold text-white">My Projects</h2>
          <Link
            to="/projects/new"
            className="bg-amber-500 text-slate-900 px-8 py-3 rounded-lg hover:bg-amber-400 font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            New Project
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-slate-300 text-lg">Loading projects...</p>
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project: any) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="bg-white/10 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-white/20 hover:border-amber-400/50 transition-all hover:transform hover:scale-105"
              >
                <h3 className="text-xl font-bold mb-2 text-white">{project.name}</h3>
                <p className="text-slate-300 mb-4">{project.description || 'No description'}</p>
                <div className="flex justify-between text-sm text-slate-400">
                  <span>{project.sheets?.length || 0} sheets</span>
                  <span>{project.pieces?.length || 0} pieces</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/10 backdrop-blur-sm rounded-xl shadow-xl border border-white/20">
            <p className="text-slate-300 mb-4 text-lg">No projects yet</p>
            <Link
              to="/projects/new"
              className="text-amber-400 hover:text-amber-300 font-semibold text-lg"
            >
              Create your first project
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
