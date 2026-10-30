const publicFields = ["slug", "repo", "stars", "forks", "open_issues", "language", "license", "pushed_at"];

export function hasPublicMetricChange(previousProjects, currentProjects) {
  if (previousProjects.length !== currentProjects.length) return true;
  return currentProjects.some((current, index) =>
    publicFields.some((field) => current[field] !== previousProjects[index]?.[field]));
}
