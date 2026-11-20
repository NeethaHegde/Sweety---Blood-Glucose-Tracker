
import { useState, useEffect, useRef } from "react";
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
    const formRef = useRef(null);

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const [readings, setReadings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [selectedDate, setSelectedDate] = useState(getTodayDate());
    const [dailyReport, setDailyReport] = useState(null);
    const [reportLoading, setReportLoading] = useState(false);
    const [monthlyReport, setMonthlyReport] = useState(null);
    const [monthlyReportLoading, setMonthlyReportLoading] = useState(false);
    const [previousMonthReport, setPreviousMonthReport] = useState(null);
    const [previousMonthLoading, setPreviousMonthLoading] = useState(false);
    const [deleteReadingId, setDeleteReadingId] = useState(null);
    const [selectedReport, setSelectedReport] = useState("daily");

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
    const fetchDailyReport = async () => {
        try {
            setReportLoading(true);
            setError("");

            const response = await API.get(
                `/readings/daily?date=${selectedDate}`
            );

            setDailyReport(response.data);
        } catch (err) {
            setError(
                err.response?.data?.message || "Unable to fetch daily report."
            );
        } finally {
            setReportLoading(false);
        }
    };

    const fetchMonthlyReport = async () => {
        try {
            setMonthlyReportLoading(true);
            setError("");

            const response = await API.get("/readings/month-to-date");

            setMonthlyReport(response.data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to fetch monthly report."
            );
        } finally {
            setMonthlyReportLoading(false);
        }
    };

    const fetchPreviousMonthReport = async () => {
        try {
            setPreviousMonthLoading(true);
            setError("");

            const response = await API.get("/readings/previous-month");

            setPreviousMonthReport(response.data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to fetch previous month's report."
            );
        } finally {
            setPreviousMonthLoading(false);
        }
    };


    // Fetch all glucose readings when the dashboard loads
    useEffect(() => {
        fetchReadings();
    }, []);

    // Fetch daily report whenever the selected date changes
    useEffect(() => {
        fetchDailyReport();
    }, [selectedDate]);

    useEffect(() => {
        fetchMonthlyReport();
    }, []);

    useEffect(() => {
        fetchPreviousMonthReport();
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
            await fetchDailyReport();
            await fetchMonthlyReport();
            await fetchPreviousMonthReport();
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

        formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
    });
    };
    

   // Open the custom confirmation modal
const handleDelete = (id) => {
    setDeleteReadingId(id);
};

// Delete only after the user confirms
const confirmDelete = async () => {
    try {
        setError("");
        setSuccess("");

        await API.delete(`/readings/${deleteReadingId}`);

        setSuccess("Reading deleted successfully!");

        if (editingId === deleteReadingId) {
            setEditingId(null);
            setFormData({
                reading_date: getTodayDate(),
                time_slot: "Morning",
                glucose_value: "",
            });
        }

        setDeleteReadingId(null);

       await fetchReadings();
        await fetchDailyReport();
        await fetchMonthlyReport();
        await fetchPreviousMonthReport();

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

                <section className="add-reading-section" ref={formRef}>
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

                {/* Daily Report */}
                <div className="report-selector">
    <label htmlFor="reportType">Choose a report</label>

    <select
        id="reportType"
        value={selectedReport}
        onChange={(e) => setSelectedReport(e.target.value)}
    >
        <option value="daily">Daily Report</option>
        <option value="monthly">Month-to-Date Report</option>
        <option value="previous">Previous Month Report</option>
    </select>
</div>
{selectedReport === "daily" && (
                <section className="report-section">
                    <div className="section-heading">
                        <h2>Daily Glucose Report</h2>
                        <p>View your glucose summary for a selected date.</p>
                    </div>

                    <div className="report-date-filter">
                        <label htmlFor="report-date">Select Date</label>
                        <input
                            type="date"
                            id="report-date"
                            value={selectedDate}
                            max={getTodayDate()}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>
                

                    
{reportLoading ? (
    <p>Loading report...</p>
) : dailyReport ? (
    <>
        <div className="report-summary">
            <div className="report-card">
                <h3>Highest</h3>
                <p>{dailyReport.summary.highest ?? "--"} <span>mg/dL</span></p>
            </div>

            <div className="report-card">
                <h3>Lowest</h3>
                <p>{dailyReport.summary.lowest ?? "--"} <span>mg/dL</span></p>
            </div>

            <div className="report-card">
                <h3>Average</h3>
                <p>{dailyReport.summary.average ?? "--"} <span>mg/dL</span></p>
            </div>

            <div className="report-card">
                <h3>Total Readings</h3>
                <p>{dailyReport.summary.total_readings ?? 0}</p>
            </div>
        </div>

        <div className="daily-report-readings">
            <h3>Readings for Selected Date</h3>

            {dailyReport.readings.length === 0 ? (
                <p>No readings recorded for this date.</p>
            ) : (
                <div className="readings-table-wrapper">
                    <table className="readings-table">
                        <thead>
                            <tr>
                                <th>Time Slot</th>
                                <th>Glucose Value</th>
                            </tr>
                        </thead>

                        <tbody>
                            {dailyReport.readings.map((reading) => (
                                <tr key={reading.id}>
                                    <td>{reading.time_slot}</td>
                                    <td>
                                        <strong>{reading.glucose_value} mg/dL</strong>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    </>
) : (
    <p>No report available.</p>
)}

                </section>
                )}

                {/* Month-to-Date Report */}
                {selectedReport === "monthly" && (
                <section className="report-section">
                    <div className="section-heading">
                        <h2>Month-to-Date Report</h2>
                        <p>Your glucose summary from the beginning of this month.</p>
                    </div>

                    {monthlyReportLoading ? (
                        <p>Loading monthly report...</p>
                    ) : monthlyReport ? (
                        <div className="report-summary">
                            <div className="report-card">
                                <h3>Highest</h3>
                                <p>{monthlyReport.summary.highest ?? "--"} <span>mg/dL</span></p>
                            </div>

                            <div className="report-card">
                                <h3>Lowest</h3>
                                <p>{monthlyReport.summary.lowest ?? "--"} <span>mg/dL</span></p>
                            </div>

                            <div className="report-card">
                                <h3>Average</h3>
                                <p>{monthlyReport.summary.average ?? "--"} <span>mg/dL</span></p>
                            </div>

                            <div className="report-card">
                                <h3>Total Readings</h3>
                                <p>{monthlyReport.summary.total_readings ?? 0}</p>
                            </div>
                        </div>
                    ) : (
                        <p>No monthly report available.</p>
                    )}
                </section>
                )}

                {/* Previous Month Report */}
                {selectedReport === "previous" && (
                <section className="report-section">
                    <div className="section-heading">
                        <h2>Previous Month Report</h2>
                        <p>Your glucose summary for the previous calendar month.</p>
                    </div>

                    {previousMonthLoading ? (
                        <p>Loading previous month's report...</p>
                    ) : previousMonthReport ? (
                        <div className="report-summary">
                            <div className="report-card">
                                <h3>Highest</h3>
                                <p>{previousMonthReport.summary.highest ?? "--"} <span>mg/dL</span></p>
                            </div>

                            <div className="report-card">
                                <h3>Lowest</h3>
                                <p>{previousMonthReport.summary.lowest ?? "--"} <span>mg/dL</span></p>
                            </div>

                            <div className="report-card">
                                <h3>Average</h3>
                                <p>{previousMonthReport.summary.average ?? "--"} <span>mg/dL</span></p>
                            </div>

                            <div className="report-card">
                                <h3>Total Readings</h3>
                                <p>{previousMonthReport.summary.total_readings ?? 0}</p>
                            </div>
                        </div>
                    ) : (
                        <p>No previous month report available.</p>
                    )}
                </section>
                )}

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

            {deleteReadingId !== null && (
                <div className="modal-overlay">
                    <div className="delete-modal">
                        <div className="delete-modal-icon">
                            <HeartPulse size={28} />
                        </div>

                        <h2>Delete this reading?</h2>

                        <p>
                            Are you sure you want to delete this glucose
                            reading? This action cannot be undone.
                        </p>

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="modal-cancel-button"
                                onClick={() => setDeleteReadingId(null)}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="modal-delete-button"
                                onClick={confirmDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default Dashboard;
