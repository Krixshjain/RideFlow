import { useState, useEffect } from 'react';

function App() {
  const [rides, setRides] = useState([]);
  const [topDrivers, setTopDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ riders: [], locations: [] });
  const [newRide, setNewRide] = useState({ riderId: '', pickupId: '', destId: '' });
  const [submitting, setSubmitting] = useState(false);
  
  const [lastQuery, setLastQuery] = useState('');

  const fetchData = async () => {
    try {
      const [ridesRes, driversRes, formRes] = await Promise.all([
        fetch('http://localhost:3000/api/rides').then(res => res.json()),
        fetch('http://localhost:3000/api/analytics/top-drivers').then(res => res.json()),
        fetch('http://localhost:3000/api/form-data').then(res => res.json())
      ]);
      
      if (ridesRes.success) setRides(ridesRes.data);
      if (driversRes.success) setTopDrivers(driversRes.data);
      if (formRes.success) setFormData(formRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBookRide = async (e) => {
    e.preventDefault();
    if (!newRide.riderId || !newRide.pickupId || !newRide.destId) return;
    
    setSubmitting(true);
    try {
      const distance = (2 + Math.random() * 8).toFixed(1);
      const fare = (parseFloat(distance) * 2.5 + 5).toFixed(2);

      const res = await fetch('http://localhost:3000/api/rides/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newRide,
          distance,
          fare
        })
      });

      const json = await res.json();
      if (json.success) {
        setLastQuery(json.query || '');
        setIsModalOpen(false);
        setNewRide({ riderId: '', pickupId: '', destId: '' });
        fetchData(); 
      }
    } catch (error) {
      console.error("Failed to book ride", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClearRides = async () => {
    if (!window.confirm("Are you sure you want to delete all ride history?")) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/rides/all', { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setLastQuery(json.query || '');
        fetchData(); 
      }
    } catch (error) {
      console.error("Failed to clear rides", error);
      setLoading(false);
    }
  };

  const handleDeleteRide = async (id) => {
    if (!window.confirm("Delete this ride?")) return;
    try {
      const res = await fetch(`http://localhost:3000/api/rides/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setLastQuery(json.query || '');
        fetchData(); 
      }
    } catch (error) {
      console.error("Failed to delete ride", error);
    }
  };

  if (loading) {
    return <div>Loading Database Info...</div>;
  }

  const totalRevenue = topDrivers.reduce((acc, curr) => acc + parseFloat(curr.total_revenue || 0), 0);

  return (
    <div className="app-container">
      <div className="header">
        <h1>RideFlow DBMS Dashboard</h1>
        <div className="actions">
          <button className="btn-danger" onClick={handleClearRides}>Clear All Rides</button>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>Book a New Ride</button>
        </div>
      </div>

      {lastQuery && (
        <div className="card" style={{marginBottom: '30px', borderColor: 'var(--primary-color)', borderLeftWidth: '4px'}}>
          <h3 style={{color: 'var(--primary-color)', fontSize: '0.9em', textTransform: 'uppercase', marginBottom: '5px'}}>Last Executed Query</h3>
          <pre style={{background: '#0a0a0a', padding: '15px', borderRadius: '4px', overflowX: 'auto', color: '#a5d6ff', fontFamily: 'monospace'}}>{lastQuery}</pre>
        </div>
      )}

      <div className="grid">
        <div className="card">
          <h3>Total Revenue</h3>
          <p>${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="card">
          <h3>Total Rides</h3>
          <p>{rides.length}</p>
        </div>
        <div className="card">
          <h3>Active Drivers</h3>
          <p>{topDrivers.length}</p>
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <h2>Top Drivers</h2>
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Driver Name</th>
                <th>Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topDrivers.map(driver => (
                <tr key={driver.driver_id}>
                  <td>{driver.revenue_rank}</td>
                  <td>{driver.full_name}</td>
                  <td>${parseFloat(driver.total_revenue).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2>Recent Rides</h2>
        <table>
          <thead>
            <tr>
              <th>Ride ID</th>
              <th>Rider</th>
              <th>Driver</th>
              <th>Distance</th>
              <th>Fare</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rides.map(ride => (
              <tr key={ride.id}>
                <td style={{fontFamily: 'monospace', fontSize: '0.9em'}}>{ride.id.substring(0, 8)}</td>
                <td>{ride.rider?.full_name || 'N/A'}</td>
                <td>{ride.driver?.user?.full_name || 'Unassigned'}</td>
                <td>{ride.estimated_distance.toFixed(1)} miles</td>
                <td>${ride.final_fare?.toFixed(2) || ride.estimated_fare.toFixed(2)}</td>
                <td>{ride.status}</td>
                <td>
                  <button className="btn-danger" style={{padding: '5px 10px', fontSize: '0.8em'}} onClick={() => handleDeleteRide(ride.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="header" style={{marginBottom: '20px', paddingBottom: '10px'}}>
              <h2>Book Ride</h2>
              <button onClick={() => setIsModalOpen(false)}>Close</button>
            </div>
            
            <form onSubmit={handleBookRide}>
              <div className="form-group">
                <label>Select Rider:</label>
                <select 
                  className="form-select"
                  value={newRide.riderId}
                  onChange={(e) => setNewRide({...newRide, riderId: e.target.value})}
                  required
                >
                  <option value="">-- Choose Rider --</option>
                  {formData.riders.map(r => (
                    <option key={r.id} value={r.id}>{r.full_name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Pickup Location:</label>
                <select 
                  className="form-select"
                  value={newRide.pickupId}
                  onChange={(e) => setNewRide({...newRide, pickupId: e.target.value})}
                  required
                >
                  <option value="">-- Choose Location --</option>
                  {formData.locations.map(l => (
                    <option key={l.id} value={l.id}>{l.address}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Destination Location:</label>
                <select 
                  className="form-select"
                  value={newRide.destId}
                  onChange={(e) => setNewRide({...newRide, destId: e.target.value})}
                  required
                >
                  <option value="">-- Choose Location --</option>
                  {formData.locations.map(l => (
                    <option key={l.id} value={l.id}>{l.address}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn-primary" disabled={submitting} style={{width: '100%', marginTop: '10px'}}>
                {submitting ? 'Booking...' : 'Submit Booking'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
