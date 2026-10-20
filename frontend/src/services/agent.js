export async function requestAgentResponse({ query, selectedTract = null, liveRiskRows = [] } = {}) {
  const payload = {
    query: typeof query === 'string' ? query : '',
    selectedTract,
    liveRiskRows,
    source: 'frontend'
  };

  try {
    const response = await fetch('http://127.0.0.1:8001/api/agent/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`ADK endpoint returned ${response.status}`);
    }

    const data = await response.json();
    if (data && typeof data.content === 'string') {
      return data;
    }

    throw new Error('ADK response payload was missing content.');
  } catch (error) {
    console.warn('ADK endpoint unavailable; falling back to local planner logic.', error);
    return null;
  }
}
