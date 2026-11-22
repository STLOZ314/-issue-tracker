import { Link, NavLink, Outlet, Route, Routes, useNavigate } from "react-router";
import { IssueListPage } from "./pages/IssueListPage";
import { EditIssuePage } from "./pages/EditIssuePage";

function Layout() {
  return (
    <>
      <header>
        <h1>Issue Tracker</h1>
        <nav aria-label="Main navigation">
          <NavLink to="/">Issues</NavLink>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}

function NotFound() {
  return (
    <section>
      <h2>Page not found</h2>
      <Link to="/">Back to the issue list</Link>
    </section>
  );
}

function RoutedIssueListPage() {
  const navigate = useNavigate();
  return <IssueListPage onSelect={(id) => navigate(`/edit/${id}`)} />;
}

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<RoutedIssueListPage />} />
        <Route path="edit/:id" element={<EditIssuePage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
