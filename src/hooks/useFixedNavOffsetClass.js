import { useAuth } from '../context/AuthContext';

/**
 * Padding below the fixed top Navbar. Empty for ADMIN (navbar is not rendered).
 */
export function useFixedNavOffsetClass() {
    const { user } = useAuth();
    if (user?.role === 'ADMIN') return '';
    return 'pt-28 sm:pt-32 md:pt-36';
}
