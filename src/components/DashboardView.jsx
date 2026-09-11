import React from 'react'
import { Printer, Users, Clock, BarChart3 } from 'lucide-react'

export default function DashboardView({ actions, users }) {
  // Calculate Task Status Summary counts
  const statusCounts = actions.reduce((acc, action) => {
    const status = action.status || 'Outstanding'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {})

  // Calculate User Workload Matrix
  const userLoadMap = {}
  users.forEach(u => {
    userLoadMap[u.id] = { name: u.full_name || 'Unnamed', total: 0, completed: 0, pending: 0 }
  })
  
  // Track unassigned tasks bucket
  userLoadMap['unassigned'] = { name: 'Unassigned', total: 0, completed: 0, pending: 0 }

  actions.forEach(action => {
    const key = action.assigned_to || 'unassigned'
    if (!userLoadMap[key]) {
      userLoadMap[key] = { name: action.profiles?.full_name || 'Unknown', total: 0, completed: 0, pending: 0 }
    }
    userLoadMap[key].total += 1
    if (action.status === 'Completed') {
      userLoadMap[key].completed += 1
    } else {
      userLoadMap[key].pending += 1
    }
  })

  const userLoadList = Object.values(userLoadMap).filter(u => u.total > 0 || u.name !== 'Unassigned')

  return (
    <div className="space-y-6">
      {/* Dashboard Top Header & Print Button (Hidden when printing) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" /> Supervisor Report Dashboard
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Real-time breakdown of organizational tasks and staff workload.</p>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm w-full sm:w-auto justify-center"
        >
          <Printer className="w-4 h-4" /> Print / Save as PDF
        </button>
      </div>

      {/* Printable Report Container */}
      <div className="space-y-6 print:space-y-4">
        
        {/* Task Status Summary Cards */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-wider">
            <Clock className="w-4 h-4 text-slate-400" /> Task Status Matrix
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl">
              <p className="text-xs font-medium text-amber-700 uppercase">Outstanding</p>
              <p className="text-2xl font-bold text-amber-900 mt-1">{statusCounts['Outstanding'] || 0}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-xl">
              <p className="text-xs font-medium text-blue-700 uppercase">In Progress</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{statusCounts['In Progress'] || 0}</p>
            </div>
            <div className="bg-green-50 border border-green-200 p-3.5 rounded-xl">
              <p className="text-xs font-medium text-green-700 uppercase">Completed</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{statusCounts['Completed'] || 0}</p>
            </div>
            <div className="bg-slate-100 border border-slate-200 p-3.5 rounded-xl">
              <p className="text-xs font-medium text-slate-600 uppercase">On Hold</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{statusCounts['On Hold'] || 0}</p>
            </div>
          </div>
        </div>

        {/* User Load Matrix Table */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-wider">
            <Users className="w-4 h-4 text-slate-400" /> User Workload Matrix
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="py-3 px-3 font-semibold">Staff Member</th>
                  <th className="py-3 px-3 font-semibold text-center">Total Assigned</th>
                  <th className="py-3 px-3 font-semibold text-center">Completed</th>
                  <th className="py-3 px-3 font-semibold text-center">Active / Pending</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {userLoadList.map((user, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-medium text-slate-900">{user.name}</td>
                    <td className="py-3 px-3 text-center font-semibold text-slate-700">{user.total}</td>
                    <td className="py-3 px-3 text-center text-green-600 font-medium">{user.completed}</td>
                    <td className="py-3 px-3 text-center text-amber-600 font-medium">{user.pending}</td>
                  </tr>
                ))}
                {userLoadList.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-slate-400 text-xs">No workload data recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
