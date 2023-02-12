import Body from '../components/Body';
import Logo from '../components/Logo';
import Snow from '../components/Snowfall';

function App() {
  return (
    <div className="flex flex-col items-center min-h-screen justify-center pt-20 pb-20">
      <Logo />
      <Body />
      <Snow />
    </div>
  );
}

export default App;
