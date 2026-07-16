import { NavLink } from "react-router-dom";

function Navbar() {
    return (
        <div className="sidebar">
            <ul>
                <li><NavLink to="/">Overview</NavLink></li>
                <li><NavLink to="/course">Course Manager</NavLink></li>
                <li><NavLink to="/resource">Resource Library</NavLink></li>
                <li><NavLink to="/users">Users</NavLink></li>
                <li><NavLink to="/settings">Settings</NavLink></li>
            </ul>
        </div>
    )
}

export default Navbar;