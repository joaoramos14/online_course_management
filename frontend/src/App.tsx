import { useState } from "react";
import CrudPage from "./CrudPage";
import type { Field } from "./CrudPage";
import ReportsPage from "./ReportsPage";

const pages: Record<string, { path: string; fields: Field[] }> = {
  Users: {
    path: "/users",
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "email", label: "Email", required: true },
      { name: "status", label: "Status", type: "select", options: ["active", "inactive"] },
    ],
  },
  Courses: {
    path: "/courses",
    fields: [
      { name: "user_id", label: "User ID", type: "number", required: true },
      { name: "code", label: "Code", required: true },
      { name: "title", label: "Title", required: true },
      { name: "description", label: "Description", type: "textarea" },
    ],
  },
  Modules: {
    path: "/modules",
    fields: [
      { name: "course_id", label: "Course ID", type: "number", required: true },
      { name: "user_id", label: "User ID", type: "number", required: true },
      { name: "title", label: "Title", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "position", label: "Position", type: "number", required: true },
    ],
  },
  Contents: {
    path: "/contents",
    fields: [
      { name: "module_id", label: "Module ID", type: "number", required: true },
      { name: "title", label: "Title", required: true },
      { name: "content", label: "Content", type: "textarea", required: true },
      { name: "content_type", label: "Type", type: "select", options: ["video", "article", "quiz"] },
      { name: "position", label: "Position", type: "number", required: true },
    ],
  },
};

export default function App() {
  const [tab, setTab] = useState("Users");
  const tabs = [...Object.keys(pages), "Reports"];

  return (
    <div className="container">
      <h1>Course Management</h1>
      <nav>
        {tabs.map((t) => (
          <button key={t} className={t === tab ? "tab active" : "tab"} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </nav>
      {tab === "Reports" ? (
        <ReportsPage />
      ) : (
        <CrudPage key={tab} title={tab} path={pages[tab]!.path} fields={pages[tab]!.fields} />
      )}
    </div>
  );
}
