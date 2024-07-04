import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import AuthPage from "./pages/AuthPage/AuthPage";
import ProblemPage from "./pages/ProblemPage/ProblemPage";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import useUser from "./hooks/useUser";
import SubmissionPage from "./pages/SubmissionPage/SubmissionPage";
import SubmissionsPage from "./pages/SubmissionsPage/SubmissionsPage";
import UsersManagementPage from "./pages/UsersManagement/UsersManagementPage";
import ProblemSubmissionsPage from "./pages/ProblemSubmissionsPage/ProblemSubmissionsPage";
import UserSubmissionsPage from "./pages/UserSubmissionsPage/UserSubmissionsPage";

function App() {
  const { user, loadingUser } = useUser();
  if (loadingUser) {
    return null;
  }
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage user={user}/>} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/problems/:problemId" element={<ProblemPage user={user}/>} />
        <Route path="/submission/:submissionId" element={<SubmissionPage user={user}/>}/>
        <Route path="/submissions/:problemId" element={<SubmissionsPage user={user}/>}/>
        <Route path="/usersManagement" element={<UsersManagementPage user={user}/>}/>
        <Route path="/problemSubmissions/:problemId" element={<ProblemSubmissionsPage user={user}/>}/>
        <Route path="/userSubmissions/:userId" element={<UserSubmissionsPage user={user}/>}/>
      </Routes> 
      <ToastContainer />
    </>

  )
}

export default App;
