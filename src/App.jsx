import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import ActionCard from './components/ActionCard'
import ActionForm from './components/ActionForm'
import { LogIn, LogOut, Loader2, PlusCircle, ShieldAlert } from 'lucide-react'

export default function App() {
  const [session, setSession] = useState(null)
  const [actions, setActions] = useState([])
  const [userRole, setUserRole] = useState('field_user')
  const [filter, setFilter] = useState('my')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchRoleAndActions(session.user.id)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        fetchRoleAndActions(session.user.id)
      } else {
        setActions([])
        setUserRole('field_user')
      }
    })
  }, [])

  async function fetchRoleAndActions(userId) {
    setLoading(true)
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single()
    if (profile) setUserRole(profile.role)

    const { data } = await supabase
      .from('actions')
      .select('*, profiles:assigned_to(full_name)')
      .order('delivery_date', { ascending: true })
    
    if (data) setActions(data)
    setLoading(false)
  }

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert(error.message)
    setLoading(false)
  }

  async function handleStatusChange(actionId, newStatus) {
    const { error } = await supabase.from('actions').update({ status: newStatus }).eq('id', actionId)
    if (!error) {
      setActions(actions.map(a => a.id === actionId ? { ...a, status: newStatus } : a))
    } else {
      alert("Error updating status: " + error.message)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <form onSubmit={handleLogin} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 w-full max-w-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">Action Tracker Login</h2>
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 mb-3 border border-slate-300 rounded-lg text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 mb-4 border border-slate-300 rounded-lg text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white p-2 rounded-lg text-sm font-semibold hover:bg-slate-800 flex justify-center items-center">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><LogIn className="w-4 h-4 mr-2" /> Sign In</>}
          </button>
        </form>
      </div>
    )
  }

  const displayedActions = actions.filter(action => {
    if (filter === 'my') return action.assigned_to === session.user.id
    return true
  })

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-3 flex items-center justify-between">
        <h1 className="font-bold text-lg text-slate-800 truncate">Tracker Dashboard</h1>
        <button onClick={() => supabase.auth.signOut()} className="text-slate-500 hover:text-slate-800">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      <main className="max-w-xl mx-auto p-4">
        {userRole === 'admin' && (
          <div className="mb-6 flex gap-2">
            <button onClick={() => setShowForm(true)} className="flex-1 bg-slate-900 text-white py-2 px-4 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-slate-800">
              <PlusCircle className="w-4 h-4" /> New Action
            </button>
            <button className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700">
              <ShieldAlert className="w-4 h-4" /> Users & Roles
            </button>
          </div>
        )}

        <div className="flex gap-2 bg-slate-200 p-1 rounded-lg mb-4">
          <button
            onClick={() => setFilter('my')}
            className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-colors ${filter === 'my' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:bg-slate-300'}`}
          >
            My Field Tasks
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-colors ${filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:bg-slate-300'}`}
          >
            All Organization Tasks
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center mt-10"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
        ) : displayedActions.length === 0 ? (
          <p className="text-center text-sm text-slate-500 mt-10">No actions found in this category.</p>
        ) : (
          displayedActions.map(action => (
            <ActionCard
              key={action.id}
              action={action}
              onStatusChange={handleStatusChange}
              isEditable={userRole === 'admin' || action.assigned_to === session.user.id}
            />
          ))
        )}
      </main>

      {showForm && (
        <ActionForm 
          onClose={() => setShowForm(false)} 
          onSave={() => fetchRoleAndActions(session.user.id)} 
        />
      )}
    </div>
  )
}
