import React, { useState, useEffect } from 'react';

function Resource_library() {
    // 1. Core State definitions matching your styling classes
    const [resources, setResources] = useState([]);
    const [stats, setStats] = useState({ total: 0, videos: 0, documents: 0 });
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('Robotics');


    // Target backend location directly
    const BACKEND_URL = 'http://localhost:8080';

    // 2. Fetch live data metrics from the express REST architecture
    const fetchResourceData = async () => {
        try {
            const listResponse = await fetch(`${BACKEND_URL}/api/resources`);
            if (!listResponse.ok) throw new Error("Failed to pull resources");
            const listData = await listResponse.json();
            setResources(listData);

            const statsResponse = await fetch(`${BACKEND_URL}/api/resources/stats`);
            if (!statsResponse.ok) throw new Error("Failed to pull stats");
            const statsData = await statsResponse.json();
            setStats(statsData);
        } catch (error) {
            console.error("Backend fetch error:", error);
            // Fallback mock array structure to prevent component breakage if server delays
            setResources([
                { id: 1, title: 'Robotics guide.pdf', file_url: '/uploads/Robotics_guide.pdf' },
                { id: 2, title: 'software programming guide.pdf', file_url: '/uploads/software_programming_guide.pdf' }
            ]);
            setStats({ total: 2, videos: 0, documents: 2 });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResourceData();
    }, []);

    // 3. Handle Resource Deletion
    const handleDelete = async (idToRemove) => {
        // Optional confirmation dialog to protect user actions
        if (!window.confirm("Are you sure you want to delete this resource?")) return;

        try {
            const response = await fetch(`${BACKEND_URL}/api/resources/${idToRemove}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert("Resource deleted successfully!");
                
                // Optimistically update the UI list immediately using filter
                setResources(prevResources => prevResources.filter(item => item.id !== idToRemove));
                
                // Refresh data from the server to recalculate the visual counters/stats accurately
                fetchResourceData(); 
            } else {
                const errData = await response.json();
                alert(`Delete failed: ${errData.error || 'Unknown endpoint error'}`);
            }
        } catch (error) {
            console.error("Deletion communication error:", error);
            alert("Could not reach backend deletion engine. Verify server is running.");
        }
    };

    // 4. Handle File Picker Selection & Stream Metadata
   const handleFileUpload = async (event) => {
   

    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
     formData.append('category', category);
    formData.append('file', file);

    try {
        const response = await fetch(`${BACKEND_URL}/api/resources/upload`, {
            method: 'POST',
            body: formData, // no Content-Type header — browser sets the multipart boundary
        });

        if (response.ok) {
            alert("File uploaded successfully!");
            event.target.value = '';
            fetchResourceData();
        } else {
            const errData = await response.json();
            alert(`Upload failed: ${errData.error || 'Unknown endpoint error'}`);
        }
    } catch (error) {
        console.error("Upload transmission error:", error);
        alert("Could not reach backend upload engine. Verify server is running.");
    }
   

};

    if (loading) return <p style={{ textAlign: 'center', padding: '50px' }}>Loading resource library configurations...</p>;

    return (
        <div className="resource-page">
            <h1> Resource library</h1>
            <p> Manage all uploaded learning resources here</p>
            
            {/* Dynamic Visual Aggregate Counters */}
            <div className="resource-stats">
                <h3> Total Resources: {stats.total}</h3>
                <h3>videos: {stats.videos}</h3>
                <h3>Documents: {stats.documents}</h3>
            </div>

            {/* Live Data Render Block */}
            <div className="resource-list">
                <h2> Available Resources</h2>
                <ul>
                    {resources.length === 0 ? (
                        <li>No resources available.</li>
                    ) : (
                        resources.map((resource) => (
                            <li key={resource.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                                <a 
                                    href={resource.file_url.startsWith('http') ? resource.file_url : `${BACKEND_URL}${resource.file_url}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    style={{ flexGrow: 1 }}
                                >
                                    {resource.title}
                                </a>
                                {/* Delete Button trigger wrapped in an arrow function */}
                                <button 
                                    onClick={() => handleDelete(resource.id)}
                                    className="delete-btn"
                                    style={{ backgroundColor: '#ff4d4f', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}
                                >
                                    Delete
                                </button>
                            </li>
                        ))
                    )}
                </ul>
            </div>
           
            {/* Operational Upload Section */}
            <div className="upload-section">
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
  <option value="Robotics">Robotics</option>
  <option value="Virtual Reality">Virtual Reality</option>
  <option value="3D Gaming and animation">3D Gaming and animation</option>
  <option value="Artificial Intelligence">Artificial Intelligence</option>
  <option value="Software development">Software development</option>
</select>
                <input 
                    type="file" 
                    id="file-picker" 
                    onChange={handleFileUpload} 
                    style={{ display: 'none' }} 
                />
                <button onClick={() => document.getElementById('file-picker').click()}>
                    Upload file
                </button>
            </div>
        </div>
    );
}

export default Resource_library;
