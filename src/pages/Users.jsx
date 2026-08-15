import React, { useState, useEffect } from 'react';

function Users() {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
    const [loading, setLoading] = useState(true);

    // 1. Dual-purpose modal states
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Student',
        status: 'Active'
    });

    const BACKEND_URL = 'https://adminbackend-production-f7a6.up.railway.app';

    const fetchUserData = async () => {
        try {
            const listResponse = await fetch(`${BACKEND_URL}/api/users`);
            if (!listResponse.ok) throw new Error("Failed to load user list");
            const listData = await listResponse.json();
            setUsers(listData);

            const statsResponse = await fetch(`${BACKEND_URL}/api/users/stats`);
            if (!statsResponse.ok) throw new Error("Failed to load user metrics");
            const statsData = await statsResponse.json();
            setStats(statsData);
        } catch (error) {
            console.error("Backend integration fetch error:", error);
            alert("Could not synchronize with the user database. Please try again later.");
            setUsers([]);
            setStats({ total: 0, active: 0, inactive: 0 });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 2. Open modal clean for new records
    const handleOpenAddModal = () => {
        setIsEditMode(false);
        setEditingUserId(null);
        setFormData({ name: '', email: '', password: '', role: 'Student', status: 'Active' });
        setShowModal(true);
    };

    // 3. Open modal populated with target user row configurations
    const handleOpenEditModal = (user) => {
        setIsEditMode(true);
        setEditingUserId(user.id);
        setFormData({
            name: user.name || '',
            email: user.email || '',
            password: '', // Leave blank to protect existing hash if unedited
            role: user.role || 'Student',
            status: user.status || 'Active'
        });
        setShowModal(true);
    };

    // 4. Combined Form Submission Handler
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        
        const url = isEditMode 
            ? `${BACKEND_URL}/api/users/${editingUserId}` 
            : `${BACKEND_URL}/api/users`;
            
        const method = isEditMode ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert(isEditMode ? "User updated successfully!" : "User created successfully!");
                setShowModal(false);
                fetchUserData(); // Refresh the list view layout
            } else {
                const errData = await response.json();
                alert(`Operation failed: ${errData.error || 'Server error'}`);
            }
        } catch (error) {
            console.error("Transmission error:", error);
            alert("Could not communicate with the endpoint handler.");
        }
    };

    const handleDelete = async (idToRemove) => {
        if (!window.confirm("Are you sure you want to permanently delete this user account?")) return;

        try {
            const response = await fetch(`${BACKEND_URL}/api/users/${idToRemove}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert("User deleted successfully!");
                fetchUserData(); 
            } else {
                const errData = await response.json();
                alert(`Delete failed: ${errData.error || 'Unknown endpoint error'}`);
            }
        } catch (error) {
            console.error("User deletion error:", error);
            alert("Could not reach backend user removal engine.");
        }
    };

    if (loading) return <p style={{ textAlign: 'center', padding: '50px' }}>Loading user directory configurations...</p>;

    return (
        <div className="users-page">
            <h1>Users</h1>
            <p>Manage all registered users here.</p>

            <div className="users-stats">
                <h3>Total Users: {stats.total}</h3>
                <h3>Active: {stats.active}</h3>
                <h3>Inactive: {stats.inactive}</h3>
            </div>

            <div className="users-list">
                <h2>Registered Users</h2>
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                                    No registered users found inside database storage.
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.role}</td>
                                    <td>
                                        <span className={`status ${user.status ? user.status.toLowerCase() : 'active'}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td>
                                        {/* Wire the edit button wrapper target */}
                                        <button className="edit-btn" style={{ marginRight: '5px' }} onClick={() => handleOpenEditModal(user)}>Edit</button>
                                        <button className="del-btn" onClick={() => handleDelete(user.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="users-actions">
                <button className="add-user-btn" onClick={handleOpenAddModal}>Add User</button>
            </div>

            {showModal && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h2>{isEditMode ? 'Edit User Profile' : 'Create New User Account'}</h2>
                        <form onSubmit={handleFormSubmit}>
                            <div style={inputGroupStyle}>
                                <label>Full Name:</label>
                                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={inputStyle}/>
                            </div>
                            <div style={inputGroupStyle}>
                                <label>Email Address:</label>
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required style={inputStyle}/>
                            </div>
                            <div style={inputGroupStyle}>
                                <label>{isEditMode ? 'New Password (Leave blank to keep current):' : 'Account Password:'}</label>
                                <input type="password" name="password" value={formData.password} onChange={handleInputChange} required={!isEditMode} style={inputStyle}/>
                            </div>
                            <div style={inputGroupStyle}>
                                <label>System Role:</label>
                                <select name="role" value={formData.role} onChange={handleInputChange} style={inputStyle}>
                                    <option value="Student">Student</option>
                                    <option value="Teacher">Teacher</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                            <div style={inputGroupStyle}>
                                <label>Operational Status:</label>
                                <select name="status" value={formData.status} onChange={handleInputChange} style={inputStyle}>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={cancelBtnStyle}>Cancel</button>
                                <button type="submit" style={saveBtnStyle}>Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContentStyle = { backgroundColor: '#fff', padding: '30px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' };
const inputGroupStyle = { display: 'flex', flexDirection: 'column', marginBottom: '15px' };
const inputStyle = { padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' };
const cancelBtnStyle = { padding: '8px 16px', marginRight: '10px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' };
const saveBtnStyle = { padding: '8px 16px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' };


export default Users;