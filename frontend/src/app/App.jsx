import { BrowserRouter as Router } from 'react-router-dom';

import { ThemeProvider } from '../shared/contexts/ThemeContext';
import ThemeToggle from '../shared/components/ThemeToggle';
import { AppRoutes } from './router';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen relative">
          <ThemeToggle />
          <AppRoutes />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
