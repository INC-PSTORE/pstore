/**
 * Asynchronously loads the component for Undeploy Page
 */
import loadable from 'loadable-components';

export default loadable(() => import('./index'));
