import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { loadTheme } from './theme.js';
import './styles.css';

loadTheme();
createRoot(document.getElementById('root')).render(<App />);
