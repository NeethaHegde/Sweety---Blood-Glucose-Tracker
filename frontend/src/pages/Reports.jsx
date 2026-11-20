
import { useState, useEffect } from "react";
import API from "../services/api";
import Navbar from "../components/NavBar";
import "../App.css";
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart,
    Bar} from "recharts";

function getTodayDate() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function Reports() {
    const [selectedDate, setSelectedDate] = useState(getTodayDate());

    const [dailyReport, setDailyReport] = useState(null);
    const [reportLoading, setReportLoading] = useState(false);

    const [monthlyReport, setMonthlyReport] = useState(null);
    const [monthlyReportLoading, setMonthlyReportLoading] = useState(false);

    const [previousMonthReport, setPreviousMonthReport] = useState(null);
    const [previousMonthLoading, setPreviousMonthLoading] = useState(false);

    const [selectedReport, setSelectedReport] = useState("daily");
    const [error, setError] = useState("");

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
                err.response?.data?.message ||
                "Unable to fetch daily report."
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

    // Fetch daily report whenever selected date changes
    useEffect(() => {
        fetchDailyReport();
    }, [selectedDate]);

    // Fetch month-to-date report when page loads
    useEffect(() => {
        fetchMonthlyReport();
    }, []);

    // Fetch previous month report when page loads
    useEffect(() => {
        fetchPreviousMonthReport();
    }, []);

    // Prepare data for the glucose trend chart


  
const chartReadings =
    selectedReport === "previous"
        ? previousMonthReport?.readings || []
        : monthlyReport?.readings || [];

const trendData = chartReadings
    .map((reading) => ({
        date: new Date(reading.reading_date).toLocaleDateString(
            "en-IN",
            { timeZone: "Asia/Kolkata" }
        ),
        glucose: Number(reading.glucose_value),
        timeSlot: reading.time_slot
    }))
    .sort(
        (a, b) =>
            new Date(a.date.split("/").reverse().join("-")) -
            new Date(b.date.split("/").reverse().join("-"))
    );

const timeSlotData = [
    "Morning",
    "After breakfast",
    "After lunch",
    "After dinner"
].map((slot) => {
    const readings = chartReadings.filter(
        (reading) => reading.time_slot === slot
    );

    const average = readings.length > 0
        ? readings.reduce(
            (total, reading) => total + Number(reading.glucose_value),
            0
        ) / readings.length
        : 0;

    return {
        timeSlot: slot,
        average: Number(average.toFixed(1)),
        count: readings.length
    };
});

    return (
        <div className="dashboard-container">
            <Navbar />

            <main className="dashboard-content">

                {/* Page Heading */}
                <div className="dashboard-welcome">
                    <h1>Glucose Reports</h1>
                    <p>
                        View and understand your glucose readings over time.
                    </p>
                </div>

                {/* Report Selector */}
                <div className="report-selector">
                    <label htmlFor="reportType">
                        Choose a report
                    </label>

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

                {error && (
                    <p className="error-message">{error}</p>
                )}

                {/* Daily Report */}
                {selectedReport === "daily" && (
                    <section className="report-section">
                        <div className="section-heading">
                            <h2>Daily Glucose Report</h2>
                            <p>
                                View your glucose summary for a selected date.
                            </p>
                        </div>

                        <div className="report-date-filter">
                            <label htmlFor="report-date">
                                Select Date
                            </label>

                            <input
                                type="date"
                                id="report-date"
                                value={selectedDate}
                                max={getTodayDate()}
                                onChange={(e) =>
                                    setSelectedDate(e.target.value)
                                }
                            />
                        </div>

                        {reportLoading ? (
                            <p>Loading report...</p>
                        ) : dailyReport ? (
                            <>
                                <div className="report-summary">
                                    <div className="report-card">
                                        <h3>Highest</h3>
                                        <p>
                                            {dailyReport.summary.highest ?? "--"}
                                            {" "}
                                            <span>mg/dL</span>
                                        </p>
                                    </div>

                                    <div className="report-card">
                                        <h3>Lowest</h3>
                                        <p>
                                            {dailyReport.summary.lowest ?? "--"}
                                            {" "}
                                            <span>mg/dL</span>
                                        </p>
                                    </div>

                                    <div className="report-card">
                                        <h3>Average</h3>
                                        <p>
                                            {dailyReport.summary.average ?? "--"}
                                            {" "}
                                            <span>mg/dL</span>
                                        </p>
                                    </div>

                                    <div className="report-card">
                                        <h3>Total Readings</h3>
                                        <p>
                                            {dailyReport.summary.total_readings ?? 0}
                                        </p>
                                    </div>
                                </div>

                                <div className="daily-report-readings">
                                    <h3>Readings for Selected Date</h3>

                                    {dailyReport.readings.length === 0 ? (
                                        <p>
                                            No readings recorded for this date.
                                        </p>
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
                                                    {dailyReport.readings.map(
                                                        (reading) => (
                                                            <tr key={reading.id}>
                                                                <td>
                                                                    {reading.time_slot}
                                                                </td>
                                                                <td>
                                                                    <strong>
                                                                        {reading.glucose_value} mg/dL
                                                                    </strong>
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}
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
                            <p>
                                Your glucose summary from the beginning of this month.
                            </p>
                        </div>

                        {monthlyReportLoading ? (
                            <p>Loading monthly report...</p>
                        ) : monthlyReport ? (
                            <div className="report-summary">
                                <div className="report-card">
                                    <h3>Highest</h3>
                                    <p>
                                        {monthlyReport.summary.highest ?? "--"}
                                        {" "}
                                        <span>mg/dL</span>
                                    </p>
                                </div>

                                <div className="report-card">
                                    <h3>Lowest</h3>
                                    <p>
                                        {monthlyReport.summary.lowest ?? "--"}
                                        {" "}
                                        <span>mg/dL</span>
                                    </p>
                                </div>

                                <div className="report-card">
                                    <h3>Average</h3>
                                    <p>
                                        {monthlyReport.summary.average ?? "--"}
                                        {" "}
                                        <span>mg/dL</span>
                                    </p>
                                </div>

                                <div className="report-card">
                                    <h3>Total Readings</h3>
                                    <p>
                                        {monthlyReport.summary.total_readings ?? 0}
                                    </p>
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
                            <p>
                                Your glucose summary for the previous calendar month.
                            </p>
                        </div>

                        {previousMonthLoading ? (
                            <p>Loading previous month's report...</p>
                        ) : previousMonthReport ? (
                            <div className="report-summary">
                                <div className="report-card">
                                    <h3>Highest</h3>
                                    <p>
                                        {previousMonthReport.summary.highest ?? "--"}
                                        {" "}
                                        <span>mg/dL</span>
                                    </p>
                                </div>

                                <div className="report-card">
                                    <h3>Lowest</h3>
                                    <p>
                                        {previousMonthReport.summary.lowest ?? "--"}
                                        {" "}
                                        <span>mg/dL</span>
                                    </p>
                                </div>

                                <div className="report-card">
                                    <h3>Average</h3>
                                    <p>
                                        {previousMonthReport.summary.average ?? "--"}
                                        {" "}
                                        <span>mg/dL</span>
                                    </p>
                                </div>

                                <div className="report-card">
                                    <h3>Total Readings</h3>
                                    <p>
                                        {previousMonthReport.summary.total_readings ?? 0}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p>No previous month report available.</p>
                        )}
                    </section>
                )}

                                {/* Glucose Trend Chart */}
                                {(selectedReport === "monthly" || selectedReport === "previous") && (
                <section className="report-section">
                    <div className="section-heading">
                        <h2>Glucose Trend</h2>
                        <p>
                            Track how your glucose readings change throughout this month.
                        </p>
                    </div>

                    {monthlyReportLoading ? (
                        <p>Loading chart...</p>
                    ) : trendData.length === 0 ? (
                        <p>No readings available to display.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={350}>
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" />

                                <XAxis dataKey="date" />

                                <YAxis
                                    domain={["auto", "auto"]}
                                    label={{
                                        value: "Glucose (mg/dL)",
                                        angle: -90,
                                        position: "insideLeft"
                                    }}
                                />

                                <Tooltip />

                                <Line
                                    type="monotone"
                                    dataKey="glucose"
                                    stroke="#0F62FE"
                                    strokeWidth={3}
                                    dot={{ r: 5 }}
                                    activeDot={{ r: 7 }}
                                    name="Glucose"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </section>
                                )}
                                {/* Time Slot Comparison Chart */}
{selectedReport === "monthly" && (
    <section className="report-section">
        <div className="section-heading">
            <h2>Time Slot Comparison</h2>
            <p>
                Compare your average glucose readings across different time slots this month.
            </p>
        </div>

        {monthlyReportLoading ? (
            <p>Loading chart...</p>
        ) : timeSlotData.every((item) => item.count === 0) ? (
            <p>No readings available to display.</p>
        ) : (
            <ResponsiveContainer width="100%" height={350}>
                <BarChart data={timeSlotData}>
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="timeSlot" />

                    <YAxis
                        label={{
                            value: "Average Glucose (mg/dL)",
                            angle: -90,
                            position: "insideLeft"
                        }}
                    />

                    <Tooltip />

                    <Bar
                        dataKey="average"
                        fill="#0F62FE"
                        name="Average Glucose"
                        radius={[6, 6, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        )}
    </section>
)}
            </main>
        </div>
    );
}

export default Reports;
