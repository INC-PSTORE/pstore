/**
 * Asynchronously loads the component for Accounts
 */
import loadable from 'loadable-components';

export default loadable(() => import('./index'));
