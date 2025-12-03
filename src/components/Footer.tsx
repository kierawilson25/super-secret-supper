import Link from 'next/link';

export function Footer() {
  return (
    <footer style={{
      position: 'fixed',
      bottom: '0',
      fontSize: '0.9rem',
      color: '#F8F4F0',
      display: 'flex',
      gap: '1.5rem',
      justifyContent: 'center',
      width: '100%',
      paddingTop: '1rem',
      paddingBottom: '1rem',
      backgroundColor: '#460C58',
    }}>
      <Link href="/about" style={{ color: '#F8F4F0', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}>
        About
      </Link>
      <Link href="/" style={{ color: '#F8F4F0', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}>
        FAQ
      </Link>
      <Link href="/" style={{ color: '#F8F4F0', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}>
        Contact
      </Link>
    </footer>
  );
}
