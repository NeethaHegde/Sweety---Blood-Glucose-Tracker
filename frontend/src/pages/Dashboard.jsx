
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HeartPulse, LogOut } from "lucide-react";
import API from "../services/api";
import "../App.css";

function getTodayDate() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function Dashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    reading_date: getTodayDate(),
    time_slot: "Morning",
    glucose_value: "",
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const fetchReadings = async () => {
    try {
      const response = await API.get("/readings");
      setReadings(response.data.readings || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to fetch glucose readings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadings();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


const handleSubmit = async (e) => {
  e.preventDefault();

  setError("");
  setSuccess("");
  setSubmitting(true);

  try {
    const payload = {
      ...formData,
      glucose_value: Number(formData.glucose_value),
    };

    let response;

    if (editingId) {
      response = await API.put(`/readings/${editingId}`, payload);
      setSuccess("Reading updated successfully!");
    } else {
      response = await API.post("/readings", payload);
      setSuccess("Reading added successfully!");
    }

    setFormData({
      reading_date: getTodayDate(),
      time_slot: "Morning",
      glucose_value: "",
    });

    setEditingId(null);

    await fetchReadings();
  } catch (err) {
    setError(
      err.response?.data?.message ||
      "Unable to save reading. Please try again."
    );
  } finally {
    setSubmitting(false);
  }
};

const handleEdit = (reading) => {
  setEditingId(reading.id);

  setFormData({
    reading_date: reading.reading_date.substring(0, 10),
    time_slot: reading.time_slot,
    glucose_value: reading.glucose_value,
  });

  setError("");
  setSuccess("");
};

const handleDelete = async (id) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this reading?"
  );

  if (!confirmed) {
    return;
  }

  try {
    setError("");
    setSuccess("");

    await API.delete(`/readings/${id}`);

    setSuccess("Reading deleted successfully!");

    // If the deleted reading is currently being edited,
    // reset the form.
    if (editingId === id) {
      setEditingId(null);
      setFormData({
        reading_date: getTodayDate(),
        time_slot: "Morning",
        glucose_value: "",
      });
    }

    await fetchReadings();
  } catch (err) {
    setError(
      err.response?.data?.message || "Unable to delete reading."
    );
  }
};

  return (
    <div className="dashboard-container">
      <nav className="dashboard-navbar">
        <div className="dashboard-logo">
          <HeartPulse size={26} />
          <h2>Sweety</h2>
        </div>

        <button className="logout-button" onClick={handleLogout}>
          <LogOut size={18} />
          Logout
        </button>
      </nav>

      <main className="dashboard-content">
        <div className="dashboard-welcome">
          <h1>Welcome back, {user.name || "there"}!</h1>
          <p>Here's an overview of your blood glucose readings.</p>
        </div>

        <section className="add-reading-section">
         <h2>{editingId ? "Edit Glucose Reading" : "Add a Glucose Reading"}</h2>
          <p>Record your latest blood glucose measurement.</p>

          {success && <p className="success-message">{success}</p>}
          {error && <p className="error-message">{error}</p>}

          <form className="reading-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="reading_date">Reading Date</label>
              <input
                type="date"
                id="reading_date"
                name="reading_date"
                value={formData.reading_date}
                max={getTodayDate()}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="time_slot">Time Slot</label>
              <select
                id="time_slot"
                name="time_slot"
                value={formData.time_slot}
                onChange={handleChange}
                required
              >
                <option value="Morning">Morning</option>
                <option value="After breakfast">After breakfast</option>
                <option value="After lunch">After lunch</option>
                <option value="After dinner">After dinner</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="glucose_value">
                Glucose Value (mg/dL)
              </label>
              <input
                type="number"
                id="glucose_value"
                name="glucose_value"
                placeholder="Enter value (40–600)"
                min="40"
                max="600"
                step="1"
                value={formData.glucose_value}
                onChange={handleChange}
                required
              />
            </div>
            

         
<button
  type="submit"
  className="auth-button"
  disabled={submitting}
>
  {submitting
    ? "Saving..."
    : editingId
      ? "Update Reading"
      : "Save Reading"}
</button>

{editingId && (
  <button
    type="button"
    className="cancel-edit-button"
    onClick={() => {
      setEditingId(null);
      setFormData({
        reading_date: getTodayDate(),
        time_slot: "Morning",
        glucose_value: "",
      });
      setError("");
      setSuccess("");
    }}
  >
    Cancel Edit
  </button>
)}

          </form>
        </section>

        {loading && <p>Loading your readings...</p>}

        {!loading && (
          <div className="readings-section">
            <div className="section-heading">
              <div>
                <h2>Your Glucose Readings</h2>
                <p>You have {readings.length} readings recorded.</p>
              </div>
            </div>

            {readings.length === 0 ? (
              <div className="empty-state">
                <HeartPulse size={36} />
                <h3>No readings yet</h3>
                <p>Start by adding your first glucose reading.</p>
              </div>
            ) : (
              <div className="readings-table-wrapper">
                <table className="readings-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Time Slot</th>
                      <th>Glucose Value</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {readings.map((reading) => (
                      <tr key={reading.id}>
                        <td>
                          {new Date(reading.reading_date).toLocaleDateString(
                            "en-IN",
                            { timeZone: "Asia/Kolkata" }
                          )}
                        </td>
                        <td>{reading.time_slot}</td>
                        <td>
                          <strong>{reading.glucose_value} mg/dL</strong>
                        </td>
                        <td>
  <div className="reading-actions">
    <button
      type="button"
      className="edit-button"
      onClick={() => handleEdit(reading)}
    >
      Edit
    </button>

    <button
      type="button"
      className="delete-button"
      onClick={() => handleDelete(reading.id)}
    >
      Delete
    </button>
  </div>
</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
