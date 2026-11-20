
import { AuthProvider } from "./context/AuthContext";
import AppRouter from "./app/providers/AppRouter";

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
