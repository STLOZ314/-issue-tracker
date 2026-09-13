import { useEffect, useState } from "react";

interface Issue {
  id: number;
  title: string;
  description: string;
  status: "open" | "in-progress" | "closed";
  priority: "low" | "medium" | "high";
}

function App() {
  const [issues, setIssues] = useState<Issue[]>([]);

  useEffect(() => {
    fetch("/issues")
      .then((res) => res.json())
      .then((data: Issue[]) => setIssues(data))
      .catch((err) => console.error("Error fetching issues:", err));
  }, []);

  return (
    <div>
      <h1>Issues</h1>
      <ul>
        {issues.map((issue) => (
          <li key={issue.id}>{issue.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
