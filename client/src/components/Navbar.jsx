import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="nav">
      <div className="nav-inner">
        <span className="brand">Ledgerly</span>
        <nav className="nav-links">
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/transactions">Transactions</NavLink>
        </nav>
        <div className="nav-user">
          <span className="muted">{user?.name}</span>
          <button className="btn btn-quiet" onClick={() => { logout(); navigate('/login'); }}>Log out</button>
        </div>
      </div>
    </header>
  );
}
