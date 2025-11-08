import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import IngredientCategorizer from "./components/IngredientCategorizer";

function App() {
  const [count, setCount] = useState(0)

return (
    <div>
      <IngredientCategorizer />
    </div>
  );
}

export default App
