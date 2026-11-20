
import { HeartPulse, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <nav className="dashboard-navbar">
            <div className="dashboard-logo">
                <HeartPulse size={26} />
                <h2>Sweety</h2>
            </div>

            <div className="navbar-actions">
                <NavLink to="/dashboard" className="nav-link">
                    Dashboard
                </NavLink>

                <NavLink to="/reports" className="nav-link">
                    Reports
                </NavLink>

                <button className="logout-button" onClick={handleLogout}>
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </nav>
    );
}

export default Navbar;
