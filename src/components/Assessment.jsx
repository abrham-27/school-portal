import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Assessment.css";

const Assessment = ({ studentId }) => {
  const [data, setData] = useState([]);
  const [selectedType, setSelectedType] = useState("assignment");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `http://localhost/react_app_backend/get_assessments.php?student_id=${studentId}`
        );
        setData(res.data.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [studentId]);

  const filtered = data.filter((item) => item.type === selectedType);

  const totalScore = data.reduce((sum, item) => sum + item.score, 0);
  const totalMax = data.reduce((sum, item) => sum + item.total, 0);
  const average = totalMax > 0 ? ((totalScore / totalMax) * 100).toFixed(2) : 0;
  const passFail = average >= 50 ? "Pass" : "Fail";

  if (loading) return <div className="assessment-container">Loading...</div>;

  return (
    <div className="assessment-container">
      <h2>Assessment Results</h2>

      <div className="assessment-tabs">
        {["assignment", "quiz", "mid", "final"].map((type) => (
          <button
            key={type}
            className={`tab-button ${selectedType === type ? "active" : ""}`}
            onClick={() => setSelectedType(type)}
          >
            {type.toUpperCase()}
          </button>
        ))}
      </div>

      <table className="assessment-table">
        <thead>
          <tr>
            <th>Subject</th>
            <th>Score</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((item, index) => (
            <tr key={index}>
              <td>{item.subject}</td>
              <td>{item.score}</td>
              <td>{item.total}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="assessment-summary">
        <p><strong>Total Score:</strong> {totalScore}/{totalMax}</p>
        <p><strong>Average:</strong> {average}%</p>
        <p className={`status ${passFail.toLowerCase()}`}>
          <strong>Status:</strong> {passFail}
        </p>
      </div>
    </div>
  );
};

export default Assessment;
