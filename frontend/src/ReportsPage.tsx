import { useEffect, useState } from "react";
import { list } from "./api";
import type { Row } from "./api";
import Table from "./Table";

const reports = [
  { path: "/reports/users-most-courses", label: "SQL 01 - Users with most courses" },
  { path: "/reports/course-most-contents", label: "SQL 02 - Course with most contents" },
  { path: "/reports/courses-totals", label: "SQL 03 - Courses with total modules and contents" },
  { path: "/reports/contents-with-course", label: "SQL 04 - Contents with course name" },
  { path: "/reports/content-2-viewers", label: "SQL 05 - Users who watched content ID=2" },
];

export default function ReportsPage() {
  const [current, setCurrent] = useState(reports[0]!);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    list(current.path)
      .then(setRows)
      .catch((e) => { setRows([]); setError(e.message); })
      .finally(() => setLoading(false));
  }, [current]);

  return (
    <section>
      <h2>Reports</h2>
      <div className="report-buttons">
        {reports.map((r) => (
          <button
            key={r.path}
            className={r.path === current.path ? "" : "secondary"}
            onClick={() => setCurrent(r)}
          >
            {r.label}
          </button>
        ))}
      </div>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && <Table rows={rows} />}
    </section>
  );
}
