import React from 'react'
import { Calendar, User, Tag, Edit } from 'lucide-react'

const priorityColors = {
  High: 'bg-red-100 text-red-700 border-red-200',
  Medium: 'bg-amber-100 text-amber-700 border-amber-200',
  Low: 'bg-green-100 text-green-700 border-green-200',
}

const statusOptions = ['Outstanding', 'In Progress', 'Completed', 'On Hold']

export default function ActionCard({ action, onStatusChange, isEditable, onEdit }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 mb-3">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${priorityColors[action.priority] || 'bg-slate-100'}`}>
          {action.priority} Priority
        </span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {action.delivery_date || 'No date'}
          </span>
          {isEditable && (
            <button onClick={() => onEdit(action)} className="text-slate-400 hover:text-slate-900 transition-colors">
              <Edit className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <h3 className="font-semibold text-slate-900 text-base mb-1.5 leading-snug">
        {action.description}
      </h3>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mb-3">
        <span className="flex items-center gap-1">
          <Tag className="w-3.5 h-3.5 text-slate-400" />
          {action.category || 'General'}
        </span>
        <span className="flex items-center gap-1">
          <User className="w-3.5 h-3.5 text-slate-400" />
          {action.profiles?.full_name || 'Unassigned'}
        </span>
      </div>

      {action.notes && (
        <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg mb-3 italic border-l-2 border-slate-300">
          {action.notes}
        </p>
      )}

      {isEditable && (
        <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 sm:flex">
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => onStatusChange(action.id, status)}
              className={`flex-1 py-1.5 text-xs rounded-lg font-medium transition-all ${
                action.status === status
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
