import { BrowserRouter } from 'react-router-dom'
import './App.css'
import MainWindow from './MainWindow'
import SetupStatusBar from './StatusBar/SetupStatusBar'

function App() {
  return (
    <SetupStatusBar>
      <BrowserRouter>
        <MainWindow />
      </BrowserRouter>
    </SetupStatusBar>
  )
}

export default App
