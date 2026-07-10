import { EditorPage } from '@/presentation/editor/EditorPage';
import { buildEditorRouteSearch, parseEditorRouteState } from '@/application/canvas/editorRouteState';
import type { EditorRouteState } from '@/application/canvas/editorRouteState';
import { useCallback } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/editor" replace />} />
        <Route path="/editor" element={<EditorRoute />} />
        <Route path="/projects/:projectId/canvases/:canvasId" element={<EditorRoute />} />
        <Route path="*" element={<Navigate to="/editor" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function EditorRoute() {
  const location = useLocation();
  const navigate = useNavigate();
  const routeState = parseEditorRouteState(new URLSearchParams(location.search));

  const updateRouteState = useCallback((state: EditorRouteState) => {
    const search = buildEditorRouteSearch(state);
    if (search === location.search) return;
    navigate({ pathname: location.pathname, search }, { replace: true });
  }, [location.pathname, location.search, navigate]);

  return <EditorPage routeState={routeState} onRouteStateChange={updateRouteState} />;
}
