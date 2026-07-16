import React, { useState, useEffect } from 'react';

function settings() {
    const [profileData, setProfileData] = useState({ name: '', email: '', role: '', avatar: '' });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(true);
   // const file = e.target.files[0]; 

    const BACKEND_URL = 'http://localhost:8080/api/settings';

    const fetchSettingsData = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/me`);
            if (!response.ok) throw new Error("Could not pull settings data");
            const data = await response.json();
            
            setProfileData({
                name: data.name || '',
                email: data.email || '',
                role: data.role || '',
                avatar: data.avatar || ''
            });
        } catch (error) {
            console.error("Settings loading error:", error);
            alert("Failed to load your personal settings profiles.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettingsData();
    }, []);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarFileChange = (e) => {
        const file = e.target.files[0]; // Fixed file indexing from file to file[0]
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert("File size exceeds the 2MB limit threshold.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileData(prev => ({ ...prev, avatar: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${BACKEND_URL}/update-profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData)
            });

            if (response.ok) {
                alert("Profile changes saved successfully!");
                fetchSettingsData(); 
            } else {
                const err = await response.json();
                alert(`Update failed: ${err.error || 'Server error'}`);
            }
        } catch (error) {
            alert("Could not reach backend configurations.");
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("Validation failed: New passwords do not match!");
            return;
        }

        try {
            const response = await fetch(`${BACKEND_URL}/update-password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            if (response.ok) {
                alert("Password updated successfully!");
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' }); 
            } else {
                const err = await response.json();
                alert(`Failed: ${err.error || 'Server error'}`);
            }
        } catch (error) {
            alert("Transmission pipeline error during password changes.");
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm("CRITICAL WARNING: Are you sure you want to permanently erase your profile?")) return;
        try {
            const response = await fetch(`${BACKEND_URL}/purge-account`, { method: 'DELETE' });
            if (response.ok) {
                alert("Your account profile was permanently purged.");
                window.location.href = '/login'; 
            } else {
                const err = await response.json();
                alert(`Purge failed: ${err.error}`);
            }
        } catch (error) {
            alert("Unable to process deletion commands.");
        }
    };

    if (loading) return <p style={{ textAlign: 'center', padding: '50px' }}>Loading profile configurations...</p>;

    const firstInitial = profileData.name ? profileData.name.charAt(0).toUpperCase() : 'N';

    return (
        <div className="settings-page" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h1>Settings</h1>
            <p>Manage your account and application preferences.</p>

            {/* Profile Block */}
            <div className="settings-section" style={{ marginBottom: '40px' }}>
                <h2>Profile Settings</h2>
                
                <div style={avatarContainerStyle}>
                    {profileData.avatar ? (
                        <img src={profileData.avatar} alt="User Avatar" style={avatarImageStyle} />
                    ) : (
                        <div style={avatarPlaceholderStyle}>{firstInitial}</div>
                    )}
                    <div style={{ marginLeft: '20px' }}>
                        {/* Fixed reference mapping token to handleButton style wrapper cleanly */}
                        <label htmlFor="avatar-file-input" style={uploadButtonStyle}>Upload New Photo</label>
                        <input id="avatar-file-input" type="file" accept="image/*" onChange={handleAvatarFileChange} style={{ display: 'none' }} />
                        <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#6c757d' }}>JPG or PNG. Max 2MB.</p>
                    </div>
                </div>

                <form className="settings-form" onSubmit={handleSaveProfile}>
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold' }}>Full Name</label>
                        <input type="text" name="name" value={profileData.name} onChange={handleProfileChange} required style={inputStyle} />
                    </div>
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold' }}>Email</label>
                        <input type="email" name="email" value={profileData.email} onChange={handleProfileChange} required style={inputStyle} />
                    </div>
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold' }}>Role</label>
                        <input type="text" name="role" value={profileData.role} disabled style={inputStyle} />
                    </div>
                    <button type="submit" className="save-btn" style={primaryButtonStyle}>Save Changes</button>
                </form>
            </div>

            {/* Password Block */}
            <div className="settings-section" style={{ marginBottom: '40px' }}>
                <h2>Password</h2>
                <form className="settings-form" onSubmit={handleUpdatePassword}>
                     <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold' }}>Current Password</label>
                        <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} required style={inputStyle} />
                    </div>
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold' }}>New Password</label>
                        <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} required style={inputStyle} />
                    </div>
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold' }}>Confirm New Password</label>
                        <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} required style={inputStyle} />
                    </div>
                    <button type="submit" style={primaryButtonStyle}>Update Password</button>
                   
                </form>

            </div>
        </div>
    );
}

// Styling Constant Mappings
const avatarContainerStyle = { display: 'flex', alignItems: 'center', marginBottom: '25px', paddingBottom: '20px', borderBottom: '1px solid #eee' };
const avatarImageStyle = { width: '85px', height: '85px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #007bfe' };
const avatarPlaceholderStyle = { width: '85px', height: '85px', borderRadius: '50%', backgroundColor: '#007bfe', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '32px', fontWeight: 'bold' };

// Fixed style definition name mapping token
const uploadButtonStyle = { display: 'inline-block', padding: '6px 14px', backgroundColor: '#f8f9fa', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' };
const inputStyle = { width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' };
const primaryButtonStyle = { padding: '10px 20px', backgroundColor: '#007bfe', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };
const dangerButtonStyle = { padding: '10px 20px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };
 export default settings;