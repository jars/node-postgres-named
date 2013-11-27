var _ = require('lodash');

var tokenPattern = /\$[a-zA-Z]([a-zA-Z0-9]*)\b/g;

function numericFromNamed(sql, parameters) {
  var fillableTokens = Object.keys(parameters);
  var matchedTokens = _.uniq(_.map(sql.match(tokenPattern), function (token) {
    return token.substring(1); // Remove leading dollar sign
  }));

  var fillTokens = _.intersection(fillableTokens, matchedTokens).sort();
  var fillValues = _.map(fillTokens, function (token) {
    return parameters[token];
  });

  var unmatchedTokens = _.difference(matchedTokens, fillableTokens);

  if (unmatchedTokens.length) {
    var missing = unmatchedTokens.join(", ");
    throw new Error("Missing Parameters: " + missing);
  }

  var interpolatedSql = _.reduce(fillTokens, function (partiallyInterpolated, token, index) {
    var replaceAllPattern = new RegExp('\\$' + fillTokens[index], "g");
    return partiallyInterpolated.replace(replaceAllPattern, '$' + index);
  }, sql);

  var out = {};
  out.sql = interpolatedSql;
  out.parameters = fillValues;

  return out;
}

module.exports.numericFromNamed = numericFromNamed;