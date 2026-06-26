import OwnerDashboard from './OwnerDashboard'
import AdminDashboard from './AdminDashboard'
import MentorDashboard from './MentorDashboard'
import MemberDashboard from './MemberDashboard'

function UserDashboard({ user, onNavigate }) {
  if (!user) return null

  switch (user.role) {
    case 'owner':
      return <OwnerDashboard user={user} onNavigate={onNavigate} />
    case 'admin':
      return <AdminDashboard user={user} onNavigate={onNavigate} />
    case 'mentor':
      return <MentorDashboard user={user} onNavigate={onNavigate} />
    case 'mahasiswa':
    case 'member':
    default:
      return <MemberDashboard user={user} onNavigate={onNavigate} />
  }
}

export default UserDashboard
