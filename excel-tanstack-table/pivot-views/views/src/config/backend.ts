function getDevDeployConfig() {
  const backendUrl = process.env?.BACKEND_URL || '';

  return {
    backendUrl,
  };
}

export const backendConfig = getDevDeployConfig;
