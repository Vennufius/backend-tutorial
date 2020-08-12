module.exports = (options) => {
  options = options || {};
  const httpsPort = options.httpsPort || 443;
  return (req, res, next) => {
    if (req.protocol !== 'https' && process.env.NODE_ENV === 'production') {
      const host = req.get('host').split(':')[0] || '127.0.0.1';
      return res.redirect(`https://${host}:${httpsPort}${req.url}`);
    }
    next();
  };
};
