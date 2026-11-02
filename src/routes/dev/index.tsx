/**
 * Dev-only route for Developer Generator
 * 
 * IMPORTANT: This entire file is wrapped in import.meta.env.DEV guard
 * to ensure it's completely tree-shaken from production builds.
 * 
 * This route is only accessible at /learn/dev/generator in development mode.
 * In production builds, this file and all imports are removed.
 */

import { DeveloperGenerator } from './DeveloperGenerator'

/**
 * Dev Generator Route
 * Only rendered in development mode (import.meta.env.DEV)
 */
export function DevGeneratorRoute() {
  // This guard is redundant at component level but serves as documentation
  // The real tree-shaking happens at the route registration level
  if (!import.meta.env.DEV) {
    return null
  }

  return <DeveloperGenerator />
}

export default DevGeneratorRoute
