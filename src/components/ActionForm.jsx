import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { X } from 'lucide-react'

export default function ActionForm({ onClose, onSave }) {
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [notes, setNotes] = useState('')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchUsers() {
      const { data } = await supabase.from('profiles').select('id, full_name')
      if (data) setUsers(data)
    }
    fetchUsers()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const newAction = {
      description,
      category,
      priority,
      delivery_date: deliveryDate || null,
      assigned_to: assignedTo || null,
      notes,
      status: 'Outstanding'
    }

    const { error } = await supabase.from('actions').insert([newAction])
    setLoading(false)
    
    if (error) {
      alert('Error saving action: ' + error.message)
    } else {
      onSave()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-800">New Action Request</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
            <textarea required value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900" rows="3"></textarea>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Project / Event</label>
              <input type="text" value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm" placeholder="e.g. Total Football Mania" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm">
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Delivery Date</label>
              <input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Assign To</label>
              <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm">
                <option value="">Unassigned</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.full_name || 'Unnamed User'}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes / Instructions</label>
            <input type="text" value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm" />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-800 mt-2">
            {loading ? 'Saving...' : 'Save Action'}
          </button>
        </form>
      </div>
    </div>
  )
}
