module.exports = ({ config }) => {
  if (process.env.ENTRELINHAS_GITHUB_PAGES === '1') {
    return config;
  }

  const experiments = { ...config.experiments };
  delete experiments.baseUrl;

  return { ...config, experiments };
};