import { Outlet, Route, Routes, useNavigate } from "react-router";
import { NavBar } from "./components/NavBar";
import { IssueListPage } from "./pages/IssueListPage";
import { IssueEditPage } from "./pages/IssueEditPage";
import { NotFoundPage } from "./pages/NotFoundPage";

function Layout() {
  return (
    <>
      <header>
        <h1>Issue Tracker</h1>
        <NavBar />
      </header>
      <main>
        <Outlet />
      </main>
    </>
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
        <Route path="edit/:id" element={<IssueEditPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
