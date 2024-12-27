import React, { useState } from 'react';
import LoginScreen from './screens/LoginScreen';
import SelectRoleScreen from './screens/SelectRoleScreen';
import SelectOrgSizeScreen from './screens/SelectOrgSizeScreen';
import SelectIndustryScreen from './screens/SelectIndustryScreen';
import DeviceLinkerScreen from './screens/DeviceLinkerScreen';
import CongratulationsScreen from './screens/CongratulationsScreen';
import StatusViewScreen from './screens/StatusViewScreen';

enum ScreenFlow {
  LOGIN,
  ROLE,
  ORG_SIZE,
  INDUSTRY,
  DEVICE_LINKER,
  CONGRATS,
  STATUS
}

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState(ScreenFlow.LOGIN);

  const nextScreen = () => setCurrentScreen(prev => prev + 1);
  const gotoScreen = (screen: ScreenFlow) => setCurrentScreen(screen);
  
  switch (currentScreen) {
    case ScreenFlow.LOGIN:
      return <LoginScreen onNext={() => nextScreen()} />;
    case ScreenFlow.ROLE:
      return <SelectRoleScreen onNext={() => nextScreen()} onBack={() => gotoScreen(ScreenFlow.LOGIN)}/>;
    case ScreenFlow.ORG_SIZE:
      return <SelectOrgSizeScreen onNext={() => nextScreen()} onBack={() => gotoScreen(ScreenFlow.ROLE)}/>;
    case ScreenFlow.INDUSTRY:
      return <SelectIndustryScreen onNext={() => nextScreen()} onBack={() => gotoScreen(ScreenFlow.ORG_SIZE)}/>;
    case ScreenFlow.DEVICE_LINKER:
      return <DeviceLinkerScreen onNext={() => nextScreen()} onBack={() => gotoScreen(ScreenFlow.INDUSTRY)}/>;
    case ScreenFlow.CONGRATS:
      return <CongratulationsScreen onNext={() => nextScreen()} onBack={() => gotoScreen(ScreenFlow.DEVICE_LINKER)}/>;
    case ScreenFlow.STATUS:
      return <StatusViewScreen onBack={() => gotoScreen(ScreenFlow.CONGRATS)}/>;
    default:
      return <LoginScreen onNext={() => nextScreen()} />;
  }
};

export default App; 