'use client'

interface User {
  id: string
  email: string
  name: string
  created_at: string
  dodo_customer_id: string | null
  has_dodo_account: boolean
}

interface UserProfileProps {
  user: User
  onLogout: () => void
}

export default function UserProfile({ user, onLogout }: UserProfileProps) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <p className="mt-1 text-sm text-gray-900">{user.email}</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">User ID</label>
          <p className="mt-1 text-sm text-gray-900 font-mono">{user.id}</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Dodo Customer ID</label>
          <p className="mt-1 text-sm text-gray-900 font-mono">
            {user.dodo_customer_id || 'Not available'}
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Account Status</label>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            user.has_dodo_account 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {user.has_dodo_account ? 'Linked with Dodo' : 'Dodo account pending'}
          </span>
        </div>
      </div>
      
      <button
        onClick={onLogout}
        className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
      >
        Logout
      </button>
    </div>
  )
}
