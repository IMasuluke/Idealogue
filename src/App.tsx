import { useGraph, GraphProvider } from './store/graphStore';
import { SearchScreen } from './components/SearchScreen';
import { GraphView } from './components/GraphView';
import { ThreadView } from './components/ThreadView';

function AppInner() {
  const { state } = useGraph();

  if (state.screen === 'search') return <SearchScreen />;
  if (state.screen === 'thread') return <ThreadView />;
  return <GraphView />;
}

export function App() {
  return (
    <GraphProvider>
      <AppInner />
    </GraphProvider>
  );
}
