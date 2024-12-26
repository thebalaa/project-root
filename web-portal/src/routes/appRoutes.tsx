// src/routes/AppRoutes.tsx

import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from '../pages/Home';
import AIAnalytics from '../pages/AIAnalytics';
import Governance from '../pages/Governance';
import CustomAIAgentsPage from '../pages/CustomAIAgents';

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/ai-analytics" component={AIAnalytics} />
        <Route path="/governance" component={Governance} />
        <Route path="/custom-ai-agents" component={CustomAIAgentsPage} />
        {/* Add more routes as needed */}
        <Route path="*">
          <div>404 Not Found</div>
        </Route>
      </Switch>
    </Router>
  );
};

export default AppRoutes;
