import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';

export default function Layout() {
  return (
    <div className="layout">
      <ScrollToTop />
      <TopBar />
      <main className="layout-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
