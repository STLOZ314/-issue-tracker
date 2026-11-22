import { Outlet, Route, Routes, useNavigate } from "react-router";
import { NavBar } from "./components/NavBar";
import { IssueListPage } from "./pages/IssueListPage";
import { IssueEditPage } from "./pages/IssueEditPage";
import { NotFoundPage } from "./pages/NotFoundPage";

function Layout() {
  return (
    <>
      <header className="border-b">
        <div className="mx-auto flex max-w-4xl flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Signal Harbor</p>
            <h1 className="text-xl font-semibold">Issue Tracker</h1>
            <p className="text-sm text-muted-foreground">Bring every issue into focus.</p>
          </div>
          <NavBar />
        </div>
      </header>
      <main className="mx-auto max-w-4xl p-4">
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
